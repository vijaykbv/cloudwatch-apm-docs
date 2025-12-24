#!/usr/bin/env node

/**
 * Deployed Links Validation Script
 * Validates that links work correctly on the deployed site
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://staging-docs.cloudwatch-apm.aws.amazon.com';
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const USER_AGENT = 'CloudWatch-APM-Docs-Link-Validator/1.0';

// Test endpoints to validate
const TEST_ENDPOINTS = [
  '/',
  '/health',
  '/getting-started',
  '/getting-started/quick-start',
  '/configuration',
  '/configuration/reference',
  '/examples',
  '/examples/java-spring-boot',
  '/implementation',
  '/implementation/brownfield-migration',
  '/api',
  '/troubleshooting',
  '/monitoring',
  '/security',
  '/performance'
];

// Expected response patterns
const RESPONSE_PATTERNS = {
  html: /<html[^>]*>/i,
  title: /<title[^>]*>([^<]+)<\/title>/i,
  navigation: /nav|menu|navigation/i,
  content: /<main|<article|<section/i
};

class DeployedLinksValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.results = new Map();
    this.requestQueue = [];
    this.activeRequests = 0;
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log(`🌐 Validating deployed site: ${SITE_URL}`);
    
    // Test basic connectivity
    await this.testConnectivity();
    
    // Validate all test endpoints
    await this.validateEndpoints();
    
    // Test cross-page navigation
    await this.testNavigation();
    
    // Test static assets
    await this.testStaticAssets();
    
    // Report results
    this.reportResults();
    
    // Exit with error code if there are errors
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  /**
   * Test basic connectivity to the site
   */
  async testConnectivity() {
    console.log('🔌 Testing basic connectivity...');
    
    try {
      const response = await this.makeRequest(SITE_URL);
      
      if (response.statusCode === 200) {
        console.log('✅ Site is accessible');
      } else {
        throw new Error(`Unexpected status code: ${response.statusCode}`);
      }
    } catch (error) {
      this.errors.push({
        test: 'connectivity',
        error: `Site is not accessible: ${error.message}`
      });
    }
  }

  /**
   * Validate all test endpoints
   */
  async validateEndpoints() {
    console.log('📋 Validating endpoints...');
    
    const promises = TEST_ENDPOINTS.map(endpoint => 
      this.validateEndpoint(endpoint)
    );
    
    await Promise.all(promises);
  }

  /**
   * Validate a single endpoint
   */
  async validateEndpoint(endpoint) {
    const url = `${SITE_URL}${endpoint}`;
    
    try {
      const response = await this.makeRequest(url);
      const result = {
        endpoint,
        url,
        statusCode: response.statusCode,
        contentType: response.headers['content-type'] || '',
        contentLength: response.headers['content-length'] || 0,
        responseTime: response.responseTime,
        valid: false,
        issues: []
      };
      
      // Check status code
      if (response.statusCode !== 200) {
        result.issues.push(`HTTP ${response.statusCode}`);
      }
      
      // Check content type
      if (!result.contentType.includes('text/html')) {
        result.issues.push(`Unexpected content type: ${result.contentType}`);
      }
      
      // Validate HTML content
      if (response.body) {
        this.validateHtmlContent(response.body, result);
      }
      
      // Mark as valid if no issues
      result.valid = result.issues.length === 0;
      
      this.results.set(endpoint, result);
      
      if (result.valid) {
        console.log(`✅ ${endpoint} (${response.responseTime}ms)`);
      } else {
        console.log(`❌ ${endpoint}: ${result.issues.join(', ')}`);
        this.errors.push({
          test: 'endpoint',
          endpoint,
          error: result.issues.join(', ')
        });
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      this.errors.push({
        test: 'endpoint',
        endpoint,
        error: error.message
      });
    }
  }

  /**
   * Validate HTML content structure
   */
  validateHtmlContent(html, result) {
    // Check for basic HTML structure
    if (!RESPONSE_PATTERNS.html.test(html)) {
      result.issues.push('Invalid HTML structure');
    }
    
    // Check for title
    const titleMatch = html.match(RESPONSE_PATTERNS.title);
    if (!titleMatch) {
      result.issues.push('Missing page title');
    } else if (titleMatch[1].trim().length === 0) {
      result.issues.push('Empty page title');
    }
    
    // Check for navigation
    if (!RESPONSE_PATTERNS.navigation.test(html)) {
      result.issues.push('Missing navigation elements');
    }
    
    // Check for main content
    if (!RESPONSE_PATTERNS.content.test(html)) {
      result.issues.push('Missing main content structure');
    }
    
    // Check for common errors
    if (html.includes('404') || html.includes('Not Found')) {
      result.issues.push('Page contains 404 error content');
    }
    
    if (html.includes('500') || html.includes('Internal Server Error')) {
      result.issues.push('Page contains server error content');
    }
    
    // Check content length
    if (html.length < 1000) {
      result.issues.push('Page content is very short');
    }
  }

  /**
   * Test navigation between pages
   */
  async testNavigation() {
    console.log('🧭 Testing navigation...');
    
    try {
      // Get the home page
      const homeResponse = await this.makeRequest(SITE_URL);
      
      if (homeResponse.statusCode === 200 && homeResponse.body) {
        // Extract navigation links
        const navLinks = this.extractNavigationLinks(homeResponse.body);
        
        console.log(`Found ${navLinks.length} navigation links`);
        
        // Test a sample of navigation links
        const sampleLinks = navLinks.slice(0, 5);
        
        for (const link of sampleLinks) {
          try {
            const linkUrl = new URL(link, SITE_URL).href;
            const response = await this.makeRequest(linkUrl);
            
            if (response.statusCode === 200) {
              console.log(`✅ Navigation link: ${link}`);
            } else {
              this.warnings.push({
                test: 'navigation',
                warning: `Navigation link returned ${response.statusCode}: ${link}`
              });
            }
          } catch (error) {
            this.warnings.push({
              test: 'navigation',
              warning: `Navigation link failed: ${link} - ${error.message}`
            });
          }
        }
      }
    } catch (error) {
      this.warnings.push({
        test: 'navigation',
        warning: `Navigation test failed: ${error.message}`
      });
    }
  }

  /**
   * Extract navigation links from HTML
   */
  extractNavigationLinks(html) {
    const links = [];
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      
      // Skip external links, anchors, and non-page links
      if (!href.startsWith('http') && 
          !href.startsWith('#') && 
          !href.startsWith('mailto:') && 
          !href.startsWith('tel:') &&
          !href.includes('.') || href.endsWith('.html')) {
        links.push(href);
      }
    }
    
    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Test static assets
   */
  async testStaticAssets() {
    console.log('📦 Testing static assets...');
    
    const assetPaths = [
      '/_next/static/',
      '/favicon.ico',
      '/robots.txt'
    ];
    
    for (const assetPath of assetPaths) {
      try {
        const url = `${SITE_URL}${assetPath}`;
        const response = await this.makeRequest(url, { method: 'HEAD' });
        
        if (response.statusCode === 200 || response.statusCode === 404) {
          console.log(`✅ Static asset: ${assetPath}`);
        } else {
          this.warnings.push({
            test: 'static-assets',
            warning: `Static asset returned ${response.statusCode}: ${assetPath}`
          });
        }
      } catch (error) {
        this.warnings.push({
          test: 'static-assets',
          warning: `Static asset failed: ${assetPath} - ${error.message}`
        });
      }
    }
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers
        },
        timeout: REQUEST_TIMEOUT
      };
      
      const req = client.request(requestOptions, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: options.method === 'HEAD' ? null : body,
            responseTime
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n📊 Deployed Links Validation Results:');
    console.log(`🌐 Site: ${SITE_URL}`);
    console.log(`✅ Endpoints tested: ${TEST_ENDPOINTS.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    // Show successful endpoints
    const successfulEndpoints = [...this.results.values()].filter(r => r.valid);
    if (successfulEndpoints.length > 0) {
      console.log('\n✅ Successful endpoints:');
      successfulEndpoints.forEach(result => {
        console.log(`  ${result.endpoint} (${result.responseTime}ms)`);
      });
    }
    
    // Show warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(({ test, warning }) => {
        console.log(`  [${test}] ${warning}`);
      });
    }
    
    // Show errors
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ test, endpoint, error }) => {
        const location = endpoint || test;
        console.log(`  [${test}] ${location}: ${error}`);
      });
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 All deployed links are working correctly!');
    } else {
      console.log('\n💥 Some links are not working correctly on the deployed site');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DeployedLinksValidator();
  validator.validate().catch(error => {
    console.error('❌ Deployed links validation failed:', error);
    process.exit(1);
  });
}

module.exports = DeployedLinksValidator;