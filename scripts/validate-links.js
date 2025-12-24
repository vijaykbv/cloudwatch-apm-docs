#!/usr/bin/env node

/**
 * Link Validation Script
 * Validates internal links in markdown files and checks for broken references
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const CONTENT_DIRS = ['content', 'src/content'];
const ALLOWED_EXTENSIONS = ['.md', '.mdx'];
const INTERNAL_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const REFERENCE_LINK_PATTERN = /\[([^\]]+)\]\[([^\]]*)\]/g;
const REFERENCE_DEF_PATTERN = /^\[([^\]]+)\]:\s*(.+)$/gm;

class LinkValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.allFiles = new Set();
    this.references = new Map();
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Starting link validation...');
    
    // Discover all markdown files
    await this.discoverFiles();
    
    // Process each file
    for (const filePath of this.allFiles) {
      await this.validateFile(filePath);
    }
    
    // Report results
    this.reportResults();
    
    // Exit with error code if there are errors
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  /**
   * Discover all markdown files in content directories
   */
  async discoverFiles() {
    for (const dir of CONTENT_DIRS) {
      if (!fs.existsSync(dir)) {
        continue;
      }
      
      const pattern = path.join(dir, '**/*.{md,mdx}');
      const files = await glob(pattern);
      
      files.forEach(file => {
        this.allFiles.add(path.resolve(file));
      });
    }
    
    console.log(`📁 Found ${this.allFiles.size} markdown files`);
  }

  /**
   * Validate links in a single file
   */
  async validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Extract reference definitions
      this.extractReferences(content, relativePath);
      
      // Validate inline links
      this.validateInlineLinks(content, relativePath);
      
      // Validate reference links
      this.validateReferenceLinks(content, relativePath);
      
    } catch (error) {
      this.errors.push({
        file: path.relative(process.cwd(), filePath),
        error: `Failed to read file: ${error.message}`
      });
    }
  }

  /**
   * Extract reference link definitions
   */
  extractReferences(content, filePath) {
    let match;
    while ((match = REFERENCE_DEF_PATTERN.exec(content)) !== null) {
      const [, label, url] = match;
      if (!this.references.has(filePath)) {
        this.references.set(filePath, new Map());
      }
      this.references.get(filePath).set(label.toLowerCase(), url.trim());
    }
  }

  /**
   * Validate inline markdown links
   */
  validateInlineLinks(content, filePath) {
    let match;
    while ((match = INTERNAL_LINK_PATTERN.exec(content)) !== null) {
      const [fullMatch, text, url] = match;
      
      // Skip external links
      if (this.isExternalLink(url)) {
        continue;
      }
      
      // Skip anchors and fragments
      if (url.startsWith('#')) {
        continue;
      }
      
      // Validate internal link
      this.validateInternalLink(url, filePath, text);
    }
  }

  /**
   * Validate reference links
   */
  validateReferenceLinks(content, filePath) {
    let match;
    while ((match = REFERENCE_LINK_PATTERN.exec(content)) !== null) {
      const [fullMatch, text, label] = match;
      const refLabel = (label || text).toLowerCase();
      
      // Check if reference exists in current file
      const fileRefs = this.references.get(filePath);
      if (!fileRefs || !fileRefs.has(refLabel)) {
        this.errors.push({
          file: filePath,
          error: `Reference link not found: [${text}][${label || text}]`
        });
        continue;
      }
      
      // Validate the referenced URL
      const url = fileRefs.get(refLabel);
      if (!this.isExternalLink(url)) {
        this.validateInternalLink(url, filePath, text);
      }
    }
  }

  /**
   * Validate an internal link
   */
  validateInternalLink(url, filePath, linkText) {
    // Remove fragment/anchor
    const [cleanUrl] = url.split('#');
    
    // Resolve relative path
    const currentDir = path.dirname(filePath);
    const targetPath = path.resolve(currentDir, cleanUrl);
    
    // Check if target exists
    if (!fs.existsSync(targetPath)) {
      // Try with .md extension if not present
      if (!cleanUrl.endsWith('.md') && !cleanUrl.endsWith('.mdx')) {
        const withMd = targetPath + '.md';
        const withMdx = targetPath + '.mdx';
        
        if (fs.existsSync(withMd) || fs.existsSync(withMdx)) {
          this.warnings.push({
            file: filePath,
            warning: `Link missing file extension: ${url} (found ${withMd})`
          });
          return;
        }
      }
      
      this.errors.push({
        file: filePath,
        error: `Broken internal link: [${linkText}](${url}) -> ${targetPath}`
      });
    }
  }

  /**
   * Check if a URL is external
   */
  isExternalLink(url) {
    return /^https?:\/\//.test(url) || /^mailto:/.test(url) || /^tel:/.test(url);
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n📊 Link Validation Results:');
    console.log(`✅ Files processed: ${this.allFiles.size}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(({ file, warning }) => {
        console.log(`  ${file}: ${warning}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 All links are valid!');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new LinkValidator();
  validator.validate().catch(error => {
    console.error('❌ Link validation failed:', error);
    process.exit(1);
  });
}

module.exports = LinkValidator;