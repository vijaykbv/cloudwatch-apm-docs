#!/usr/bin/env node

/**
 * Content Report Generation Script
 * Generates comprehensive statistics and reports about documentation content
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const matter = require('gray-matter');

class ContentReportGenerator {
  constructor() {
    this.stats = {
      totalFiles: 0,
      totalWords: 0,
      totalCharacters: 0,
      sections: new Map(),
      audiences: new Map(),
      difficulties: new Map(),
      categories: new Map(),
      languages: new Map(),
      estimatedReadTime: 0,
      lastUpdated: new Date().toISOString()
    };
    this.files = [];
  }

  /**
   * Generate comprehensive content report
   */
  async generateReport() {
    console.log('📊 Generating content report...');
    
    // Discover and analyze all content files
    await this.discoverContent();
    await this.analyzeContent();
    
    // Generate report
    const report = this.formatReport();
    
    // Output report
    console.log(report);
    
    return report;
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
        const relativePath = path.relative(process.cwd(), file);
        const section = this.extractSection(relativePath);
        
        this.files.push({
          path: file,
          relativePath,
          section
        });
      }
    }
    
    this.stats.totalFiles = this.files.length;
  }

  /**
   * Extract section name from file path
   */
  extractSection(filePath) {
    const parts = filePath.split(path.sep);
    // Skip 'content' or 'src/content' prefix
    const contentIndex = parts.findIndex(part => part === 'content');
    if (contentIndex >= 0 && contentIndex < parts.length - 1) {
      return parts[contentIndex + 1];
    }
    return 'root';
  }

  /**
   * Analyze all content files
   */
  async analyzeContent() {
    for (const fileInfo of this.files) {
      await this.analyzeFile(fileInfo);
    }
  }

  /**
   * Analyze a single content file
   */
  async analyzeFile(fileInfo) {
    try {
      const content = fs.readFileSync(fileInfo.path, 'utf8');
      const { data: frontmatter, content: body } = matter(content);
      
      // Count words and characters
      const wordCount = this.countWords(body);
      const charCount = body.length;
      
      this.stats.totalWords += wordCount;
      this.stats.totalCharacters += charCount;
      
      // Analyze sections
      this.incrementMap(this.stats.sections, fileInfo.section);
      
      // Analyze frontmatter
      this.analyzeFrontmatter(frontmatter);
      
      // Analyze content structure
      this.analyzeContentStructure(body, fileInfo);
      
      // Calculate estimated read time (average 200 words per minute)
      const readTime = Math.ceil(wordCount / 200);
      this.stats.estimatedReadTime += readTime;
      
    } catch (error) {
      console.warn(`Warning: Could not analyze ${fileInfo.relativePath}: ${error.message}`);
    }
  }

  /**
   * Count words in text
   */
  countWords(text) {
    // Remove code blocks
    const withoutCode = text.replace(/```[\s\S]*?```/g, '');
    
    // Remove inline code
    const withoutInlineCode = withoutCode.replace(/`[^`]+`/g, '');
    
    // Count words
    const words = withoutInlineCode
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    return words.length;
  }

  /**
   * Analyze frontmatter metadata
   */
  analyzeFrontmatter(frontmatter) {
    // Analyze audience
    if (frontmatter.audience) {
      const audiences = Array.isArray(frontmatter.audience) 
        ? frontmatter.audience 
        : [frontmatter.audience];
      
      audiences.forEach(audience => {
        this.incrementMap(this.stats.audiences, audience);
      });
    }
    
    // Analyze difficulty
    if (frontmatter.difficulty) {
      this.incrementMap(this.stats.difficulties, frontmatter.difficulty);
    }
    
    // Analyze category
    if (frontmatter.category) {
      this.incrementMap(this.stats.categories, frontmatter.category);
    }
  }

  /**
   * Analyze content structure
   */
  analyzeContentStructure(content, fileInfo) {
    // Count headings
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    
    // Count code blocks and extract languages
    const codeBlocks = content.match(/```(\w+)/g) || [];
    codeBlocks.forEach(block => {
      const language = block.replace('```', '');
      if (language) {
        this.incrementMap(this.stats.languages, language);
      }
    });
    
    // Count images
    const images = content.match(/!\[.*?\]\(.*?\)/g) || [];
    
    // Count links
    const links = content.match(/\[.*?\]\(.*?\)/g) || [];
    
    // Store additional stats per file
    fileInfo.stats = {
      headings: headings.length,
      codeBlocks: codeBlocks.length,
      images: images.length,
      links: links.length
    };
  }

  /**
   * Increment count in a Map
   */
  incrementMap(map, key) {
    if (key) {
      map.set(key, (map.get(key) || 0) + 1);
    }
  }

  /**
   * Format the final report
   */
  formatReport() {
    const report = [];
    
    report.push('# Content Report');
    report.push('');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push('');
    
    // Overview statistics
    report.push('## Overview');
    report.push('');
    report.push(`- **Total Files**: ${this.stats.totalFiles}`);
    report.push(`- **Total Words**: ${this.stats.totalWords.toLocaleString()}`);
    report.push(`- **Total Characters**: ${this.stats.totalCharacters.toLocaleString()}`);
    report.push(`- **Estimated Read Time**: ${Math.ceil(this.stats.estimatedReadTime)} minutes`);
    report.push('');
    
    // Content by section
    if (this.stats.sections.size > 0) {
      report.push('## Content by Section');
      report.push('');
      report.push('| Section | Files | Percentage |');
      report.push('|---------|-------|------------|');
      
      const sortedSections = [...this.stats.sections.entries()]
        .sort((a, b) => b[1] - a[1]);
      
      for (const [section, count] of sortedSections) {
        const percentage = ((count / this.stats.totalFiles) * 100).toFixed(1);
        report.push(`| ${section} | ${count} | ${percentage}% |`);
      }
      report.push('');
    }
    
    // Content by audience
    if (this.stats.audiences.size > 0) {
      report.push('## Content by Audience');
      report.push('');
      report.push('| Audience | Files | Percentage |');
      report.push('|----------|-------|------------|');
      
      const sortedAudiences = [...this.stats.audiences.entries()]
        .sort((a, b) => b[1] - a[1]);
      
      for (const [audience, count] of sortedAudiences) {
        const percentage = ((count / this.stats.totalFiles) * 100).toFixed(1);
        report.push(`| ${audience} | ${count} | ${percentage}% |`);
      }
      report.push('');
    }
    
    // Content by difficulty
    if (this.stats.difficulties.size > 0) {
      report.push('## Content by Difficulty');
      report.push('');
      report.push('| Difficulty | Files | Percentage |');
      report.push('|------------|-------|------------|');
      
      const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
      const sortedDifficulties = [...this.stats.difficulties.entries()]
        .sort((a, b) => {
          const aIndex = difficultyOrder.indexOf(a[0]);
          const bIndex = difficultyOrder.indexOf(b[0]);
          return aIndex - bIndex;
        });
      
      for (const [difficulty, count] of sortedDifficulties) {
        const percentage = ((count / this.stats.totalFiles) * 100).toFixed(1);
        report.push(`| ${difficulty} | ${count} | ${percentage}% |`);
      }
      report.push('');
    }
    
    // Programming languages in examples
    if (this.stats.languages.size > 0) {
      report.push('## Programming Languages in Examples');
      report.push('');
      report.push('| Language | Code Blocks |');
      report.push('|----------|-------------|');
      
      const sortedLanguages = [...this.stats.languages.entries()]
        .sort((a, b) => b[1] - a[1]);
      
      for (const [language, count] of sortedLanguages) {
        report.push(`| ${language} | ${count} |`);
      }
      report.push('');
    }
    
    // Content gaps and recommendations
    report.push('## Content Analysis & Recommendations');
    report.push('');
    
    // Check for content gaps
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        report.push(`- ${rec}`);
      });
    } else {
      report.push('- Content coverage appears comprehensive');
    }
    report.push('');
    
    // Quality metrics
    report.push('## Quality Metrics');
    report.push('');
    
    const avgWordsPerFile = Math.round(this.stats.totalWords / this.stats.totalFiles);
    const avgReadTimePerFile = Math.round(this.stats.estimatedReadTime / this.stats.totalFiles);
    
    report.push(`- **Average words per file**: ${avgWordsPerFile}`);
    report.push(`- **Average read time per file**: ${avgReadTimePerFile} minutes`);
    
    // File size distribution
    const fileSizeCategories = this.categorizeFileSizes();
    if (fileSizeCategories.short > 0) {
      report.push(`- **Short files** (< 300 words): ${fileSizeCategories.short}`);
    }
    if (fileSizeCategories.medium > 0) {
      report.push(`- **Medium files** (300-1000 words): ${fileSizeCategories.medium}`);
    }
    if (fileSizeCategories.long > 0) {
      report.push(`- **Long files** (> 1000 words): ${fileSizeCategories.long}`);
    }
    
    return report.join('\n');
  }

  /**
   * Generate content recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check for missing audiences
    const expectedAudiences = ['developer', 'operations', 'architect', 'security'];
    const missingAudiences = expectedAudiences.filter(audience => 
      !this.stats.audiences.has(audience)
    );
    
    if (missingAudiences.length > 0) {
      recommendations.push(`Consider adding content for: ${missingAudiences.join(', ')}`);
    }
    
    // Check for difficulty balance
    const beginnerContent = this.stats.difficulties.get('beginner') || 0;
    const totalWithDifficulty = [...this.stats.difficulties.values()].reduce((a, b) => a + b, 0);
    
    if (totalWithDifficulty > 0 && beginnerContent / totalWithDifficulty < 0.3) {
      recommendations.push('Consider adding more beginner-friendly content');
    }
    
    // Check for programming language coverage
    const commonLanguages = ['javascript', 'python', 'java', 'typescript'];
    const missingLanguages = commonLanguages.filter(lang => 
      !this.stats.languages.has(lang)
    );
    
    if (missingLanguages.length > 0) {
      recommendations.push(`Consider adding examples for: ${missingLanguages.join(', ')}`);
    }
    
    return recommendations;
  }

  /**
   * Categorize files by size
   */
  categorizeFileSizes() {
    const categories = { short: 0, medium: 0, long: 0 };
    
    this.files.forEach(fileInfo => {
      try {
        const content = fs.readFileSync(fileInfo.path, 'utf8');
        const { content: body } = matter(content);
        const wordCount = this.countWords(body);
        
        if (wordCount < 300) {
          categories.short++;
        } else if (wordCount <= 1000) {
          categories.medium++;
        } else {
          categories.long++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    return categories;
  }
}

// Run report generation if called directly
if (require.main === module) {
  const generator = new ContentReportGenerator();
  generator.generateReport().catch(error => {
    console.error('❌ Content report generation failed:', error);
    process.exit(1);
  });
}

module.exports = ContentReportGenerator;