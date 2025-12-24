import { Platform } from '../types/quickstart'

export const PLATFORMS: Platform[] = [
  // Programming Languages
  {
    id: 'java',
    name: 'Java',
    description: 'Java applications with Spring Boot, Tomcat, or standalone',
    icon: '☕',
    category: 'language',
    prerequisites: [
      'Java 8 or higher',
      'Maven or Gradle build system',
      'AWS credentials configured'
    ],
    installationSteps: [
      {
        id: 'add-dependency',
        title: 'Add CloudWatch APM dependency',
        description: 'Add the CloudWatch APM agent to your project dependencies',
        code: `<!-- Maven -->
<dependency>
    <groupId>software.amazon.cloudwatchapm</groupId>
    <artifactId>cloudwatch-apm-java-agent</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- Gradle -->
implementation 'software.amazon.cloudwatchapm:cloudwatch-apm-java-agent:1.0.0'`,
        language: 'xml',
        notes: ['Use the latest version available', 'Check for updates regularly']
      },
      {
        id: 'configure-agent',
        title: 'Configure the APM agent',
        description: 'Add configuration to your application properties',
        code: `# application.properties
cloudwatch.apm.service.name=my-java-app
cloudwatch.apm.service.version=1.0.0
cloudwatch.apm.environment=production
cloudwatch.apm.region=us-east-1`,
        language: 'properties',
        notes: ['Replace service name with your actual application name', 'Set appropriate environment']
      },
      {
        id: 'initialize-agent',
        title: 'Initialize the agent in your application',
        description: 'Add initialization code to your main application class',
        code: `import software.amazon.cloudwatchapm.CloudWatchAPM;

@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        // Initialize CloudWatch APM
        CloudWatchAPM.initialize();
        
        SpringApplication.run(MyApplication.class, args);
    }
}`,
        language: 'java',
        notes: ['Initialize as early as possible in your application lifecycle']
      }
    ],
    verificationSteps: [
      {
        id: 'check-agent-status',
        title: 'Verify agent is running',
        description: 'Check that the CloudWatch APM agent is active',
        command: 'curl http://localhost:8080/actuator/health/cloudwatch-apm',
        expectedOutput: '{"status":"UP","details":{"agent":"active"}}',
        troubleshooting: [
          'Ensure your application is running',
          'Check that the agent dependency is properly included',
          'Verify AWS credentials are configured'
        ]
      },
      {
        id: 'check-metrics',
        title: 'Verify metrics are being sent',
        description: 'Confirm that metrics are appearing in CloudWatch',
        troubleshooting: [
          'Check CloudWatch console for your service metrics',
          'Verify IAM permissions for CloudWatch access',
          'Allow a few minutes for metrics to appear'
        ]
      }
    ]
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Node.js applications with Express, Fastify, or other frameworks',
    icon: '🟢',
    category: 'language',
    prerequisites: [
      'Node.js 14 or higher',
      'npm or yarn package manager',
      'AWS SDK configured'
    ],
    installationSteps: [
      {
        id: 'install-package',
        title: 'Install CloudWatch APM package',
        description: 'Add the CloudWatch APM SDK to your project',
        code: `npm install @aws/cloudwatch-apm-nodejs

# or with yarn
yarn add @aws/cloudwatch-apm-nodejs`,
        language: 'bash',
        notes: ['Use npm or yarn depending on your project setup']
      },
      {
        id: 'initialize-apm',
        title: 'Initialize APM in your application',
        description: 'Add initialization code at the top of your main file',
        code: `// Import and initialize CloudWatch APM first
const apm = require('@aws/cloudwatch-apm-nodejs');

apm.start({
  serviceName: 'my-nodejs-app',
  serviceVersion: '1.0.0',
  environment: 'production',
  region: 'us-east-1'
});

// Then import your other modules
const express = require('express');
const app = express();`,
        language: 'javascript',
        notes: ['Initialize APM before importing other modules', 'Replace service name with your app name']
      },
      {
        id: 'add-middleware',
        title: 'Add APM middleware (Express)',
        description: 'Configure middleware for automatic instrumentation',
        code: `const express = require('express');
const app = express();

// Add CloudWatch APM middleware
app.use(apm.middleware());

// Your routes and other middleware
app.get('/', (req, res) => {
  res.send('Hello World!');
});`,
        language: 'javascript',
        notes: ['Add middleware early in your middleware stack'],
        isOptional: true
      }
    ],
    verificationSteps: [
      {
        id: 'check-initialization',
        title: 'Verify APM initialization',
        description: 'Check that the APM agent started successfully',
        command: 'node -e "console.log(require(\'@aws/cloudwatch-apm-nodejs\').isActive())"',
        expectedOutput: 'true',
        troubleshooting: [
          'Check that initialization code runs before other imports',
          'Verify AWS credentials are configured',
          'Check console for any error messages'
        ]
      }
    ]
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python applications with Django, Flask, FastAPI, or other frameworks',
    icon: '🐍',
    category: 'language',
    prerequisites: [
      'Python 3.7 or higher',
      'pip package manager',
      'boto3 library installed'
    ],
    installationSteps: [
      {
        id: 'install-package',
        title: 'Install CloudWatch APM package',
        description: 'Install the CloudWatch APM Python SDK',
        code: `pip install cloudwatch-apm-python

# or with requirements.txt
echo "cloudwatch-apm-python>=1.0.0" >> requirements.txt
pip install -r requirements.txt`,
        language: 'bash'
      },
      {
        id: 'configure-apm',
        title: 'Configure APM in your application',
        description: 'Initialize CloudWatch APM in your main application file',
        code: `import cloudwatch_apm

# Initialize CloudWatch APM
apm = cloudwatch_apm.Client(
    service_name='my-python-app',
    service_version='1.0.0',
    environment='production',
    region='us-east-1'
)

# For Django, add to settings.py
INSTALLED_APPS = [
    'cloudwatch_apm.contrib.django',
    # ... your other apps
]

CLOUDWATCH_APM = {
    'SERVICE_NAME': 'my-django-app',
    'SERVICE_VERSION': '1.0.0',
    'ENVIRONMENT': 'production',
}`,
        language: 'python',
        notes: ['Configuration varies by framework', 'See framework-specific documentation']
      }
    ],
    verificationSteps: [
      {
        id: 'check-import',
        title: 'Verify package import',
        description: 'Test that the CloudWatch APM package can be imported',
        command: 'python -c "import cloudwatch_apm; print(\'APM package imported successfully\')"',
        expectedOutput: 'APM package imported successfully',
        troubleshooting: [
          'Ensure the package is installed in the correct Python environment',
          'Check for any import errors in the console'
        ]
      }
    ]
  },
  // Frameworks
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    description: 'Spring Boot applications with auto-configuration',
    icon: '🍃',
    category: 'framework',
    prerequisites: [
      'Spring Boot 2.5 or higher',
      'Java 8 or higher',
      'Maven or Gradle'
    ],
    installationSteps: [
      {
        id: 'add-starter',
        title: 'Add Spring Boot starter',
        description: 'Add the CloudWatch APM Spring Boot starter dependency',
        code: `<!-- Maven -->
<dependency>
    <groupId>software.amazon.cloudwatchapm</groupId>
    <artifactId>cloudwatch-apm-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>`,
        language: 'xml'
      },
      {
        id: 'configure-properties',
        title: 'Configure application properties',
        description: 'Add CloudWatch APM configuration to application.yml or application.properties',
        code: `# application.yml
cloudwatch:
  apm:
    enabled: true
    service-name: my-spring-app
    service-version: 1.0.0
    environment: production
    sampling-rate: 0.1
    
# application.properties
cloudwatch.apm.enabled=true
cloudwatch.apm.service-name=my-spring-app
cloudwatch.apm.service-version=1.0.0
cloudwatch.apm.environment=production
cloudwatch.apm.sampling-rate=0.1`,
        language: 'yaml'
      }
    ],
    verificationSteps: [
      {
        id: 'check-actuator',
        title: 'Check Spring Boot Actuator endpoint',
        description: 'Verify APM health through Spring Boot Actuator',
        command: 'curl http://localhost:8080/actuator/health/cloudwatch-apm',
        expectedOutput: '{"status":"UP"}',
        troubleshooting: [
          'Ensure Spring Boot Actuator is enabled',
          'Check that the application is running on the expected port'
        ]
      }
    ]
  },
  {
    id: 'express',
    name: 'Express.js',
    description: 'Express.js web applications',
    icon: '🚂',
    category: 'framework',
    prerequisites: [
      'Node.js 14 or higher',
      'Express.js 4.x or higher'
    ],
    installationSteps: [
      {
        id: 'install-middleware',
        title: 'Install Express middleware',
        description: 'Install the CloudWatch APM Express middleware',
        code: `npm install @aws/cloudwatch-apm-express`,
        language: 'bash'
      },
      {
        id: 'configure-middleware',
        title: 'Configure Express middleware',
        description: 'Add CloudWatch APM middleware to your Express app',
        code: `const express = require('express');
const cloudwatchAPM = require('@aws/cloudwatch-apm-express');

const app = express();

// Configure CloudWatch APM middleware
app.use(cloudwatchAPM({
  serviceName: 'my-express-app',
  serviceVersion: '1.0.0',
  environment: 'production'
}));

// Your routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});`,
        language: 'javascript'
      }
    ],
    verificationSteps: [
      {
        id: 'test-endpoint',
        title: 'Test instrumented endpoint',
        description: 'Make a request to verify instrumentation is working',
        command: 'curl http://localhost:3000/',
        expectedOutput: 'Hello World!',
        troubleshooting: [
          'Check that your Express server is running',
          'Verify the middleware is properly configured'
        ]
      }
    ]
  },
  // Infrastructure
  {
    id: 'docker',
    name: 'Docker',
    description: 'Containerized applications with Docker',
    icon: '🐳',
    category: 'infrastructure',
    prerequisites: [
      'Docker installed',
      'Application already containerized',
      'AWS credentials available to container'
    ],
    installationSteps: [
      {
        id: 'modify-dockerfile',
        title: 'Modify Dockerfile',
        description: 'Add CloudWatch APM agent to your Docker image',
        code: `# For Java applications
FROM openjdk:11-jre-slim
COPY target/my-app.jar app.jar
# Download CloudWatch APM agent
RUN wget -O cloudwatch-apm-agent.jar https://github.com/aws/cloudwatch-apm-java/releases/latest/download/cloudwatch-apm-agent.jar
ENTRYPOINT ["java", "-javaagent:cloudwatch-apm-agent.jar", "-jar", "app.jar"]

# For Node.js applications
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# APM initialization should be in your app code
CMD ["node", "index.js"]`,
        language: 'dockerfile'
      },
      {
        id: 'set-environment',
        title: 'Set environment variables',
        description: 'Configure CloudWatch APM through environment variables',
        code: `# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - CLOUDWATCH_APM_SERVICE_NAME=my-docker-app
      - CLOUDWATCH_APM_SERVICE_VERSION=1.0.0
      - CLOUDWATCH_APM_ENVIRONMENT=production
      - AWS_REGION=us-east-1
    ports:
      - "8080:8080"

# Or with docker run
docker run -e CLOUDWATCH_APM_SERVICE_NAME=my-app \\
           -e CLOUDWATCH_APM_SERVICE_VERSION=1.0.0 \\
           -e CLOUDWATCH_APM_ENVIRONMENT=production \\
           -p 8080:8080 my-app:latest`,
        language: 'yaml'
      }
    ],
    verificationSteps: [
      {
        id: 'check-container-logs',
        title: 'Check container logs',
        description: 'Verify APM agent initialization in container logs',
        command: 'docker logs <container-id> | grep -i "cloudwatch apm"',
        expectedOutput: 'CloudWatch APM agent initialized successfully',
        troubleshooting: [
          'Check that environment variables are properly set',
          'Verify AWS credentials are available to the container',
          'Ensure the APM agent is properly included in the image'
        ]
      }
    ]
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: 'Applications deployed on Kubernetes clusters',
    icon: '☸️',
    category: 'infrastructure',
    prerequisites: [
      'Kubernetes cluster access',
      'kubectl configured',
      'AWS Load Balancer Controller (for EKS)'
    ],
    installationSteps: [
      {
        id: 'create-configmap',
        title: 'Create ConfigMap for APM configuration',
        description: 'Create a ConfigMap with CloudWatch APM settings',
        code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: cloudwatch-apm-config
  namespace: default
data:
  CLOUDWATCH_APM_SERVICE_NAME: "my-k8s-app"
  CLOUDWATCH_APM_SERVICE_VERSION: "1.0.0"
  CLOUDWATCH_APM_ENVIRONMENT: "production"
  AWS_REGION: "us-east-1"`,
        language: 'yaml'
      },
      {
        id: 'update-deployment',
        title: 'Update deployment manifest',
        description: 'Add CloudWatch APM configuration to your deployment',
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        envFrom:
        - configMapRef:
            name: cloudwatch-apm-config
        ports:
        - containerPort: 8080`,
        language: 'yaml'
      },
      {
        id: 'apply-manifests',
        title: 'Apply Kubernetes manifests',
        description: 'Deploy the updated configuration to your cluster',
        code: `kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl rollout status deployment/my-app`,
        language: 'bash'
      }
    ],
    verificationSteps: [
      {
        id: 'check-pod-logs',
        title: 'Check pod logs',
        description: 'Verify APM initialization in pod logs',
        command: 'kubectl logs -l app=my-app | grep -i "cloudwatch apm"',
        expectedOutput: 'CloudWatch APM agent initialized',
        troubleshooting: [
          'Check that pods are running: kubectl get pods',
          'Verify ConfigMap is properly mounted',
          'Check for any error messages in pod logs'
        ]
      }
    ]
  }
]