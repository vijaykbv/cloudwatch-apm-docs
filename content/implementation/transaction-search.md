---
title: "CloudWatch Transaction Search"
description: "Search and analyze distributed traces to find specific transactions and troubleshoot issues across your applications"
audience: ["developer", "operations", "architect"]
difficulty: "intermediate"
category: "implementation"
tags: ["transaction-search", "traces", "troubleshooting", "analysis"]
estimatedReadTime: 10
lastUpdated: "2026-01-26"
relatedPages: ["application-signals", "distributed-tracing", "cost-optimization"]
---

# CloudWatch Transaction Search

Search and analyze distributed traces to find specific transactions, troubleshoot issues, and understand application behavior across your distributed systems.

## Overview

CloudWatch Transaction Search enables you to query distributed traces using powerful filters to:
- Find specific transactions by attributes (user ID, session ID, error codes)
- Investigate performance issues and errors
- Analyze transaction patterns and anomalies
- Trace end-to-end requests across microservices
- Debug production issues without deploying code changes

---

## ⚠️ Important: Cost Considerations

**Before enabling Transaction Search, understand the cost implications:**

Transaction Search automatically creates custom CloudWatch metrics for span attributes, which can significantly increase costs:

- **Metric Creation:** Each unique combination of span attributes creates a new custom metric
- **High Cardinality:** Attributes like user IDs, session IDs, or timestamps can create thousands of metrics
- **Cost Impact:** Can increase CloudWatch costs by 5-10x or more
- **Automatic Enablement:** Some configurations enable Transaction Search by default

### Cost Warning Example

A real customer experienced:
- **Before:** $10/month for basic tracing
- **After enabling Transaction Search:** $100/month
- **Cause:** 500+ custom metrics created automatically from span attributes
- **Solution:** Selective enablement with metric filters

**💡 Recommendation:** Start with Transaction Search **disabled** and enable selectively for specific services or attributes.

[**Read Cost Optimization Guide →**](../cost-optimization/index.md)

---

## When to Use Transaction Search

### ✅ Use Transaction Search When:

#### **Investigating Production Issues**
- Troubleshooting specific customer complaints
- Finding failed transactions by error code
- Analyzing performance degradation for specific users
- Debugging intermittent issues

#### **Advanced Analysis**
- Analyzing transaction patterns across services
- Investigating rate limiting or throttling issues
- Searching for transactions with specific attributes
- Tracing requests across account boundaries

#### **Compliance & Auditing**
- Auditing access to sensitive resources
- Tracking regulatory compliance transactions
- Monitoring financial transactions
- Investigating security incidents

#### **Performance Investigation**
- Finding slow transactions above latency thresholds
- Analyzing specific API endpoint performance
- Investigating database query performance
- Identifying bottlenecks in specific code paths

---

### ❌ Don't Use Transaction Search When:

#### **Basic Monitoring**
- Simple service health monitoring → Use **Application Signals** instead
- General latency tracking → Use **CloudWatch Metrics** instead
- Error rate monitoring → Use **CloudWatch Alarms** instead
- Service dependency mapping → Use **Service Map** instead

#### **Cost-Sensitive Environments**
- Development/test environments (unless required for testing)
- Low-budget personal projects
- High-traffic applications without careful attribute selection
- When basic CloudWatch Logs search is sufficient

#### **Alternative Solutions Available**
- Searching for specific log messages → Use **CloudWatch Logs Insights**
- Real-time alerting → Use **CloudWatch Alarms**
- General observability → Use **Application Signals** (included with APM)
- Code-level debugging → Use local debugging tools

---

## Who Should Use Transaction Search

### 👥 Primary Users

#### **DevOps/SRE Engineers**
- **Use Case:** Troubleshooting production incidents
- **Typical Queries:** Find all failed transactions for a specific API endpoint
- **Frequency:** As needed during incidents
- **Cost Impact:** Moderate (incident-based usage)

#### **Backend Developers**
- **Use Case:** Debugging complex distributed transactions
- **Typical Queries:** Trace specific user requests across microservices
- **Frequency:** During active development and bug fixes
- **Cost Impact:** Low to moderate

#### **Application Architects**
- **Use Case:** Analyzing system behavior and performance patterns
- **Typical Queries:** Find transactions with specific characteristics
- **Frequency:** Periodic analysis
- **Cost Impact:** Low (infrequent usage)

#### **Support Engineers**
- **Use Case:** Investigating customer-reported issues
- **Typical Queries:** Search by customer ID or transaction ID
- **Frequency:** Per support ticket
- **Cost Impact:** Moderate

---

### 🚫 Not Recommended For

- **Business Analysts** (use CloudWatch Dashboards instead)
- **Marketing Teams** (use application-specific analytics)
- **Automated Monitoring Systems** (use CloudWatch Alarms instead)
- **Continuous Performance Testing** (use Application Signals metrics)

---

## Common Use Cases

### 1. **Find Failed Transactions**

Search for all failed transactions with specific error codes:

```
Trace Search Query:
  error.type = "TimeoutException"
  AND http.status_code >= 500
  AND service.name = "payment-service"
```

**When to use:**
- Investigating spike in errors
- Debugging specific failure patterns
- Analyzing error distribution

**Cost consideration:** ✅ Low impact - error traces are typically < 5% of traffic

---

### 2. **Investigate Slow Transactions**

Find transactions exceeding latency thresholds:

```
Trace Search Query:
  duration > 5000ms
  AND http.route = "/api/checkout"
  AND time_range = "Last 1 hour"
```

**When to use:**
- Performance degradation alerts
- SLA violation investigation
- Latency outlier analysis

**Cost consideration:** ✅ Low to moderate - depends on traffic volume

---

### 3. **Trace Specific User Journey**

Follow a user's complete transaction path:

```
Trace Search Query:
  user.id = "user-12345"
  AND session.id = "session-abc-xyz"
  AND time_range = "Last 24 hours"
```

**When to use:**
- Customer support escalations
- Bug reproduction
- User experience investigation

**Cost consideration:** ⚠️ High if user IDs are used as metric dimensions

---

### 4. **Cross-Service Transaction Analysis**

Analyze transactions spanning multiple services:

```
Trace Search Query:
  trace.span_count > 10
  AND service.name IN ["api-gateway", "auth-service", "payment-service"]
  AND http.method = "POST"
```

**When to use:**
- Distributed system debugging
- Service dependency analysis
- End-to-end latency investigation

**Cost consideration:** ✅ Moderate - focused on specific service combinations

---

### 5. **Database Performance Investigation**

Find slow database queries:

```
Trace Search Query:
  db.operation = "SELECT"
  AND db.system = "postgresql"
  AND duration > 1000ms
  AND db.statement CONTAINS "users"
```

**When to use:**
- Database performance tuning
- Query optimization
- N+1 query detection

**Cost consideration:** ✅ Low to moderate

---

### 6. **External API Dependency Issues**

Track failures in external API calls:

```
Trace Search Query:
  http.target CONTAINS "api.external-service.com"
  AND http.status_code >= 400
  AND time_range = "Last 6 hours"
```

**When to use:**
- Third-party API outages
- Rate limiting issues
- Dependency failure analysis

**Cost consideration:** ✅ Low impact

---

### 7. **Security Incident Investigation**

Search for suspicious transaction patterns:

```
Trace Search Query:
  http.status_code = 403
  AND user.authenticated = false
  AND http.route CONTAINS "/admin"
  AND time_range = "Last 7 days"
```

**When to use:**
- Security breach investigation
- Access control auditing
- Compliance monitoring

**Cost consideration:** ✅ Low - security events are typically rare

---

## Enabling Transaction Search

### Prerequisites

1. **Application Signals Enabled**
   - Transaction Search requires Application Signals
   - Must be enabled in your AWS region

2. **ADOT Instrumentation**
   - Application instrumented with AWS Distro for OpenTelemetry (ADOT)
   - Traces being sent to CloudWatch

3. **IAM Permissions**
   - `cloudwatch:GetTransactionSearch`
   - `cloudwatch:PutTransactionSearch`
   - `xray:GetTraceSummaries`
   - `xray:BatchGetTraces`

---

### Enable via AWS Console

#### Step 1: Navigate to CloudWatch

1. Open [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Select **Application Signals** from the left navigation
3. Click **Transaction Search** tab

#### Step 2: Enable Transaction Search

1. Click **"Enable Transaction Search"**
2. **⚠️ Review the cost warning**
3. Select services to enable (or all services)
4. Click **"Enable"**

#### Step 3: Configure Attribute Filters (Recommended)

1. Click **"Configure Attributes"**
2. Select which span attributes to index:
   - ✅ **Include:** `error.type`, `http.status_code`, `service.name`
   - ❌ **Exclude:** `user.id`, `session.id`, `trace.id` (high cardinality)
3. Save configuration

---

### Enable via AWS CLI

```bash
# Enable Transaction Search for specific service
aws application-signals enable-transaction-search \
  --region us-east-1 \
  --service-name my-service

# Enable with attribute filters
aws application-signals enable-transaction-search \
  --region us-east-1 \
  --service-name my-service \
  --indexed-attributes "error.type,http.status_code,http.method"
```

---

### Enable via CloudFormation

```yaml
Resources:
  TransactionSearchConfiguration:
    Type: AWS::ApplicationSignals::TransactionSearchConfig
    Properties:
      ServiceName: my-service
      Enabled: true
      IndexedAttributes:
        - error.type
        - http.status_code
        - http.method
        - service.name
      ExcludedAttributes:
        - user.id
        - session.id
        - trace.id
```

---

## Using Transaction Search

### Basic Search

1. Navigate to **CloudWatch → Application Signals → Transaction Search**
2. Enter search criteria:
   - **Service:** Select target service
   - **Time Range:** Choose time window
   - **Filters:** Add attribute filters

3. Click **"Search"**

### Advanced Queries

#### Query Builder

```
Service: payment-service
Time: Last 1 hour
Filters:
  http.status_code >= 500
  AND duration > 1000ms
  AND error.type EXISTS
```

#### SQL-like Syntax

```sql
SELECT trace_id, duration, http.status_code
FROM traces
WHERE service.name = 'payment-service'
  AND duration > 1000
  AND time > NOW() - INTERVAL 1 HOUR
ORDER BY duration DESC
LIMIT 100
```

---

### Search Results

Results include:
- **Trace ID:** Unique identifier
- **Duration:** End-to-end latency
- **Service Graph:** Services involved
- **Span Count:** Number of operations
- **Error Status:** Success/failure
- **Attributes:** Custom span attributes

Click any trace to view:
- Complete trace timeline
- Individual span details
- Service dependencies
- Error details and stack traces

---

## Best Practices

### 1. **Selective Enablement**

✅ **Do:**
- Enable for critical production services only
- Start with a single service
- Add services as needed

❌ **Don't:**
- Enable for all services at once
- Enable in development/test without limits
- Enable without reviewing attributes

---

### 2. **Attribute Selection**

✅ **Low-cardinality attributes (safe):**
- `service.name`
- `http.method`
- `http.status_code`
- `error.type`
- `db.system`
- `aws.region`

❌ **High-cardinality attributes (expensive):**
- `user.id` (thousands/millions of users)
- `session.id` (unique per session)
- `trace.id` (unique per request)
- `timestamp` (unique per millisecond)
- `request.id` (unique per request)

---

### 3. **Query Optimization**

✅ **Efficient queries:**
- Add time range filters (narrow window)
- Use indexed attributes in filters
- Limit result set size
- Use specific service names

❌ **Inefficient queries:**
- Broad time ranges (> 24 hours)
- Wildcard searches on high-cardinality fields
- No time limits
- Searching all services

---

### 4. **Cost Control**

**Set Up Billing Alerts:**

```bash
# Create billing alarm for Transaction Search
aws cloudwatch put-metric-alarm \
  --alarm-name "TransactionSearchCostAlert" \
  --alarm-description "Alert when Transaction Search costs exceed $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=AWSCloudWatch
```

**Monitor Custom Metrics:**

```bash
# Check custom metric count
aws cloudwatch list-metrics \
  --namespace ApplicationSignals \
  --query 'length(Metrics[])'
```

---

### 5. **Alternative Solutions**

Before enabling Transaction Search, consider:

| Requirement | Alternative Solution | Cost |
|-------------|---------------------|------|
| Find error logs | CloudWatch Logs Insights | Lower |
| Service health | Application Signals (default) | Included |
| Basic metrics | CloudWatch Metrics | Lower |
| Latency analysis | Service dashboards | Included |
| Log search | CloudWatch Logs | Lower |

---

## Disabling Transaction Search

### Via Console

1. Navigate to **CloudWatch → Application Signals → Transaction Search**
2. Select service
3. Click **"Disable Transaction Search"**
4. Confirm (metrics will stop being created)

### Via AWS CLI

```bash
# Disable Transaction Search
aws application-signals disable-transaction-search \
  --region us-east-1 \
  --service-name my-service
```

### Clean Up Existing Metrics

```bash
# List custom metrics created by Transaction Search
aws cloudwatch list-metrics \
  --namespace ApplicationSignals \
  --dimensions Name=Service,Value=my-service

# Note: Custom metrics cannot be deleted immediately
# They expire after 15 months of no data
```

---

## Troubleshooting

### No Search Results

**Symptoms:**
- Search returns 0 results
- Recent transactions not appearing

**Solutions:**
1. Check if Application Signals is enabled
2. Verify traces are being generated
3. Wait 5-10 minutes for indexing
4. Check attribute spelling and case sensitivity

---

### High Costs

**Symptoms:**
- Unexpected CloudWatch bills
- Hundreds of custom metrics
- Exponential metric growth

**Solutions:**
1. Review enabled attributes
2. Disable high-cardinality attributes
3. Limit to specific services
4. Consider disabling if not actively used

[**View Cost Troubleshooting →**](../cost-optimization/cost-troubleshooting.md)

---

### Slow Queries

**Symptoms:**
- Search takes > 30 seconds
- Timeout errors
- Incomplete results

**Solutions:**
1. Narrow time range (< 6 hours)
2. Add more specific filters
3. Use indexed attributes only
4. Limit result set size

---

## Cost Optimization Strategies

### Strategy 1: Time-Based Enablement

Enable Transaction Search only during business hours or incidents:

```bash
# Enable during investigation
aws application-signals enable-transaction-search --service my-service

# Disable after resolution
aws application-signals disable-transaction-search --service my-service
```

---

### Strategy 2: Attribute Filtering

Index only essential attributes:

```yaml
IndexedAttributes:
  - error.type        # For error analysis (low cardinality)
  - http.status_code  # For status tracking (low cardinality)
  - service.name      # For service filtering (low cardinality)
  
ExcludedAttributes:
  - user.id          # High cardinality
  - session.id       # High cardinality
  - trace.id         # High cardinality
```

---

### Strategy 3: Service-Specific Enablement

Enable only for critical services:

```bash
# Enable for critical payment service only
aws application-signals enable-transaction-search \
  --service payment-service

# Keep other services disabled
```

---

### Strategy 4: Use CloudWatch Logs Instead

For simple searches, use Logs Insights (cheaper):

```sql
-- CloudWatch Logs Insights query
fields @timestamp, @message, userId, statusCode
| filter statusCode >= 500
| filter service = "payment-service"
| limit 100
```

**Cost comparison:**
- **Logs Insights:** $0.005 per GB scanned
- **Transaction Search:** $2.50 per GB + custom metrics

---

## Comparison with Alternatives

### Transaction Search vs CloudWatch Logs Insights

| Feature | Transaction Search | Logs Insights |
|---------|-------------------|---------------|
| **Search Scope** | Distributed traces | Log messages |
| **Cost** | High (custom metrics) | Low (scan-based) |
| **Best For** | Complex transactions | Simple log search |
| **Time Range** | Real-time to 15 days | Custom retention |
| **Query Language** | Attribute-based | SQL-like |

**Recommendation:** Use Logs Insights for simple searches; Transaction Search for complex trace analysis.

---

### Transaction Search vs Application Signals

| Feature | Transaction Search | Application Signals |
|---------|-------------------|---------------------|
| **Purpose** | Find specific traces | Service health monitoring |
| **Cost** | Additional cost | Included with APM |
| **Search** | Advanced queries | Dashboard filtering |
| **Use Case** | Investigation | Monitoring |

**Recommendation:** Always use Application Signals; add Transaction Search only when needed for investigation.

---

## Real-World Examples

### Example 1: E-Commerce Checkout Failure

**Scenario:** Customers reporting failed checkouts

**Query:**
```
Service: checkout-service
Time: Last 2 hours
Filters:
  http.route = "/api/checkout"
  AND http.status_code = 500
  AND error.type = "PaymentGatewayTimeout"
```

**Result:** Found 47 failed transactions, all with payment gateway timeouts

**Action:** Contacted payment provider, found network issue

---

### Example 2: Slow API Performance

**Scenario:** API latency increased from 200ms to 2000ms

**Query:**
```
Service: api-gateway
Time: Last 1 hour
Filters:
  duration > 2000ms
  AND http.route = "/api/users"
ORDER BY duration DESC
```

**Result:** Found slow database queries due to missing index

**Action:** Added database index, latency returned to normal

---

### Example 3: Security Investigation

**Scenario:** Unusual admin access attempts

**Query:**
```
Service: auth-service
Time: Last 24 hours
Filters:
  http.route = "/admin/login"
  AND http.status_code = 403
  AND user.authenticated = false
```

**Result:** Found 200+ failed login attempts from single IP

**Action:** Blocked IP address, enabled rate limiting

---

## Integration with Other AWS Services

### X-Ray Service Graph

Transaction Search results link to X-Ray:
- View complete service graph
- See downstream dependencies
- Analyze call patterns

### CloudWatch Logs

Traces link to associated logs:
- See application logs for trace
- Correlate errors with log messages
- Debug with full context

### CloudWatch Dashboards

Create dashboards from search results:
- Save frequent queries
- Track patterns over time
- Share with team

---

## Additional Resources

### Documentation
- [AWS Application Signals Documentation](https://docs.aws.amazon.com/cloudwatch/latest/monitoring/CloudWatch-Application-Signals.html)
- [CloudWatch Transaction Search API Reference](https://docs.aws.amazon.com/cloudwatch/latest/APIReference/)
- [ADOT Instrumentation Guide](https://aws-otel.github.io/docs/introduction)

### Related Pages
- [Application Signals Overview](application-signals.md)
- [Distributed Tracing Guide](distributed-tracing.md)
- [Cost Optimization Guide](../cost-optimization/index.md)
- [Troubleshooting Guide](../troubleshooting/common-issues.md)

### Support
- [AWS Support Console](https://console.aws.amazon.com/support/)
- [AWS re:Post](https://repost.aws/)
- [GitHub Issues](https://github.com/aws-observability/aws-otel-community/issues)

---

## Summary

### ✅ Use Transaction Search For:
- Investigating specific production issues
- Finding failed transactions by attributes
- Analyzing complex distributed traces
- Security and compliance auditing

### ❌ Don't Use Transaction Search For:
- Basic service monitoring
- Real-time alerting
- Cost-sensitive environments without careful planning
- Cases where CloudWatch Logs Insights suffices

### 💰 Cost Management:
- **Start disabled**, enable selectively
- **Index low-cardinality attributes only**
- **Enable per-service**, not globally
- **Monitor costs weekly**

### 🎯 Best Practice:
Enable Transaction Search **on-demand** during investigations, then disable when not actively needed.

---

**Next Steps:**
1. [Enable Application Signals](application-signals.md) (prerequisite)
2. [Review Cost Implications](../cost-optimization/index.md)
3. [Set Up Billing Alerts](../cost-optimization/monitoring.md)
4. Enable Transaction Search selectively
5. Create saved queries for common use cases
