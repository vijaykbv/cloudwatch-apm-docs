#!/usr/bin/env node

/**
 * Rollback Script
 * Provides rollback capabilities for quick fixes in staging and production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ENVIRONMENTS = {
  staging: {
    bucket: process.env.S3_BUCKET_STAGING,
    distribution: process.env.CLOUDFRONT_DISTRIBUTION_ID_STAGING,
    url: 'https://staging-docs.cloudwatch-apm.aws.amazon.com'
  },
  production: {
    bucket: process.env.S3_BUCKET_PRODUCTION,
    distribution: process.env.CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION,
    url: 'https://docs.cloudwatch-apm.aws.amazon.com'
  }
};

// Colors for output
const colors = {
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  nc: '\033[0m' // No Color
};

class RollbackManager {
  constructor(environment) {
    this.environment = environment;
    this.config = ENVIRONMENTS[environment];
    
    if (!this.config) {
      throw new Error(`Invalid environment: ${environment}. Must be 'staging' or 'production'`);
    }
    
    if (!this.config.bucket || !this.config.distribution) {
      throw new Error(`Missing configuration for ${environment} environment`);
    }
  }

  /**
   * Main rollback function
   */
  async rollback(options = {}) {
    try {
      console.log(`${colors.blue}🔄 Starting rollback for ${this.environment}...${colors.nc}`);
      
      // Get deployment history
      const deployments = await this.getDeploymentHistory();
      
      if (deployments.length < 2) {
        throw new Error('No previous deployment found for rollback');
      }
      
      // Select target deployment
      const targetDeployment = options.version 
        ? deployments.find(d => d.version === options.version)
        : deployments[1]; // Previous deployment
      
      if (!targetDeployment) {
        throw new Error(`Target deployment not found: ${options.version || 'previous'}`);
      }
      
      console.log(`${colors.yellow}📋 Rolling back to deployment: ${targetDeployment.version}${colors.nc}`);
      console.log(`   Deployed: ${targetDeployment.timestamp}`);
      console.log(`   Commit: ${targetDeployment.commit}`);
      
      // Confirm rollback
      if (!options.force && !this.confirmRollback(targetDeployment)) {
        console.log(`${colors.yellow}❌ Rollback cancelled${colors.nc}`);
        return;
      }
      
      // Perform rollback
      await this.performRollback(targetDeployment);
      
      // Verify rollback
      await this.verifyRollback();
      
      console.log(`${colors.green}✅ Rollback completed successfully!${colors.nc}`);
      console.log(`   Environment: ${this.environment}`);
      console.log(`   URL: ${this.config.url}`);
      
    } catch (error) {
      console.error(`${colors.red}❌ Rollback failed: ${error.message}${colors.nc}`);
      process.exit(1);
    }
  }

  /**
   * Get deployment history from S3 object versions
   */
  async getDeploymentHistory() {
    try {
      console.log(`${colors.blue}📚 Fetching deployment history...${colors.nc}`);
      
      // Get object versions for index.html (represents deployments)
      const command = `aws s3api list-object-versions --bucket ${this.config.bucket} --prefix index.html --query 'Versions[?IsLatest!=\`true\`]' --output json`;
      const result = execSync(command, { encoding: 'utf8' });
      const versions = JSON.parse(result);
      
      // Get deployment metadata
      const deployments = [];
      
      for (const version of versions.slice(0, 10)) { // Last 10 deployments
        try {
          // Try to get deployment metadata
          const metadataCommand = `aws s3api get-object-tagging --bucket ${this.config.bucket} --key index.html --version-id ${version.VersionId} --output json`;
          const metadataResult = execSync(metadataCommand, { encoding: 'utf8' });
          const metadata = JSON.parse(metadataResult);
          
          const deployment = {
            version: version.VersionId,
            timestamp: version.LastModified,
            size: version.Size,
            commit: this.extractTag(metadata.TagSet, 'commit') || 'unknown',
            branch: this.extractTag(metadata.TagSet, 'branch') || 'unknown',
            buildNumber: this.extractTag(metadata.TagSet, 'build') || 'unknown'
          };
          
          deployments.push(deployment);
        } catch (error) {
          // Skip versions without metadata
          deployments.push({
            version: version.VersionId,
            timestamp: version.LastModified,
            size: version.Size,
            commit: 'unknown',
            branch: 'unknown',
            buildNumber: 'unknown'
          });
        }
      }
      
      console.log(`${colors.green}📋 Found ${deployments.length} previous deployments${colors.nc}`);
      return deployments;
      
    } catch (error) {
      throw new Error(`Failed to fetch deployment history: ${error.message}`);
    }
  }

  /**
   * Extract tag value from S3 tag set
   */
  extractTag(tagSet, key) {
    const tag = tagSet.find(t => t.Key === key);
    return tag ? tag.Value : null;
  }

  /**
   * Confirm rollback with user
   */
  confirmRollback(targetDeployment) {
    console.log(`\n${colors.yellow}⚠️  ROLLBACK CONFIRMATION${colors.nc}`);
    console.log(`Environment: ${this.environment}`);
    console.log(`Target Version: ${targetDeployment.version}`);
    console.log(`Target Timestamp: ${targetDeployment.timestamp}`);
    console.log(`Target Commit: ${targetDeployment.commit}`);
    
    // In CI/CD, this would be handled differently
    if (process.env.CI) {
      return true; // Auto-confirm in CI
    }
    
    // For manual execution, require explicit confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('\nProceed with rollback? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  /**
   * Perform the actual rollback
   */
  async performRollback(targetDeployment) {
    console.log(`${colors.blue}🔄 Performing rollback...${colors.nc}`);
    
    try {
      // Create backup of current deployment
      await this.createBackup();
      
      // Restore files from target deployment
      await this.restoreFromVersion(targetDeployment);
      
      // Invalidate CloudFront cache
      await this.invalidateCache();
      
    } catch (error) {
      throw new Error(`Rollback operation failed: ${error.message}`);
    }
  }

  /**
   * Create backup of current deployment
   */
  async createBackup() {
    console.log(`${colors.blue}💾 Creating backup of current deployment...${colors.nc}`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPrefix = `backups/${this.environment}/${timestamp}/`;
    
    try {
      // Copy current deployment to backup location
      const command = `aws s3 sync s3://${this.config.bucket}/ s3://${this.config.bucket}/${backupPrefix} --exclude "backups/*"`;
      execSync(command, { stdio: 'inherit' });
      
      console.log(`${colors.green}✅ Backup created at: ${backupPrefix}${colors.nc}`);
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Restore files from specific version
   */
  async restoreFromVersion(targetDeployment) {
    console.log(`${colors.blue}📦 Restoring files from version ${targetDeployment.version}...${colors.nc}`);
    
    try {
      // Get list of all objects in the bucket
      const listCommand = `aws s3api list-objects-v2 --bucket ${this.config.bucket} --query 'Contents[].Key' --output text`;
      const objects = execSync(listCommand, { encoding: 'utf8' }).trim().split('\n');
      
      // Restore each object from the target version
      for (const objectKey of objects) {
        if (objectKey.startsWith('backups/')) {
          continue; // Skip backup files
        }
        
        try {
          // Copy object from specific version
          const copyCommand = `aws s3api copy-object --bucket ${this.config.bucket} --copy-source "${this.config.bucket}/${objectKey}?versionId=${targetDeployment.version}" --key "${objectKey}"`;
          execSync(copyCommand, { stdio: 'pipe' });
        } catch (error) {
          console.warn(`${colors.yellow}⚠️  Could not restore ${objectKey}: ${error.message}${colors.nc}`);
        }
      }
      
      console.log(`${colors.green}✅ Files restored from target version${colors.nc}`);
    } catch (error) {
      throw new Error(`Failed to restore files: ${error.message}`);
    }
  }

  /**
   * Invalidate CloudFront cache
   */
  async invalidateCache() {
    console.log(`${colors.blue}🔄 Invalidating CloudFront cache...${colors.nc}`);
    
    try {
      const command = `aws cloudfront create-invalidation --distribution-id ${this.config.distribution} --paths "/*"`;
      const result = execSync(command, { encoding: 'utf8' });
      const invalidation = JSON.parse(result);
      
      console.log(`${colors.green}✅ Cache invalidation created: ${invalidation.Invalidation.Id}${colors.nc}`);
      
      // Wait for invalidation to complete (optional)
      if (process.env.WAIT_FOR_INVALIDATION === 'true') {
        console.log(`${colors.blue}⏳ Waiting for cache invalidation to complete...${colors.nc}`);
        const waitCommand = `aws cloudfront wait invalidation-completed --distribution-id ${this.config.distribution} --id ${invalidation.Invalidation.Id}`;
        execSync(waitCommand, { stdio: 'inherit' });
        console.log(`${colors.green}✅ Cache invalidation completed${colors.nc}`);
      }
      
    } catch (error) {
      throw new Error(`Failed to invalidate cache: ${error.message}`);
    }
  }

  /**
   * Verify rollback was successful
   */
  async verifyRollback() {
    console.log(`${colors.blue}🔍 Verifying rollback...${colors.nc}`);
    
    try {
      // Wait for deployment to propagate
      await this.sleep(30000); // 30 seconds
      
      // Test basic endpoints
      const endpoints = [
        '/',
        '/health',
        '/getting-started'
      ];
      
      for (const endpoint of endpoints) {
        const url = `${this.config.url}${endpoint}`;
        try {
          execSync(`curl -f -s "${url}" > /dev/null`, { stdio: 'pipe' });
          console.log(`${colors.green}✅ ${endpoint} is accessible${colors.nc}`);
        } catch (error) {
          console.warn(`${colors.yellow}⚠️  ${endpoint} may not be accessible yet${colors.nc}`);
        }
      }
      
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  Verification completed with warnings: ${error.message}${colors.nc}`);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * List available deployments
   */
  async listDeployments() {
    try {
      const deployments = await this.getDeploymentHistory();
      
      console.log(`\n${colors.blue}📋 Available deployments for ${this.environment}:${colors.nc}\n`);
      console.log('Version ID'.padEnd(40) + 'Timestamp'.padEnd(25) + 'Commit'.padEnd(15) + 'Branch');
      console.log('-'.repeat(90));
      
      deployments.forEach(deployment => {
        const version = deployment.version.substring(0, 36) + '...';
        const timestamp = new Date(deployment.timestamp).toLocaleString();
        const commit = deployment.commit.substring(0, 12);
        const branch = deployment.branch;
        
        console.log(version.padEnd(40) + timestamp.padEnd(25) + commit.padEnd(15) + branch);
      });
      
      console.log('');
    } catch (error) {
      console.error(`${colors.red}❌ Failed to list deployments: ${error.message}${colors.nc}`);
      process.exit(1);
    }
  }
}

// CLI interface
function showUsage() {
  console.log(`
Usage: node rollback.js <environment> [options]

Arguments:
  environment    Environment to rollback (staging|production)

Options:
  --version <id>    Specific version ID to rollback to
  --list           List available deployments
  --force          Skip confirmation prompt
  --help           Show this help message

Examples:
  node rollback.js staging
  node rollback.js production --version abc123...
  node rollback.js staging --list
  node rollback.js production --force
`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    process.exit(0);
  }
  
  const environment = args[0];
  const options = {
    version: null,
    force: false,
    list: false
  };
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--version':
        options.version = args[++i];
        break;
      case '--force':
        options.force = true;
        break;
      case '--list':
        options.list = true;
        break;
    }
  }
  
  try {
    const rollbackManager = new RollbackManager(environment);
    
    if (options.list) {
      rollbackManager.listDeployments();
    } else {
      rollbackManager.rollback(options);
    }
  } catch (error) {
    console.error(`${colors.red}❌ ${error.message}${colors.nc}`);
    process.exit(1);
  }
}

module.exports = RollbackManager;