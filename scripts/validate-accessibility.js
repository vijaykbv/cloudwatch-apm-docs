#!/usr/bin/env node

/**
 * Accessibility Validation Script
 * Validates that content follows accessibility guidelines
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const matter = require('gray-matter');

// Accessibility rules
const ACCESSIBILITY_RULES = {
  // Images must have alt text
  images: {
    pattern: /!\[([^\]]*)\]\([^)]+\)/g,
    validate: (match) => {
      const altText = match[1];
      return altText && altText.trim().length > 0;
    },
    message: 'Images must have descriptive alt text'
  },
  
  // Headings should follow hierarchy
  headings: {
    pattern: /^(#{1,6})\s+(.+)$/gm,
    validate: (matches) => {
      const levels = matches.map(match => match[1].length);
      
      // Check for proper hierarchy (no skipping levels)
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i-1] + 1) {
          return false;
        }
      }
      return true;
    },
    message: 'Headings should follow proper hierarchy (no skipping levels)'
  },
  
  // Links should have descriptive text
  links: {
    pattern: /\[([^\]]+)\]\([^)]+\)/g,
    validate: (match) => {
      const linkText = match[1];
      const badTexts = ['click here', 'read more', 'here', 'link', 'more'];
      return !badTexts.includes(linkText.toLowerCase().trim());
    },
    message: 'Links should have descriptive text (avoid "click here", "read more", etc.)'
  },
  
  // Tables should have headers
  tables: {
    pattern: /\|.*\|[\r\n]+\|[-\s|:]+\|/g,
    validate: (match) => {
      // Check if table has header row (indicated by separator row)
      return true; // Basic table structure check
    },
    message: 'Tables should have proper header structure'
  },
  
  // Code blocks should have language specified
  codeBlocks: {
    pattern: /```(\w*)\n/g,
    validate: (match) => {
      const language = match[1];
      return language && language.trim().length > 0;
    },
    message: 'Code blocks should specify the programming language for screen readers'
  }
};

// Color contrast and visual accessibility checks
const VISUAL_ACCESSIBILITY_RULES = {
  // Check for color-only information
  colorOnly: {
    pattern: /(red|green|blue|yellow|orange|purple|pink)\s+(text|color|background)/gi,
    message: 'Avoid using color alone to convey information'
  },
  
  // Check for directional references
  directional: {
    pattern: /(above|below|left|right|top|bottom)\s+(image|figure|table|diagram)/gi,
    message: 'Avoid directional references that may not work with screen readers'
  }
};

class AccessibilityValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.allFiles = [];
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('♿ Starting accessibility validation...');
    
    // Discover all markdown files
    await this.discoverFiles();
    
    // Validate each file
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
   * Discover all markdown files
   */
  async discoverFiles() {
    const contentDirs = ['content', 'src/content'];
    
    for (const dir of contentDirs) {
      if (!fs.existsSync(dir)) {
        continue;
      }
      
      const pattern = path.join(dir, '**/*.{md,mdx}');
      const files = await glob(pattern);
      this.allFiles.push(...files);
    }
    
    console.log(`📁 Found ${this.allFiles.length} markdown files`);
  }

  /**
   * Validate accessibility in a single file
   */
  async validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content: body } = matter(content);
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Validate frontmatter accessibility
      this.validateFrontmatterAccessibility(frontmatter, relativePath);
      
      // Validate content accessibility
      this.validateContentAccessibility(body, relativePath);
      
    } catch (error) {
      this.errors.push({
        file: path.relative(process.cwd(), filePath),
        error: `Failed to read file: ${error.message}`
      });
    }
  }

  /**
   * Validate frontmatter for accessibility
   */
  validateFrontmatterAccessibility(frontmatter, filePath) {
    // Check for required accessibility metadata
    if (!frontmatter.description) {
      this.warnings.push({
        file: filePath,
        warning: 'Missing description in frontmatter (important for SEO and screen readers)'
      });
    }
    
    // Check description length
    if (frontmatter.description && frontmatter.description.length > 160) {
      this.warnings.push({
        file: filePath,
        warning: 'Description is too long (should be under 160 characters for SEO)'
      });
    }
    
    // Check for accessibility-specific metadata
    if (frontmatter.hasImages && !frontmatter.imageDescriptions) {
      this.warnings.push({
        file: filePath,
        warning: 'Content with images should include imageDescriptions metadata'
      });
    }
  }

  /**
   * Validate content for accessibility
   */
  validateContentAccessibility(content, filePath) {
    // Apply all accessibility rules
    for (const [ruleName, rule] of Object.entries(ACCESSIBILITY_RULES)) {
      this.applyRule(rule, content, filePath, ruleName);
    }
    
    // Apply visual accessibility rules
    for (const [ruleName, rule] of Object.entries(VISUAL_ACCESSIBILITY_RULES)) {
      this.applyVisualRule(rule, content, filePath, ruleName);
    }
    
    // Check for document structure
    this.validateDocumentStructure(content, filePath);
  }

  /**
   * Apply a single accessibility rule
   */
  applyRule(rule, content, filePath, ruleName) {
    const matches = [...content.matchAll(rule.pattern)];
    
    if (ruleName === 'headings') {
      // Special handling for heading hierarchy
      if (matches.length > 0 && !rule.validate(matches)) {
        this.errors.push({
          file: filePath,
          error: rule.message
        });
      }
    } else {
      // Standard rule validation
      for (const match of matches) {
        if (!rule.validate(match)) {
          this.errors.push({
            file: filePath,
            error: `${rule.message}: "${match[0].substring(0, 50)}..."`
          });
        }
      }
    }
  }

  /**
   * Apply visual accessibility rules
   */
  applyVisualRule(rule, content, filePath, ruleName) {
    const matches = [...content.matchAll(rule.pattern)];
    
    for (const match of matches) {
      this.warnings.push({
        file: filePath,
        warning: `${rule.message}: "${match[0]}"`
      });
    }
  }

  /**
   * Validate overall document structure
   */
  validateDocumentStructure(content, filePath) {
    // Check for main heading (H1)
    const h1Pattern = /^#\s+(.+)$/m;
    const h1Match = content.match(h1Pattern);
    
    if (!h1Match) {
      this.errors.push({
        file: filePath,
        error: 'Document should have exactly one main heading (H1)'
      });
    }
    
    // Check for multiple H1s
    const h1Matches = content.match(/^#\s+(.+)$/gm);
    if (h1Matches && h1Matches.length > 1) {
      this.errors.push({
        file: filePath,
        error: 'Document should have only one main heading (H1)'
      });
    }
    
    // Check for empty headings
    const emptyHeadingPattern = /^#{1,6}\s*$/gm;
    const emptyHeadings = content.match(emptyHeadingPattern);
    if (emptyHeadings) {
      this.errors.push({
        file: filePath,
        error: 'Found empty headings (headings without text)'
      });
    }
    
    // Check for very long lines (readability)
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 120 && !line.startsWith('```') && !line.includes('http')) {
        this.warnings.push({
          file: filePath,
          warning: `Line ${i + 1} is very long (${line.length} characters). Consider breaking it up for readability.`
        });
      }
    }
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n📊 Accessibility Validation Results:');
    console.log(`✅ Files processed: ${this.allFiles.length}`);
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
      console.log('\n🎉 Content is accessible!');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AccessibilityValidator();
  validator.validate().catch(error => {
    console.error('❌ Accessibility validation failed:', error);
    process.exit(1);
  });
}

module.exports = AccessibilityValidator;