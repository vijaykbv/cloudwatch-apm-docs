---
title: "Migrating from Existing APM Solutions"
description: "Step-by-step guide for migrating from other APM tools to CloudWatch APM"
audience: ["operations", "architect"]
difficulty: "intermediate"
category: "implementation"
tags: ["migration", "brownfield", "integration"]
estimatedReadTime: 15
lastUpdated: "2024-01-15"
relatedPages: ["gradual-rollout", "compatibility-matrix"]
---

# Migrating from Existing APM Solutions

This guide helps you migrate from other APM solutions to CloudWatch APM while minimizing disruption to your existing operations.

## Supported Migration Paths

### From New Relic

CloudWatch APM can run alongside New Relic during transition:

```yaml
# Dual instrumentation configuration
exporters:
  newrelic:
    endpoint: https://trace-api.newrelic.com/trace/v1
    headers:
      api-key: ${NEW_RELIC_API_KEY}
  awsxray:
    region: us-west-2

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
```

### From Datadog

Gradual migration strategy with metric mapping:

```python
# Python example: Dual metrics export
from opentelemetry import metrics
from opentelemetry.exporter.datadog import DatadogMetricsExporter
from opentelemetry.exporter.cloudwatch import CloudWatchMetricsExporter

# Configure dual export during migration
datadog_exporter = DatadogMetricsExporter(api_key="your-dd-key")
cloudwatch_exporter = CloudWatchMetricsExporter(region="us-west-2")
```

### From AppDynamics

Service map and dependency migration:

```java
// Java configuration for AppDynamics migration
@Configuration
public class APMConfiguration {
    
    @Bean
    public OpenTelemetryAgent openTelemetryAgent() {
        return OpenTelemetryAgent.builder()
            .setResource(Resource.getDefault()
                .merge(Resource.builder()
                    .put(ResourceAttributes.SERVICE_NAME, "my-service")
                    .put(ResourceAttributes.SERVICE_VERSION, "1.0.0")
                    .build()))
            .build();
    }
}
```

## Migration Strategy

### Phase 1: Parallel Deployment (Weeks 1-2)

1. **Install CloudWatch APM alongside existing solution**
2. **Configure dual export** to both systems
3. **Validate data consistency** between platforms
4. **Train team** on CloudWatch APM interface

### Phase 2: Gradual Transition (Weeks 3-6)

1. **Migrate dashboards** one service at a time
2. **Update alerting rules** with CloudWatch equivalents
3. **Redirect monitoring workflows** to CloudWatch
4. **Maintain parallel systems** for rollback capability

### Phase 3: Complete Migration (Weeks 7-8)

1. **Remove old APM agents** from applications
2. **Decommission old dashboards** and alerts
3. **Update documentation** and runbooks
4. **Conduct post-migration review**

## Common Challenges and Solutions

### Challenge: Different Metric Names

**Problem**: Existing dashboards use different metric naming conventions.

**Solution**: Use metric transformation and aliasing:

```yaml
processors:
  metricstransform:
    transforms:
      - include: old.metric.name
        match_type: strict
        action: update
        new_name: new.metric.name
```

### Challenge: Custom Instrumentation

**Problem**: Existing custom instrumentation needs to be adapted.

**Solution**: Gradual replacement with OpenTelemetry:

```python
# Before (custom instrumentation)
@custom_trace("operation_name")
def my_function():
    pass

# After (OpenTelemetry)
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

@tracer.start_as_current_span("operation_name")
def my_function():
    pass
```

## Validation Checklist

- [ ] All services reporting to CloudWatch APM
- [ ] Key metrics available in CloudWatch dashboards
- [ ] Alerting rules configured and tested
- [ ] Team trained on new interface
- [ ] Documentation updated
- [ ] Rollback plan tested
- [ ] Performance impact assessed
- [ ] Cost analysis completed

## Next Steps

- [Gradual Rollout Strategies](gradual-rollout.md)
- [AWS Service Compatibility](compatibility-matrix.md)
- [Performance Optimization](../performance/optimization-guide.md)