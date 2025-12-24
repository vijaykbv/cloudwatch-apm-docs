#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// Required frontmatter fields for different content types
const requiredFields = {
  'getting-started': ['title', 'description', 'order', 'audience'],
  'examples': ['title', 'description', 'language', 'difficulty', 'tags'],
  'configuration': ['title', 'description', 'category', 'parameters'],
  'troubleshooting': ['title', 'description', 'category', 'symptoms', 'solutions'],
  'api': ['title', 'description', 'endpoint', 'method', 'parameters'],
  'default': ['title', 'description']
};

// Optional fields that should be validated if present
const optionalFields = {
  'lastUpdated': 'date',
  'author': 'string',
  'reviewers': 'array',
  'tags': 'array',
  'relatedPages': 'array'
};

function validateFrontmatter(filePath, content) {
  const errors = [];
  const warnings = [];
  
  try {
    const parsed = matter(content);
    const frontmatter = parsed.data;
    
    // Determine content type from file path
    const contentType = getContentType(filePath);
    const required = requiredFields[contentType] || requiredFields.default;
    
    // Check required fields
    for (const field of required) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      } else if (typeof frontmatter[field] === 'string' && frontmatter[field].trim() === '') {
        errors.push(`Empty required field: ${field}`);
      }
    }
    
    // Validate optional fields if present
    for (const [field, expectedType] of Object.entries(optionalFields)) {
      if (frontmatter[field]) {
        if (!validateFieldType(frontmatter[field], expectedType)) {
          errors.push(`Invalid type for field ${field}: expected ${expectedType}`);
        }
      }
    }
    
    // Content-specific validations
    if (contentType === 'examples' && frontmatter.language) {
      const validLanguages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'csharp'];
      if (!validLanguages.includes(frontmatter.language.toLowerCase())) {
        warnings.push(`Uncommon language: ${frontmatter.language}`);
      }
    }
    
    if (frontmatter.difficulty) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(frontmatter.difficulty.toLowerCase())) {
        errors.push(`Invalid difficulty level: ${frontmatter.difficulty}`);
      }
    }
    
    if (frontmatter.audience) {
      const validAudiences = ['developer', 'operations', 'architect', 'security', 'all'];
      const audiences = Array.isArray(frontmatter.audience) ? frontmatter.audience : [frontmatter.audience];
      for (const audience of audiences) {
        if (!validAudiences.includes(audience.toLowerCase())) {
          warnings.push(`Uncommon audience: ${audience}`);
        }
      }
    }
    
    // Check for common typos in field names
    const commonTypos = {
      'titel': 'title',
      'discription': 'description',
      'autor': 'author',
      'tages': 'tags'
    };
    
    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (frontmatter[typo]) {
        errors.push(`Possible typo: "${typo}" should be "${correct}"`);
      }
    }
    
  } catch (error) {
    errors.push(`Failed to parse frontmatter: ${error.message}`);
  }
  
  return { errors, warnings };
}

function getContentType(filePath) {
  if (filePath.includes('getting-started')) return 'getting-started';
  if (filePath.includes('examples')) return 'examples';
  if (filePath.includes('configuration')) return 'configuration';
  if (filePath.includes('troubleshooting')) return 'troubleshooting';
  if (filePath.includes('api')) return 'api';
  return 'default';
}

function validateFieldType(value, expectedType) {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'array':
      return Array.isArray(value);
    case 'date':
      return !isNaN(Date.parse(value));
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return true;
  }
}

function main() {
  console.log('🔍 Validating frontmatter in markdown files...\n');
  
  const patterns = [
    'content/**/*.md',
    'src/content/**/*.md'
  ];
  
  let totalFiles = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      totalFiles++;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { errors, warnings } = validateFrontmatter(file, content);
        
        if (errors.length > 0 || warnings.length > 0) {
          console.log(`📄 ${file}`);
          
          if (errors.length > 0) {
            console.log('  ❌ Errors:');
            errors.forEach(error => console.log(`    - ${error}`));
            totalErrors += errors.length;
          }
          
          if (warnings.length > 0) {
            console.log('  ⚠️  Warnings:');
            warnings.forEach(warning => console.log(`    - ${warning}`));
            totalWarnings += warnings.length;
          }
          
          console.log('');
        }
      } catch (error) {
        console.log(`❌ Failed to read file ${file}: ${error.message}`);
        totalErrors++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files checked: ${totalFiles}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Validation failed due to errors.');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Validation completed with warnings.');
  } else {
    console.log('\n✅ All frontmatter validation passed!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateFrontmatter, getContentType };