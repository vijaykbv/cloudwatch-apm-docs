---
title: "Quick Start Guide"
description: "Get CloudWatch APM running in your application in under 10 minutes with step-by-step instructions"
audience: ["developer", "operations"]
difficulty: "beginner"
category: "getting-started"
tags: ["quickstart", "setup", "installation", "getting-started"]
estimatedReadTime: 12
lastUpdated: "2024-01-15"
relatedPages: ["installation-guide", "first-configuration", "why-apm"]
---

# Quick Start Guide

**Get CloudWatch APM running in your application in under 10 minutes.** This guide will have you monitoring application performance, tracking errors, and gaining insights into your system's behavior with minimal setup.

## What You'll Achieve

By the end of this guide, you'll have:

✅ **CloudWatch APM agent** installed and running  
✅ **Application metrics** flowing to CloudWatch  
✅ **Distributed traces** showing request flows  
✅ **Basic dashboards** displaying key performance indicators  
✅ **Automatic alerts** configured for critical issues  

---

## Prerequisites

Before you begin, ensure you have:

### **Required**
- **AWS Account** with CloudWatch and X-Ray permissions
- **Application** running on a supported platform (Java, Node.js, Python, .NET, Go, Ruby)
- **Network access** to AWS services (ports 443 for HTTPS)

### **Recommended**
- **AWS CLI** configured with appropriate credentials
- **Basic familiarity** with your application's deployment process
- **5-10 minutes** of uninterrupted time

### **Permissions Needed**
Your AWS credentials need these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords",
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

---

## Step 1: Choose Your Installation Method

### **Option A: Auto-Instrumentation (Recommended)**
Perfect for getting started quickly with minimal code changes.

### **Option B: Manual Instrumentation**
Gives you more control over what gets monitored.

### **Option C: Container Deployment**
For containerized applications using Docker, ECS, or EKS.

---

## Step 2: Install the APM Agent

Choose your technology stack:

### **Java Applications** (Spring Boot, Tomcat, WebLogic)

#### **Auto-Instrumentation**
```bash
# Download the latest APM agent
wget -O aws-opentelemetry-agent.jar \
  https://github.com/aws-observability/aws-otel-java-instrumentation/releases/latest/download/aws-opentelemetry-agent.jar

# Start your application with the agent
java -javaagent:aws-opentelemetry-agent.jar \
     -Dotel.service.name=my-application \
     -Dotel.service.version=1.0.0 \
     -Dotel.resource.attributes=deployment.environment=production \
     -jar your-application.jar
```

#### **Environment Variables**
```bash
export OTEL_SERVICE_NAME=my-application
export OTEL_SERVICE_VERSION=1.0.0
export OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production
export AWS_REGION=us-west-2
```

### **Node.js Applications** (Express, Nest.js, Fastify)

#### **Auto-Instrumentation**
```bash
# Install the APM SDK
npm install @aws/aws-distro-for-opentelemetry-node-autoinstrumentation

# Add to your package.json
{
  "scripts": {
    "start": "node -r @aws/aws-distro-for-opentelemetry-node-autoinstrumentation app.js"
  }
}
```

#### **Manual Setup**
```javascript
// Add to the very top of your main application file
require('@aws/aws-distro-for-opentelemetry-node-autoinstrumentation');

// Your application code
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);
```

### **Python Applications** (Django, Flask, FastAPI)

#### **Auto-Instrumentation**
```bash
# Install the APM SDK
pip install aws-distro-for-opentelemetry[otlp]

# Auto-instrument your application
opentelemetry-instrument \
  --service-name my-application \
  --service-version 1.0.0 \
  python your-app.py
```

#### **Django Integration**
```python
# Add to your Django settings.py
import os
from opentelemetry.instrumentation.django import DjangoInstrumentor

# Initialize instrumentation
DjangoInstrumentor().instrument()

# Environment variables
os.environ.setdefault('OTEL_SERVICE_NAME', 'my-django-app')
os.environ.setdefault('OTEL_SERVICE_VERSION', '1.0.0')
```

### **.NET Applications** (ASP.NET Core, .NET Framework)

#### **Auto-Instrumentation**
```bash
# Install the APM package
dotnet add package AWS.Distro.OpenTelemetry

# Set environment variables
export OTEL_SERVICE_NAME=my-dotnet-app
export OTEL_SERVICE_VERSION=1.0.0
export AWS_REGION=us-west-2
```

#### **Code Integration**
```csharp
// In your Program.cs or Startup.cs
using AWS.Distro.OpenTelemetry;

var builder = WebApplication.CreateBuilder(args);

// Add OpenTelemetry
builder.Services.AddOpenTelemetry()
    .WithTracing(builder => builder.AddAWSInstrumentation())
    .WithMetrics(builder => builder.AddAWSInstrumentation());

var app = builder.Build();
```

### **Container Deployment** (Docker, ECS, EKS)

#### **Docker**
```dockerfile
FROM openjdk:17-jre-slim

# Download APM agent
RUN wget -O /opt/aws-opentelemetry-agent.jar \
    https://github.com/aws-observability/aws-otel-java-instrumentation/releases/latest/download/aws-opentelemetry-agent.jar

# Copy your application
COPY target/my-app.jar /app/app.jar

# Set environment variables
ENV OTEL_SERVICE_NAME=my-application
ENV OTEL_SERVICE_VERSION=1.0.0
ENV AWS_REGION=us-west-2

# Start with APM agent
ENTRYPOINT ["java", "-javaagent:/opt/aws-opentelemetry-agent.jar", "-jar", "/app/app.jar"]
```

#### **Kubernetes (EKS)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-application
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-application
  template:
    metadata:
      labels:
        app: my-application
    spec:
      containers:
      - name: app
        image: my-application:latest
        env:
        - name: OTEL_SERVICE_NAME
          value: "my-application"
        - name: OTEL_SERVICE_VERSION
          value: "1.0.0"
        - name: AWS_REGION
          value: "us-west-2"
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://aws-otel-collector:4317"
```

---

## Step 3: Configure Basic Settings

### **Option A: Environment Variables (Simplest)**
```bash
# Service identification
export OTEL_SERVICE_NAME=my-application
export OTEL_SERVICE_VERSION=1.0.0
export OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,team=backend

# AWS configuration
export AWS_REGION=us-west-2

# Sampling (optional - reduces data volume)
export OTEL_TRACES_SAMPLER=traceidratio
export OTEL_TRACES_SAMPLER_ARG=0.1  # Sample 10% of traces
```

### **Option B: Configuration File (More Control)**
Create `otel-config.yaml`:

```yaml
# Service configuration
service:
  name: my-application
  version: 1.0.0

# Resource attributes
resource:
  attributes:
    deployment.environment: production
    service.namespace: backend
    team: platform

# Exporters
exporters:
  awsxray:
    region: us-west-2
    no_verify_ssl: false
  
  awscloudwatchmetrics:
    region: us-west-2
    namespace: MyApp/APM
    dimension_rollup_option: NoDimensionRollup

# Processors
processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  
  memory_limiter:
    limit_mib: 512

# Receivers
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

# Service pipelines
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [awsxray]
    
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [awscloudwatchmetrics]
```

---

## Step 4: Start Your Application

### **Local Development**
```bash
# With environment variables
OTEL_SERVICE_NAME=my-app \
OTEL_SERVICE_VERSION=1.0.0 \
AWS_REGION=us-west-2 \
java -javaagent:aws-opentelemetry-agent.jar -jar your-app.jar

# Or with configuration file
java -javaagent:aws-opentelemetry-agent.jar \
     -Dotel.javaagent.configuration-file=otel-config.yaml \
     -jar your-app.jar
```

### **Production Deployment**
```bash
# Systemd service example
[Unit]
Description=My Application with APM
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/myapp
Environment=OTEL_SERVICE_NAME=my-application
Environment=OTEL_SERVICE_VERSION=1.0.0
Environment=AWS_REGION=us-west-2
ExecStart=/usr/bin/java -javaagent:aws-opentelemetry-agent.jar -jar app.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Step 5: Generate Test Traffic

Create some activity to see data flowing:

### **Simple Load Test**
```bash
# Generate HTTP requests
for i in {1..100}; do
  curl http://localhost:8080/api/users
  curl http://localhost:8080/api/products
  sleep 0.1
done

# Generate some errors
curl http://localhost:8080/api/nonexistent
```

### **Realistic Traffic Patterns**
```bash
# Install Apache Bench for load testing
sudo apt-get install apache2-utils

# Generate sustained load
ab -n 1000 -c 10 http://localhost:8080/api/users

# Generate mixed traffic
ab -n 500 -c 5 http://localhost:8080/api/users &
ab -n 300 -c 3 http://localhost:8080/api/products &
ab -n 200 -c 2 http://localhost:8080/api/orders &
wait
```

---

## Step 6: Verify Installation

### **Check Application Logs**
Look for these success messages:

```
[otel.javaagent] OpenTelemetry Javaagent started successfully
[aws-otel] AWS X-Ray exporter initialized
[aws-otel] CloudWatch metrics exporter initialized
[otel.javaagent] Instrumentation applied: spring-boot, jdbc, http-clients
```

### **AWS Console Verification**

#### **1. CloudWatch Metrics**
1. Go to **CloudWatch Console** → **Metrics**
2. Look for namespace: **MyApp/APM** (or your configured namespace)
3. You should see metrics like:
   - `http.server.duration`
   - `http.server.requests`
   - `jvm.memory.used`

#### **2. X-Ray Traces**
1. Go to **X-Ray Console** → **Traces**
2. You should see traces from your application
3. Click on a trace to see the detailed timeline

#### **3. CloudWatch Logs**
1. Go to **CloudWatch Console** → **Log Groups**
2. Look for log group: `/aws/lambda/my-application` or similar
3. Check for APM-related log entries

### **Command Line Verification**
```bash
# Check if metrics are being sent
aws cloudwatch list-metrics --namespace "MyApp/APM" --region us-west-2

# Check X-Ray traces
aws xray get-trace-summaries --time-range-type TimeRangeByStartTime \
  --start-time $(date -d '5 minutes ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --region us-west-2
```

---

## Step 7: Create Your First Dashboard

### **Quick Dashboard Setup**
1. Go to **CloudWatch Console** → **Dashboards**
2. Click **Create Dashboard**
3. Name it "My Application APM"
4. Add these widgets:

#### **Response Time Widget**
```json
{
  "metrics": [
    ["MyApp/APM", "http.server.duration", "service.name", "my-application"]
  ],
  "period": 300,
  "stat": "Average",
  "region": "us-west-2",
  "title": "Average Response Time"
}
```

#### **Error Rate Widget**
```json
{
  "metrics": [
    ["MyApp/APM", "http.server.requests", "service.name", "my-application", "http.status_code", "5xx"]
  ],
  "period": 300,
  "stat": "Sum",
  "region": "us-west-2",
  "title": "Error Count"
}
```

#### **Throughput Widget**
```json
{
  "metrics": [
    ["MyApp/APM", "http.server.requests", "service.name", "my-application"]
  ],
  "period": 300,
  "stat": "Sum",
  "region": "us-west-2",
  "title": "Request Count"
}
```

---

## Step 8: Set Up Basic Alerts

### **High Response Time Alert**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "High-Response-Time" \
  --alarm-description "Alert when response time is high" \
  --metric-name "http.server.duration" \
  --namespace "MyApp/APM" \
  --statistic "Average" \
  --period 300 \
  --threshold 2000 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2 \
  --alarm-actions "arn:aws:sns:us-west-2:123456789012:my-alerts"
```

### **Error Rate Alert**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "High-Error-Rate" \
  --alarm-description "Alert when error rate is high" \
  --metric-name "http.server.requests" \
  --namespace "MyApp/APM" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 1 \
  --alarm-actions "arn:aws:sns:us-west-2:123456789012:my-alerts"
```

---

## Troubleshooting Common Issues

### **No Data Appearing**

#### **Check Network Connectivity**
```bash
# Test connectivity to AWS endpoints
curl -I https://xray.us-west-2.amazonaws.com
curl -I https://monitoring.us-west-2.amazonaws.com
```

#### **Verify Permissions**
```bash
# Test AWS credentials
aws sts get-caller-identity
aws xray put-trace-segments --trace-segment-documents '[]' --region us-west-2
```

#### **Check Application Logs**
```bash
# Look for APM initialization messages
grep -i "opentelemetry\|otel\|aws.*exporter" application.log

# Check for error messages
grep -i "error\|exception\|failed" application.log | grep -i "otel\|telemetry"
```

### **High Overhead**

#### **Reduce Sampling Rate**
```bash
export OTEL_TRACES_SAMPLER=traceidratio
export OTEL_TRACES_SAMPLER_ARG=0.01  # Sample 1% instead of 100%
```

#### **Optimize Batch Settings**
```yaml
processors:
  batch:
    timeout: 5s        # Increase timeout
    send_batch_size: 2048  # Increase batch size
```

### **Missing Traces**

#### **Check Instrumentation**
```bash
# Verify auto-instrumentation is working
grep -i "instrumentation.*applied" application.log
```

#### **Manual Instrumentation Check**
```java
// Add this to verify tracing is working
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.GlobalOpenTelemetry;

Tracer tracer = GlobalOpenTelemetry.getTracer("test");
Span span = tracer.spanBuilder("test-operation").startSpan();
span.setAttribute("test", "value");
span.end();
```

---

## Next Steps

### **🎯 Immediate Actions**
- [ ] **Explore your dashboards** and understand the metrics
- [ ] **Set up additional alerts** for critical business metrics
- [ ] **Review traces** to understand request flows
- [ ] **Share access** with your team members

### **📈 Optimization**
- [**Performance Tuning Guide**](../performance/optimization.md) - Optimize APM overhead
- [**Custom Metrics**](../advanced/custom-metrics.md) - Track business KPIs
- [**Advanced Dashboards**](../monitoring/advanced-dashboards.md) - Create sophisticated visualizations

### **🔧 Advanced Configuration**
- [**Custom Instrumentation**](../advanced/custom-instrumentation.md) - Monitor specific code paths
- [**Sampling Strategies**](../configuration/sampling.md) - Optimize data collection
- [**Multi-Service Tracing**](../advanced/distributed-tracing.md) - Track requests across services

### **🏢 Enterprise Features**
- [**Multi-Account Setup**](../implementation/multi-account.md) - Centralized monitoring
- [**Compliance Configuration**](../security/compliance.md) - Meet regulatory requirements
- [**Cost Optimization**](../performance/cost-optimization.md) - Manage monitoring costs

---

## Get Help

### **📚 Documentation**
- [**Configuration Reference**](../configuration/reference.md) - Complete parameter guide
- [**Troubleshooting Guide**](../troubleshooting/common-issues.md) - Solve common problems
- [**FAQ**](../troubleshooting/faq.md) - Frequently asked questions

### **💬 Community & Support**
- [**AWS Community Forum**](https://community.aws.amazon.com) - Connect with other users
- [**GitHub Issues**](https://github.com/aws-observability/aws-otel-java-instrumentation/issues) - Report bugs
- [**AWS Support**](https://aws.amazon.com/support/) - Get expert help

### **🎓 Learning Resources**
- [**APM Best Practices**](best-practices.md) - Proven strategies
- [**Video Tutorials**](tutorials.md) - Step-by-step walkthroughs
- [**Webinar Series**](webinars.md) - Live training sessions

---

**🎉 Congratulations!** You now have CloudWatch APM monitoring your application. You're ready to catch performance issues before they impact users and optimize your application for better user experience.