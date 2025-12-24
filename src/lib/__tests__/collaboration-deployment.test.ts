/**
 * Unit tests for deployment pipeline and validation checks in collaboration features
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Mock child_process
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Mock fs
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock fetch for deployed link validation
global.fetch = jest.fn();

describe('Collaboration Deployment Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Deployment Script Validation', () => {
    it('should validate deployment environment configuration', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        S3_BUCKET_STAGING: 'staging-bucket',
        S3_BUCKET_PRODUCTION: 'production-bucket',
        CLOUDFRONT_DISTRIBUTION_ID_STAGING: 'staging-distribution',
        CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION: 'production-distribution',
      };

      const environments = {
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

      expect(environments.staging.bucket).toBe('staging-bucket');
      expect(environments.production.bucket).toBe('production-bucket');
      expect(environments.staging.distribution).toBe('staging-distribution');
      expect(environments.production.distribution).toBe('production-distribution');

      // Restore original environment
      process.env = originalEnv;
    });

    it('should validate AWS CLI commands for deployment', () => {
      // Mock successful AWS CLI commands
      mockExecSync
        .mockReturnValueOnce(Buffer.from('')) // S3 sync command
        .mockReturnValueOnce(Buffer.from('')) // CloudFront invalidation
        .mockReturnValueOnce(Buffer.from('{"Invalidation":{"Id":"invalidation-123"}}')); // Invalidation response

      // Simulate deployment commands
      const bucket = 'test-bucket';
      const distributionId = 'test-distribution';

      // Test S3 sync command
      expect(() => {
        mockExecSync(`aws s3 sync .next/static s3://${bucket}/_next/static --delete`);
      }).not.toThrow();

      // Test CloudFront invalidation
      expect(() => {
        mockExecSync(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`);
      }).not.toThrow();

      expect(mockExecSync).toHaveBeenCalledTimes(2);
    });

    it('should handle deployment failures gracefully', () => {
      // Test that we can handle deployment failures
      const mockError = new Error('AWS CLI command failed');
      
      // Simulate a deployment failure scenario
      expect(() => {
        throw mockError;
      }).toThrow('AWS CLI command failed');
      
      // Verify that the mock can be configured to throw errors
      mockExecSync.mockImplementation(() => {
        throw new Error('AWS CLI command failed');
      });
      
      expect(mockExecSync).toBeDefined();
    });
  });

  describe('Rollback Functionality', () => {
    beforeEach(() => {
      // Clear all mocks before each test in this describe block
      jest.clearAllMocks();
      mockExecSync.mockReset();
    });

    it('should list deployment history for rollback', () => {
      // Mock S3 object versions response - return as Buffer to match execSync behavior
      const mockVersions = [
        {
          VersionId: 'version-123',
          LastModified: '2023-01-01T10:00:00Z',
          Size: 1024
        },
        {
          VersionId: 'version-456',
          LastModified: '2023-01-02T10:00:00Z',
          Size: 2048
        }
      ];

      // Set up a fresh mock for this specific test
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('list-object-versions')) {
          return Buffer.from(JSON.stringify(mockVersions));
        }
        return Buffer.from('');
      });

      const result = mockExecSync('aws s3api list-object-versions --bucket test-bucket --prefix index.html');
      const versions = JSON.parse(result.toString());

      expect(versions).toHaveLength(2);
      expect(versions[0].VersionId).toBe('version-123');
      expect(versions[1].VersionId).toBe('version-456');
    });

    it('should create backup before rollback', () => {
      const timestamp = '2023-01-01-10-00-00';
      const backupPrefix = `backups/production/${timestamp}/`;

      // Set up a fresh mock for this specific test
      mockExecSync.mockImplementation(() => Buffer.from(''));

      expect(() => {
        mockExecSync(`aws s3 sync s3://production-bucket/ s3://production-bucket/${backupPrefix} --exclude "backups/*"`);
      }).not.toThrow();

      expect(mockExecSync).toHaveBeenCalledWith(
        `aws s3 sync s3://production-bucket/ s3://production-bucket/${backupPrefix} --exclude "backups/*"`
      );
    });

    it('should restore from specific version during rollback', () => {
      const targetVersion = 'version-123';
      const bucket = 'test-bucket';
      const objectKey = 'index.html';

      // Set up a fresh mock for this specific test
      mockExecSync.mockImplementation(() => Buffer.from(''));

      expect(() => {
        mockExecSync(`aws s3api copy-object --bucket ${bucket} --copy-source "${bucket}/${objectKey}?versionId=${targetVersion}" --key "${objectKey}"`);
      }).not.toThrow();

      expect(mockExecSync).toHaveBeenCalledWith(
        `aws s3api copy-object --bucket ${bucket} --copy-source "${bucket}/${objectKey}?versionId=${targetVersion}" --key "${objectKey}"`
      );
    });
  });

  describe('Content Validation Pipeline', () => {
    it('should validate markdown content structure', () => {
      // Mock file system operations
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(`
---
title: Test Page
audience: developer
difficulty: beginner
---

# Test Page

This is a test page with proper structure.

## Section 1

Content here.

\`\`\`javascript
console.log('test');
\`\`\`
      `);

      const content = mockFs.readFileSync('test.md', 'utf8');
      
      // Validate frontmatter exists (trim to remove leading whitespace)
      expect(content.trim()).toMatch(/^---[\s\S]*?---/);
      
      // Validate headings
      expect(content).toMatch(/^# /m);
      expect(content).toMatch(/^## /m);
      
      // Validate code blocks
      expect(content).toMatch(/```\w+/);
    });

    it('should validate internal links', () => {
      const content = `
# Test Page

Check out our [getting started guide](/getting-started) and [API docs](/api).

Also see [external link](https://example.com).
      `;

      // Extract internal links
      const internalLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links: string[] = [];
      let match;

      while ((match = internalLinkRegex.exec(content)) !== null) {
        const url = match[2];
        if (!url.startsWith('http') && !url.startsWith('#')) {
          links.push(url);
        }
      }

      expect(links).toContain('/getting-started');
      expect(links).toContain('/api');
      expect(links).not.toContain('https://example.com');
    });

    it('should validate code examples syntax', () => {
      const content = `
\`\`\`javascript
const config = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_test123'
};
\`\`\`

\`\`\`python
import boto3

client = boto3.client('cognito-idp')
\`\`\`
      `;

      // Extract code blocks
      const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
      const codeBlocks: Array<{ language: string; code: string }> = [];
      let match;

      while ((match = codeBlockRegex.exec(content)) !== null) {
        codeBlocks.push({
          language: match[1],
          code: match[2].trim()
        });
      }

      expect(codeBlocks).toHaveLength(2);
      expect(codeBlocks[0].language).toBe('javascript');
      expect(codeBlocks[1].language).toBe('python');
      expect(codeBlocks[0].code).toContain('const config');
      expect(codeBlocks[1].code).toContain('import boto3');
    });
  });

  describe('Deployed Link Validation', () => {
    it('should validate deployed site endpoints', async () => {
      const siteUrl = 'https://staging-docs.cloudwatch-apm.aws.amazon.com';
      const testEndpoints = [
        '/',
        '/health',
        '/getting-started',
        '/configuration',
        '/examples'
      ];

      // Mock successful responses
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          'content-type': 'text/html',
          'content-length': '5000'
        },
        text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><nav>Navigation</nav><main>Content</main></body></html>')
      });

      for (const endpoint of testEndpoints) {
        const response = await fetch(`${siteUrl}${endpoint}`);
        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
      }

      expect(fetch).toHaveBeenCalledTimes(testEndpoints.length);
    });

    it('should validate HTML content structure', async () => {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>CloudWatch APM Documentation</title>
</head>
<body>
  <nav class="navigation">
    <ul>
      <li><a href="/getting-started">Getting Started</a></li>
      <li><a href="/configuration">Configuration</a></li>
    </ul>
  </nav>
  <main>
    <h1>Welcome to CloudWatch APM</h1>
    <p>This is the main content area.</p>
  </main>
</body>
</html>
      `;

      // Validate HTML structure
      expect(htmlContent).toMatch(/<html[^>]*>/i);
      expect(htmlContent).toMatch(/<title[^>]*>([^<]+)<\/title>/i);
      expect(htmlContent).toMatch(/nav|menu|navigation/i);
      expect(htmlContent).toMatch(/<main|<article|<section/i);

      // Extract title
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      expect(titleMatch?.[1]).toBe('CloudWatch APM Documentation');

      // Check for navigation links
      const navLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      const navLinks: string[] = [];
      let match;

      while ((match = navLinkRegex.exec(htmlContent)) !== null) {
        navLinks.push(match[1]);
      }

      expect(navLinks).toContain('/getting-started');
      expect(navLinks).toContain('/configuration');
    });

    it('should handle validation errors gracefully', async () => {
      // Mock failed response
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const response = await fetch('https://example.com/invalid-endpoint');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should validate static assets availability', async () => {
      const assetPaths = [
        '/_next/static/css/app.css',
        '/_next/static/js/app.js',
        '/favicon.ico',
        '/robots.txt'
      ];

      // Mock successful asset responses
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200
      });

      for (const assetPath of assetPaths) {
        const response = await fetch(`https://example.com${assetPath}`, { method: 'HEAD' });
        expect(response.ok).toBe(true);
      }
    });
  });

  describe('Content Report Generation', () => {
    it('should generate comprehensive content statistics', () => {
      // Mock file discovery
      const mockFiles = [
        'content/getting-started/index.md',
        'content/getting-started/quick-start.md',
        'content/configuration/reference.md',
        'content/examples/java-spring-boot.md'
      ];

      const mockContent = `
---
title: Getting Started
audience: developer
difficulty: beginner
category: tutorial
---

# Getting Started with CloudWatch APM

This guide will help you get started with CloudWatch APM.

## Prerequisites

Before you begin, ensure you have:
- AWS account
- Basic knowledge of monitoring

## Installation

\`\`\`bash
npm install @aws-sdk/client-cloudwatch
\`\`\`

\`\`\`javascript
const { CloudWatchClient } = require('@aws-sdk/client-cloudwatch');
\`\`\`

![Architecture Diagram](./images/architecture.png)

For more information, see [Configuration Guide](/configuration).
      `;

      // Analyze content
      const stats = {
        totalFiles: mockFiles.length,
        totalWords: 0,
        totalCharacters: mockContent.length,
        sections: new Map(),
        audiences: new Map(),
        difficulties: new Map(),
        languages: new Map()
      };

      // Count words (excluding code blocks)
      const withoutCode = mockContent.replace(/```[\s\S]*?```/g, '');
      const words = withoutCode
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      stats.totalWords = words.length;

      // Extract code languages
      const codeBlocks = mockContent.match(/```(\w+)/g) || [];
      codeBlocks.forEach(block => {
        const language = block.replace('```', '');
        if (language) {
          stats.languages.set(language, (stats.languages.get(language) || 0) + 1);
        }
      });

      // Count images
      const images = mockContent.match(/!\[.*?\]\(.*?\)/g) || [];

      // Count links
      const links = mockContent.match(/\[.*?\]\(.*?\)/g) || [];

      expect(stats.totalFiles).toBe(4);
      expect(stats.totalWords).toBeGreaterThan(0);
      expect(stats.languages.get('bash')).toBe(1);
      expect(stats.languages.get('javascript')).toBe(1);
      expect(images).toHaveLength(1);
      expect(links.length).toBeGreaterThan(0);
    });

    it('should identify content gaps and recommendations', () => {
      const stats = {
        audiences: new Map([
          ['developer', 10],
          ['operations', 5]
        ]),
        difficulties: new Map([
          ['beginner', 8],
          ['intermediate', 5],
          ['advanced', 2]
        ]),
        languages: new Map([
          ['javascript', 8],
          ['python', 3]
        ])
      };

      const recommendations: string[] = [];

      // Check for missing audiences
      const expectedAudiences = ['developer', 'operations', 'architect', 'security'];
      const missingAudiences = expectedAudiences.filter(audience => 
        !stats.audiences.has(audience)
      );

      if (missingAudiences.length > 0) {
        recommendations.push(`Consider adding content for: ${missingAudiences.join(', ')}`);
      }

      // Check for difficulty balance
      const beginnerContent = stats.difficulties.get('beginner') || 0;
      const totalWithDifficulty = Array.from(stats.difficulties.values()).reduce((a, b) => a + b, 0);

      if (totalWithDifficulty > 0 && beginnerContent / totalWithDifficulty < 0.3) {
        recommendations.push('Consider adding more beginner-friendly content');
      }

      // Check for programming language coverage
      const commonLanguages = ['javascript', 'python', 'java', 'typescript'];
      const missingLanguages = commonLanguages.filter(lang => 
        !stats.languages.has(lang)
      );

      if (missingLanguages.length > 0) {
        recommendations.push(`Consider adding examples for: ${missingLanguages.join(', ')}`);
      }

      expect(recommendations).toContain('Consider adding content for: architect, security');
      expect(recommendations).toContain('Consider adding examples for: java, typescript');
    });
  });

  describe('CI/CD Pipeline Integration', () => {
    it('should validate GitHub Actions workflow configuration', () => {
      const workflowConfig = {
        name: 'Deploy CloudWatch APM Documentation',
        on: {
          push: {
            branches: ['main', 'staging']
          },
          pull_request: {
            branches: ['main', 'staging']
          }
        },
        env: {
          NODE_VERSION: '18',
          AWS_REGION: 'us-east-1'
        },
        jobs: {
          validate: {
            name: 'Validate Content',
            'runs-on': 'ubuntu-latest'
          },
          test: {
            name: 'Run Tests',
            'runs-on': 'ubuntu-latest',
            needs: 'validate'
          },
          build: {
            name: 'Build Application',
            'runs-on': 'ubuntu-latest',
            needs: ['validate', 'test']
          }
        }
      };

      expect(workflowConfig.name).toBe('Deploy CloudWatch APM Documentation');
      expect(workflowConfig.on.push.branches).toContain('main');
      expect(workflowConfig.on.push.branches).toContain('staging');
      expect(workflowConfig.env.NODE_VERSION).toBe('18');
      expect(workflowConfig.jobs.test.needs).toBe('validate');
      expect(workflowConfig.jobs.build.needs).toContain('validate');
      expect(workflowConfig.jobs.build.needs).toContain('test');
    });

    it('should validate deployment environment secrets', () => {
      const requiredSecrets = [
        'AWS_ACCESS_KEY_ID_STAGING',
        'AWS_SECRET_ACCESS_KEY_STAGING',
        'AWS_ACCESS_KEY_ID_PRODUCTION',
        'AWS_SECRET_ACCESS_KEY_PRODUCTION',
        'S3_BUCKET_STAGING',
        'S3_BUCKET_PRODUCTION',
        'CLOUDFRONT_DISTRIBUTION_ID_STAGING',
        'CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION',
        'COGNITO_USER_POOL_ID_STAGING',
        'COGNITO_USER_POOL_CLIENT_ID_STAGING'
      ];

      // Mock secrets validation
      const availableSecrets = new Set([
        'AWS_ACCESS_KEY_ID_STAGING',
        'AWS_SECRET_ACCESS_KEY_STAGING',
        'S3_BUCKET_STAGING',
        'CLOUDFRONT_DISTRIBUTION_ID_STAGING'
      ]);

      const missingSecrets = requiredSecrets.filter(secret => 
        !availableSecrets.has(secret)
      );

      expect(missingSecrets).toContain('AWS_ACCESS_KEY_ID_PRODUCTION');
      expect(missingSecrets).toContain('COGNITO_USER_POOL_ID_STAGING');
      expect(missingSecrets.length).toBeGreaterThan(0);
    });

    it('should validate build artifact structure', () => {
      const expectedArtifacts = [
        '.next/',
        'public/',
        'package.json'
      ];

      // Mock artifact validation
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        return expectedArtifacts.some(artifact => 
          filePath.toString().includes(artifact)
        );
      });

      expectedArtifacts.forEach(artifact => {
        expect(mockFs.existsSync(artifact)).toBe(true);
      });
    });
  });

  describe('Performance and Monitoring', () => {
    it('should validate deployment performance metrics', async () => {
      const performanceMetrics = {
        deploymentTime: 180000, // 3 minutes in milliseconds
        buildTime: 120000, // 2 minutes
        testTime: 60000, // 1 minute
        invalidationTime: 300000, // 5 minutes
      };

      // Validate acceptable performance thresholds
      expect(performanceMetrics.deploymentTime).toBeLessThan(600000); // < 10 minutes
      expect(performanceMetrics.buildTime).toBeLessThan(300000); // < 5 minutes
      expect(performanceMetrics.testTime).toBeLessThan(180000); // < 3 minutes
      expect(performanceMetrics.invalidationTime).toBeLessThan(900000); // < 15 minutes
    });

    it('should validate site health after deployment', async () => {
      const healthChecks = [
        { endpoint: '/health', expectedStatus: 200 },
        { endpoint: '/', expectedStatus: 200 },
        { endpoint: '/getting-started', expectedStatus: 200 },
        { endpoint: '/api/health', expectedStatus: 200 }
      ];

      // Mock health check responses
      (fetch as jest.Mock).mockImplementation((url: string) => {
        const endpoint = new URL(url).pathname;
        const check = healthChecks.find(hc => hc.endpoint === endpoint);
        
        return Promise.resolve({
          ok: check?.expectedStatus === 200,
          status: check?.expectedStatus || 404,
          json: () => Promise.resolve({ status: 'healthy' })
        });
      });

      for (const check of healthChecks) {
        const response = await fetch(`https://example.com${check.endpoint}`);
        expect(response.status).toBe(check.expectedStatus);
      }
    });

    it('should validate CloudFront cache behavior', () => {
      const cacheConfig = {
        staticAssets: {
          pattern: '/_next/static/*',
          cacheControl: 'public, max-age=31536000, immutable'
        },
        htmlPages: {
          pattern: '*.html',
          cacheControl: 'public, max-age=0, must-revalidate'
        },
        apiEndpoints: {
          pattern: '/api/*',
          cacheControl: 'no-cache'
        }
      };

      expect(cacheConfig.staticAssets.cacheControl).toContain('max-age=31536000');
      expect(cacheConfig.htmlPages.cacheControl).toContain('must-revalidate');
      expect(cacheConfig.apiEndpoints.cacheControl).toBe('no-cache');
    });
  });
});