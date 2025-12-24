#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function extractCodeBlocks(content) {
  const codeBlocks = [];
  
  // Match fenced code blocks with language specification
  const fencedRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = fencedRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2],
      raw: match[0],
      startIndex: match.index
    });
  }
  
  return codeBlocks;
}

function validateCodeBlock(codeBlock, filePath) {
  const errors = [];
  const warnings = [];
  const { language, code } = codeBlock;
  
  // Check for empty code blocks
  if (!code || code.trim() === '') {
    warnings.push(`Empty code block (${language})`);
    return { errors, warnings };
  }
  
  // Language-specific validations
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
      validateJavaScript(code, errors, warnings);
      break;
    case 'typescript':
    case 'ts':
      validateTypeScript(code, errors, warnings);
      break;
    case 'python':
    case 'py':
      validatePython(code, errors, warnings);
      break;
    case 'java':
      validateJava(code, errors, warnings);
      break;
    case 'json':
      validateJSON(code, errors, warnings);
      break;
    case 'yaml':
    case 'yml':
      validateYAML(code, errors, warnings);
      break;
    case 'bash':
    case 'sh':
    case 'shell':
      validateShell(code, errors, warnings);
      break;
    case 'dockerfile':
      validateDockerfile(code, errors, warnings);
      break;
    default:
      // Generic validations for unknown languages
      validateGeneric(code, language, errors, warnings);
  }
  
  return { errors, warnings };
}

function validateJavaScript(code, errors, warnings) {
  // Check for common syntax issues
  if (code.includes('console.log') && !code.includes('//') && !code.includes('/*')) {
    warnings.push('Code contains console.log - consider if this is intentional for documentation');
  }
  
  // Check for incomplete code (common patterns)
  if (code.includes('...') || code.includes('// TODO')) {
    warnings.push('Code appears to be incomplete or contains placeholders');
  }
  
  // Check for proper async/await usage
  if (code.includes('await') && !code.includes('async')) {
    errors.push('Code uses await without async function declaration');
  }
  
  // Check for missing semicolons (if style requires them)
  const lines = code.split('\n').filter(line => line.trim());
  const statementsWithoutSemicolon = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.endsWith(';') && 
           !trimmed.endsWith('{') && 
           !trimmed.endsWith('}') &&
           !trimmed.startsWith('//') &&
           !trimmed.startsWith('/*') &&
           !trimmed.includes('if (') &&
           !trimmed.includes('for (') &&
           !trimmed.includes('while (');
  });
  
  if (statementsWithoutSemicolon.length > 0) {
    warnings.push(`Possible missing semicolons in ${statementsWithoutSemicolon.length} lines`);
  }
}

function validateTypeScript(code, errors, warnings) {
  // Run JavaScript validations first
  validateJavaScript(code, errors, warnings);
  
  // TypeScript-specific checks
  if (code.includes(': any')) {
    warnings.push('Code uses "any" type - consider more specific types for documentation');
  }
  
  // Check for proper interface/type definitions
  if (code.includes('interface') || code.includes('type ')) {
    if (!code.includes('{') || !code.includes('}')) {
      errors.push('Interface or type definition appears incomplete');
    }
  }
}

function validatePython(code, errors, warnings) {
  // Check for proper indentation (Python requirement)
  const lines = code.split('\n');
  let hasIndentationIssues = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() && line.startsWith(' ')) {
      // Check if indentation is consistent (multiples of 4 or 2)
      const leadingSpaces = line.match(/^ */)[0].length;
      if (leadingSpaces % 4 !== 0 && leadingSpaces % 2 !== 0) {
        hasIndentationIssues = true;
        break;
      }
    }
  }
  
  if (hasIndentationIssues) {
    warnings.push('Inconsistent indentation detected');
  }
  
  // Check for common Python issues
  if (code.includes('print ')) {
    warnings.push('Code uses Python 2 print statement - consider Python 3 syntax');
  }
  
  if (code.includes('import *')) {
    warnings.push('Code uses wildcard imports - consider specific imports for clarity');
  }
}

function validateJava(code, errors, warnings) {
  // Check for proper class structure
  if (code.includes('class ') && !code.includes('{')) {
    errors.push('Java class definition appears incomplete');
  }
  
  // Check for proper method structure
  if (code.includes('public ') && code.includes('(') && !code.includes('{')) {
    warnings.push('Java method definition may be incomplete');
  }
  
  // Check for missing semicolons
  const lines = code.split('\n').filter(line => line.trim());
  const statementsWithoutSemicolon = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.endsWith(';') && 
           !trimmed.endsWith('{') && 
           !trimmed.endsWith('}') &&
           !trimmed.startsWith('//') &&
           !trimmed.startsWith('/*') &&
           !trimmed.includes('if (') &&
           !trimmed.includes('for (') &&
           !trimmed.includes('while (') &&
           !trimmed.includes('class ') &&
           !trimmed.includes('interface ');
  });
  
  if (statementsWithoutSemicolon.length > 0) {
    warnings.push(`Possible missing semicolons in ${statementsWithoutSemicolon.length} lines`);
  }
}

function validateJSON(code, errors, warnings) {
  try {
    JSON.parse(code);
  } catch (error) {
    errors.push(`Invalid JSON syntax: ${error.message}`);
  }
}

function validateYAML(code, errors, warnings) {
  // Basic YAML validation
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for tabs (YAML doesn't allow tabs)
    if (line.includes('\t')) {
      errors.push(`Line ${i + 1}: YAML does not allow tabs for indentation`);
    }
    
    // Check for proper key-value format
    if (line.includes(':') && !line.trim().startsWith('#')) {
      const colonIndex = line.indexOf(':');
      const afterColon = line.substring(colonIndex + 1);
      
      if (afterColon && !afterColon.startsWith(' ') && afterColon.trim() !== '') {
        warnings.push(`Line ${i + 1}: Missing space after colon in YAML`);
      }
    }
  }
}

function validateShell(code, errors, warnings) {
  // Check for common shell script issues
  if (code.includes('rm -rf') && !code.includes('#')) {
    warnings.push('Code contains potentially dangerous rm -rf command');
  }
  
  // Check for proper shebang
  if (code.includes('#!/bin/bash') || code.includes('#!/bin/sh')) {
    // Good practice
  } else if (code.split('\n').length > 3) {
    warnings.push('Multi-line shell script missing shebang');
  }
  
  // Check for unquoted variables
  const variableUsage = code.match(/\$\w+/g);
  if (variableUsage) {
    variableUsage.forEach(variable => {
      if (!code.includes(`"${variable}"`) && !code.includes(`'${variable}'`)) {
        warnings.push(`Unquoted variable usage: ${variable}`);
      }
    });
  }
}

function validateDockerfile(code, errors, warnings) {
  const lines = code.split('\n').filter(line => line.trim());
  
  // Check for FROM instruction
  if (!lines.some(line => line.trim().toUpperCase().startsWith('FROM'))) {
    errors.push('Dockerfile missing FROM instruction');
  }
  
  // Check for proper instruction format
  const validInstructions = ['FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const instruction = trimmed.split(' ')[0].toUpperCase();
      if (!validInstructions.includes(instruction)) {
        warnings.push(`Line ${index + 1}: Unknown Dockerfile instruction: ${instruction}`);
      }
    }
  });
}

function validateGeneric(code, language, errors, warnings) {
  // Generic validations for any code
  
  // Check for placeholder text
  const placeholders = ['TODO', 'FIXME', 'XXX', '...', '<your-', '[your-'];
  placeholders.forEach(placeholder => {
    if (code.includes(placeholder)) {
      warnings.push(`Code contains placeholder text: ${placeholder}`);
    }
  });
  
  // Check for very long lines
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    if (line.length > 120) {
      warnings.push(`Line ${index + 1}: Very long line (${line.length} characters)`);
    }
  });
  
  // Check for mixed line endings
  if (code.includes('\r\n') && code.includes('\n')) {
    warnings.push('Mixed line endings detected');
  }
}

function main() {
  console.log('💻 Validating code examples in markdown files...\n');
  
  const patterns = [
    'content/**/*.md',
    'src/content/**/*.md'
  ];
  
  let totalFiles = 0;
  let totalCodeBlocks = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      totalFiles++;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const codeBlocks = extractCodeBlocks(content);
        
        totalCodeBlocks += codeBlocks.length;
        
        let fileErrors = 0;
        let fileWarnings = 0;
        
        for (const codeBlock of codeBlocks) {
          const { errors, warnings } = validateCodeBlock(codeBlock, file);
          fileErrors += errors.length;
          fileWarnings += warnings.length;
          
          if (errors.length > 0 || warnings.length > 0) {
            if (fileErrors + fileWarnings === errors.length + warnings.length) {
              // First issue in this file
              console.log(`📄 ${file} (${codeBlocks.length} code blocks)`);
            }
            
            console.log(`  📝 ${codeBlock.language} code block:`);
            
            if (errors.length > 0) {
              errors.forEach(error => console.log(`    ❌ ${error}`));
            }
            
            if (warnings.length > 0) {
              warnings.forEach(warning => console.log(`    ⚠️  ${warning}`));
            }
          }
        }
        
        if (fileErrors > 0 || fileWarnings > 0) {
          console.log('');
        }
        
        totalErrors += fileErrors;
        totalWarnings += fileWarnings;
        
      } catch (error) {
        console.log(`❌ Failed to read file ${file}: ${error.message}`);
        totalErrors++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files checked: ${totalFiles}`);
  console.log(`   Code blocks found: ${totalCodeBlocks}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Code validation failed due to errors.');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Code validation completed with warnings.');
  } else {
    console.log('\n✅ All code validation passed!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateCodeBlock, extractCodeBlocks };