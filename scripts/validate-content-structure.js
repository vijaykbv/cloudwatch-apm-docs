#!/usr/bin/env node

/**
 * Content Structure Validation Script
 * Validates that required content sections and structure exist
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const matter = require('gray-matter');

// Required content structure
const REQUIRED_SECTIONS = {
  'getting-started': {
    required: true,
    files: ['index.md', 'quick-start.md'],
    subsections: ['installation', 'configuration', 'verification']
  },
  'configuration': {
    required: true,
    files: ['reference.md'],
    subsections: ['parameters', 'examples', 'validation']
  },
  'examples': {
    required: true,
    files: ['java-spring-boot.md'],
    subsections: ['basic', 'advanced', 'best-practices']
  },
  'implementation': {
    required: true,
    files: ['brownfield-migration.md'],
    subsections: ['migration', 'integration', 'rollout']
  },
  'troubleshooting': {
    required: false,
    files: [],
    subsections: ['common-issues', 'diagnostics', 'faq']
  }
};

// Required frontmatter fields
const REQUIRED_FRONTMATTER = [
  'title',
  'description',
  'audience',
  'difficulty'
];

// Valid values for frontmatter fields
const VALID_VALUES = {
  audience: ['developer', 'operations', 'architect', 'security'],
  difficulty: ['beginner', 'intermediate', 'advanced'],
  category: ['getting-started', 'configuration', 'examples', 'implementation', 'troubleshooting', 'api', 'monitoring', 'security', 'performance']
};

class ContentStructureValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.contentFiles = new Map();
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🏗️  Starting content structure validation...');
    
    // Discover all content files
    await this.discoverContent();
    
    // Validate required sections
    this.validateRequiredSections();
    
    // Validate individual files
    await this.validateFiles();
    
    // Report results
    this.reportResults();
    
    // Exit with error code if there are errors
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  /**
   * Discover all content files
   */
  async discoverContent() {
    const contentDirs = ['content', 'src/content'];
    
    for (const dir of contentDirs) {
      if (!fs.existsSync(dir)) {
        continue;
      }
      
      const pattern = path.join(dir, '**/*.{md,mdx}');
      const files = await glob(pattern);
      
      for (const file of files) {
        const relativePath = path.relative(dir, file);
        const section = this.extractSection(relativePath);
        
        if (!this.contentFiles.has(section)) {
          this.contentFiles.set(section, []);
        }
        
        this.contentFiles.get(section).push({
          path: file,
          relativePath,
          section
        });
      }
    }
    
    console.log(`📁 Found content in ${this.contentFiles.size} sections`);
  }

  /**
   * Extract section name from file path
   */
  extractSection(filePath) {
    const parts = filePath.split(path.sep);
    return parts[0] || 'root';
  }

  /**
   * Validate required sections exist
   */
  validateRequiredSections() {
    for (const [sectionName, config] of Object.entries(REQUIRED_SECTIONS)) {
      if (!config.required) {
        continue;
      }
      
      if (!this.contentFiles.has(sectionName)) {
        this.errors.push({
          section: sectionName,
          error: `Required section '${sectionName}' is missing`
        });
        continue;
      }
      
      // Check required files
      const sectionFiles = this.contentFiles.get(sectionName);
      const fileNames = sectionFiles.map(f => path.basename(f.relativePath));
      
      for (const requiredFile of config.files) {
        if (!fileNames.includes(requiredFile)) {
          this.errors.push({
            section: sectionName,
            error: `Required file '${requiredFile}' is missing from section '${sectionName}'`
          });
        }
      }
    }
  }

  /**
   * Validate individual content files
   */
  async validateFiles() {
    for (const [section, files] of this.contentFiles) {
      for (const file of files) {
        await this.validateFile(file);
      }
    }
  }

  /**
   * Validate a single content file
   */
  async validateFile(fileInfo) {
    try {
      const content = fs.readFileSync(fileInfo.path, 'utf8');
      const { data: frontmatter, content: body } = matter(content);
      
      // Validate frontmatter
      this.validateFrontmatter(frontmatter, fileInfo);
      
      // Validate content structure
      this.validateContentBody(body, fileInfo);
      
    } catch (error) {
      this.errors.push({
        file: fileInfo.relativePath,
        error: `Failed to parse file: ${error.message}`
      });
    }
  }

  /**
   * Validate frontmatter fields
   */
  validateFrontmatter(frontmatter, fileInfo) {
    // Check required fields
    for (const field of REQUIRED_FRONTMATTER) {
      if (!frontmatter[field]) {
        this.errors.push({
          file: fileInfo.relativePath,
          error: `Missing required frontmatter field: ${field}`
        });
      }
    }
    
    // Validate field values
    for (const [field, validValues] of Object.entries(VALID_VALUES)) {
      if (frontmatter[field]) {
        const value = Array.isArray(frontmatter[field]) ? frontmatter[field] : [frontmatter[field]];
        
        for (const v of value) {
          if (!validValues.includes(v)) {
            this.errors.push({
              file: fileInfo.relativePath,
              error: `Invalid ${field} value: '${v}'. Valid values: ${validValues.join(', ')}`
            });
          }
        }
      }
    }
    
    // Validate estimated read time
    if (frontmatter.estimatedReadTime && typeof frontmatter.estimatedReadTime !== 'number') {
      this.errors.push({
        file: fileInfo.relativePath,
        error: 'estimatedReadTime must be a number (minutes)'
      });
    }
    
    // Validate tags
    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      this.errors.push({
        file: fileInfo.relativePath,
        error: 'tags must be an array'
      });
    }
  }

  /**
   * Validate content body structure
   */
  validateContentBody(body, fileInfo) {
    // Check for minimum content length
    if (body.trim().length < 100) {
      this.warnings.push({
        file: fileInfo.relativePath,
        warning: 'Content is very short (less than 100 characters)'
      });
    }
    
    // Check for required headings based on section
    const headings = this.extractHeadings(body);
    
    if (fileInfo.section === 'getting-started') {
      this.validateGettingStartedStructure(headings, fileInfo);
    } else if (fileInfo.section === 'configuration') {
      this.validateConfigurationStructure(headings, fileInfo);
    } else if (fileInfo.section === 'examples') {
      this.validateExamplesStructure(headings, fileInfo);
    }
    
    // Check for code blocks in example files
    if (fileInfo.section === 'examples' && !body.includes('```')) {
      this.warnings.push({
        file: fileInfo.relativePath,
        warning: 'Example file should contain code blocks'
      });
    }
  }

  /**
   * Extract headings from markdown content
   */
  extractHeadings(content) {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      });
    }
    
    return headings;
  }

  /**
   * Validate getting started content structure
   */
  validateGettingStartedStructure(headings, fileInfo) {
    const requiredSections = ['Prerequisites', 'Installation', 'Configuration', 'Verification'];
    const headingTexts = headings.map(h => h.text);
    
    for (const section of requiredSections) {
      if (!headingTexts.some(text => text.toLowerCase().includes(section.toLowerCase()))) {
        this.warnings.push({
          file: fileInfo.relativePath,
          warning: `Getting started guide should include '${section}' section`
        });
      }
    }
  }

  /**
   * Validate configuration content structure
   */
  validateConfigurationStructure(headings, fileInfo) {
    const requiredSections = ['Parameters', 'Examples'];
    const headingTexts = headings.map(h => h.text);
    
    for (const section of requiredSections) {
      if (!headingTexts.some(text => text.toLowerCase().includes(section.toLowerCase()))) {
        this.warnings.push({
          file: fileInfo.relativePath,
          warning: `Configuration guide should include '${section}' section`
        });
      }
    }
  }

  /**
   * Validate examples content structure
   */
  validateExamplesStructure(headings, fileInfo) {
    const requiredSections = ['Overview', 'Implementation'];
    const headingTexts = headings.map(h => h.text);
    
    for (const section of requiredSections) {
      if (!headingTexts.some(text => text.toLowerCase().includes(section.toLowerCase()))) {
        this.warnings.push({
          file: fileInfo.relativePath,
          warning: `Example should include '${section}' section`
        });
      }
    }
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n📊 Content Structure Validation Results:');
    console.log(`✅ Sections found: ${this.contentFiles.size}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(({ file, section, warning }) => {
        const location = file || section || 'unknown';
        console.log(`  ${location}: ${warning}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, section, error }) => {
        const location = file || section || 'unknown';
        console.log(`  ${location}: ${error}`);
      });
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 Content structure is valid!');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ContentStructureValidator();
  validator.validate().catch(error => {
    console.error('❌ Content structure validation failed:', error);
    process.exit(1);
  });
}

module.exports = ContentStructureValidator;