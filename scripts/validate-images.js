#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function extractImageReferences(content) {
  const images = [];
  
  // Markdown image syntax: ![alt](path)
  const markdownImages = content.match(/!\[.*?\]\((.*?)\)/g);
  if (markdownImages) {
    markdownImages.forEach(match => {
      const pathMatch = match.match(/!\[.*?\]\((.*?)\)/);
      if (pathMatch && pathMatch[1]) {
        images.push({
          type: 'markdown',
          path: pathMatch[1],
          raw: match
        });
      }
    });
  }
  
  // HTML img tags: <img src="path">
  const htmlImages = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/g);
  if (htmlImages) {
    htmlImages.forEach(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        images.push({
          type: 'html',
          path: srcMatch[1],
          raw: match
        });
      }
    });
  }
  
  return images;
}

function isExternalUrl(imagePath) {
  return imagePath.startsWith('http://') || 
         imagePath.startsWith('https://') || 
         imagePath.startsWith('//');
}

function resolveImagePath(imagePath, markdownFilePath) {
  if (isExternalUrl(imagePath)) {
    return null; // External URLs are not validated
  }
  
  // Handle absolute paths from project root
  if (imagePath.startsWith('/')) {
    return path.join(process.cwd(), imagePath.substring(1));
  }
  
  // Handle relative paths
  const markdownDir = path.dirname(markdownFilePath);
  return path.resolve(markdownDir, imagePath);
}

function validateImages(filePath, content) {
  const errors = [];
  const warnings = [];
  const images = extractImageReferences(content);
  
  for (const image of images) {
    if (isExternalUrl(image.path)) {
      // Skip external URLs but warn about them
      warnings.push(`External image URL: ${image.path}`);
      continue;
    }
    
    const resolvedPath = resolveImagePath(image.path, filePath);
    
    if (!resolvedPath) {
      warnings.push(`Could not resolve image path: ${image.path}`);
      continue;
    }
    
    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`Missing image: ${image.path} (resolved to: ${resolvedPath})`);
      continue;
    }
    
    // Check if it's actually an image file
    const ext = path.extname(resolvedPath).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    
    if (!validExtensions.includes(ext)) {
      warnings.push(`Unusual image extension: ${image.path} (${ext})`);
    }
    
    // Check file size (warn if > 1MB)
    try {
      const stats = fs.statSync(resolvedPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > 1) {
        warnings.push(`Large image file: ${image.path} (${fileSizeMB.toFixed(2)}MB)`);
      }
    } catch (error) {
      warnings.push(`Could not check file size for: ${image.path}`);
    }
    
    // Check for alt text in markdown images
    if (image.type === 'markdown') {
      const altMatch = image.raw.match(/!\[(.*?)\]/);
      const altText = altMatch ? altMatch[1] : '';
      
      if (!altText || altText.trim() === '') {
        warnings.push(`Missing alt text for image: ${image.path}`);
      } else if (altText.length < 3) {
        warnings.push(`Very short alt text for image: ${image.path} ("${altText}")`);
      }
    }
    
    // Check for alt attribute in HTML images
    if (image.type === 'html') {
      if (!image.raw.includes('alt=')) {
        warnings.push(`Missing alt attribute for HTML image: ${image.path}`);
      }
    }
  }
  
  return { errors, warnings, imageCount: images.length };
}

function main() {
  console.log('🖼️  Validating images in markdown files...\n');
  
  const patterns = [
    'content/**/*.md',
    'src/content/**/*.md'
  ];
  
  let totalFiles = 0;
  let totalImages = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      totalFiles++;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { errors, warnings, imageCount } = validateImages(file, content);
        
        totalImages += imageCount;
        
        if (errors.length > 0 || warnings.length > 0) {
          console.log(`📄 ${file} (${imageCount} images)`);
          
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
  console.log(`   Images found: ${totalImages}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Image validation failed due to errors.');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Image validation completed with warnings.');
  } else {
    console.log('\n✅ All image validation passed!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateImages, extractImageReferences };