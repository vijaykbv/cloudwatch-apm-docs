# APM Cost Calculator & Estimator

## 🧮 **Interactive Cost Calculator**

### **Input Your Current Usage**

#### **Application Profile**
```yaml
# Fill in your application details
application:
  name: "MyApp"
  environment: "production"  # development, staging, production
  traffic_level: "medium"    # low, medium, high, enterprise
  
  # Request Volume
  requests_per_day: 100000
  requests_per_month: 3000000
  
  # Error Rates
  error_rate_percentage: 0.5
  slow_request_percentage: 2.0
```

#### **Current Monitoring Setup**
```yaml
current_setup:
  # Tracing
  trace_sampling_rate: 10    # Percentage of traces sampled
  traces_per_day: 10000
  
  # Metrics
  custom_metrics_count: 50
  metric_data_points_per_day: 50000
  
  # Logs
  log_volume_gb_per_day: 5
  log_retention_days: 30
  
  # Features Enabled
  x_ray_enabled: true
  application_signals_enabled: false
  transaction_search_enabled: false
```

---

## 💰 **Cost Breakdown Calculator**

### **AWS CloudWatch APM Pricing (US East 1)**

#### **Base Pricing Structure**
```yaml
pricing:
  # X-Ray Tracing
  x_ray:
    traces_recorded: 5.00    # per 1M traces recorded
    traces_retrieved: 5.00   # per 1M traces retrieved
    trace_storage: 1.00      # per 1M trace segments stored per month
  
  # CloudWatch Metrics
  metrics:
    custom_metrics: 0.30     # per metric per month
    api_requests: 0.01       # per 1,000 API requests
    dashboard_hours: 3.00    # per dashboard per month
  
  # CloudWatch Logs
  logs:
    ingestion: 0.50          # per GB ingested
    storage: 0.03            # per GB per month
    insights_queries: 0.005  # per GB scanned
  
  # Application Signals
  application_signals:
    ingestion: 0.25          # per GB of telemetry data ingested
    custom_metrics: 0.30     # per custom metric per month (auto-created)
```

### **Monthly Cost Estimation**

#### **X-Ray Costs**
```javascript
function calculateXRayCosts(tracesPerDay, samplingRate, retentionDays) {
  const tracesRecorded = (tracesPerDay * 30 * samplingRate / 100) / 1000000;
  const tracesRetrieved = tracesRecorded * 0.1; // Assume 10% retrieval rate
  const traceStorage = tracesRecorded * (retentionDays / 30);
  
  return {
    recording: tracesRecorded * 5.00,
    retrieval: tracesRetrieved * 5.00,
    storage: traceStorage * 1.00,
    total: (tracesRecorded * 5.00) + (tracesRetrieved * 5.00) + (traceStorage * 1.00)
  };
}

// Example calculation
const xrayCosts = calculateXRayCosts(10000, 1, 30);
console.log(`X-Ray monthly cost: $${xrayCosts.total.toFixed(2)}`);
```

#### **CloudWatch Metrics Costs**
```javascript
function calculateMetricsCosts(customMetricsCount, apiRequestsPerDay) {
  const customMetricsCost = customMetricsCount * 0.30;
  const apiRequestsCost = (apiRequestsPerDay * 30 / 1000) * 0.01;
  
  return {
    customMetrics: customMetricsCost,
    apiRequests: apiRequestsCost,
    total: customMetricsCost + apiRequestsCost
  };
}

// Example calculation
const metricsCosts = calculateMetricsCosts(50, 1000);
console.log(`Metrics monthly cost: $${metricsCosts.total.toFixed(2)}`);
```

#### **CloudWatch Logs Costs**
```javascript
function calculateLogsCosts(logVolumeGBPerDay, retentionDays) {
  const monthlyIngestion = logVolumeGBPerDay * 30;
  const averageStorage = (monthlyIngestion * retentionDays) / 30;
  
  return {
    ingestion: monthlyIngestion * 0.50,
    storage: averageStorage * 0.03,
    total: (monthlyIngestion * 0.50) + (averageStorage * 0.03)
  };
}

// Example calculation
const logsCosts = calculateLogsCosts(5, 30);
console.log(`Logs monthly cost: $${logsCosts.total.toFixed(2)}`);
```

---

## 📊 **Cost Optimization Scenarios**

### **Scenario 1: Personal/Development Project**
```yaml
scenario_personal:
  profile:
    requests_per_day: 1000
    error_rate: 1%
    team_size: 1-2
    budget_target: "$10-20/month"
  
  recommended_config:
    x_ray_sampling: 0.1%        # Very low sampling
    custom_metrics: 5           # Minimal metrics
    log_retention: 7            # Short retention
    features:
      application_signals: false
      transaction_search: false
  
  estimated_cost:
    x_ray: "$2.50"
    metrics: "$1.50"
    logs: "$3.00"
    total: "$7.00/month"
```

### **Scenario 2: Production Application**
```yaml
scenario_production:
  profile:
    requests_per_day: 100000
    error_rate: 0.5%
    team_size: 5-10
    budget_target: "$50-100/month"
  
  recommended_config:
    x_ray_sampling: 1%          # Balanced sampling
    custom_metrics: 25          # Essential metrics
    log_retention: 30           # Standard retention
    features:
      application_signals: selective
      transaction_search: false
  
  estimated_cost:
    x_ray: "$25.00"
    metrics: "$7.50"
    logs: "$15.00"
    application_signals: "$20.00"
    total: "$67.50/month"
```

### **Scenario 3: Enterprise Application**
```yaml
scenario_enterprise:
  profile:
    requests_per_day: 1000000
    error_rate: 0.1%
    team_size: 20+
    budget_target: "$200-500/month"
  
  recommended_config:
    x_ray_sampling: 2%          # Higher sampling
    custom_metrics: 100         # Comprehensive metrics
    log_retention: 90           # Extended retention
    features:
      application_signals: true
      transaction_search: true
  
  estimated_cost:
    x_ray: "$100.00"
    metrics: "$30.00"
    logs: "$45.00"
    application_signals: "$75.00"
    transaction_search: "$50.00"
    total: "$300.00/month"
```

---

## 🎯 **Cost Optimization Calculator**

### **Before vs. After Optimization**

#### **Input Current State**
```yaml
current_state:
  x_ray_sampling: 10%         # Current sampling rate
  custom_metrics: 300         # Current metric count
  log_volume_gb_day: 20       # Current log volume
  log_retention: 365          # Current retention
  features_enabled:
    - application_signals
    - transaction_search
    - detailed_monitoring
```

#### **Optimization Recommendations**
```javascript
function generateOptimizations(currentState) {
  const optimizations = [];
  
  // Sampling optimization
  if (currentState.x_ray_sampling > 5) {
    optimizations.push({
      area: "X-Ray Sampling",
      current: `${currentState.x_ray_sampling}%`,
      recommended: "1-2%",
      savings: calculateSamplingSavings(currentState.x_ray_sampling, 2),
      impact: "Minimal - errors and slow requests still captured"
    });
  }
  
  // Metrics optimization
  if (currentState.custom_metrics > 100) {
    optimizations.push({
      area: "Custom Metrics",
      current: currentState.custom_metrics,
      recommended: "50-75 essential metrics",
      savings: (currentState.custom_metrics - 75) * 0.30,
      impact: "Low - focus on business-critical metrics"
    });
  }
  
  // Log retention optimization
  if (currentState.log_retention > 90) {
    optimizations.push({
      area: "Log Retention",
      current: `${currentState.log_retention} days`,
      recommended: "30-90 days",
      savings: calculateRetentionSavings(currentState.log_volume_gb_day, currentState.log_retention, 30),
      impact: "None - older logs rarely accessed"
    });
  }
  
  return optimizations;
}
```

### **ROI Calculator**
```javascript
function calculateROI(currentCost, optimizedCost, issuesDetected, mttrImprovement) {
  const monthlySavings = currentCost - optimizedCost;
  const annualSavings = monthlySavings * 12;
  
  // Calculate value of issues detected
  const avgIncidentCost = 10000; // $10k average incident cost
  const issuesPreventedValue = issuesDetected * avgIncidentCost;
  
  // Calculate MTTR improvement value
  const mttrValue = mttrImprovement * 1000; // $1k per hour of MTTR improvement
  
  const totalValue = issuesPreventedValue + mttrValue;
  const roi = ((totalValue - (optimizedCost * 12)) / (optimizedCost * 12)) * 100;
  
  return {
    monthlySavings,
    annualSavings,
    issuesPreventedValue,
    mttrValue,
    totalValue,
    roi: `${roi.toFixed(1)}%`
  };
}
```

---

## 🔧 **Interactive Tools**

### **1. Sampling Rate Optimizer**
```html
<!-- Interactive sampling calculator -->
<div class="sampling-calculator">
  <h4>Optimal Sampling Rate Calculator</h4>
  
  <label>Daily Request Volume:</label>
  <input type="number" id="dailyRequests" value="100000">
  
  <label>Error Rate (%):</label>
  <input type="number" id="errorRate" value="0.5" step="0.1">
  
  <label>Budget Target ($/month):</label>
  <input type="number" id="budgetTarget" value="50">
  
  <button onclick="calculateOptimalSampling()">Calculate</button>
  
  <div id="samplingResults"></div>
</div>

<script>
function calculateOptimalSampling() {
  const dailyRequests = document.getElementById('dailyRequests').value;
  const errorRate = document.getElementById('errorRate').value;
  const budgetTarget = document.getElementById('budgetTarget').value;
  
  // Always sample errors (100% of error rate)
  const errorTraces = dailyRequests * (errorRate / 100);
  
  // Calculate remaining budget for normal traces
  const errorTraceCost = (errorTraces * 30 / 1000000) * 5;
  const remainingBudget = budgetTarget - errorTraceCost;
  
  // Calculate optimal sampling for normal traces
  const normalRequests = dailyRequests * (1 - errorRate / 100);
  const maxNormalTraces = (remainingBudget / 5) * 1000000 / 30;
  const optimalSampling = (maxNormalTraces / normalRequests) * 100;
  
  document.getElementById('samplingResults').innerHTML = `
    <h5>Recommended Configuration:</h5>
    <p>Error Sampling: 100% (${errorTraces.toFixed(0)} traces/day)</p>
    <p>Normal Sampling: ${optimalSampling.toFixed(2)}%</p>
    <p>Total Monthly Cost: $${budgetTarget}</p>
  `;
}
</script>
```

### **2. Metric Cardinality Analyzer**
```javascript
// Tool to analyze metric cardinality impact
function analyzeMetricCardinality(metricDefinition) {
  const dimensions = metricDefinition.dimensions;
  let totalCombinations = 1;
  
  dimensions.forEach(dimension => {
    totalCombinations *= dimension.possibleValues;
  });
  
  const monthlyCost = totalCombinations * 0.30;
  
  return {
    metricName: metricDefinition.name,
    dimensions: dimensions.length,
    combinations: totalCombinations,
    monthlyCost: monthlyCost,
    recommendation: totalCombinations > 100 ? "High cardinality - consider reducing dimensions" : "Acceptable cardinality"
  };
}

// Example usage
const userActionMetric = {
  name: "UserAction",
  dimensions: [
    { name: "Action", possibleValues: 10 },
    { name: "Region", possibleValues: 5 },
    { name: "UserType", possibleValues: 3 }
  ]
};

const analysis = analyzeMetricCardinality(userActionMetric);
console.log(analysis);
// Output: 150 combinations, $45/month
```

---

## 📈 **Cost Trend Analysis**

### **Historical Cost Tracking**
```python
import boto3
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

def analyze_cost_trends():
    ce = boto3.client('ce')
    
    # Get last 6 months of CloudWatch costs
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
    
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['BlendedCost'],
        GroupBy=[
            {
                'Type': 'DIMENSION',
                'Key': 'SERVICE'
            }
        ],
        Filter={
            'Dimensions': {
                'Key': 'SERVICE',
                'Values': ['Amazon CloudWatch', 'AWS X-Ray']
            }
        }
    )
    
    # Process and visualize data
    months = []
    costs = []
    
    for result in response['ResultsByTime']:
        month = result['TimePeriod']['Start']
        total_cost = sum(float(group['Metrics']['BlendedCost']['Amount']) 
                        for group in result['Groups'])
        months.append(month)
        costs.append(total_cost)
    
    # Plot trend
    plt.figure(figsize=(10, 6))
    plt.plot(months, costs, marker='o')
    plt.title('APM Cost Trend Analysis')
    plt.xlabel('Month')
    plt.ylabel('Cost ($)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
    
    return {
        'months': months,
        'costs': costs,
        'trend': 'increasing' if costs[-1] > costs[0] else 'decreasing',
        'average_monthly': sum(costs) / len(costs)
    }
```

---

## 🎯 **Quick Cost Assessment**

### **5-Minute Cost Health Check**
```yaml
cost_health_check:
  questions:
    - "What's your current monthly APM spend?"
    - "How many custom metrics do you have?"
    - "What's your X-Ray sampling rate?"
    - "How long do you retain logs?"
    - "Which APM features are enabled?"
  
  red_flags:
    - monthly_cost > 500
    - custom_metrics > 200
    - sampling_rate > 10
    - log_retention > 365
    - all_features_enabled: true
  
  quick_wins:
    - reduce_sampling_to_1_percent
    - audit_custom_metrics
    - reduce_log_retention_to_30_days
    - disable_unused_features
```

### **Cost Optimization Score**
```javascript
function calculateOptimizationScore(config) {
  let score = 100;
  
  // Deduct points for inefficiencies
  if (config.sampling_rate > 5) score -= 20;
  if (config.custom_metrics > 100) score -= 15;
  if (config.log_retention > 90) score -= 10;
  if (config.unused_features > 0) score -= 15;
  if (config.high_cardinality_metrics > 0) score -= 20;
  
  return {
    score: Math.max(score, 0),
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
    recommendations: generateRecommendations(config)
  };
}
```

This comprehensive cost optimization guide provides practical tools and strategies to help customers control their APM costs while maintaining effective observability.