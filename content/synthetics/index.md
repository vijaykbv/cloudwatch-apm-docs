---
title: "CloudWatch Synthetics Monitoring"
description: "Proactive application monitoring with CloudWatch Synthetics - continuously test your APIs, URLs, and workflows to catch issues before your users do"
audience: ["developer", "operations", "architect", "sre"]
difficulty: "beginner"
category: "monitoring"
tags: ["synthetics", "monitoring", "canaries", "uptime", "api-testing", "user-journey"]
estimatedReadTime: 10
lastUpdated: "2026-01-29"
relatedPages: ["/getting-started/", "/implementation/", "/cost-optimization/"]
---

# CloudWatch Synthetics

## Monitor Your Applications 24/7, Before Users Notice Issues

**CloudWatch Synthetics** allows you to create canaries—configurable scripts that run on a schedule to monitor your endpoints, APIs, and user workflows. Catch broken links, slow responses, and errors before they impact your customers.

### 🎯 **Why CloudWatch Synthetics?**

<div class="benefits-grid">

#### 🔍 **Proactive Monitoring**
Detect issues before customers experience them with continuous automated testing of your application endpoints and user journeys.

#### 🌍 **Global Coverage**
Test from multiple AWS regions to understand performance across different geographic locations and catch region-specific issues.

#### 📊 **Visual Verification**
Capture screenshots and HAR files to see exactly what your users see, making troubleshooting faster and more accurate.

#### 💰 **Cost-Effective**
Pay only for what you use with no upfront costs. Start with free tier: 100 canary runs per month.

</div>

---

## Quick Start Guides

### 🆕 **For New Users**

#### Getting Started with Your First Canary

**What you'll learn:**
- Create a heartbeat monitor for your website
- Set up alerts for failures
- View results and screenshots

**Time to complete:** 10 minutes

```bash
# Prerequisites
- AWS Account with CloudWatch access
- Application endpoint URL to monitor
- Basic familiarity with AWS Console
```

**Steps:**
1. [Create a heartbeat canary](#create-heartbeat-canary) for simple URL monitoring
2. [Configure alerting](#configure-alerts) to get notified of failures
3. [Review canary results](#view-results) and screenshots

[**Start Your First Canary →**](#getting-started)

---

#### API Monitoring Quickstart

**What you'll learn:**
- Monitor REST API endpoints
- Validate response codes and payloads
- Set up multi-step API workflows

**Time to complete:** 15 minutes

[**Monitor Your API →**](#api-monitoring)

---

### 🔄 **For Returning Users**

#### Common Tasks

<div class="task-cards">

**🔧 Manage Canaries**
- [Update canary scripts](#update-canary)
- [Modify run schedules](#modify-schedule)
- [Clone existing canaries](#clone-canary)
- [Delete old canaries](#delete-canary)

**📈 Analyze Results**
- [View canary metrics](#view-metrics)
- [Download screenshots & HAR files](#download-artifacts)
- [Set up custom dashboards](#custom-dashboards)
- [Export data to S3](#export-data)

**⚙️ Advanced Configuration**
- [Use VPC endpoints](#vpc-endpoints)
- [Pass secrets securely](#use-secrets)
- [Custom Node.js modules](#custom-modules)
- [Blue/green deployment testing](#blue-green)

**💵 Cost Management**
- [Optimize canary runs](#optimize-runs)
- [Set budget alerts](#budget-alerts)
- [Right-size canaries](#right-size)

</div>

---

### 🔴 **Troubleshooting**

#### Quick Solutions for Common Issues

**Canary Failures**
- [Canary timing out](#timeout-issues) → Check duration limits and optimize scripts
- [403/404 errors](#http-errors) → Verify URL accessibility and authentication
- [Script errors](#script-errors) → Review logs and validate syntax
- [Screenshot issues](#screenshot-issues) → Check page load times and resources

**Configuration Issues**
- [IAM permission errors](#iam-issues) → Review required permissions
- [VPC connectivity](#vpc-issues) → Verify security groups and routes
- [Secret access denied](#secret-issues) → Check Secrets Manager permissions
- [S3 artifact failures](#s3-issues) → Verify bucket permissions

**Performance Problems**
- [Slow canary execution](#slow-execution) → Optimize script and reduce wait times
- [High costs](#high-costs) → Review run frequency and duration
- [Inconsistent results](#inconsistent-results) → Check network conditions and retries

[**Full Troubleshooting Guide →**](#troubleshooting)

---

## What Can You Monitor?

### 🌐 **Website & Application Monitoring**

#### Heartbeat Monitoring
Monitor endpoint availability with simple HTTP/HTTPS checks.

**Use Cases:**
- Website uptime monitoring
- API health checks
- Load balancer health
- CDN endpoint verification

**Example:**
```javascript
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const heartbeatBlueprint = async function () {
    const urls = ['https://example.com', 'https://api.example.com'];
    
    for (const url of urls) {
        await synthetics.executeHttpStep('Verify ' + url, url);
    }
};

exports.handler = async () => {
    return await heartbeatBlueprint();
};
```

[**Create Heartbeat Canary →**](#create-heartbeat)

---

#### Visual Monitoring
Capture screenshots to verify visual rendering and UI elements.

**Use Cases:**
- Homepage visual regression
- Login page verification
- Dashboard rendering checks
- Marketing page monitoring

**Example:**
```javascript
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const pageLoadBlueprint = async function () {
    const URL = "https://example.com";

    let page = await synthetics.getPage();
    const response = await page.goto(URL, {waitUntil: 'domcontentloaded', timeout: 30000});
    
    // Take screenshot
    await synthetics.takeScreenshot('loaded', 'result');
    
    // Validate page elements
    await page.waitForSelector('h1');
};

exports.handler = async () => {
    return await pageLoadBlueprint();
};
```

[**Create Visual Canary →**](#create-visual)

---

### 🔌 **API Monitoring**

Monitor REST APIs, GraphQL endpoints, and microservices.

**Use Cases:**
- REST API endpoint monitoring
- GraphQL query validation
- Authentication flow testing
- Rate limit verification
- Multi-step workflows

**Example:**
```javascript
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const apiCanaryBlueprint = async function () {
    // Test GET endpoint
    const getResponse = await synthetics.executeHttpStep('GET /users', 
        'https://api.example.com/users', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + process.env.API_TOKEN
            }
        });
    
    // Validate response
    if (getResponse.statusCode !== 200) {
        throw new Error('API returned ' + getResponse.statusCode);
    }
    
    // Test POST endpoint
    await synthetics.executeHttpStep('POST /users', 
        'https://api.example.com/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.API_TOKEN
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com'
            })
        });
};

exports.handler = async () => {
    return await apiCanaryBlueprint();
};
```

[**Create API Canary →**](#create-api)

---

### 👤 **User Journey Testing**

Test complete user workflows from login to checkout.

**Use Cases:**
- E-commerce checkout flows
- User registration and login
- Multi-step forms
- Account management workflows

**Example:**
```javascript
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const userJourneyBlueprint = async function () {
    let page = await synthetics.getPage();
    
    // Step 1: Navigate to login
    await page.goto('https://example.com/login', {waitUntil: 'domcontentloaded'});
    await synthetics.takeScreenshot('login-page', 'loaded');
    
    // Step 2: Fill login form
    await page.type('#email', 'test@example.com');
    await page.type('#password', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await synthetics.takeScreenshot('login', 'success');
    
    // Step 3: Navigate to dashboard
    await page.goto('https://example.com/dashboard');
    await page.waitForSelector('.dashboard-widget');
    await synthetics.takeScreenshot('dashboard', 'loaded');
    
    // Step 4: Logout
    await page.click('#logout-button');
    await synthetics.takeScreenshot('logout', 'complete');
};

exports.handler = async () => {
    return await userJourneyBlueprint();
};
```

[**Create User Journey Canary →**](#create-journey)

---

## Key Features

### 📸 **Screenshot Capture**
- Automatic screenshots at each step
- Compare before/after images
- Detect visual regressions
- Stored in S3 for historical analysis

### 📊 **Performance Metrics**
- **Duration metrics:** Total execution time, step durations
- **Success rate:** Pass/fail over time
- **Response times:** API and page load times
- **Custom metrics:** Track business-specific KPIs

### 🔔 **Alerting & Notifications**
- **CloudWatch Alarms:** Trigger on failures or degraded performance
- **SNS Integration:** Email, SMS, or webhook notifications
- **EventBridge:** Route events to Lambda, SQS, or third-party systems
- **Custom actions:** Auto-remediation workflows

### 🗺️ **Multi-Region Testing**
- Test from multiple AWS regions
- Compare performance across locations
- Catch region-specific issues
- Support for VPC endpoints

---

## Getting Started

### Prerequisites

Before creating your first canary, ensure you have:

✅ **AWS Account** with CloudWatch access  
✅ **IAM Permissions** for CloudWatch Synthetics  
✅ **S3 Bucket** for storing artifacts (optional, auto-created)  
✅ **Application endpoint** to monitor

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "synthetics:CreateCanary",
        "synthetics:StartCanary",
        "synthetics:DescribeCanaries",
        "synthetics:GetCanaryRuns",
        "lambda:CreateFunction",
        "lambda:AddPermission",
        "lambda:PublishVersion",
        "iam:PassRole",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

[**Full IAM Setup Guide →**](/configuration/reference#synthetics-permissions)

---

### <a name="create-heartbeat-canary"></a>Create Your First Heartbeat Canary

#### Step 1: Open CloudWatch Console

1. Navigate to [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Choose **Synthetics Canaries** from the left navigation
3. Click **Create canary**

#### Step 2: Choose Blueprint

1. Select **Heartbeat monitoring** blueprint
2. Enter your application URL: `https://your-app.example.com`
3. Name your canary: `my-app-heartbeat`

#### Step 3: Configure Schedule

```yaml
Run frequency: Every 5 minutes
Duration: 1 minute timeout
Data retention: 31 days
```

**Cost estimate:** ~$4.32/month (1,440 runs × $0.0012 × 3 steps)

#### Step 4: Set Up Alerts

1. Create CloudWatch Alarm for failures
2. Set threshold: 2 consecutive failures
3. Add SNS topic for notifications

#### Step 5: Review and Create

1. Review configuration
2. Click **Create canary**
3. Wait 2-3 minutes for first run

#### Step 6: View Results

1. Click on your canary name
2. View **Availability** and **Duration** metrics
3. Check **Screenshots** tab for visual verification
4. Review **Logs** for detailed execution info

[**Detailed Setup Guide →**](#detailed-setup)

---

### <a name="api-monitoring"></a>API Monitoring Setup

#### Monitor REST API Endpoints

**1. Create API Canary**

```javascript
const synthetics = require('Synthetics');
const https = require('https');

const apiTest = async function () {
    // Test health endpoint
    await synthetics.executeHttpStep('Health Check', 
        'https://api.example.com/health');
    
    // Test with authentication
    const authenticatedRequest = {
        hostname: 'api.example.com',
        path: '/api/v1/users',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    const response = await synthetics.executeHttpStep(
        'Get Users',
        authenticatedRequest
    );
    
    // Validate response structure
    const data = JSON.parse(response.body);
    if (!data.users || data.users.length === 0) {
        throw new Error('Invalid response: no users found');
    }
    
    // Custom metric
    await synthetics.addUserAgentMetric(
        'UserCount',
        data.users.length,
        'Count'
    );
};

exports.handler = async () => {
    return await apiTest();
};
```

**2. Store Secrets Securely**

Use AWS Secrets Manager for API tokens:

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
    const data = await secretsManager.getSecretValue({
        SecretId: secretName
    }).promise();
    
    return JSON.parse(data.SecretString);
}

// Usage in canary
const secrets = await getSecret('prod/api/credentials');
const token = secrets.API_TOKEN;
```

[**API Monitoring Best Practices →**](#api-best-practices)

---

## Pricing

### Cost Structure

| Component | Price |
|-----------|-------|
| **Canary runs** | $0.0012 per run |
| **Visual monitoring** | Additional $0.0036 per screenshot |
| **Data storage (S3)** | Standard S3 pricing |
| **CloudWatch Logs** | Standard CloudWatch Logs pricing |

### Free Tier

- **100 canary runs** per month (first 12 months)
- Applies to basic monitoring canaries
- Visual monitoring not included in free tier

### Example Costs

**Scenario 1: Simple Heartbeat (5-minute interval)**
```
Monthly runs: 8,640 (24 × 60 ÷ 5 × 30)
Cost: 8,640 × $0.0012 = $10.37/month
With free tier: $10.37 - $0.12 = $10.25/month
```

**Scenario 2: Visual Monitoring (15-minute interval)**
```
Monthly runs: 2,880
Base cost: 2,880 × $0.0012 = $3.46
Screenshots: 2,880 × $0.0036 = $10.37
Total: $13.83/month
```

**Scenario 3: Multiple Endpoints (hourly)**
```
5 endpoints × 720 runs = 3,600 runs
Cost: 3,600 × $0.0012 = $4.32/month
```

[**Cost Optimization Guide →**](/cost-optimization/#synthetics)

---

## Best Practices

### 🎯 **Monitoring Strategy**

#### Choose the Right Frequency

| Use Case | Recommended Frequency | Rationale |
|----------|----------------------|-----------|
| **Critical production APIs** | 1-5 minutes | Fast detection of issues |
| **Public website homepage** | 5-10 minutes | Balance cost and coverage |
| **Internal dashboards** | 15-30 minutes | Lower priority, cost-effective |
| **Dev/staging environments** | 1 hour | Infrequent checks sufficient |
| **Marketing campaigns** | 5 minutes during campaign | Intensive monitoring when needed |

#### Monitor What Matters

✅ **Do Monitor:**
- Critical user journeys (login, checkout, registration)
- Public-facing APIs and endpoints
- Payment processing flows
- Third-party integrations
- Post-deployment verification

❌ **Don't Monitor:**
- Internal admin pages with low usage
- Redundant endpoints (if load balancer is monitored)
- Non-critical background jobs
- Development/test environments excessively

---

### 🔒 **Security Best Practices**

#### Secret Management

```javascript
// ❌ BAD: Hardcoded credentials
const password = 'mySecretPassword123';

// ✅ GOOD: Use Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getCredentials() {
    const secret = await secretsManager.getSecretValue({
        SecretId: 'prod/app/credentials'
    }).promise();
    
    return JSON.parse(secret.SecretString);
}
```

#### VPC Endpoints

For internal applications:

```yaml
VPC Configuration:
  - Security Groups: Allow outbound HTTPS
  - Subnets: Use private subnets with NAT
  - VPC Endpoints: Enable for S3, CloudWatch
```

---

### ⚡ **Performance Optimization**

#### Reduce Canary Duration

```javascript
// ❌ Slow: Multiple full page loads
await page.goto(url1);
await page.waitFor(5000); // Unnecessary wait
await page.goto(url2);

// ✅ Fast: Efficient waits and parallel checks
await page.goto(url1, {waitUntil: 'domcontentloaded'});
await page.waitForSelector('#main-content', {timeout: 10000});
// Navigate immediately when ready
await page.goto(url2, {waitUntil: 'networkidle2'});
```

#### Optimize Screenshot Capture

```javascript
// Only capture on failures or key steps
if (response.statusCode !== 200) {
    await synthetics.takeScreenshot('error-state', 'failure');
}

// Reduce screenshot dimensions for faster processing
await page.setViewport({ width: 1280, height: 800 });
```

---

### 📊 **Alerting Strategy**

#### Smart Threshold Configuration

```yaml
# Basic alarm
Threshold: 1 failure
Evaluation: 2 datapoints within 2 periods
Action: Send notification

# Production-critical alarm
Threshold: 2 consecutive failures
Evaluation: 2 datapoints within 5 minutes
Action: 
  - Send PagerDuty alert
  - Trigger Lambda remediation
  - Log to incident management system
```

#### Reduce Alert Fatigue

1. **Use composite alarms** - Combine multiple canaries
2. **Set evaluation periods** - Require consecutive failures
3. **Time-based suppression** - Silence during maintenance
4. **Escalation policies** - Route based on severity

---

## Integration Patterns

### 🔗 **With Application Signals**

Combine synthetics with real user monitoring:

```javascript
// Canary monitors synthetic user journey
// Application Signals tracks real users
// Compare synthetic vs. real user metrics

const syntheticLoadTime = canaryMetrics.duration;
const realUserLoadTime = applicationSignals.p95;

if (realUserLoadTime > syntheticLoadTime * 1.5) {
    // Real users experiencing worse performance
    // Investigate network, caching, or scaling issues
}
```

[**Full Integration Guide →**](/implementation/#synthetics-integration)

---

### 📢 **With Incident Management**

**PagerDuty Integration:**

```javascript
// Lambda function triggered by canary failure
const https = require('https');

exports.handler = async (event) => {
    const options = {
        hostname: 'events.pagerduty.com',
        path: '/v2/enqueue',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token token=' + process.env.PD_TOKEN
        }
    };
    
    const data = JSON.stringify({
        routing_key: process.env.PD_ROUTING_KEY,
        event_action: 'trigger',
        payload: {
            summary: `Canary ${event.canaryName} failed`,
            severity: 'error',
            source: 'cloudwatch-synthetics'
        }
    });
    
    // Send to PagerDuty
};
```

**Slack Notifications:**

```javascript
// SNS to Lambda to Slack webhook
const slackWebhook = process.env.SLACK_WEBHOOK;

await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: '🚨 Canary Alert',
        blocks: [{
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${event.canaryName}* failed\n` +
                      `Error: ${event.error}\n` +
                      `<${event.screenshotUrl}|View Screenshot>`
            }
        }]
    })
});
```

---

## Troubleshooting

### <a name="timeout-issues"></a>Canary Timing Out

**Symptoms:**
- Canary fails with "Execution timed out" error
- Duration reaches maximum limit

**Solutions:**

1. **Increase timeout duration**
   ```javascript
   // In canary configuration
   Timeout: 180 // seconds (max: 840 for visual, 60 for heartbeat)
   ```

2. **Optimize script execution**
   ```javascript
   // Reduce wait times
   await page.waitForSelector('#element', {timeout: 5000}); // Not 30000
   
   // Use faster wait conditions
   await page.goto(url, {waitUntil: 'domcontentloaded'}); // Not 'networkidle0'
   ```

3. **Remove unnecessary steps**
   - Eliminate redundant navigation
   - Skip non-critical element checks
   - Reduce screenshot captures

---

### <a name="http-errors"></a>403/404 Errors

**Symptoms:**
- HTTP 403 Forbidden errors
- HTTP 404 Not Found errors

**Solutions:**

1. **Verify URL accessibility**
   ```bash
   # Test from local machine
   curl -I https://your-app.example.com
   
   # Test with headers
   curl -H "User-Agent: CloudWatchSynthetics" https://your-app.example.com
   ```

2. **Check authentication**
   ```javascript
   // Add proper authentication headers
   await synthetics.executeHttpStep('API Call', url, {
       headers: {
           'Authorization': 'Bearer ' + process.env.API_TOKEN,
           'User-Agent': 'CloudWatchSynthetics/1.0'
       }
   });
   ```

3. **Whitelist canary IPs**
   - Get canary IP ranges from [AWS IP Ranges](https://docs.aws.amazon.com/general/latest/gr/aws-ip-ranges.html)
   - Add to WAF allow list or security group

---

### <a name="iam-issues"></a>IAM Permission Errors

**Symptoms:**
- "Access Denied" errors
- "User is not authorized" messages

**Solution:**

Update IAM role with required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetBucketLocation",
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

[**Detailed IAM Configuration →**](/configuration/reference#synthetics-iam)

---

### <a name="vpc-issues"></a>VPC Connectivity Issues

**Symptoms:**
- Connection timeouts to internal endpoints
- DNS resolution failures

**Solutions:**

1. **Verify security group rules**
   ```yaml
   Outbound Rules:
     - Type: HTTPS
       Port: 443
       Destination: 0.0.0.0/0
     - Type: HTTP
       Port: 80
       Destination: 0.0.0.0/0
   ```

2. **Check subnet routing**
   - Ensure NAT Gateway for internet access
   - Verify route table has internet gateway route

3. **DNS resolution**
   ```javascript
   // Test DNS resolution in canary
   const dns = require('dns').promises;
   const addresses = await dns.resolve4('internal-api.example.com');
   log.info('Resolved addresses: ' + addresses);
   ```

---

## Advanced Topics

### 🔄 **Blue/Green Deployment Testing**

Test new deployments before switching traffic:

```javascript
const synthetics = require('Synthetics');

const blueGreenTest = async function () {
    const blueEndpoint = 'https://blue.example.com';
    const greenEndpoint = 'https://green.example.com';
    
    // Test blue (current production)
    const blueResponse = await synthetics.executeHttpStep('Test Blue', blueEndpoint);
    
    // Test green (new version)
    const greenResponse = await synthetics.executeHttpStep('Test Green', greenEndpoint);
    
    // Compare responses
    if (greenResponse.statusCode !== blueResponse.statusCode) {
        throw new Error('Green deployment has different status code');
    }
    
    // Validate green is ready
    const greenData = JSON.parse(greenResponse.body);
    if (greenData.version !== process.env.EXPECTED_VERSION) {
        throw new Error('Green deployment version mismatch');
    }
};

exports.handler = async () => {
    return await blueGreenTest();
};
```

---

### 📦 **Custom Node.js Dependencies**

Use custom modules in your canaries:

**1. Create deployment package**

```bash
mkdir canary-dependencies
cd canary-dependencies
npm init -y
npm install axios cheerio
zip -r canary-dependencies.zip node_modules/
```

**2. Upload to S3**

```bash
aws s3 cp canary-dependencies.zip s3://my-bucket/canaries/dependencies/
```

**3. Reference in canary**

```javascript
// Canary configuration
LayerVersionArn: 'arn:aws:lambda:us-east-1:123456789:layer:canary-deps:1'

// In canary script
const axios = require('axios');
const cheerio = require('cheerio');

const response = await axios.get('https://example.com');
const $ = cheerio.load(response.data);
const title = $('title').text();
```

---

### 🎨 **Custom Metrics**

Track business-specific KPIs:

```javascript
const synthetics = require('Synthetics');

// Custom metric for API response time
await synthetics.addUserAgentMetric(
    'APIResponseTime',
    responseTime,
    'Milliseconds'
);

// Custom metric for search results count
await synthetics.addUserAgentMetric(
    'SearchResultsCount',
    resultsCount,
    'Count'
);

// Custom metric for cart value
await synthetics.addUserAgentMetric(
    'AverageCartValue',
    cartTotal,
    'None'
);
```

Create CloudWatch dashboard to visualize:

```yaml
Dashboard Widgets:
  - Custom Metrics: Display alongside standard canary metrics
  - Alarms: Alert on business metric thresholds
  - Comparisons: Compare synthetic vs. real user metrics
```

---

## Resources

### 📚 **Documentation**

- [AWS CloudWatch Synthetics Official Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html)
- [Synthetics Runtime Versions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Library.html)
- [Blueprint Reference](/configuration/reference#synthetics-blueprints)
- [API Reference](https://docs.aws.amazon.com/AmazonCloudWatchSynthetics/latest/APIReference/Welcome.html)

### 🛠️ **Tools & SDKs**

- [Synthetics Node.js Library](https://www.npmjs.com/package/cloudwatch-synthetics)
- [AWS CLI Synthetics Commands](https://docs.aws.amazon.com/cli/latest/reference/synthetics/index.html)
- [CloudFormation Templates](/examples/#synthetics-templates)
- [Terraform Modules](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/synthetics_canary)

### 💬 **Community & Support**

- [AWS re:Post - CloudWatch Synthetics](https://repost.aws/tags/TAgOvCb-8kRf2_gU7Qg6_L5A/amazon-cloud-watch)
- [GitHub Issues & Discussions](https://github.com/aws/aws-sdk-js/issues)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/amazon-cloudwatch-synthetics)
- [AWS Support Center](https://console.aws.amazon.com/support/)

### 📖 **Related Documentation**

- [Application Signals Integration](/implementation/#synthetics-integration)
- [CloudWatch Alarms Setup](/getting-started/#alerting)
- [Cost Optimization Strategies](/cost-optimization/)
- [VPC Configuration Guide](/configuration/reference#vpc-configuration)

---

## Next Steps

<div class="next-steps-grid">

### 🚀 **Quick Wins**

1. **[Create your first canary](#create-heartbeat-canary)** - 10 minutes
2. **[Set up alerting](#configure-alerts)** - 5 minutes
3. **[Review first results](#view-results)** - View insights

### 📊 **Expand Coverage**

1. **[Add API monitoring](#api-monitoring)** - Monitor critical APIs
2. **[Test user journeys](#create-journey)** - End-to-end workflows
3. **[Multi-region testing](#multi-region)** - Global coverage

### 🎯 **Optimize**

1. **[Review costs](#optimize-runs)** - Reduce unnecessary runs
2. **[Refine alerts](#smart-alerts)** - Reduce false positives
3. **[Custom dashboards](#custom-dashboards)** - Visualize what matters

</div>

---

## Frequently Asked Questions

**Q: How is CloudWatch Synthetics different from Application Signals?**  
A: Synthetics provides **proactive synthetic monitoring** (testing before users), while Application Signals provides **reactive real user monitoring** (observing actual users). Use both for complete coverage.

**Q: Can I test internal applications?**  
A: Yes, deploy canaries in VPC to test private endpoints. Configure security groups and routing appropriately.

**Q: What languages are supported?**  
A: Canaries run Node.js (Puppeteer) for browser testing and support Python for API testing. Custom runtimes can be added via Lambda layers.

**Q: How do I handle authentication?**  
A: Use AWS Secrets Manager to store credentials securely. Reference secrets in your canary scripts via environment variables.

**Q: Can I run canaries on-demand?**  
A: Yes, you can manually start canaries or trigger them via API/CLI in addition to scheduled runs.

**Q: What's the maximum canary execution time?**  
A: Visual canaries: 14 minutes (840 seconds). Heartbeat canaries: 1 minute (60 seconds).

**Q: How long are artifacts retained?**  
A: Default is 31 days. Configure S3 lifecycle policies for longer retention if needed.

**Q: Can I test mobile apps?**  
A: Synthetics is designed for web applications. For mobile app testing, consider AWS Device Farm or third-party solutions.

---

<div class="cta-section">

## Ready to Start Monitoring?

**Start with a free canary today** - 100 runs free per month for the first year.

<div class="cta-buttons">

[**Create Your First Canary →**](#create-heartbeat-canary)

[**View Pricing Details →**](#pricing)

[**Contact Sales →**](https://aws.amazon.com/contact-us/)

</div>

</div>

---

*Last updated: January 29, 2026 | [Report an issue](https://github.com/vijaykbv/cloudwatch-apm-docs/issues) | [Improve this page](https://github.com/vijaykbv/cloudwatch-apm-docs/edit/main/content/synthetics/index.md)*
