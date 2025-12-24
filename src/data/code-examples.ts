// Sample code examples data for CloudWatch APM
import { CodeExample, MultiLanguageCodeExample, SampleApplication, PerformanceExample } from '../types/examples'

export const codeExamples: CodeExample[] = [
  {
    id: 'basic-nodejs-setup',
    title: 'Basic Node.js Setup',
    description: 'Simple Node.js application with CloudWatch APM integration',
    language: 'javascript',
    code: `const express = require('express');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { AWSXRayPropagator } = require('@opentelemetry/propagator-aws-xray');
const { AWSXRayIdGenerator } = require('@opentelemetry/id-generator-aws-xray');

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter: new (require('@opentelemetry/exporter-aws-xray').AWSXRayExporter)(),
  instrumentations: [getNodeAutoInstrumentations()],
  textMapPropagator: new AWSXRayPropagator(),
  idGenerator: new AWSXRayIdGenerator(),
});

sdk.start();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello CloudWatch APM!' });
});

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  // Simulate database call
  const user = await getUserById(userId);
  res.json(user);
});

async function getUserById(id) {
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: \`User \${id}\`, email: \`user\${id}@example.com\` });
    }, 100);
  });
}

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`,
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['javascript', 'nodejs', 'express', 'basic-setup', 'getting-started'],
    dependencies: [
      '@opentelemetry/sdk-node',
      '@opentelemetry/auto-instrumentations-node',
      '@opentelemetry/exporter-aws-xray',
      '@opentelemetry/propagator-aws-xray',
      '@opentelemetry/id-generator-aws-xray',
      'express'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'app.js',
      runnable: true,
      testable: true,
      framework: 'express',
      version: '4.18.0',
      platform: 'nodejs'
    }
  },
  {
    id: 'python-flask-setup',
    title: 'Python Flask Integration',
    description: 'Flask application with OpenTelemetry and CloudWatch APM',
    language: 'python',
    code: `from flask import Flask, jsonify, request
from opentelemetry import trace
from opentelemetry.exporter.aws_xray import AwsXRaySpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
import time
import random

# Configure tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Configure AWS X-Ray exporter
xray_exporter = AwsXRaySpanExporter(
    region_name="us-west-2"
)
span_processor = BatchSpanProcessor(xray_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

app = Flask(__name__)

# Auto-instrument Flask
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

@app.route('/')
def hello():
    return jsonify({"message": "Hello CloudWatch APM!"})

@app.route('/users/<int:user_id>')
def get_user(user_id):
    with tracer.start_as_current_span("get_user") as span:
        span.set_attribute("user.id", user_id)
        
        # Simulate database query
        user_data = fetch_user_from_db(user_id)
        
        if user_data:
            span.set_attribute("user.found", True)
            return jsonify(user_data)
        else:
            span.set_attribute("user.found", False)
            span.set_status(trace.Status(trace.StatusCode.ERROR, "User not found"))
            return jsonify({"error": "User not found"}), 404

def fetch_user_from_db(user_id):
    with tracer.start_as_current_span("database_query") as span:
        span.set_attribute("db.operation", "SELECT")
        span.set_attribute("db.table", "users")
        
        # Simulate database latency
        time.sleep(random.uniform(0.01, 0.1))
        
        if user_id <= 100:
            return {
                "id": user_id,
                "name": f"User {user_id}",
                "email": f"user{user_id}@example.com"
            }
        return None

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)`,
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['python', 'flask', 'basic-setup', 'getting-started'],
    dependencies: [
      'flask',
      'opentelemetry-api',
      'opentelemetry-sdk',
      'opentelemetry-exporter-aws-xray',
      'opentelemetry-instrumentation-flask',
      'opentelemetry-instrumentation-requests'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'app.py',
      runnable: true,
      testable: true,
      framework: 'flask',
      version: '2.3.0',
      platform: 'python'
    }
  },
  {
    id: 'java-spring-boot-basic',
    title: 'Java Spring Boot Basic Setup',
    description: 'Spring Boot application with OpenTelemetry auto-instrumentation',
    language: 'java',
    code: `package com.example.cloudwatchapm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Scope;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class CloudWatchApmApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudWatchApmApplication.class, args);
    }
}

@RestController
@RequestMapping("/api")
class ApiController {
    
    @Autowired
    private Tracer tracer;
    
    @GetMapping("/")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello CloudWatch APM!");
        return response;
    }
    
    @GetMapping("/users/{id}")
    public Map<String, Object> getUser(@PathVariable String id) {
        Span span = tracer.spanBuilder("get-user-operation")
                .setAttribute("user.id", id)
                .startSpan();
        
        try (Scope scope = span.makeCurrent()) {
            // Simulate business logic
            Map<String, Object> user = fetchUserData(id);
            span.setAttribute("user.found", user != null);
            
            if (user == null) {
                span.setStatus(io.opentelemetry.api.trace.StatusCode.ERROR, "User not found");
                throw new RuntimeException("User not found: " + id);
            }
            
            return user;
        } finally {
            span.end();
        }
    }
    
    private Map<String, Object> fetchUserData(String id) {
        Span span = tracer.spanBuilder("fetch-user-data")
                .setAttribute("operation", "database-query")
                .startSpan();
        
        try (Scope scope = span.makeCurrent()) {
            // Simulate database call
            Thread.sleep(50);
            
            Map<String, Object> user = new HashMap<>();
            user.put("id", id);
            user.put("name", "User " + id);
            user.put("email", "user" + id + "@example.com");
            
            return user;
        } catch (InterruptedException e) {
            span.recordException(e);
            Thread.currentThread().interrupt();
            return null;
        } finally {
            span.end();
        }
    }
}`,
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['java', 'spring-boot', 'basic-setup', 'getting-started'],
    dependencies: [
      'spring-boot-starter-web',
      'opentelemetry-spring-boot-starter',
      'opentelemetry-exporter-aws-xray'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'CloudWatchApmApplication.java',
      runnable: true,
      testable: true,
      framework: 'spring-boot',
      version: '3.2.0',
      platform: 'java'
    }
  },
  {
    id: 'typescript-express-setup',
    title: 'TypeScript Express Integration',
    description: 'TypeScript Express application with CloudWatch APM monitoring',
    language: 'typescript',
    code: `import express from 'express';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import { AWSXRayExporter } from '@opentelemetry/exporter-aws-xray';

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter: new AWSXRayExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  textMapPropagator: new AWSXRayPropagator(),
  idGenerator: new AWSXRayIdGenerator(),
});

sdk.start();

interface User {
  id: string;
  name: string;
  email: string;
}

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello CloudWatch APM with TypeScript!' });
});

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    const user = await getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

async function getUserById(id: string): Promise<User> {
  // Simulate async database operation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (parseInt(id) <= 100) {
        resolve({
          id,
          name: \`User \${id}\`,
          email: \`user\${id}@example.com\`
        });
      } else {
        reject(new Error('User not found'));
      }
    }, 100);
  });
}

app.listen(port, () => {
  console.log(\`TypeScript server running at http://localhost:\${port}\`);
});`,
    category: 'getting-started',
    difficulty: 'intermediate',
    tags: ['typescript', 'express', 'basic-setup', 'getting-started'],
    dependencies: [
      '@opentelemetry/sdk-node',
      '@opentelemetry/auto-instrumentations-node',
      '@opentelemetry/exporter-aws-xray',
      '@opentelemetry/propagator-aws-xray',
      '@opentelemetry/id-generator-aws-xray',
      'express',
      '@types/express'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'app.ts',
      runnable: true,
      testable: true,
      framework: 'express',
      version: '4.18.0',
      platform: 'nodejs'
    }
  },
  {
    id: 'go-basic-setup',
    title: 'Go HTTP Server Integration',
    description: 'Go HTTP server with OpenTelemetry and CloudWatch APM',
    language: 'go',
    code: `package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "time"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/aws-xray"
    "go.opentelemetry.io/otel/propagation"
    "go.opentelemetry.io/otel/sdk/resource"
    "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

type User struct {
    ID    string \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

func main() {
    // Initialize OpenTelemetry
    ctx := context.Background()
    
    exporter, err := xray.New(xray.WithRegion("us-west-2"))
    if err != nil {
        log.Fatal(err)
    }

    tp := trace.NewTracerProvider(
        trace.WithBatcher(exporter),
        trace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String("cloudwatch-apm-go"),
            semconv.ServiceVersionKey.String("1.0.0"),
        )),
    )

    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.TraceContext{})

    defer func() {
        if err := tp.Shutdown(ctx); err != nil {
            log.Printf("Error shutting down tracer provider: %v", err)
        }
    }()

    // Set up HTTP routes
    http.HandleFunc("/", homeHandler)
    http.HandleFunc("/users/", userHandler)

    fmt.Println("Go server running at http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
    tracer := otel.Tracer("home-handler")
    ctx, span := tracer.Start(r.Context(), "home-request")
    defer span.End()

    response := map[string]string{
        "message": "Hello CloudWatch APM from Go!",
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
    tracer := otel.Tracer("user-handler")
    ctx, span := tracer.Start(r.Context(), "get-user")
    defer span.End()

    userID := r.URL.Path[len("/users/"):]
    span.SetAttributes(attribute.String("user.id", userID))

    user, err := getUserByID(ctx, userID)
    if err != nil {
        span.SetAttributes(attribute.Bool("user.found", false))
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    span.SetAttributes(attribute.Bool("user.found", true))
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

func getUserByID(ctx context.Context, id string) (*User, error) {
    tracer := otel.Tracer("database")
    _, span := tracer.Start(ctx, "fetch-user")
    defer span.End()

    span.SetAttributes(
        attribute.String("db.operation", "SELECT"),
        attribute.String("db.table", "users"),
    )

    // Simulate database latency
    time.Sleep(50 * time.Millisecond)

    userIDInt, err := strconv.Atoi(id)
    if err != nil || userIDInt > 100 {
        return nil, fmt.Errorf("user not found")
    }

    return &User{
        ID:    id,
        Name:  fmt.Sprintf("User %s", id),
        Email: fmt.Sprintf("user%s@example.com", id),
    }, nil
}`,
    category: 'getting-started',
    difficulty: 'intermediate',
    tags: ['go', 'http-server', 'basic-setup', 'getting-started'],
    dependencies: [
      'go.opentelemetry.io/otel',
      'go.opentelemetry.io/otel/exporters/aws-xray',
      'go.opentelemetry.io/otel/sdk/trace',
      'go.opentelemetry.io/otel/semconv/v1.4.0'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'main.go',
      runnable: true,
      testable: true,
      framework: 'net/http',
      version: '1.21',
      platform: 'go'
    }
  },
  {
    id: 'csharp-aspnet-setup',
    title: 'C# ASP.NET Core Integration',
    description: 'ASP.NET Core application with OpenTelemetry and CloudWatch APM',
    language: 'csharp',
    code: `using Microsoft.AspNetCore.Mvc;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure OpenTelemetry
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
    {
        tracerProviderBuilder
            .AddSource("CloudWatchApmDemo")
            .SetResourceBuilder(ResourceBuilder.CreateDefault()
                .AddService("cloudwatch-apm-csharp", "1.0.0"))
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddAWSXRayExporter();
    });

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseRouting();
app.MapControllers();

app.Run();

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static readonly ActivitySource ActivitySource = new("CloudWatchApmDemo");

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "Hello CloudWatch APM from C#!" });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        using var activity = ActivitySource.StartActivity("get-user");
        activity?.SetTag("user.id", id);

        try
        {
            var user = await GetUserByIdAsync(id);
            activity?.SetTag("user.found", true);
            return Ok(user);
        }
        catch (UserNotFoundException)
        {
            activity?.SetTag("user.found", false);
            activity?.SetStatus(ActivityStatusCode.Error, "User not found");
            return NotFound(new { error = "User not found" });
        }
    }

    private async Task<object> GetUserByIdAsync(string id)
    {
        using var activity = ActivitySource.StartActivity("database-query");
        activity?.SetTag("db.operation", "SELECT");
        activity?.SetTag("db.table", "users");

        // Simulate database latency
        await Task.Delay(50);

        if (int.TryParse(id, out int userId) && userId <= 100)
        {
            return new
            {
                id = id,
                name = $"User {id}",
                email = $"user{id}@example.com"
            };
        }

        throw new UserNotFoundException();
    }
}

public class UserNotFoundException : Exception
{
    public UserNotFoundException() : base("User not found") { }
}`,
    category: 'getting-started',
    difficulty: 'intermediate',
    tags: ['csharp', 'aspnet-core', 'basic-setup', 'getting-started'],
    dependencies: [
      'OpenTelemetry',
      'OpenTelemetry.Extensions.Hosting',
      'OpenTelemetry.Instrumentation.AspNetCore',
      'OpenTelemetry.Instrumentation.Http',
      'OpenTelemetry.Exporter.AWSXRay'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'Program.cs',
      runnable: true,
      testable: true,
      framework: 'aspnet-core',
      version: '8.0',
      platform: 'dotnet'
    }
  },
  {
    id: 'nodejs-integration-example',
    title: 'Node.js Microservice Integration',
    description: 'Advanced Node.js microservice with distributed tracing',
    language: 'javascript',
    code: `const express = require('express');
const axios = require('axios');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { AWSXRayExporter } = require('@opentelemetry/exporter-aws-xray');

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter: new AWSXRayExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const app = express();
const port = 3001;

app.use(express.json());

// Service discovery endpoints
const SERVICES = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3003'
};

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

// Aggregate user profile with order history
app.get('/users/:id/profile', async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Parallel service calls with distributed tracing
    const [userResponse, ordersResponse] = await Promise.all([
      axios.get(\`\${SERVICES.user}/users/\${userId}\`),
      axios.get(\`\${SERVICES.order}/users/\${userId}/orders\`)
    ]);

    const profile = {
      user: userResponse.data,
      orders: ordersResponse.data,
      totalOrders: ordersResponse.data.length
    };

    res.json(profile);
  } catch (error) {
    console.error('Profile aggregation failed:', error.message);
    res.status(500).json({ error: 'Failed to load user profile' });
  }
});

// Circuit breaker pattern for external service calls
app.get('/external-data/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const response = await axios.get(\`https://api.external.com/data/\${id}\`, {
      timeout: 5000,
      headers: { 'User-Agent': 'CloudWatch-APM-Demo' }
    });
    
    res.json(response.data);
  } catch (error) {
    // Fallback response
    res.json({ 
      id, 
      data: 'fallback-data', 
      source: 'cache',
      error: 'External service unavailable'
    });
  }
});

app.listen(port, () => {
  console.log(\`Microservice running at http://localhost:\${port}\`);
});

module.exports = app;`,
    category: 'integration',
    difficulty: 'advanced',
    tags: ['javascript', 'microservices', 'integration', 'distributed-tracing'],
    dependencies: ['express', '@opentelemetry/sdk-node', 'axios'],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'microservice.js',
      runnable: true,
      testable: true,
      framework: 'express'
    }
  },
  {
    id: 'python-integration-example',
    title: 'Python Service Integration',
    description: 'Python service with advanced APM integration',
    language: 'python',
    code: `from flask import Flask, jsonify, request
import requests
from opentelemetry import trace
from opentelemetry.exporter.aws_xray import AwsXRaySpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Configure AWS X-Ray exporter
xray_exporter = AwsXRaySpanExporter(region_name="us-west-2")
span_processor = BatchSpanProcessor(xray_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

app = Flask(__name__)

# Auto-instrument Flask and requests
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

# Service configuration
EXTERNAL_API_URL = os.getenv('EXTERNAL_API_URL', 'https://jsonplaceholder.typicode.com')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///app.db')

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "python-integration"})

@app.route('/data/<int:item_id>')
def get_enriched_data(item_id):
    with tracer.start_as_current_span("get_enriched_data") as span:
        span.set_attribute("item.id", item_id)
        
        try:
            # Fetch data from external API
            external_data = fetch_external_data(item_id)
            
            # Enrich with local data
            local_data = fetch_local_data(item_id)
            
            # Combine data sources
            enriched_data = {
                "id": item_id,
                "external": external_data,
                "local": local_data,
                "enriched_at": "2024-01-15T10:00:00Z"
            }
            
            span.set_attribute("data.enriched", True)
            return jsonify(enriched_data)
            
        except Exception as e:
            span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
            logger.error(f"Failed to enrich data for item {item_id}: {e}")
            return jsonify({"error": "Data enrichment failed"}), 500

def fetch_external_data(item_id):
    with tracer.start_as_current_span("fetch_external_data") as span:
        span.set_attribute("external.api", EXTERNAL_API_URL)
        
        try:
            response = requests.get(
                f"{EXTERNAL_API_URL}/posts/{item_id}",
                timeout=5,
                headers={"User-Agent": "CloudWatch-APM-Python-Demo"}
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            span.record_exception(e)
            # Return fallback data
            return {"id": item_id, "title": "Fallback data", "source": "cache"}

def fetch_local_data(item_id):
    with tracer.start_as_current_span("fetch_local_data") as span:
        span.set_attribute("db.operation", "SELECT")
        span.set_attribute("db.table", "local_data")
        
        # Simulate database query
        import time
        time.sleep(0.05)  # Simulate DB latency
        
        return {
            "metadata": f"Local metadata for item {item_id}",
            "category": "integration-example",
            "last_updated": "2024-01-15"
        }

@app.route('/batch-process', methods=['POST'])
def batch_process():
    with tracer.start_as_current_span("batch_process") as span:
        data = request.get_json()
        items = data.get('items', [])
        
        span.set_attribute("batch.size", len(items))
        
        results = []
        for item_id in items:
            try:
                result = process_item(item_id)
                results.append({"id": item_id, "status": "success", "result": result})
            except Exception as e:
                results.append({"id": item_id, "status": "error", "error": str(e)})
        
        span.set_attribute("batch.processed", len(results))
        return jsonify({"results": results})

def process_item(item_id):
    with tracer.start_as_current_span("process_item") as span:
        span.set_attribute("item.id", item_id)
        
        # Simulate processing
        import time
        time.sleep(0.1)
        
        return f"Processed item {item_id}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)`,
    category: 'integration',
    difficulty: 'advanced',
    tags: ['python', 'service', 'integration', 'monitoring'],
    dependencies: ['flask', 'opentelemetry-api', 'requests'],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'service.py',
      runnable: true,
      testable: true,
      framework: 'flask'
    }
  },
  {
    id: 'nodejs-monitoring-example',
    title: 'Node.js Monitoring Setup',
    description: 'Comprehensive monitoring setup for Node.js applications',
    language: 'javascript',
    code: `const express = require('express');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { AWSXRayExporter } = require('@opentelemetry/exporter-aws-xray');
const { CloudWatchMetricsExporter } = require('@opentelemetry/exporter-cloudwatch-metrics');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Initialize OpenTelemetry SDK with comprehensive monitoring
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nodejs-monitoring-demo',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new AWSXRayExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Configure metrics
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nodejs-monitoring-demo',
  }),
  readers: [new CloudWatchMetricsExporter({
    region: 'us-west-2',
    namespace: 'CustomApp/Metrics'
  })]
});

sdk.start();

const app = express();
const meter = meterProvider.getMeter('nodejs-monitoring-demo');

// Custom metrics
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests'
});

const requestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds'
});

const activeConnections = meter.createUpDownCounter('active_connections', {
  description: 'Number of active connections'
});

const memoryGauge = meter.createObservableGauge('memory_usage_bytes', {
  description: 'Memory usage in bytes'
});

// Monitor memory usage
memoryGauge.addCallback((result) => {
  const memUsage = process.memoryUsage();
  result.observe(memUsage.heapUsed, { type: 'heap_used' });
  result.observe(memUsage.heapTotal, { type: 'heap_total' });
  result.observe(memUsage.rss, { type: 'rss' });
});

// Middleware for request monitoring
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Increment request counter
  requestCounter.add(1, {
    method: req.method,
    route: req.route?.path || req.path
  });
  
  // Track active connections
  activeConnections.add(1);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Record request duration
    requestDuration.record(duration, {
      method: req.method,
      status_code: res.statusCode.toString(),
      route: req.route?.path || req.path
    });
    
    // Decrement active connections
    activeConnections.add(-1);
  });
  
  next();
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Monitoring demo running',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external
    },
    uptime: uptime,
    timestamp: new Date().toISOString()
  });
});

app.get('/simulate-load', async (req, res) => {
  // Simulate CPU intensive task
  const iterations = parseInt(req.query.iterations) || 1000000;
  let result = 0;
  
  for (let i = 0; i < iterations; i++) {
    result += Math.random();
  }
  
  res.json({ 
    result: result / iterations,
    iterations,
    message: 'Load simulation completed'
  });
});

app.get('/simulate-error', (req, res) => {
  const shouldError = Math.random() < 0.5;
  
  if (shouldError) {
    throw new Error('Simulated error for monitoring');
  }
  
  res.json({ message: 'No error this time' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error occurred:', error.message);
  
  // Record error metric
  requestCounter.add(1, {
    method: req.method,
    status: 'error',
    error_type: error.name
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(\`Monitoring demo server running at http://localhost:\${port}\`);
  console.log('Metrics available at /metrics');
  console.log('Simulate load at /simulate-load?iterations=1000000');
  console.log('Simulate errors at /simulate-error');
});

module.exports = app;`,
    category: 'monitoring',
    difficulty: 'intermediate',
    tags: ['javascript', 'monitoring', 'metrics', 'alerts'],
    dependencies: ['express', '@opentelemetry/metrics', '@opentelemetry/exporter-cloudwatch-metrics'],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'monitoring.js',
      runnable: true,
      testable: true,
      framework: 'express'
    }
  },
  {
    id: 'python-monitoring-example',
    title: 'Python Monitoring Configuration',
    description: 'Python application monitoring and alerting setup',
    language: 'python',
    code: `from flask import Flask, jsonify, request
import time
import psutil
import threading
from opentelemetry import trace, metrics
from opentelemetry.exporter.aws_xray import AwsXRaySpanExporter
from opentelemetry.exporter.cloudwatch_metrics import CloudWatchMetricsExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.instrumentation.flask import FlaskInstrumentor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure tracing
resource = Resource.create({
    ResourceAttributes.SERVICE_NAME: "python-monitoring-demo",
    ResourceAttributes.SERVICE_VERSION: "1.0.0"
})

trace.set_tracer_provider(TracerProvider(resource=resource))
tracer = trace.get_tracer(__name__)

# Configure metrics
metrics.set_meter_provider(MeterProvider(
    resource=resource,
    metric_readers=[CloudWatchMetricsExporter(
        region_name="us-west-2",
        namespace="CustomApp/Python"
    )]
))
meter = metrics.get_meter(__name__)

# Configure exporters
xray_exporter = AwsXRaySpanExporter(region_name="us-west-2")
span_processor = BatchSpanProcessor(xray_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

# Custom metrics
request_counter = meter.create_counter(
    "http_requests_total",
    description="Total number of HTTP requests"
)

request_duration = meter.create_histogram(
    "http_request_duration_seconds",
    description="HTTP request duration in seconds"
)

active_requests = meter.create_up_down_counter(
    "active_requests",
    description="Number of active requests"
)

# System metrics
cpu_gauge = meter.create_observable_gauge(
    "cpu_usage_percent",
    description="CPU usage percentage"
)

memory_gauge = meter.create_observable_gauge(
    "memory_usage_bytes",
    description="Memory usage in bytes"
)

def collect_system_metrics(result):
    # CPU usage
    cpu_percent = psutil.cpu_percent(interval=1)
    result.observe(cpu_percent, {"type": "cpu_percent"})
    
    # Memory usage
    memory = psutil.virtual_memory()
    result.observe(memory.used, {"type": "memory_used"})
    result.observe(memory.available, {"type": "memory_available"})
    result.observe(memory.percent, {"type": "memory_percent"})

cpu_gauge.add_callback(collect_system_metrics)
memory_gauge.add_callback(collect_system_metrics)

# Request monitoring middleware
@app.before_request
def before_request():
    request.start_time = time.time()
    active_requests.add(1)
    
    request_counter.add(1, {
        "method": request.method,
        "endpoint": request.endpoint or "unknown"
    })

@app.after_request
def after_request(response):
    duration = time.time() - request.start_time
    active_requests.add(-1)
    
    request_duration.record(duration, {
        "method": request.method,
        "status_code": str(response.status_code),
        "endpoint": request.endpoint or "unknown"
    })
    
    return response

@app.route('/')
def home():
    return jsonify({
        "message": "Python monitoring demo",
        "timestamp": time.time()
    })

@app.route('/health')
def health_check():
    with tracer.start_as_current_span("health_check") as span:
        # Check system health
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        health_status = {
            "status": "healthy" if cpu_percent < 80 and memory.percent < 80 else "degraded",
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "timestamp": time.time()
        }
        
        span.set_attribute("health.status", health_status["status"])
        span.set_attribute("health.cpu_percent", cpu_percent)
        span.set_attribute("health.memory_percent", memory.percent)
        
        return jsonify(health_status)

@app.route('/metrics')
def get_metrics():
    with tracer.start_as_current_span("get_metrics") as span:
        # System metrics
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        metrics_data = {
            "system": {
                "cpu_percent": cpu_percent,
                "memory": {
                    "total": memory.total,
                    "used": memory.used,
                    "available": memory.available,
                    "percent": memory.percent
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100
                }
            },
            "application": {
                "uptime": time.time() - app.start_time,
                "timestamp": time.time()
            }
        }
        
        span.set_attribute("metrics.collected", True)
        return jsonify(metrics_data)

@app.route('/simulate-work')
def simulate_work():
    with tracer.start_as_current_span("simulate_work") as span:
        duration = float(request.args.get('duration', 1.0))
        span.set_attribute("work.duration", duration)
        
        # Simulate CPU work
        start_time = time.time()
        while time.time() - start_time < duration:
            # Busy work
            sum(range(1000))
        
        return jsonify({
            "message": f"Simulated work for {duration} seconds",
            "actual_duration": time.time() - start_time
        })

@app.route('/simulate-memory')
def simulate_memory():
    with tracer.start_as_current_span("simulate_memory") as span:
        size_mb = int(request.args.get('size', 10))
        span.set_attribute("memory.size_mb", size_mb)
        
        # Allocate memory
        data = bytearray(size_mb * 1024 * 1024)  # Allocate MB
        
        # Hold for a moment
        time.sleep(2)
        
        # Release memory
        del data
        
        return jsonify({
            "message": f"Allocated and released {size_mb}MB of memory"
        })

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {e}")
    
    # Record error metric
    request_counter.add(1, {
        "method": request.method,
        "status": "error",
        "error_type": type(e).__name__
    })
    
    return jsonify({
        "error": "Internal server error",
        "timestamp": time.time()
    }), 500

if __name__ == '__main__':
    app.start_time = time.time()
    app.run(debug=True, host='0.0.0.0', port=5002)`,
    category: 'monitoring',
    difficulty: 'intermediate',
    tags: ['python', 'monitoring', 'configuration', 'alerts'],
    dependencies: ['flask', 'opentelemetry-metrics', 'psutil'],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'monitoring.py',
      runnable: true,
      testable: true,
      framework: 'flask'
    }
  },
  {
    id: 'nodejs-configuration-example',
    title: 'Node.js APM Configuration',
    description: 'Comprehensive APM configuration for Node.js applications',
    language: 'javascript',
    code: `const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { AWSXRayExporter } = require('@opentelemetry/exporter-aws-xray');
const { AWSXRayPropagator } = require('@opentelemetry/propagator-aws-xray');
const { AWSXRayIdGenerator } = require('@opentelemetry/id-generator-aws-xray');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const express = require('express');

// Environment-based configuration
const config = {
  serviceName: process.env.SERVICE_NAME || 'nodejs-apm-demo',
  serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  awsRegion: process.env.AWS_REGION || 'us-west-2',
  tracing: {
    enabled: process.env.TRACING_ENABLED !== 'false',
    sampleRate: parseFloat(process.env.TRACE_SAMPLE_RATE) || 1.0,
    maxSpansPerTrace: parseInt(process.env.MAX_SPANS_PER_TRACE) || 1000
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    exportInterval: parseInt(process.env.METRICS_EXPORT_INTERVAL) || 30000
  }
};

// Create resource with comprehensive metadata
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'cloudwatch-apm',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'localhost',
  // Custom attributes
  'application.team': 'platform-team',
  'application.component': 'api-server',
  'deployment.region': config.awsRegion
});

// Configure instrumentation with custom settings
const instrumentations = getNodeAutoInstrumentations({
  // HTTP instrumentation settings
  '@opentelemetry/instrumentation-http': {
    enabled: true,
    ignoreIncomingRequestHook: (req) => {
      // Ignore health check and metrics endpoints
      return req.url?.includes('/health') || req.url?.includes('/metrics');
    },
    requestHook: (span, request) => {
      span.setAttributes({
        'http.user_agent': request.headers['user-agent'],
        'http.client_ip': request.headers['x-forwarded-for'] || request.connection.remoteAddress
      });
    }
  },
  // Express instrumentation
  '@opentelemetry/instrumentation-express': {
    enabled: true,
    ignoreLayers: [
      // Ignore middleware layers that create noise
      (name) => name === 'query' || name === 'expressInit'
    ]
  },
  // Database instrumentation
  '@opentelemetry/instrumentation-mysql': {
    enabled: true,
    addSqlCommenterCommentToQueries: true
  },
  '@opentelemetry/instrumentation-redis': {
    enabled: true,
    dbStatementSerializer: (cmdName, cmdArgs) => {
      return \`\${cmdName} \${cmdArgs.slice(0, 2).join(' ')}\`; // Limit args for privacy
    }
  }
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource,
  traceExporter: config.tracing.enabled ? new AWSXRayExporter({
    region: config.awsRegion
  }) : undefined,
  textMapPropagator: new AWSXRayPropagator(),
  idGenerator: new AWSXRayIdGenerator(),
  instrumentations,
  sampler: {
    // Custom sampling strategy
    shouldSample: (context, traceId, spanName, spanKind, attributes, links) => {
      // Always sample errors
      if (attributes['http.status_code'] >= 400) {
        return { decision: 1 }; // RECORD_AND_SAMPLE
      }
      
      // Sample based on configured rate
      return Math.random() < config.tracing.sampleRate 
        ? { decision: 1 } 
        : { decision: 0 }; // NOT_RECORD
    }
  }
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('Shutting down OpenTelemetry SDK...');
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK:', error);
  }
  process.exit(0);
});

// Start the SDK
sdk.start();
console.log('OpenTelemetry SDK started with configuration:', {
  serviceName: config.serviceName,
  environment: config.environment,
  tracingEnabled: config.tracing.enabled,
  metricsEnabled: config.metrics.enabled
});

// Example Express application
const app = express();

app.use(express.json());

// Configuration endpoint
app.get('/config', (req, res) => {
  res.json({
    service: {
      name: config.serviceName,
      version: config.serviceVersion,
      environment: config.environment
    },
    tracing: {
      enabled: config.tracing.enabled,
      sampleRate: config.tracing.sampleRate
    },
    metrics: {
      enabled: config.metrics.enabled,
      exportInterval: config.metrics.exportInterval
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
  console.log('Configuration endpoint: /config');
  console.log('Health check endpoint: /health');
});

module.exports = { app, sdk, config };`,
    category: 'configuration',
    difficulty: 'intermediate',
    tags: ['javascript', 'configuration', 'setup', 'environment'],
    dependencies: [
      '@opentelemetry/sdk-node',
      '@opentelemetry/auto-instrumentations-node',
      '@opentelemetry/exporter-aws-xray',
      'express'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'config.js',
      runnable: true,
      testable: true,
      framework: 'express'
    }
  },
  {
    id: 'python-configuration-example',
    title: 'Python APM Configuration',
    description: 'Advanced Python APM configuration with environment-based settings',
    language: 'python',
    code: `import os
import logging
from flask import Flask, jsonify
from opentelemetry import trace, metrics
from opentelemetry.exporter.aws_xray import AwsXRaySpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased, ParentBased
from opentelemetry.sdk.resources import Resource
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor

# Configuration class
class APMConfig:
    def __init__(self):
        self.service_name = os.getenv('SERVICE_NAME', 'python-apm-demo')
        self.service_version = os.getenv('SERVICE_VERSION', '1.0.0')
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.aws_region = os.getenv('AWS_REGION', 'us-west-2')
        
        # Tracing configuration
        self.tracing_enabled = os.getenv('TRACING_ENABLED', 'true').lower() == 'true'
        self.sample_rate = float(os.getenv('TRACE_SAMPLE_RATE', '1.0'))
        self.max_spans = int(os.getenv('MAX_SPANS_PER_TRACE', '1000'))
        
        # Logging configuration
        self.log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
        self.log_correlation = os.getenv('LOG_CORRELATION', 'true').lower() == 'true'
        
        # Export configuration
        self.export_timeout = int(os.getenv('EXPORT_TIMEOUT', '30'))
        self.max_export_batch_size = int(os.getenv('MAX_EXPORT_BATCH_SIZE', '512'))

# Initialize configuration
config = APMConfig()

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create resource with comprehensive metadata
resource = Resource.create({
    ResourceAttributes.SERVICE_NAME: config.service_name,
    ResourceAttributes.SERVICE_VERSION: config.service_version,
    ResourceAttributes.DEPLOYMENT_ENVIRONMENT: config.environment,
    ResourceAttributes.SERVICE_NAMESPACE: "cloudwatch-apm",
    ResourceAttributes.SERVICE_INSTANCE_ID: os.getenv('HOSTNAME', 'localhost'),
    # Custom attributes
    "application.team": "platform-team",
    "application.component": "api-server",
    "deployment.region": config.aws_region
})

# Configure tracing
if config.tracing_enabled:
    # Custom sampler with environment-based logic
    if config.environment == 'production':
        sampler = ParentBased(root=TraceIdRatioBased(config.sample_rate))
    else:
        sampler = ParentBased(root=TraceIdRatioBased(1.0))  # Sample everything in dev
    
    trace_provider = TracerProvider(
        resource=resource,
        sampler=sampler
    )
    
    # Configure X-Ray exporter
    xray_exporter = AwsXRaySpanExporter(
        region_name=config.aws_region,
        max_export_batch_size=config.max_export_batch_size,
        export_timeout_millis=config.export_timeout * 1000
    )
    
    span_processor = BatchSpanProcessor(
        xray_exporter,
        max_queue_size=2048,
        max_export_batch_size=config.max_export_batch_size,
        export_timeout_millis=config.export_timeout * 1000
    )
    
    trace_provider.add_span_processor(span_processor)
    trace.set_tracer_provider(trace_provider)
    
    logger.info(f"Tracing configured with sample rate: {config.sample_rate}")
else:
    logger.info("Tracing disabled")

# Get tracer
tracer = trace.get_tracer(__name__)

# Flask application
app = Flask(__name__)

# Configure instrumentation
if config.tracing_enabled:
    # Flask instrumentation with custom configuration
    FlaskInstrumentor().instrument_app(
        app,
        excluded_urls="/health,/metrics",  # Exclude monitoring endpoints
        request_hook=lambda span, environ: span.set_attribute(
            "http.user_agent", environ.get("HTTP_USER_AGENT", "")
        ),
        response_hook=lambda span, status, response_headers: span.set_attribute(
            "http.response.size", len(response_headers.get("content-length", "0"))
        )
    )
    
    # Requests instrumentation
    RequestsInstrumentor().instrument()
    
    # Logging instrumentation for trace correlation
    if config.log_correlation:
        LoggingInstrumentor().instrument(set_logging_format=True)

# Configuration validation
def validate_config():
    """Validate APM configuration"""
    issues = []
    
    if not config.service_name:
        issues.append("SERVICE_NAME is required")
    
    if config.sample_rate < 0 or config.sample_rate > 1:
        issues.append("TRACE_SAMPLE_RATE must be between 0 and 1")
    
    if config.max_spans < 1:
        issues.append("MAX_SPANS_PER_TRACE must be positive")
    
    return issues

@app.route('/config')
def get_config():
    """Get current APM configuration"""
    return jsonify({
        "service": {
            "name": config.service_name,
            "version": config.service_version,
            "environment": config.environment
        },
        "tracing": {
            "enabled": config.tracing_enabled,
            "sample_rate": config.sample_rate,
            "max_spans": config.max_spans
        },
        "logging": {
            "level": config.log_level,
            "correlation": config.log_correlation
        },
        "export": {
            "timeout": config.export_timeout,
            "batch_size": config.max_export_batch_size
        }
    })

@app.route('/config/validate')
def validate_configuration():
    """Validate current configuration"""
    with tracer.start_as_current_span("validate_config") as span:
        issues = validate_config()
        
        span.set_attribute("config.valid", len(issues) == 0)
        span.set_attribute("config.issues_count", len(issues))
        
        if issues:
            logger.warning(f"Configuration issues found: {issues}")
            return jsonify({
                "valid": False,
                "issues": issues
            }), 400
        
        return jsonify({
            "valid": True,
            "message": "Configuration is valid"
        })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": config.service_name,
        "version": config.service_version
    })

@app.route('/trace-test')
def trace_test():
    """Test endpoint to generate traces"""
    with tracer.start_as_current_span("trace_test") as span:
        span.set_attribute("test.type", "configuration")
        
        # Nested span
        with tracer.start_as_current_span("nested_operation") as nested_span:
            nested_span.set_attribute("operation.name", "test_operation")
            
            # Simulate work
            import time
            time.sleep(0.1)
            
            return jsonify({
                "message": "Trace test completed",
                "tracing_enabled": config.tracing_enabled
            })

if __name__ == '__main__':
    # Validate configuration on startup
    issues = validate_config()
    if issues:
        logger.error(f"Configuration validation failed: {issues}")
        exit(1)
    
    logger.info(f"Starting {config.service_name} v{config.service_version}")
    logger.info(f"Environment: {config.environment}")
    logger.info(f"Tracing enabled: {config.tracing_enabled}")
    
    app.run(
        debug=(config.environment != 'production'),
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )`,
    category: 'configuration',
    difficulty: 'advanced',
    tags: ['python', 'configuration', 'environment', 'validation'],
    dependencies: [
      'flask',
      'opentelemetry-api',
      'opentelemetry-sdk',
      'opentelemetry-exporter-aws-xray',
      'opentelemetry-instrumentation-flask'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'apm_config.py',
      runnable: true,
      testable: true,
      framework: 'flask'
    }
  },
  {
    id: 'nodejs-troubleshooting-example',
    title: 'Node.js APM Troubleshooting',
    description: 'Common troubleshooting scenarios and debugging techniques for Node.js APM',
    language: 'javascript',
    code: `const express = require('express');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { AWSXRayExporter } = require('@opentelemetry/exporter-aws-xray');
const { trace, context } = require('@opentelemetry/api');

// Troubleshooting utilities
class APMTroubleshooter {
  constructor() {
    this.diagnostics = {
      sdkInitialized: false,
      exporterConnected: false,
      instrumentationActive: false,
      tracesGenerated: 0,
      errors: []
    };
  }

  // Check if SDK is properly initialized
  checkSDKStatus() {
    try {
      const provider = trace.getTracerProvider();
      this.diagnostics.sdkInitialized = provider !== undefined;
      return this.diagnostics.sdkInitialized;
    } catch (error) {
      this.diagnostics.errors.push(\`SDK Check Error: \${error.message}\`);
      return false;
    }
  }

  // Test trace generation
  generateTestTrace() {
    try {
      const tracer = trace.getTracer('troubleshooting-test');
      const span = tracer.startSpan('test-span');
      
      span.setAttributes({
        'test.type': 'troubleshooting',
        'test.timestamp': Date.now()
      });
      
      // Simulate some work
      setTimeout(() => {
        span.setStatus({ code: 1 }); // OK
        span.end();
        this.diagnostics.tracesGenerated++;
      }, 100);
      
      return true;
    } catch (error) {
      this.diagnostics.errors.push(\`Trace Generation Error: \${error.message}\`);
      return false;
    }
  }

  // Check environment variables
  checkEnvironment() {
    const requiredEnvVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY'
    ];
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      this.diagnostics.errors.push(\`Missing environment variables: \${missing.join(', ')}\`);
      return false;
    }
    
    return true;
  }

  // Get comprehensive diagnostic report
  getDiagnostics() {
    this.checkSDKStatus();
    this.checkEnvironment();
    
    return {
      ...this.diagnostics,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

// Initialize troubleshooter
const troubleshooter = new APMTroubleshooter();

// SDK initialization with error handling
let sdk;
try {
  sdk = new NodeSDK({
    traceExporter: new AWSXRayExporter({
      region: process.env.AWS_REGION || 'us-west-2'
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  
  sdk.start();
  troubleshooter.diagnostics.sdkInitialized = true;
  console.log('✅ OpenTelemetry SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize OpenTelemetry SDK:', error);
  troubleshooter.diagnostics.errors.push(\`SDK Initialization: \${error.message}\`);
}

const app = express();
app.use(express.json());

// Middleware to track instrumentation
app.use((req, res, next) => {
  const span = trace.getActiveSpan();
  if (span) {
    troubleshooter.diagnostics.instrumentationActive = true;
    span.setAttributes({
      'troubleshooting.middleware': 'active',
      'http.request.id': req.headers['x-request-id'] || 'unknown'
    });
  }
  next();
});

// Diagnostic endpoints
app.get('/diagnostics', (req, res) => {
  const diagnostics = troubleshooter.getDiagnostics();
  res.json(diagnostics);
});

app.get('/test-trace', (req, res) => {
  const tracer = trace.getTracer('troubleshooting-test');
  
  const span = tracer.startSpan('manual-test-trace');
  span.setAttributes({
    'test.endpoint': '/test-trace',
    'test.manual': true
  });
  
  try {
    // Simulate some processing
    const result = performTestOperation();
    
    span.setAttributes({
      'test.result': result,
      'test.success': true
    });
    
    res.json({
      message: 'Test trace generated successfully',
      result,
      traceId: span.spanContext().traceId
    });
  } catch (error) {
    span.recordException(error);
    span.setStatus({
      code: 2, // ERROR
      message: error.message
    });
    
    res.status(500).json({
      error: 'Test trace failed',
      message: error.message
    });
  } finally {
    span.end();
  }
});

// Common troubleshooting scenarios
app.get('/simulate-error', (req, res) => {
  const tracer = trace.getTracer('error-simulation');
  const span = tracer.startSpan('simulate-error');
  
  try {
    // Simulate different types of errors
    const errorType = req.query.type || 'generic';
    
    switch (errorType) {
      case 'timeout':
        // Simulate timeout
        setTimeout(() => {
          throw new Error('Operation timed out');
        }, 5000);
        break;
        
      case 'database':
        throw new Error('Database connection failed');
        
      case 'external':
        throw new Error('External service unavailable');
        
      default:
        throw new Error('Simulated error for troubleshooting');
    }
  } catch (error) {
    span.recordException(error);
    span.setStatus({
      code: 2,
      message: error.message
    });
    
    console.error('Simulated error:', error);
    
    res.status(500).json({
      error: error.message,
      type: req.query.type || 'generic',
      timestamp: new Date().toISOString()
    });
  } finally {
    span.end();
  }
});

app.get('/check-connectivity', async (req, res) => {
  const tracer = trace.getTracer('connectivity-check');
  const span = tracer.startSpan('check-aws-connectivity');
  
  try {
    // Test AWS connectivity
    const AWS = require('aws-sdk');
    const xray = new AWS.XRay({ region: process.env.AWS_REGION || 'us-west-2' });
    
    // Try to get service map (requires minimal permissions)
    await xray.getServiceGraph({
      StartTime: new Date(Date.now() - 300000), // 5 minutes ago
      EndTime: new Date()
    }).promise();
    
    span.setAttributes({
      'connectivity.aws': true,
      'connectivity.xray': true
    });
    
    res.json({
      status: 'connected',
      message: 'AWS X-Ray connectivity verified',
      region: process.env.AWS_REGION || 'us-west-2'
    });
  } catch (error) {
    span.recordException(error);
    span.setAttributes({
      'connectivity.aws': false,
      'connectivity.error': error.code || 'unknown'
    });
    
    res.status(500).json({
      status: 'disconnected',
      error: error.message,
      code: error.code,
      troubleshooting: {
        'Check AWS credentials': 'Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set',
        'Check IAM permissions': 'Ensure the role has xray:PutTraceSegments permission',
        'Check region': 'Ensure AWS_REGION is set correctly'
      }
    });
  } finally {
    span.end();
  }
});

// Performance troubleshooting
app.get('/performance-test', (req, res) => {
  const tracer = trace.getTracer('performance-test');
  const span = tracer.startSpan('performance-test');
  
  const startTime = Date.now();
  
  // Simulate CPU-intensive operation
  const iterations = parseInt(req.query.iterations) || 100000;
  let result = 0;
  
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i);
  }
  
  const duration = Date.now() - startTime;
  
  span.setAttributes({
    'performance.iterations': iterations,
    'performance.duration_ms': duration,
    'performance.result': result
  });
  
  // Add performance warning if slow
  if (duration > 1000) {
    span.addEvent('performance_warning', {
      'warning.type': 'slow_operation',
      'warning.threshold_ms': 1000,
      'warning.actual_ms': duration
    });
  }
  
  span.end();
  
  res.json({
    iterations,
    duration_ms: duration,
    result,
    performance_warning: duration > 1000
  });
});

function performTestOperation() {
  // Simulate some work with nested spans
  const tracer = trace.getTracer('test-operation');
  const span = tracer.startSpan('test-operation');
  
  try {
    // Simulate database call
    const dbSpan = tracer.startSpan('database-query', { parent: span });
    dbSpan.setAttributes({
      'db.operation': 'SELECT',
      'db.table': 'test_table'
    });
    
    // Simulate processing time
    const start = Date.now();
    while (Date.now() - start < 50) {
      // Busy wait
    }
    
    dbSpan.end();
    
    return 'Test operation completed successfully';
  } finally {
    span.end();
  }
}

// Health check with troubleshooting info
app.get('/health', (req, res) => {
  const diagnostics = troubleshooter.getDiagnostics();
  
  res.json({
    status: diagnostics.errors.length === 0 ? 'healthy' : 'degraded',
    service: 'troubleshooting-demo',
    diagnostics: {
      sdk_initialized: diagnostics.sdkInitialized,
      instrumentation_active: diagnostics.instrumentationActive,
      traces_generated: diagnostics.tracesGenerated,
      error_count: diagnostics.errors.length
    },
    errors: diagnostics.errors
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(\`🔧 Troubleshooting server running on port \${port}\`);
  console.log('Available endpoints:');
  console.log('  GET /diagnostics - Full diagnostic report');
  console.log('  GET /test-trace - Generate test trace');
  console.log('  GET /simulate-error?type=<type> - Simulate errors');
  console.log('  GET /check-connectivity - Test AWS connectivity');
  console.log('  GET /performance-test?iterations=<n> - Performance test');
  console.log('  GET /health - Health check with diagnostics');
});

module.exports = { app, troubleshooter };`,
    category: 'troubleshooting',
    difficulty: 'advanced',
    tags: ['javascript', 'troubleshooting', 'debugging', 'diagnostics'],
    dependencies: [
      'express',
      '@opentelemetry/sdk-node',
      '@opentelemetry/api',
      'aws-sdk'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'troubleshooting.js',
      runnable: true,
      testable: true,
      framework: 'express'
    }
  },
  {
    id: 'python-troubleshooting-example',
    title: 'Python APM Troubleshooting',
    description: 'Comprehensive troubleshooting guide for Python APM integration issues',
    language: 'python',
    code: `import os
import sys
import time
import traceback
import logging
from flask import Flask, jsonify, request
from opentelemetry import trace, context
from opentelemetry.exporter.aws_xray import AwsXRaySpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Configure logging for troubleshooting
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class APMTroubleshooter:
    """Comprehensive APM troubleshooting utility"""
    
    def __init__(self):
        self.diagnostics = {
            'sdk_initialized': False,
            'exporter_configured': False,
            'instrumentation_active': False,
            'aws_credentials_valid': False,
            'traces_generated': 0,
            'errors': [],
            'warnings': []
        }
        
    def check_python_version(self):
        """Check Python version compatibility"""
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 7):
            self.diagnostics['errors'].append(
                f"Python {version.major}.{version.minor} not supported. Requires Python 3.7+"
            )
            return False
        return True
    
    def check_dependencies(self):
        """Check if required packages are installed"""
        required_packages = [
            'opentelemetry-api',
            'opentelemetry-sdk',
            'opentelemetry-exporter-aws-xray',
            'opentelemetry-instrumentation-flask'
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            self.diagnostics['errors'].append(
                f"Missing packages: {', '.join(missing_packages)}"
            )
            return False
        return True
    
    def check_aws_credentials(self):
        """Validate AWS credentials and permissions"""
        try:
            # Check environment variables
            required_env_vars = ['AWS_REGION']
            missing_vars = [var for var in required_env_vars if not os.getenv(var)]
            
            if missing_vars:
                self.diagnostics['warnings'].append(
                    f"Missing environment variables: {', '.join(missing_vars)}"
                )
            
            # Test AWS credentials
            session = boto3.Session()
            credentials = session.get_credentials()
            
            if not credentials:
                self.diagnostics['errors'].append("No AWS credentials found")
                return False
            
            # Test X-Ray permissions
            xray_client = boto3.client('xray', region_name=os.getenv('AWS_REGION', 'us-west-2'))
            
            # Try to get service map (minimal permission test)
            xray_client.get_service_graph(
                StartTime=time.time() - 300,  # 5 minutes ago
                EndTime=time.time()
            )
            
            self.diagnostics['aws_credentials_valid'] = True
            return True
            
        except NoCredentialsError:
            self.diagnostics['errors'].append("AWS credentials not configured")
            return False
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'AccessDenied':
                self.diagnostics['errors'].append(
                    "AWS credentials lack X-Ray permissions. Need xray:GetServiceGraph"
                )
            else:
                self.diagnostics['errors'].append(f"AWS error: {error_code}")
            return False
        except Exception as e:
            self.diagnostics['errors'].append(f"AWS connectivity error: {str(e)}")
            return False
    
    def check_sdk_initialization(self):
        """Check if OpenTelemetry SDK is properly initialized"""
        try:
            provider = trace.get_tracer_provider()
            if hasattr(provider, '_resource'):
                self.diagnostics['sdk_initialized'] = True
                return True
            else:
                self.diagnostics['errors'].append("TracerProvider not properly initialized")
                return False
        except Exception as e:
            self.diagnostics['errors'].append(f"SDK check error: {str(e)}")
            return False
    
    def test_trace_generation(self):
        """Test manual trace generation"""
        try:
            tracer = trace.get_tracer('troubleshooting-test')
            
            with tracer.start_as_current_span('test-span') as span:
                span.set_attribute('test.type', 'troubleshooting')
                span.set_attribute('test.timestamp', time.time())
                
                # Simulate some work
                time.sleep(0.1)
                
                span.set_status(trace.Status(trace.StatusCode.OK))
                self.diagnostics['traces_generated'] += 1
                
            return True
        except Exception as e:
            self.diagnostics['errors'].append(f"Trace generation failed: {str(e)}")
            return False
    
    def check_instrumentation(self):
        """Check if auto-instrumentation is working"""
        try:
            # Check if Flask is instrumented
            from opentelemetry.instrumentation.flask import FlaskInstrumentor
            instrumentor = FlaskInstrumentor()
            
            if hasattr(instrumentor, '_instrumented_apps'):
                self.diagnostics['instrumentation_active'] = True
                return True
            else:
                self.diagnostics['warnings'].append("Flask instrumentation may not be active")
                return False
        except Exception as e:
            self.diagnostics['errors'].append(f"Instrumentation check failed: {str(e)}")
            return False
    
    def run_full_diagnostic(self):
        """Run comprehensive diagnostic check"""
        logger.info("Starting APM diagnostic check...")
        
        checks = [
            ('Python Version', self.check_python_version),
            ('Dependencies', self.check_dependencies),
            ('AWS Credentials', self.check_aws_credentials),
            ('SDK Initialization', self.check_sdk_initialization),
            ('Instrumentation', self.check_instrumentation),
            ('Trace Generation', self.test_trace_generation)
        ]
        
        results = {}
        for check_name, check_func in checks:
            try:
                results[check_name] = check_func()
                logger.info(f"✅ {check_name}: {'PASS' if results[check_name] else 'FAIL'}")
            except Exception as e:
                results[check_name] = False
                self.diagnostics['errors'].append(f"{check_name}: {str(e)}")
                logger.error(f"❌ {check_name}: ERROR - {str(e)}")
        
        return results
    
    def get_diagnostic_report(self):
        """Get comprehensive diagnostic report"""
        return {
            **self.diagnostics,
            'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            'platform': sys.platform,
            'environment_variables': {
                'AWS_REGION': os.getenv('AWS_REGION'),
                'AWS_ACCESS_KEY_ID': '***' if os.getenv('AWS_ACCESS_KEY_ID') else None,
                'AWS_SECRET_ACCESS_KEY': '***' if os.getenv('AWS_SECRET_ACCESS_KEY') else None,
                'OTEL_SERVICE_NAME': os.getenv('OTEL_SERVICE_NAME'),
                'OTEL_RESOURCE_ATTRIBUTES': os.getenv('OTEL_RESOURCE_ATTRIBUTES')
            },
            'timestamp': time.time()
        }

# Initialize troubleshooter
troubleshooter = APMTroubleshooter()

# Initialize OpenTelemetry with error handling
try:
    trace.set_tracer_provider(TracerProvider())
    
    xray_exporter = AwsXRaySpanExporter(
        region_name=os.getenv('AWS_REGION', 'us-west-2')
    )
    
    span_processor = BatchSpanProcessor(xray_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
    
    troubleshooter.diagnostics['exporter_configured'] = True
    logger.info("✅ OpenTelemetry configured successfully")
    
except Exception as e:
    logger.error(f"❌ OpenTelemetry configuration failed: {e}")
    troubleshooter.diagnostics['errors'].append(f"OpenTelemetry setup: {str(e)}")

# Flask application
app = Flask(__name__)

# Instrument Flask
try:
    FlaskInstrumentor().instrument_app(app)
    troubleshooter.diagnostics['instrumentation_active'] = True
    logger.info("✅ Flask instrumentation enabled")
except Exception as e:
    logger.error(f"❌ Flask instrumentation failed: {e}")
    troubleshooter.diagnostics['errors'].append(f"Flask instrumentation: {str(e)}")

@app.route('/diagnostics')
def get_diagnostics():
    """Get comprehensive diagnostic information"""
    troubleshooter.run_full_diagnostic()
    return jsonify(troubleshooter.get_diagnostic_report())

@app.route('/test-trace')
def test_trace():
    """Generate a test trace for verification"""
    tracer = trace.get_tracer('troubleshooting-test')
    
    with tracer.start_as_current_span('manual-test-trace') as span:
        span.set_attribute('test.endpoint', '/test-trace')
        span.set_attribute('test.manual', True)
        
        try:
            # Simulate processing
            result = perform_test_operation()
            
            span.set_attribute('test.result', result)
            span.set_status(trace.Status(trace.StatusCode.OK))
            
            return jsonify({
                'message': 'Test trace generated successfully',
                'result': result,
                'trace_id': format(span.get_span_context().trace_id, '032x')
            })
            
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
            
            return jsonify({
                'error': 'Test trace failed',
                'message': str(e),
                'traceback': traceback.format_exc()
            }), 500

@app.route('/simulate-error')
def simulate_error():
    """Simulate different types of errors for testing"""
    tracer = trace.get_tracer('error-simulation')
    
    with tracer.start_as_current_span('simulate-error') as span:
        error_type = request.args.get('type', 'generic')
        span.set_attribute('error.type', error_type)
        
        try:
            if error_type == 'timeout':
                time.sleep(10)  # Simulate timeout
            elif error_type == 'memory':
                # Simulate memory error
                data = [0] * (10**8)  # Large list
            elif error_type == 'division':
                result = 1 / 0  # Division by zero
            else:
                raise Exception(f"Simulated {error_type} error")
                
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
            
            logger.error(f"Simulated error: {e}")
            
            return jsonify({
                'error': str(e),
                'type': error_type,
                'timestamp': time.time(),
                'traceback': traceback.format_exc()
            }), 500

@app.route('/performance-test')
def performance_test():
    """Test performance and generate performance traces"""
    tracer = trace.get_tracer('performance-test')
    
    with tracer.start_as_current_span('performance-test') as span:
        iterations = int(request.args.get('iterations', 100000))
        span.set_attribute('performance.iterations', iterations)
        
        start_time = time.time()
        
        # CPU-intensive operation
        result = sum(i**2 for i in range(iterations))
        
        duration = time.time() - start_time
        
        span.set_attribute('performance.duration_seconds', duration)
        span.set_attribute('performance.result', result)
        
        if duration > 1.0:
            span.add_event('performance_warning', {
                'warning.type': 'slow_operation',
                'warning.threshold_seconds': 1.0,
                'warning.actual_seconds': duration
            })
        
        return jsonify({
            'iterations': iterations,
            'duration_seconds': duration,
            'result': result,
            'performance_warning': duration > 1.0
        })

def perform_test_operation():
    """Helper function for test operations"""
    tracer = trace.get_tracer('test-operation')
    
    with tracer.start_as_current_span('test-operation') as span:
        # Simulate database operation
        with tracer.start_as_current_span('database-query') as db_span:
            db_span.set_attribute('db.operation', 'SELECT')
            db_span.set_attribute('db.table', 'test_table')
            time.sleep(0.05)  # Simulate DB latency
        
        # Simulate external API call
        with tracer.start_as_current_span('external-api-call') as api_span:
            api_span.set_attribute('http.method', 'GET')
            api_span.set_attribute('http.url', 'https://api.example.com/data')
            time.sleep(0.03)  # Simulate API latency
        
        return 'Test operation completed successfully'

@app.route('/health')
def health_check():
    """Health check with troubleshooting information"""
    diagnostics = troubleshooter.get_diagnostic_report()
    
    status = 'healthy' if len(diagnostics['errors']) == 0 else 'degraded'
    
    return jsonify({
        'status': status,
        'service': 'python-troubleshooting-demo',
        'diagnostics': {
            'sdk_initialized': diagnostics['sdk_initialized'],
            'exporter_configured': diagnostics['exporter_configured'],
            'instrumentation_active': diagnostics['instrumentation_active'],
            'aws_credentials_valid': diagnostics['aws_credentials_valid'],
            'error_count': len(diagnostics['errors']),
            'warning_count': len(diagnostics['warnings'])
        },
        'errors': diagnostics['errors'][:5],  # Limit to first 5 errors
        'warnings': diagnostics['warnings'][:5]  # Limit to first 5 warnings
    })

if __name__ == '__main__':
    # Run initial diagnostic
    logger.info("Running initial diagnostic check...")
    troubleshooter.run_full_diagnostic()
    
    port = int(os.getenv('PORT', 5000))
    
    logger.info(f"🔧 Python troubleshooting server starting on port {port}")
    logger.info("Available endpoints:")
    logger.info("  GET /diagnostics - Full diagnostic report")
    logger.info("  GET /test-trace - Generate test trace")
    logger.info("  GET /simulate-error?type=<type> - Simulate errors")
    logger.info("  GET /performance-test?iterations=<n> - Performance test")
    logger.info("  GET /health - Health check with diagnostics")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=port
    )`,
    category: 'troubleshooting',
    difficulty: 'advanced',
    tags: ['python', 'troubleshooting', 'debugging', 'diagnostics'],
    dependencies: [
      'flask',
      'opentelemetry-api',
      'opentelemetry-sdk',
      'opentelemetry-exporter-aws-xray',
      'boto3'
    ],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'troubleshooting.py',
      runnable: true,
      testable: true,
      framework: 'flask'
    }
  },
]

export const multiLanguageExamples: MultiLanguageCodeExample[] = [
  {
    id: 'basic-http-server',
    title: 'Basic HTTP Server with APM',
    description: 'Simple HTTP server implementation across different languages with CloudWatch APM integration',
    examples: [
      codeExamples.find(e => e.id === 'basic-nodejs-setup')!,
      codeExamples.find(e => e.id === 'python-flask-setup')!,
      codeExamples.find(e => e.id === 'java-spring-boot-basic')!
    ],
    category: 'getting-started',
    useCase: 'Basic web server with APM monitoring',
    tags: ['http-server', 'basic-setup', 'multi-language'],
    lastUpdated: new Date('2024-01-15')
  }
]

export const sampleApplications: SampleApplication[] = [
  {
    id: 'ecommerce-microservices',
    name: 'E-commerce Microservices',
    description: 'Complete e-commerce application built with microservices architecture, demonstrating distributed tracing and monitoring',
    language: 'typescript',
    framework: 'express',
    category: 'integration',
    useCase: 'Microservices distributed tracing',
    features: [
      'User service with authentication',
      'Product catalog service',
      'Order processing service',
      'Payment service integration',
      'Distributed tracing across services',
      'Custom metrics and dashboards',
      'Error tracking and alerting'
    ],
    downloadUrl: 'https://github.com/aws-samples/cloudwatch-apm-ecommerce-demo/archive/main.zip',
    repositoryUrl: 'https://github.com/aws-samples/cloudwatch-apm-ecommerce-demo',
    documentation: 'Complete setup guide with step-by-step instructions for running the microservices locally and deploying to AWS',
    prerequisites: [
      'Node.js 18+',
      'Docker and Docker Compose',
      'AWS CLI configured',
      'AWS account with CloudWatch access'
    ],
    installationSteps: [
      'Clone the repository',
      'Install dependencies with npm install',
      'Configure AWS credentials',
      'Start services with docker-compose up',
      'Run database migrations',
      'Verify services are running'
    ],
    runningInstructions: [
      'Access the application at http://localhost:3000',
      'Use the API documentation at http://localhost:3000/docs',
      'Generate test traffic with the included scripts',
      'View traces in AWS X-Ray console',
      'Monitor metrics in CloudWatch dashboard'
    ],
    tags: ['microservices', 'typescript', 'distributed-tracing', 'ecommerce'],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      size: '25MB',
      complexity: 'complex',
      estimatedSetupTime: 30,
      supportedPlatforms: ['linux', 'macos', 'windows']
    }
  },
  {
    id: 'python-data-pipeline',
    name: 'Data Processing Pipeline',
    description: 'Python-based data processing pipeline with comprehensive monitoring and observability',
    language: 'python',
    framework: 'fastapi',
    category: 'integration',
    useCase: 'Data pipeline monitoring',
    features: [
      'Data ingestion from multiple sources',
      'ETL processing with error handling',
      'Batch and streaming processing',
      'Custom metrics for data quality',
      'Performance monitoring',
      'Automated alerting on failures'
    ],
    downloadUrl: 'https://github.com/aws-samples/cloudwatch-apm-data-pipeline/archive/main.zip',
    repositoryUrl: 'https://github.com/aws-samples/cloudwatch-apm-data-pipeline',
    documentation: 'Comprehensive guide covering data pipeline patterns, monitoring strategies, and troubleshooting',
    prerequisites: [
      'Python 3.9+',
      'Docker',
      'AWS CLI configured',
      'S3 bucket for data storage'
    ],
    installationSteps: [
      'Clone the repository',
      'Create virtual environment',
      'Install requirements with pip install -r requirements.txt',
      'Configure environment variables',
      'Initialize database schema',
      'Start the application'
    ],
    runningInstructions: [
      'Start the FastAPI server',
      'Upload sample data files',
      'Trigger processing jobs via API',
      'Monitor job progress in CloudWatch',
      'View custom metrics dashboard'
    ],
    tags: ['python', 'data-pipeline', 'etl', 'monitoring'],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      size: '15MB',
      complexity: 'moderate',
      estimatedSetupTime: 20,
      supportedPlatforms: ['linux', 'macos']
    }
  }
]

export const performanceExamples: PerformanceExample[] = [
  {
    id: 'nodejs-memory-optimization',
    title: 'Node.js Memory Usage Optimization',
    description: 'Optimize memory usage in Node.js applications with proper monitoring',
    category: 'optimization',
    language: 'javascript',
    beforeCode: `// Inefficient memory usage
const express = require('express');
const app = express();

let cache = {}; // Memory leak: unbounded cache

app.get('/data/:id', async (req, res) => {
  const id = req.params.id;
  
  // Always fetch from database, no caching strategy
  const data = await fetchFromDatabase(id);
  
  // Store in unbounded cache
  cache[id] = data;
  
  res.json(data);
});

async function fetchFromDatabase(id) {
  // Simulate expensive database operation
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id, data: 'x'.repeat(10000) }); // Large objects
    }, 100);
  });
}`,
    afterCode: `// Optimized memory usage with monitoring
const express = require('express');
const { trace, metrics } = require('@opentelemetry/api');
const LRU = require('lru-cache');

const app = express();
const tracer = trace.getTracer('memory-optimization');
const meter = metrics.getMeter('memory-optimization');

// Bounded LRU cache
const cache = new LRU({
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minutes
});

// Custom metrics
const cacheHitCounter = meter.createCounter('cache_hits_total');
const cacheMissCounter = meter.createCounter('cache_misses_total');
const memoryGauge = meter.createObservableGauge('memory_usage_bytes');

// Monitor memory usage
memoryGauge.addCallback((result) => {
  const memUsage = process.memoryUsage();
  result.observe(memUsage.heapUsed, { type: 'heap_used' });
  result.observe(memUsage.heapTotal, { type: 'heap_total' });
  result.observe(memUsage.rss, { type: 'rss' });
});

app.get('/data/:id', async (req, res) => {
  const span = tracer.startSpan('get_data');
  const id = req.params.id;
  
  try {
    // Check cache first
    let data = cache.get(id);
    
    if (data) {
      cacheHitCounter.add(1);
      span.setAttributes({ 'cache.hit': true });
    } else {
      cacheMissCounter.add(1);
      span.setAttributes({ 'cache.hit': false });
      
      data = await fetchFromDatabase(id);
      cache.set(id, data);
    }
    
    res.json(data);
  } finally {
    span.end();
  }
});

async function fetchFromDatabase(id) {
  const span = tracer.startSpan('database_fetch');
  
  try {
    // Simulate database operation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id, data: 'optimized data' }); // Smaller objects
      }, 100);
    });
  } finally {
    span.end();
  }
}`,
    explanation: 'This optimization introduces bounded caching with LRU eviction, memory usage monitoring, and cache hit/miss metrics. The LRU cache prevents memory leaks while maintaining performance benefits.',
    metrics: [
      {
        name: 'Memory Usage',
        beforeValue: 150,
        afterValue: 75,
        unit: 'MB',
        improvement: 50,
        description: 'Heap memory usage reduced by implementing bounded cache'
      },
      {
        name: 'Response Time',
        beforeValue: 100,
        afterValue: 15,
        unit: 'ms',
        improvement: 85,
        description: 'Average response time for cached requests'
      },
      {
        name: 'Cache Hit Rate',
        beforeValue: 0,
        afterValue: 85,
        unit: '%',
        improvement: 85,
        description: 'Percentage of requests served from cache'
      }
    ],
    tools: ['OpenTelemetry', 'CloudWatch Metrics', 'Node.js process.memoryUsage()'],
    tags: ['nodejs', 'memory-optimization', 'caching', 'monitoring'],
    lastUpdated: new Date('2024-01-15')
  }
]