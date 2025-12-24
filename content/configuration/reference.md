---
title: "Configuration Reference"
description: "Complete reference for all CloudWatch APM configuration options"
audience: ["developer", "operations"]
difficulty: "intermediate"
category: "reference"
tags: ["configuration", "reference", "parameters"]
estimatedReadTime: 20
lastUpdated: "2024-01-15"
relatedPages: ["configuration-examples", "performance-tuning"]
---

# Configuration Reference

Complete reference for all CloudWatch APM configuration parameters.

## Service Configuration

### Basic Service Settings

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `service.name` | string | `unknown_service` | Name of your service |
| `service.version` | string | `""` | Version of your service |
| `service.namespace` | string | `""` | Logical namespace for grouping |

```yaml
service:
  name: "my-application"
  version: "1.2.3"
  namespace: "production"
```

### Resource Attributes

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `resource.attributes.deployment.environment` | string | `""` | Environment name |
| `resource.attributes.host.name` | string | auto-detected | Host identifier |
| `resource.attributes.cloud.provider` | string | `aws` | Cloud provider |

## Exporters

### AWS X-Ray Exporter

```yaml
exporters:
  awsxray:
    region: "us-west-2"
    no_verify_ssl: false
    endpoint: ""  # Optional custom endpoint
    max_retries: 3
    timeout: 30s
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `region` | string | `""` | AWS region |
| `no_verify_ssl` | boolean | `false` | Skip SSL verification |
| `endpoint` | string | `""` | Custom endpoint URL |
| `max_retries` | integer | `3` | Maximum retry attempts |
| `timeout` | duration | `30s` | Request timeout |

### CloudWatch Metrics Exporter

```yaml
exporters:
  awscloudwatchmetrics:
    region: "us-west-2"
    namespace: "MyApp/APM"
    dimension_rollup_option: "NoDimensionRollup"
    metric_declarations:
      - dimensions: [["service.name"], ["service.name", "operation"]]
        metric_name_selectors: ["latency", "error_rate"]
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `namespace` | string | `""` | CloudWatch namespace |
| `dimension_rollup_option` | string | `NoDimensionRollup` | Dimension aggregation |
| `metric_declarations` | array | `[]` | Metric filtering rules |

## Processors

### Batch Processor

```yaml
processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
    send_batch_max_size: 2048
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeout` | duration | `1s` | Maximum wait time |
| `send_batch_size` | integer | `1024` | Preferred batch size |
| `send_batch_max_size` | integer | `2048` | Maximum batch size |

### Memory Limiter

```yaml
processors:
  memory_limiter:
    limit_mib: 512
    spike_limit_mib: 128
    check_interval: 5s
```

## Receivers

### OTLP Receiver

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"
      http:
        endpoint: "0.0.0.0:4318"
```

### AWS Container Insights Receiver

```yaml
receivers:
  awscontainerinsightreceiver:
    collection_interval: 60s
    container_orchestrator: "eks"
    add_service_as_attribute: true
```

## Sampling

### Probabilistic Sampling

```yaml
processors:
  probabilistic_sampler:
    sampling_percentage: 10.0
    hash_seed: 22
```

### Tail Sampling

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100
    expected_new_traces_per_sec: 10
    policies:
      - name: error_policy
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: latency_policy
        type: latency
        latency: {threshold_ms: 1000}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_SERVICE_NAME` | Service name | `unknown_service` |
| `OTEL_SERVICE_VERSION` | Service version | `""` |
| `OTEL_RESOURCE_ATTRIBUTES` | Resource attributes | `""` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint | `http://localhost:4317` |
| `AWS_REGION` | AWS region | `us-east-1` |

## Performance Tuning

### High Throughput Configuration

```yaml
# Optimized for high-throughput applications
processors:
  batch:
    timeout: 200ms
    send_batch_size: 2048
    send_batch_max_size: 4096
  
  memory_limiter:
    limit_mib: 1024
    spike_limit_mib: 256

exporters:
  awsxray:
    timeout: 10s
    max_retries: 2
```

### Low Latency Configuration

```yaml
# Optimized for low-latency requirements
processors:
  batch:
    timeout: 50ms
    send_batch_size: 256
    send_batch_max_size: 512

exporters:
  awsxray:
    timeout: 5s
    max_retries: 1
```

## Validation

Use the configuration validator to check your settings:

```bash
# Validate configuration file
otel-config-validator --config otel-config.yaml

# Test configuration with dry run
otel-collector --config otel-config.yaml --dry-run
```

## Next Steps

- [Configuration Examples](configuration-examples.md) - Real-world configurations
- [Performance Tuning Guide](../performance/tuning-guide.md) - Optimize for your workload
- [Troubleshooting Configuration](../troubleshooting/config-issues.md) - Common problems