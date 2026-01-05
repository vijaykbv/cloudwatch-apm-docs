# APM Cost Troubleshooting Guide

## 🚨 **Emergency Cost Response**

### **Immediate Actions for Cost Spikes**

#### **Step 1: Identify the Source (5 minutes)**
```bash
# Quick cost analysis commands
# Check current month's charges by service
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --filter file://cloudwatch-filter.json

# cloudwatch-filter.json
{
  "Dimensions": {
    "Key": "SERVICE",
    "Values": ["Amazon CloudWatch", "AWS X-Ray", "Amazon CloudWatch Logs"]
  }
}
```

#### **Step 2: Stop the Bleeding (10 minutes)**
```bash
# Emergency cost controls

# 1. Reduce X-Ray sampling immediately
aws xray put-sampling-rule \
  --sampling-rule '{
    "rule_name": "emergency_sampling",
    "priority": 1,
    "fixed_rate": 0.01,
    "reservoir_size": 1,
    "service_name": "*",
    "service_type": "*",
    "host": "*",
    "method": "*",
    "url_path": "*",
    "version": 1
  }'

# 2. Disable Transaction Search if enabled
aws application-signals delete-service-level-objective \
  --slo-identifier "transaction-search-slo"

# 3. Reduce log retention for high-volume groups
aws logs put-retention-policy \
  --log-group-name "aws/spans" \
  --retention-in-days 1
```

#### **Step 3: Assess Damage (15 minutes)**
```python
import boto3
from datetime import datetime, timedelta

def emergency_cost_assessment():
    ce = boto3.client('ce')
    
    # Get today's estimated charges
    today = datetime.now().strftime('%Y-%m-%d')
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    response = ce.get_cost_and_usage(
        TimePeriod={'Start': yesterday, 'End': today},
        Granularity='DAILY',
        Metrics=['BlendedCost'],
        GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'}],
        Filter={
            'Dimensions': {
                'Key': 'SERVICE',
                'Values': ['Amazon CloudWatch', 'AWS X-Ray']
            }
        }
    )
    
    print("🚨 EMERGENCY COST ASSESSMENT")
    print("=" * 40)
    
    for result in response['ResultsByTime']:
        date = result['TimePeriod']['Start']
        print(f"\nDate: {date}")
        
        for group in result['Groups']:
            service = group['Keys'][0]
            cost = float(group['Metrics']['BlendedCost']['Amount'])
            print(f"  {service}: ${cost:.2f}")
            
            # Alert on high daily costs
            if cost > 10:  # $10/day threshold
                print(f"  ⚠️  HIGH COST ALERT: ${cost:.2f}/day")
                monthly_projection = cost * 30
                print(f"  📊 Monthly projection: ${monthly_projection:.2f}")

emergency_cost_assessment()
```

---

## 🔍 **Cost Spike Investigation**

### **Common Cost Spike Scenarios**

#### **Scenario 1: Custom Metrics Explosion**
```bash
# Investigate custom metrics
aws cloudwatch list-metrics \
  --namespace "ApplicationSignals" \
  --query 'length(Metrics[])'

# Get detailed metric breakdown
aws cloudwatch list-metrics \
  --namespace "ApplicationSignals" \
  --query 'Metrics[].{Name:MetricName,Dimensions:Dimensions}' \
  --output table

# Check for high-cardinality dimensions
aws cloudwatch list-metrics \
  --namespace "ApplicationSignals" \
  --query 'Metrics[?length(Dimensions) > `3`]'
```

**Root Causes:**
- User IDs in metric dimensions
- Timestamp-based dimensions
- Session IDs or request IDs as dimensions
- Auto-generated metrics from Application Signals

**Quick Fix:**
```bash
# Disable Application Signals auto-metrics
aws application-signals put-service-level-objective \
  --service-level-objective '{
    "Name": "disable-auto-metrics",
    "ComparisonOperator": "GreaterThanThreshold",
    "Threshold": 0,
    "EvaluationPeriods": 1
  }' \
  --disable-auto-metrics
```

#### **Scenario 2: Log Volume Explosion**
```bash
# Check log group sizes
aws logs describe-log-groups \
  --query 'logGroups[?storedBytes > `1000000000`].{Name:logGroupName,SizeGB:storedBytes}' \
  --output table

# Check recent log ingestion
aws logs describe-log-streams \
  --log-group-name "aws/spans" \
  --order-by LastEventTime \
  --descending \
  --max-items 10
```

**Root Causes:**
- Debug logging enabled in production
- Verbose application logs
- High-frequency health check logs
- Transaction Search span ingestion

**Quick Fix:**
```bash
# Reduce log retention immediately
for log_group in $(aws logs describe-log-groups --query 'logGroups[?storedBytes > `1000000000`].logGroupName' --output text); do
  aws logs put-retention-policy \
    --log-group-name "$log_group" \
    --retention-in-days 3
done
```

#### **Scenario 3: X-Ray Trace Volume Spike**
```bash
# Check X-Ray service statistics
aws xray get-service-graph \
  --start-time $(date -d '1 day ago' +%s) \
  --end-time $(date +%s)

# Check sampling rules
aws xray get-sampling-rules
```

**Root Causes:**
- High sampling rate (>5%)
- No sampling rules configured
- Traffic spike without sampling adjustment
- All requests being traced

**Quick Fix:**
```bash
# Implement emergency sampling
aws xray create-sampling-rule \
  --sampling-rule '{
    "rule_name": "emergency_low_sampling",
    "priority": 1,
    "fixed_rate": 0.01,
    "reservoir_size": 1,
    "service_name": "*",
    "service_type": "*",
    "host": "*",
    "method": "*",
    "url_path": "*",
    "version": 1
  }'
```

---

## 🛠️ **Diagnostic Tools**

### **Cost Analysis Scripts**

#### **Comprehensive Cost Breakdown**
```python
import boto3
import json
from datetime import datetime, timedelta

class APMCostAnalyzer:
    def __init__(self):
        self.ce = boto3.client('ce')
        self.cloudwatch = boto3.client('cloudwatch')
        self.logs = boto3.client('logs')
        self.xray = boto3.client('xray')
    
    def analyze_current_month_costs(self):
        """Get detailed cost breakdown for current month"""
        start_date = datetime.now().replace(day=1).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        response = self.ce.get_cost_and_usage(
            TimePeriod={'Start': start_date, 'End': end_date},
            Granularity='MONTHLY',
            Metrics=['BlendedCost'],
            GroupBy=[
                {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}
            ],
            Filter={
                'Dimensions': {
                    'Key': 'SERVICE',
                    'Values': ['Amazon CloudWatch', 'AWS X-Ray', 'Amazon CloudWatch Logs']
                }
            }
        )
        
        costs = {}
        for result in response['ResultsByTime']:
            for group in result['Groups']:
                service = group['Keys'][0]
                usage_type = group['Keys'][1]
                cost = float(group['Metrics']['BlendedCost']['Amount'])
                
                if service not in costs:
                    costs[service] = {}
                costs[service][usage_type] = cost
        
        return costs
    
    def analyze_custom_metrics(self):
        """Analyze custom metrics for cost optimization"""
        metrics_analysis = {}
        
        # Get all custom metrics
        paginator = self.cloudwatch.get_paginator('list_metrics')
        
        for page in paginator.paginate():
            for metric in page['Metrics']:
                namespace = metric['Namespace']
                
                if namespace not in ['AWS/EC2', 'AWS/RDS', 'AWS/Lambda']:  # Skip AWS native metrics
                    if namespace not in metrics_analysis:
                        metrics_analysis[namespace] = {
                            'count': 0,
                            'estimated_cost': 0,
                            'high_cardinality': []
                        }
                    
                    metrics_analysis[namespace]['count'] += 1
                    metrics_analysis[namespace]['estimated_cost'] += 0.30
                    
                    # Check for high cardinality
                    if len(metric.get('Dimensions', [])) > 3:
                        metrics_analysis[namespace]['high_cardinality'].append({
                            'metric': metric['MetricName'],
                            'dimensions': len(metric.get('Dimensions', []))
                        })
        
        return metrics_analysis
    
    def analyze_log_costs(self):
        """Analyze log groups for cost optimization"""
        log_analysis = {}
        
        paginator = self.logs.get_paginator('describe_log_groups')
        
        for page in paginator.paginate():
            for log_group in page['logGroups']:
                name = log_group['logGroupName']
                size_bytes = log_group.get('storedBytes', 0)
                size_gb = size_bytes / (1024**3)
                retention = log_group.get('retentionInDays', 'Never expire')
                
                # Estimate monthly costs
                ingestion_cost = size_gb * 0.50  # Rough estimate
                storage_cost = size_gb * 0.03
                
                log_analysis[name] = {
                    'size_gb': round(size_gb, 2),
                    'retention_days': retention,
                    'estimated_monthly_cost': round(ingestion_cost + storage_cost, 2),
                    'optimization_potential': 'High' if size_gb > 10 else 'Medium' if size_gb > 1 else 'Low'
                }
        
        return log_analysis
    
    def generate_cost_report(self):
        """Generate comprehensive cost analysis report"""
        print("🔍 APM COST ANALYSIS REPORT")
        print("=" * 50)
        
        # Current month costs
        costs = self.analyze_current_month_costs()
        print("\n💰 Current Month Costs:")
        total_cost = 0
        for service, usage_types in costs.items():
            service_total = sum(usage_types.values())
            total_cost += service_total
            print(f"  {service}: ${service_total:.2f}")
            for usage_type, cost in usage_types.items():
                if cost > 1:  # Only show significant costs
                    print(f"    {usage_type}: ${cost:.2f}")
        
        print(f"\n📊 Total APM Cost: ${total_cost:.2f}")
        
        # Custom metrics analysis
        metrics = self.analyze_custom_metrics()
        print(f"\n📈 Custom Metrics Analysis:")
        for namespace, data in metrics.items():
            print(f"  {namespace}:")
            print(f"    Count: {data['count']} metrics")
            print(f"    Estimated Cost: ${data['estimated_cost']:.2f}/month")
            if data['high_cardinality']:
                print(f"    ⚠️  High Cardinality Metrics: {len(data['high_cardinality'])}")
        
        # Log analysis
        logs = self.analyze_log_costs()
        print(f"\n📝 Log Groups Analysis:")
        high_cost_logs = {k: v for k, v in logs.items() if v['estimated_monthly_cost'] > 5}
        for log_group, data in high_cost_logs.items():
            print(f"  {log_group}:")
            print(f"    Size: {data['size_gb']} GB")
            print(f"    Retention: {data['retention_days']} days")
            print(f"    Est. Cost: ${data['estimated_monthly_cost']}/month")
            print(f"    Optimization: {data['optimization_potential']}")
        
        return {
            'total_cost': total_cost,
            'costs_by_service': costs,
            'metrics_analysis': metrics,
            'logs_analysis': logs
        }

# Usage
analyzer = APMCostAnalyzer()
report = analyzer.generate_cost_report()
```

#### **Real-Time Cost Monitor**
```python
import boto3
import time
from datetime import datetime

def real_time_cost_monitor():
    """Monitor costs in real-time and alert on spikes"""
    cloudwatch = boto3.client('cloudwatch')
    
    while True:
        try:
            # Get current estimated charges
            response = cloudwatch.get_metric_statistics(
                Namespace='AWS/Billing',
                MetricName='EstimatedCharges',
                Dimensions=[
                    {'Name': 'Currency', 'Value': 'USD'},
                    {'Name': 'ServiceName', 'Value': 'AmazonCloudWatch'}
                ],
                StartTime=datetime.now() - timedelta(hours=24),
                EndTime=datetime.now(),
                Period=3600,
                Statistics=['Maximum']
            )
            
            if response['Datapoints']:
                current_cost = response['Datapoints'][-1]['Maximum']
                timestamp = response['Datapoints'][-1]['Timestamp']
                
                print(f"[{timestamp}] Current CloudWatch cost: ${current_cost:.2f}")
                
                # Alert thresholds
                if current_cost > 100:
                    print("🚨 CRITICAL: Cost exceeds $100!")
                    send_alert(f"CloudWatch cost alert: ${current_cost:.2f}")
                elif current_cost > 50:
                    print("⚠️  WARNING: Cost exceeds $50")
            
            time.sleep(300)  # Check every 5 minutes
            
        except Exception as e:
            print(f"Error monitoring costs: {e}")
            time.sleep(60)

def send_alert(message):
    """Send cost alert via SNS"""
    sns = boto3.client('sns')
    sns.publish(
        TopicArn='arn:aws:sns:us-east-1:123456789012:apm-cost-alerts',
        Message=message,
        Subject='APM Cost Alert'
    )
```

---

## 🎯 **Cost Recovery Strategies**

### **Immediate Recovery (0-24 hours)**

#### **Emergency Shutdown Checklist**
```yaml
emergency_actions:
  immediate:
    - disable_transaction_search
    - reduce_xray_sampling_to_0_1_percent
    - set_log_retention_to_1_day
    - disable_application_signals_auto_metrics
  
  within_1_hour:
    - audit_custom_metrics_namespaces
    - identify_high_volume_log_groups
    - check_for_runaway_processes
    - implement_emergency_sampling_rules
  
  within_24_hours:
    - analyze_cost_spike_root_cause
    - implement_permanent_cost_controls
    - set_up_proactive_monitoring
    - document_lessons_learned
```

#### **Emergency Cost Control Script**
```bash
#!/bin/bash
# emergency-cost-control.sh

echo "🚨 EMERGENCY APM COST CONTROL ACTIVATED"
echo "========================================"

# 1. Reduce X-Ray sampling to minimum
echo "Reducing X-Ray sampling to 0.1%..."
aws xray put-sampling-rule \
  --sampling-rule '{
    "rule_name": "emergency_minimal_sampling",
    "priority": 1,
    "fixed_rate": 0.001,
    "reservoir_size": 1,
    "service_name": "*",
    "service_type": "*",
    "host": "*",
    "method": "*",
    "url_path": "*",
    "version": 1
  }'

# 2. Reduce log retention for high-cost groups
echo "Reducing log retention to 1 day for high-volume groups..."
aws logs describe-log-groups \
  --query 'logGroups[?storedBytes > `100000000`].logGroupName' \
  --output text | \
while read log_group; do
  echo "  Reducing retention for: $log_group"
  aws logs put-retention-policy \
    --log-group-name "$log_group" \
    --retention-in-days 1
done

# 3. Disable Application Signals if enabled
echo "Checking for Application Signals..."
if aws application-signals describe-service-level-objectives --query 'SLOs[0]' --output text 2>/dev/null; then
  echo "  Disabling Application Signals auto-metrics..."
  # Implementation depends on specific setup
fi

# 4. Set up emergency cost monitoring
echo "Setting up emergency cost monitoring..."
aws cloudwatch put-metric-alarm \
  --alarm-name "Emergency-APM-Cost-Alert" \
  --alarm-description "Emergency cost monitoring for APM services" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 3600 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=Currency,Value=USD Name=ServiceName,Value=AmazonCloudWatch \
  --evaluation-periods 1

echo "✅ Emergency cost controls activated!"
echo "📊 Monitor costs closely over the next 24 hours"
```

### **Short-term Recovery (1-7 days)**

#### **Cost Optimization Implementation**
```python
def implement_cost_optimizations():
    """Implement systematic cost optimizations"""
    
    optimizations = [
        {
            'name': 'Optimize X-Ray Sampling',
            'action': optimize_xray_sampling,
            'expected_savings': '60-80%',
            'risk': 'Low'
        },
        {
            'name': 'Reduce Custom Metrics',
            'action': optimize_custom_metrics,
            'expected_savings': '40-60%',
            'risk': 'Medium'
        },
        {
            'name': 'Optimize Log Retention',
            'action': optimize_log_retention,
            'expected_savings': '30-50%',
            'risk': 'Low'
        },
        {
            'name': 'Disable Unused Features',
            'action': disable_unused_features,
            'expected_savings': '20-40%',
            'risk': 'Low'
        }
    ]
    
    for optimization in optimizations:
        print(f"Implementing: {optimization['name']}")
        print(f"Expected savings: {optimization['expected_savings']}")
        print(f"Risk level: {optimization['risk']}")
        
        try:
            optimization['action']()
            print("✅ Successfully implemented")
        except Exception as e:
            print(f"❌ Failed: {e}")
        
        print("-" * 40)

def optimize_xray_sampling():
    """Implement intelligent X-Ray sampling"""
    # Implementation for optimized sampling rules
    pass

def optimize_custom_metrics():
    """Reduce high-cardinality custom metrics"""
    # Implementation for metric optimization
    pass

def optimize_log_retention():
    """Set appropriate log retention policies"""
    # Implementation for log optimization
    pass

def disable_unused_features():
    """Disable expensive unused features"""
    # Implementation for feature cleanup
    pass
```

---

## 📞 **Escalation Procedures**

### **When to Escalate**
- Daily costs exceed $50 unexpectedly
- Monthly projection exceeds budget by 200%
- Unable to identify cost spike source within 2 hours
- Cost controls don't reduce spending within 24 hours

### **Escalation Contacts**
```yaml
escalation_matrix:
  level_1:
    threshold: "$50/day unexpected"
    contact: "DevOps Team Lead"
    response_time: "2 hours"
  
  level_2:
    threshold: "$100/day or 3x budget"
    contact: "Engineering Manager"
    response_time: "1 hour"
  
  level_3:
    threshold: "$500/day or 5x budget"
    contact: "CTO/VP Engineering"
    response_time: "30 minutes"
```

### **Emergency Contact Script**
```bash
#!/bin/bash
# emergency-contact.sh

CURRENT_COST=$(aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[0].Groups[?Keys[0]==`Amazon CloudWatch`].Metrics.BlendedCost.Amount' \
  --output text)

if (( $(echo "$CURRENT_COST > 50" | bc -l) )); then
  echo "🚨 EMERGENCY: APM costs at $${CURRENT_COST}/day"
  echo "Sending alerts to escalation contacts..."
  
  # Send Slack alert
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 APM Cost Emergency: $${CURRENT_COST}/day\"}" \
    $SLACK_WEBHOOK_URL
  
  # Send email alert
  aws ses send-email \
    --source "alerts@company.com" \
    --destination "ToAddresses=devops@company.com" \
    --message "Subject={Data='APM Cost Emergency'},Body={Text={Data='Current APM cost: $${CURRENT_COST}/day'}}"
fi
```

This troubleshooting guide provides immediate response procedures and systematic approaches to identify and resolve APM cost issues quickly and effectively.