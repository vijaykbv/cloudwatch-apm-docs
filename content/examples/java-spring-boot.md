---
title: "Java Spring Boot Integration"
description: "Complete example of integrating CloudWatch APM with Spring Boot applications"
audience: ["developer"]
difficulty: "intermediate"
category: "examples"
tags: ["java", "spring-boot", "integration", "example"]
estimatedReadTime: 12
lastUpdated: "2024-01-15"
relatedPages: ["java-configuration", "spring-boot-best-practices"]
---

# Java Spring Boot Integration

Complete example showing how to integrate CloudWatch APM with a Spring Boot application.

## Sample Application

This example uses a simple REST API built with Spring Boot that includes:

- REST endpoints
- Database operations
- External service calls
- Custom business logic

## Project Setup

### Dependencies

Add the following to your `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- OpenTelemetry Auto-instrumentation -->
    <dependency>
        <groupId>io.opentelemetry.instrumentation</groupId>
        <artifactId>opentelemetry-spring-boot-starter</artifactId>
        <version>1.32.0-alpha</version>
    </dependency>
    
    <!-- AWS X-Ray Exporter -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-exporter-aws-xray</artifactId>
        <version>1.32.0</version>
    </dependency>
</dependencies>
```

### Configuration

Create `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: cloudwatch-apm-demo
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver

# OpenTelemetry Configuration
otel:
  service:
    name: ${spring.application.name}
    version: 1.0.0
  exporter:
    otlp:
      endpoint: http://localhost:4317
  resource:
    attributes:
      deployment.environment: development
      service.namespace: demo

# AWS Configuration
aws:
  region: us-west-2
  xray:
    tracing-name: ${spring.application.name}
```

## Application Code

### Main Application Class

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class CloudWatchApmDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudWatchApmDemoApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### REST Controller

```java
package com.example.demo.controller;

import com.example.demo.service.UserService;
import com.example.demo.model.User;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private Tracer tracer;

    @GetMapping
    public List<User> getAllUsers() {
        Span span = tracer.spanBuilder("get-all-users")
                .setAttribute("operation", "database-query")
                .startSpan();
        
        try (Scope scope = span.makeCurrent()) {
            List<User> users = userService.findAll();
            span.setAttribute("user.count", users.size());
            return users;
        } finally {
            span.end();
        }
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        Span span = tracer.spanBuilder("get-user-by-id")
                .setAttribute("user.id", id)
                .startSpan();
        
        try (Scope scope = span.makeCurrent()) {
            return userService.findById(id);
        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(io.opentelemetry.api.trace.StatusCode.ERROR, e.getMessage());
            throw e;
        } finally {
            span.end();
        }
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
```

### Service Layer

```java
package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.trace.Span;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final LongCounter userCreatedCounter;

    public UserService(Meter meter) {
        this.userCreatedCounter = meter
                .counterBuilder("users_created_total")
                .setDescription("Total number of users created")
                .build();
    }

    public List<User> findAll() {
        // Add custom span attributes
        Span currentSpan = Span.current();
        currentSpan.setAttribute("service.operation", "find-all-users");
        
        return userRepository.findAll();
    }

    public User findById(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found: " + id);
        }
        
        // Enrich user data with external service call
        enrichUserData(user.get());
        
        return user.get();
    }

    public User save(User user) {
        User savedUser = userRepository.save(user);
        
        // Increment custom metric
        userCreatedCounter.add(1, 
            io.opentelemetry.api.common.Attributes.of(
                io.opentelemetry.api.common.AttributeKey.stringKey("user.type"), 
                user.getType()
            ));
        
        return savedUser;
    }

    private void enrichUserData(User user) {
        try {
            // Simulate external service call
            String enrichmentData = restTemplate.getForObject(
                "https://api.example.com/enrich/" + user.getId(), 
                String.class
            );
            user.setEnrichmentData(enrichmentData);
        } catch (Exception e) {
            // Log error but don't fail the request
            Span.current().addEvent("enrichment-failed", 
                io.opentelemetry.api.common.Attributes.of(
                    io.opentelemetry.api.common.AttributeKey.stringKey("error.message"), 
                    e.getMessage()
                ));
        }
    }
}
```

### Configuration Class

```java
package com.example.demo.config;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.trace.Tracer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ObservabilityConfig {

    @Bean
    public Tracer tracer(OpenTelemetry openTelemetry) {
        return openTelemetry.getTracer("cloudwatch-apm-demo", "1.0.0");
    }

    @Bean
    public Meter meter(OpenTelemetry openTelemetry) {
        return openTelemetry.getMeter("cloudwatch-apm-demo", "1.0.0");
    }
}
```

## Running the Application

### Local Development

1. **Start the application**:
```bash
mvn spring-boot:run
```

2. **With APM agent**:
```bash
java -javaagent:aws-opentelemetry-agent.jar \
     -Dotel.resource.attributes=service.name=cloudwatch-apm-demo \
     -Dotel.aws.imds.endpointOverride=http://localhost:1338 \
     -jar target/cloudwatch-apm-demo-1.0.0.jar
```

### Production Deployment

```dockerfile
FROM openjdk:17-jre-slim

# Download APM agent
RUN wget -O /opt/aws-opentelemetry-agent.jar \
    https://github.com/aws-observability/aws-otel-java-instrumentation/releases/latest/download/aws-opentelemetry-agent.jar

COPY target/cloudwatch-apm-demo-1.0.0.jar /app/app.jar

ENV OTEL_SERVICE_NAME=cloudwatch-apm-demo
ENV OTEL_SERVICE_VERSION=1.0.0
ENV OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production

ENTRYPOINT ["java", "-javaagent:/opt/aws-opentelemetry-agent.jar", "-jar", "/app/app.jar"]
```

## Testing the Integration

### Generate Test Traffic

```bash
# Create users
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","type":"premium"}'

# Get all users
curl http://localhost:8080/api/users

# Get specific user
curl http://localhost:8080/api/users/1

# Generate error
curl http://localhost:8080/api/users/999
```

### Verify in CloudWatch

1. **Check X-Ray traces** in the AWS Console
2. **View custom metrics** in CloudWatch Metrics
3. **Set up dashboards** for key metrics
4. **Configure alerts** for error rates

## Best Practices

### Custom Instrumentation

```java
@Component
public class BusinessLogicService {
    
    private final Tracer tracer;
    private final LongCounter processedCounter;
    
    public BusinessLogicService(Tracer tracer, Meter meter) {
        this.tracer = tracer;
        this.processedCounter = meter
            .counterBuilder("business_operations_total")
            .build();
    }
    
    public void processBusinessLogic(String operation) {
        Span span = tracer.spanBuilder("business-operation")
            .setAttribute("operation.type", operation)
            .startSpan();
            
        try (Scope scope = span.makeCurrent()) {
            // Business logic here
            processedCounter.add(1);
            span.setStatus(StatusCode.OK);
        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(StatusCode.ERROR, e.getMessage());
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### Error Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        // Add exception details to current span
        Span currentSpan = Span.current();
        currentSpan.recordException(e);
        currentSpan.setStatus(StatusCode.ERROR, e.getMessage());
        
        return ResponseEntity.status(500).body("Internal Server Error");
    }
}
```

## Next Steps

- [Java Configuration Guide](../configuration/java-config.md)
- [Spring Boot Best Practices](spring-boot-best-practices.md)
- [Performance Optimization](../performance/java-optimization.md)
- [Troubleshooting Java Applications](../troubleshooting/java-issues.md)