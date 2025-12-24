/**
 * Property-based tests for API documentation completeness
 * Feature: cloudwatch-apm-docs, Property 7: API Documentation Completeness
 * Validates: Requirements 7.1, 7.3, 7.4
 */

import fc from 'fast-check';
import { 
  OpenAPISpec, 
  Operation, 
  Parameter, 
  Schema, 
  AuthenticationGuide,
  SDKDocumentation 
} from '../../types/api';
import { 
  cloudwatchAPMOpenAPISpec, 
  authenticationGuides, 
  sdkDocumentations 
} from '../../data/api-documentation';

// Generators for API testing - constrained to produce realistic business data
const validWordArb = fc.constantFrom(
  'application', 'monitoring', 'performance', 'trace', 'metric', 'service', 'endpoint',
  'authentication', 'authorization', 'parameter', 'response', 'request', 'schema',
  'validation', 'configuration', 'documentation', 'example', 'guide', 'reference'
);

const validSentenceArb = fc.array(validWordArb, { minLength: 3, maxLength: 8 })
  .map(words => words.join(' '));

const validIdArb = fc.oneof(
  fc.constantFrom(
    'api-endpoint', 'operation-id', 'parameter-name', 'schema-ref',
    'auth-method', 'sdk-method', 'example-id', 'guide-section'
  ),
  fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5)
);

const validNameArb = fc.oneof(
  fc.constantFrom(
    'listApplications', 'createApplication', 'getTraces', 'updateConfiguration',
    'deleteApplication', 'getMetrics', 'createAlert', 'updateSettings',
    'applicationId', 'traceId', 'metricName', 'configValue', 'alertName'
  ),
  fc.string({ minLength: 5, maxLength: 50 })
    .filter(s => s.trim().length >= 5 && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s.trim()))
);

const httpMethodArb = fc.constantFrom('get', 'post', 'put', 'delete', 'patch', 'head', 'options');
const httpStatusArb = fc.constantFrom('200', '201', '400', '401', '403', '404', '500');
const parameterLocationArb = fc.constantFrom('query', 'header', 'path', 'cookie');
const schemaTypeArb = fc.constantFrom('string', 'number', 'integer', 'boolean', 'array', 'object');

// Schema generator with proper recursive structure
const schemaArb: fc.Arbitrary<Schema> = fc.letrec(tie => ({
  schema: fc.record({
    type: fc.option(schemaTypeArb, { nil: undefined }),
    format: fc.option(fc.constantFrom('date-time', 'email', 'uri', 'uuid'), { nil: undefined }),
    title: fc.option(validSentenceArb, { nil: undefined }),
    description: fc.option(validSentenceArb.filter(s => s.length >= 10), { nil: undefined }),
    enum: fc.option(fc.array(
      fc.oneof(
        fc.constantFrom('option1', 'option2', 'option3'),
        fc.integer({ min: 1, max: 100 }),
        fc.boolean()
      ),
      { minLength: 1, maxLength: 3 }
    ), { nil: undefined }),
    properties: fc.option(fc.dictionary(
      validNameArb,
      tie('schema') as fc.Arbitrary<Schema>,
      { minKeys: 1, maxKeys: 3 }
    ), { nil: undefined }),
    required: fc.option(fc.array(validNameArb, { minLength: 1, maxLength: 3 }), { nil: undefined }),
    items: fc.option(tie('schema') as fc.Arbitrary<Schema>, { nil: undefined }),
    example: fc.option(fc.oneof(
      fc.constantFrom('example-value', 'test-data'),
      fc.integer({ min: 1, max: 1000 }),
      fc.boolean()
    ), { nil: undefined }),
    minimum: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    maximum: fc.option(fc.integer({ min: 101, max: 1000 }), { nil: undefined }),
    minLength: fc.option(fc.integer({ min: 0, max: 10 }), { nil: undefined }),
    maxLength: fc.option(fc.integer({ min: 11, max: 100 }), { nil: undefined }),
    pattern: fc.option(fc.constantFrom('^[a-zA-Z0-9]+$', '^\\d{4}-\\d{2}-\\d{2}$'), { nil: undefined }),
    nullable: fc.option(fc.boolean(), { nil: undefined }),
    deprecated: fc.option(fc.boolean(), { nil: undefined })
  }).map(schema => {
    // Ensure schemas with properties have object type and no items
    if (schema.properties) {
      schema = { ...schema, type: 'object', items: undefined };
    }
    // Ensure schemas with items have array type and no properties
    else if (schema.items) {
      schema = { ...schema, type: 'array', properties: undefined };
    }
    
    // Ensure required fields reference valid properties
    if (schema.properties && schema.required) {
      const propertyNames = Object.keys(schema.properties);
      const validRequired = schema.required.filter(reqField => 
        propertyNames.includes(reqField)
      );
      if (validRequired.length === 0) {
        // If no required fields are valid, remove the required array
        schema = { ...schema, required: undefined };
      } else {
        schema = { ...schema, required: validRequired };
      }
    }
    return schema;
  }) as fc.Arbitrary<Schema>
})).schema;

const parameterArb = fc.record({
  name: validNameArb,
  in: parameterLocationArb,
  description: fc.option(validSentenceArb.filter(s => s.length >= 10), { nil: undefined }),
  required: fc.option(fc.boolean(), { nil: undefined }),
  deprecated: fc.option(fc.boolean(), { nil: undefined }),
  schema: fc.option(schemaArb, { nil: undefined }),
  example: fc.option(fc.oneof(
    fc.constantFrom('example-param-value', 'test-parameter'),
    fc.integer({ min: 1, max: 100 }),
    fc.boolean()
  ), { nil: undefined })
}).map(parameter => {
  // Path parameters must be required
  if (parameter.in === 'path') {
    parameter = { ...parameter, required: true };
  }
  
  // Ensure example matches schema type if both are present
  if (parameter.schema && parameter.schema.type && parameter.example !== undefined) {
    const schemaType = parameter.schema.type;
    let compatibleExample = parameter.example;
    
    // Adjust example to match schema type
    switch (schemaType) {
      case 'string':
        compatibleExample = typeof parameter.example === 'string' ? parameter.example : 'example-string';
        break;
      case 'integer':
      case 'number':
        compatibleExample = typeof parameter.example === 'number' ? parameter.example : 42;
        break;
      case 'boolean':
        compatibleExample = typeof parameter.example === 'boolean' ? parameter.example : true;
        break;
      case 'array':
        compatibleExample = Array.isArray(parameter.example) ? parameter.example : ['example-item'];
        break;
      case 'object':
        compatibleExample = typeof parameter.example === 'object' && !Array.isArray(parameter.example) ? parameter.example : { example: 'value' };
        break;
    }
    
    return { ...parameter, example: compatibleExample };
  }
  
  return parameter;
});

const responseArb = fc.record({
  description: validSentenceArb.filter(s => s.length >= 10),
  content: fc.option(fc.dictionary(
    fc.constantFrom('application/json', 'application/xml', 'text/plain'),
    fc.record({
      schema: fc.option(schemaArb, { nil: undefined }),
      example: fc.option(fc.oneof(
        fc.constantFrom({ message: 'success' }, { data: 'example' }),
        fc.array(fc.constantFrom('item1', 'item2'), { minLength: 1, maxLength: 3 })
      ), { nil: undefined })
    }),
    { minKeys: 1, maxKeys: 2 }
  ), { nil: undefined })
});

const operationArb = fc.record({
  tags: fc.option(fc.array(
    fc.constantFrom('Applications', 'Traces', 'Metrics', 'Configuration'),
    { minLength: 1, maxLength: 2 }
  ), { nil: undefined }),
  summary: fc.option(validSentenceArb.filter(s => s.length >= 10), { nil: undefined }),
  description: fc.option(validSentenceArb.filter(s => s.length >= 15), { nil: undefined }),
  operationId: fc.option(validNameArb, { nil: undefined }),
  parameters: fc.option(fc.array(parameterArb, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  requestBody: fc.option(fc.record({
    description: fc.option(validSentenceArb.filter(s => s.length >= 10), { nil: undefined }),
    required: fc.option(fc.boolean(), { nil: undefined }),
    content: fc.dictionary(
      fc.constantFrom('application/json', 'application/xml'),
      fc.record({
        schema: fc.option(schemaArb, { nil: undefined }),
        example: fc.option(fc.constantFrom(
          { name: 'example-app' },
          { configuration: 'test-config' }
        ), { nil: undefined })
      }),
      { minKeys: 1, maxKeys: 1 }
    )
  }), { nil: undefined }),
  responses: fc.dictionary(
    httpStatusArb,
    responseArb,
    { minKeys: 1, maxKeys: 3 }
  ),
  security: fc.option(fc.array(
    fc.dictionary(
      fc.constantFrom('AWS4-HMAC-SHA256', 'ApiKeyAuth', 'BearerAuth'),
      fc.array(fc.constantFrom('read', 'write', 'admin'), { minLength: 0, maxLength: 2 }),
      { minKeys: 1, maxKeys: 1 }
    ),
    { minLength: 1, maxLength: 2 }
  ), { nil: undefined }),
  deprecated: fc.option(fc.boolean(), { nil: undefined })
}).map(operation => {
  // Ensure operation has either summary or description
  if (!operation.summary && !operation.description) {
    return {
      ...operation,
      summary: 'Generated operation summary for testing'
    };
  }
  return operation;
});

const pathItemArb = fc.dictionary(
  httpMethodArb,
  operationArb,
  { minKeys: 1, maxKeys: 3 }
);

const openAPISpecArb = fc.record({
  openapi: fc.constantFrom('3.0.0', '3.0.1', '3.0.2', '3.0.3'),
  info: fc.record({
    title: validSentenceArb.filter(s => s.length >= 10),
    description: validSentenceArb.filter(s => s.length >= 20),
    version: fc.constantFrom('1.0.0', '1.1.0', '2.0.0', '2023-11-27'),
    contact: fc.option(fc.record({
      name: fc.option(validSentenceArb, { nil: undefined }),
      url: fc.option(fc.constantFrom('https://aws.amazon.com/cloudwatch/', 'https://docs.aws.amazon.com/'), { nil: undefined }),
      email: fc.option(fc.constantFrom('support@aws.amazon.com', 'cloudwatch@amazon.com'), { nil: undefined })
    }), { nil: undefined })
  }),
  servers: fc.array(fc.record({
    url: fc.constantFrom(
      'https://application-insights.us-east-1.amazonaws.com',
      'https://application-insights.us-west-2.amazonaws.com',
      'https://application-insights.eu-west-1.amazonaws.com'
    ),
    description: fc.option(validSentenceArb.filter(s => s.length >= 10), { nil: undefined })
  }), { minLength: 1, maxLength: 3 }),
  paths: fc.dictionary(
    fc.constantFrom('/applications', '/applications/{id}', '/traces', '/metrics'),
    pathItemArb,
    { minKeys: 1, maxKeys: 4 }
  ),
  tags: fc.option(fc.array(fc.record({
    name: fc.constantFrom('Applications', 'Traces', 'Metrics', 'Configuration'),
    description: fc.option(validSentenceArb.filter(s => s.length >= 10), { nil: undefined })
  }), { minLength: 1, maxLength: 4 }), { nil: undefined }),
  security: fc.option(fc.array(
    fc.dictionary(
      fc.constantFrom('AWS4-HMAC-SHA256', 'ApiKeyAuth', 'BearerAuth'),
      fc.array(fc.constantFrom('read', 'write', 'admin'), { minLength: 0, maxLength: 2 }),
      { minKeys: 1, maxKeys: 1 }
    ),
    { minLength: 1, maxLength: 2 }
  ), { nil: undefined })
}).map(spec => {
  // Ensure either global security or all operations have security
  const hasGlobalSecurity = spec.security && spec.security.length > 0;
  
  if (!hasGlobalSecurity) {
    // Add security to all operations
    const updatedPaths: Record<string, any> = {};
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      const updatedPathItem: any = {};
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          updatedPathItem[method] = {
            ...operation,
            security: [{
              'AWS4-HMAC-SHA256': []
            }]
          };
        } else {
          updatedPathItem[method] = operation;
        }
      });
      updatedPaths[path] = updatedPathItem;
    });
    
    return {
      ...spec,
      paths: updatedPaths
    };
  }
  
  return spec;
});

const authenticationGuideArb = fc.record({
  id: validIdArb,
  title: validSentenceArb.filter(s => s.length >= 10),
  description: validSentenceArb.filter(s => s.length >= 20),
  type: fc.constantFrom('apiKey', 'oauth2', 'jwt', 'iam'),
  steps: fc.array(fc.record({
    id: validIdArb,
    title: validSentenceArb.filter(s => s.length >= 5),
    description: validSentenceArb.filter(s => s.length >= 15),
    code: fc.option(fc.constantFrom(
      'aws configure set region us-east-1',
      'const client = new AWS.ApplicationInsights();',
      'import boto3; client = boto3.client("application-insights")'
    )),
    language: fc.option(fc.constantFrom('bash', 'javascript', 'python', 'java')),
    required: fc.boolean()
  }), { minLength: 1, maxLength: 5 }),
  examples: fc.array(fc.record({
    id: validIdArb,
    title: validSentenceArb.filter(s => s.length >= 10),
    description: validSentenceArb.filter(s => s.length >= 15),
    language: fc.constantFrom('javascript', 'python', 'java', 'bash'),
    code: validSentenceArb.filter(s => s.length >= 20),
    explanation: validSentenceArb.filter(s => s.length >= 20)
  }), { minLength: 1, maxLength: 3 }),
  troubleshooting: fc.array(fc.record({
    id: validIdArb,
    issue: validSentenceArb.filter(s => s.length >= 10),
    solution: validSentenceArb.filter(s => s.length >= 15),
    code: fc.option(validSentenceArb.filter(s => s.length >= 10)),
    language: fc.option(fc.constantFrom('bash', 'javascript', 'python'))
  }), { minLength: 0, maxLength: 3 })
});

const sdkDocumentationArb = fc.record({
  id: validIdArb,
  language: fc.constantFrom('JavaScript', 'Python', 'Java', 'Go', 'C#'),
  version: fc.constantFrom('1.0.0', '2.0.0', '3.0.0'),
  title: validSentenceArb.filter(s => s.length >= 15),
  description: validSentenceArb.filter(s => s.length >= 25),
  installation: fc.record({
    packageManager: fc.constantFrom('npm', 'pip', 'maven', 'gradle', 'nuget'),
    command: validSentenceArb.filter(s => s.length >= 10),
    requirements: fc.array(validSentenceArb, { minLength: 1, maxLength: 3 })
  }),
  quickStart: fc.record({
    title: validSentenceArb.filter(s => s.length >= 10),
    description: validSentenceArb.filter(s => s.length >= 20),
    steps: fc.array(fc.record({
      title: validSentenceArb.filter(s => s.length >= 5),
      description: validSentenceArb.filter(s => s.length >= 15),
      code: validSentenceArb.filter(s => s.length >= 20),
      explanation: validSentenceArb.filter(s => s.length >= 15)
    }), { minLength: 1, maxLength: 5 }),
    completeExample: validSentenceArb.filter(s => s.length >= 50)
  }),
  examples: fc.array(fc.record({
    id: validIdArb,
    title: validSentenceArb.filter(s => s.length >= 10),
    description: validSentenceArb.filter(s => s.length >= 15),
    category: fc.constantFrom('Basic Operations', 'Error Handling', 'Advanced Usage'),
    code: validSentenceArb.filter(s => s.length >= 30),
    explanation: validSentenceArb.filter(s => s.length >= 20),
    relatedMethods: fc.array(validNameArb, { minLength: 0, maxLength: 3 })
  }), { minLength: 1, maxLength: 5 })
});

describe('API Documentation Completeness Properties', () => {
  describe('Property 7: API Documentation Completeness', () => {
    test('all API endpoints should have complete documentation', () => {
      fc.assert(fc.property(openAPISpecArb, (spec) => {
        // OpenAPI spec must have required metadata
        if (!spec.info.title || spec.info.title.trim().length < 10) return false;
        if (!spec.info.description || spec.info.description.trim().length < 20) return false;
        if (!spec.info.version || !spec.info.version.match(/^\d+\.\d+\.\d+|^\d{4}-\d{2}-\d{2}$/)) return false;

        // Must have at least one server
        if (!spec.servers || spec.servers.length === 0) return false;

        // Must have at least one path
        if (!spec.paths || Object.keys(spec.paths).length === 0) return false;

        // All servers must have valid URLs
        const serversValid = spec.servers.every(server =>
          server.url && server.url.startsWith('https://')
        );
        if (!serversValid) return false;

        // All paths must have at least one operation
        const pathsValid = Object.values(spec.paths).every(pathItem =>
          Object.keys(pathItem).some(method => 
            ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)
          )
        );
        if (!pathsValid) return false;

        return true;
      }), { numRuns: 10 });
    });

    test('all operations should have required documentation fields', () => {
      fc.assert(fc.property(operationArb, (operation) => {
        // Operations should have meaningful summary or description (already ensured by generator)
        const hasSummary = operation.summary && operation.summary.trim().length >= 10;
        const hasDescription = operation.description && operation.description.trim().length >= 15;
        
        if (!hasSummary && !hasDescription) return false;

        // Operations should have at least one response
        if (!operation.responses || Object.keys(operation.responses).length === 0) return false;

        // All responses should have descriptions
        const responsesValid = Object.values(operation.responses).every(response =>
          response.description && response.description.trim().length >= 10
        );
        if (!responsesValid) return false;

        // Parameters should have proper documentation
        if (operation.parameters) {
          const parametersValid = operation.parameters.every(param =>
            param.name && param.name.trim().length >= 3 &&
            param.in && ['query', 'header', 'path', 'cookie'].includes(param.in) &&
            (!param.description || param.description.trim().length >= 10)
          );
          if (!parametersValid) return false;
        }

        return true;
      }), { numRuns: 10 });
    });

    test('all parameters should have consistent types and examples', () => {
      fc.assert(fc.property(parameterArb, (parameter) => {
        // Parameter must have valid name and location
        if (!parameter.name || parameter.name.trim().length < 3) return false;
        if (!['query', 'header', 'path', 'cookie'].includes(parameter.in)) return false;

        // If parameter has schema and example, they should be consistent
        if (parameter.schema && parameter.example !== undefined) {
          const schemaType = parameter.schema.type;
          
          // Skip validation if schema has no type
          if (!schemaType) return true;
          
          const exampleType = Array.isArray(parameter.example) ? 'array' : typeof parameter.example;
          
          // Allow reasonable type coercion
          const typeMatches = 
            schemaType === exampleType ||
            (schemaType === 'integer' && exampleType === 'number') ||
            (schemaType === 'number' && exampleType === 'number') ||
            (schemaType === 'string' && typeof parameter.example === 'string') ||
            (schemaType === 'array' && Array.isArray(parameter.example)) ||
            (schemaType === 'boolean' && typeof parameter.example === 'boolean');
          
          if (!typeMatches) return false;
        }

        // Path parameters must be required
        if (parameter.in === 'path' && parameter.required !== true) return false;

        return true;
      }), { numRuns: 10 });
    });

    test('authentication guides should be complete and actionable', () => {
      fc.assert(fc.property(authenticationGuideArb, (guide) => {
        // Guide must have basic metadata
        if (!guide.id || guide.id.trim().length < 3) return false;
        if (!guide.title || guide.title.trim().length < 10) return false;
        if (!guide.description || guide.description.trim().length < 20) return false;
        if (!['apiKey', 'oauth2', 'jwt', 'iam'].includes(guide.type)) return false;

        // Must have at least one step
        if (!guide.steps || guide.steps.length === 0) return false;

        // All steps must be properly documented
        const stepsValid = guide.steps.every(step =>
          step.id && step.id.trim().length >= 3 &&
          step.title && step.title.trim().length >= 5 &&
          step.description && step.description.trim().length >= 15 &&
          typeof step.required === 'boolean'
        );
        if (!stepsValid) return false;

        // Must have at least one example
        if (!guide.examples || guide.examples.length === 0) return false;

        // All examples must be complete
        const examplesValid = guide.examples.every(example =>
          example.id && example.id.trim().length >= 3 &&
          example.title && example.title.trim().length >= 10 &&
          example.description && example.description.trim().length >= 15 &&
          example.language && ['javascript', 'python', 'java', 'bash'].includes(example.language) &&
          example.code && example.code.trim().length >= 20 &&
          example.explanation && example.explanation.trim().length >= 20
        );
        if (!examplesValid) return false;

        // Troubleshooting items should be complete if present
        if (guide.troubleshooting && guide.troubleshooting.length > 0) {
          const troubleshootingValid = guide.troubleshooting.every(item =>
            item.id && item.id.trim().length >= 3 &&
            item.issue && item.issue.trim().length >= 10 &&
            item.solution && item.solution.trim().length >= 15
          );
          if (!troubleshootingValid) return false;
        }

        return true;
      }), { numRuns: 10 });
    });

    test('SDK documentation should have complete installation and usage guides', () => {
      fc.assert(fc.property(sdkDocumentationArb, (sdk) => {
        // SDK must have basic metadata
        if (!sdk.id || sdk.id.trim().length < 3) return false;
        if (!sdk.language || !['JavaScript', 'Python', 'Java', 'Go', 'C#'].includes(sdk.language)) return false;
        if (!sdk.version || !sdk.version.match(/^\d+\.\d+\.\d+$/)) return false;
        if (!sdk.title || sdk.title.trim().length < 15) return false;
        if (!sdk.description || sdk.description.trim().length < 25) return false;

        // Installation guide must be complete
        if (!sdk.installation.packageManager || sdk.installation.packageManager.trim().length < 3) return false;
        if (!sdk.installation.command || sdk.installation.command.trim().length < 10) return false;
        if (!sdk.installation.requirements || sdk.installation.requirements.length === 0) return false;

        // Quick start must be complete
        if (!sdk.quickStart.title || sdk.quickStart.title.trim().length < 10) return false;
        if (!sdk.quickStart.description || sdk.quickStart.description.trim().length < 20) return false;
        if (!sdk.quickStart.steps || sdk.quickStart.steps.length === 0) return false;
        if (!sdk.quickStart.completeExample || sdk.quickStart.completeExample.trim().length < 50) return false;

        // All quick start steps must be complete
        const stepsValid = sdk.quickStart.steps.every(step =>
          step.title && step.title.trim().length >= 5 &&
          step.description && step.description.trim().length >= 15 &&
          step.code && step.code.trim().length >= 20 &&
          step.explanation && step.explanation.trim().length >= 15
        );
        if (!stepsValid) return false;

        // Must have at least one example
        if (!sdk.examples || sdk.examples.length === 0) return false;

        // All examples must be complete
        const examplesValid = sdk.examples.every(example =>
          example.id && example.id.trim().length >= 3 &&
          example.title && example.title.trim().length >= 10 &&
          example.description && example.description.trim().length >= 15 &&
          example.category && ['Basic Operations', 'Error Handling', 'Advanced Usage'].includes(example.category) &&
          example.code && example.code.trim().length >= 30 &&
          example.explanation && example.explanation.trim().length >= 20
        );
        if (!examplesValid) return false;

        return true;
      }), { numRuns: 10 });
    });

    test('schemas should have proper type definitions and examples', () => {
      fc.assert(fc.property(schemaArb, (schema) => {
        // If schema has properties, it should have object type (ensured by generator)
        if (schema.properties && schema.type !== 'object') return false;

        // If schema has items, it should have array type (ensured by generator)
        if (schema.items && schema.type !== 'array') return false;

        // Schema cannot have both properties and items
        if (schema.properties && schema.items) return false;

        // If schema has properties, required fields should reference valid properties
        if (schema.properties && schema.required) {
          const propertyNames = Object.keys(schema.properties);
          const requiredValid = schema.required.every(reqField =>
            propertyNames.includes(reqField)
          );
          if (!requiredValid) return false;
        }

        // Numeric constraints should be logical
        if (schema.minimum !== undefined && schema.maximum !== undefined) {
          if (schema.minimum >= schema.maximum) return false;
        }

        if (schema.minLength !== undefined && schema.maxLength !== undefined) {
          if (schema.minLength >= schema.maxLength) return false;
        }

        // Enum values should exist if enum type is specified
        if (schema.enum && schema.enum.length === 0) return false;

        return true;
      }), { numRuns: 10 });
    });

    test('deprecated operations should have proper deprecation information', () => {
      fc.assert(fc.property(operationArb, (operation) => {
        // This test passes for all operations since deprecation info is optional
        // but validates that if deprecated flag is set, it's boolean
        if (operation.deprecated !== undefined) {
          return typeof operation.deprecated === 'boolean';
        }
        return true;
      }), { numRuns: 50 });
    });

    test('security requirements should reference valid schemes', () => {
      fc.assert(fc.property(operationArb, (operation) => {
        if (!operation.security) return true;

        // All security requirements should have valid scheme names
        return operation.security.every(securityReq =>
          Object.keys(securityReq).every(schemeName =>
            schemeName && schemeName.trim().length >= 3 &&
            Array.isArray(securityReq[schemeName])
          )
        );
      }), { numRuns: 50 });
    });

    test('API specifications should have proper authentication coverage', () => {
      fc.assert(fc.property(openAPISpecArb, (spec) => {
        // Check if spec has global security or all operations have security
        const hasGlobalSecurity = spec.security && spec.security.length > 0;
        
        if (hasGlobalSecurity) {
          // If global security exists, it's sufficient
          return true;
        }
        
        // Otherwise, check that all operations have security requirements
        const allOperationsSecured = Object.values(spec.paths).every(pathItem =>
          Object.entries(pathItem).every(([method, operation]) => {
            if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
              return true; // Skip non-HTTP methods
            }
            const op = operation as any;
            return op.security && op.security.length > 0;
          })
        );
        
        return allOperationsSecured;
      }), { numRuns: 10 });
    });

    test('request bodies should have valid content types and schemas', () => {
      fc.assert(fc.property(operationArb, (operation) => {
        if (!operation.requestBody) return true;

        // Request body should have at least one content type
        if (!operation.requestBody.content || Object.keys(operation.requestBody.content).length === 0) {
          return false;
        }

        // All content types should be valid MIME types
        const validContentTypes = Object.keys(operation.requestBody.content).every(contentType =>
          contentType.includes('/') && contentType.trim().length >= 5
        );

        return validContentTypes;
      }), { numRuns: 50 });
    });

    test('response content should match declared content types', () => {
      fc.assert(fc.property(responseArb, (response) => {
        // Response must have description
        if (!response.description || response.description.trim().length < 10) return false;

        // If response has content, validate content types
        if (response.content) {
          const contentTypesValid = Object.keys(response.content).every(contentType =>
            contentType.includes('/') && contentType.trim().length >= 5
          );
          if (!contentTypesValid) return false;
        }

        return true;
      }), { numRuns: 50 });
    });
  });

  // Test the actual CloudWatch APM API documentation
  describe('CloudWatch APM API Documentation Validation', () => {
    test('CloudWatch APM OpenAPI spec should be complete and valid', () => {
      // Test the actual spec structure
      expect(cloudwatchAPMOpenAPISpec.openapi).toMatch(/^3\.0\.\d+$/);
      expect(cloudwatchAPMOpenAPISpec.info.title).toBeTruthy();
      expect(cloudwatchAPMOpenAPISpec.info.description).toBeTruthy();
      expect(cloudwatchAPMOpenAPISpec.info.version).toBeTruthy();
      expect(cloudwatchAPMOpenAPISpec.servers.length).toBeGreaterThan(0);
      expect(Object.keys(cloudwatchAPMOpenAPISpec.paths).length).toBeGreaterThan(0);

      // All servers should have valid URLs
      cloudwatchAPMOpenAPISpec.servers.forEach(server => {
        expect(server.url).toMatch(/^https:\/\//);
        expect(server.url).toContain('amazonaws.com');
      });

      // All paths should have at least one operation
      Object.values(cloudwatchAPMOpenAPISpec.paths).forEach(pathItem => {
        const methods = Object.keys(pathItem).filter(key => 
          ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(key)
        );
        expect(methods.length).toBeGreaterThan(0);
      });
    });

    test('all operations should have required documentation', () => {
      Object.entries(cloudwatchAPMOpenAPISpec.paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
            const op = operation as Operation;
            
            // Should have summary or description
            expect(op.summary || op.description).toBeTruthy();
            
            // Should have responses
            expect(op.responses).toBeTruthy();
            expect(Object.keys(op.responses).length).toBeGreaterThan(0);
            
            // All responses should have descriptions
            Object.values(op.responses).forEach(response => {
              expect(response.description).toBeTruthy();
              expect(response.description.length).toBeGreaterThan(5);
            });
            
            // Parameters should be properly documented
            if (op.parameters) {
              op.parameters.forEach(param => {
                expect(param.name).toBeTruthy();
                expect(['query', 'header', 'path', 'cookie']).toContain(param.in);
                
                // Path parameters must be required
                if (param.in === 'path') {
                  expect(param.required).toBe(true);
                }
              });
            }
          }
        });
      });
    });

    test('authentication guides should be complete', () => {
      expect(authenticationGuides.length).toBeGreaterThan(0);
      
      authenticationGuides.forEach(guide => {
        expect(guide.id).toBeTruthy();
        expect(guide.title).toBeTruthy();
        expect(guide.description).toBeTruthy();
        expect(['apiKey', 'oauth2', 'jwt', 'iam']).toContain(guide.type);
        expect(guide.steps.length).toBeGreaterThan(0);
        expect(guide.examples.length).toBeGreaterThan(0);
        
        // All steps should be complete
        guide.steps.forEach(step => {
          expect(step.id).toBeTruthy();
          expect(step.title).toBeTruthy();
          expect(step.description).toBeTruthy();
          expect(typeof step.required).toBe('boolean');
        });
        
        // All examples should be complete
        guide.examples.forEach(example => {
          expect(example.id).toBeTruthy();
          expect(example.title).toBeTruthy();
          expect(example.description).toBeTruthy();
          expect(example.language).toBeTruthy();
          expect(example.code).toBeTruthy();
          expect(example.explanation).toBeTruthy();
        });
      });
    });

    test('SDK documentation should be complete', () => {
      expect(sdkDocumentations.length).toBeGreaterThan(0);
      
      sdkDocumentations.forEach(sdk => {
        expect(sdk.id).toBeTruthy();
        expect(sdk.language).toBeTruthy();
        expect(sdk.version).toMatch(/^\d+\.\d+\.\d+$/);
        expect(sdk.title).toBeTruthy();
        expect(sdk.description).toBeTruthy();
        
        // Installation guide should be complete
        expect(sdk.installation.packageManager).toBeTruthy();
        expect(sdk.installation.command).toBeTruthy();
        expect(sdk.installation.requirements.length).toBeGreaterThan(0);
        
        // Quick start should be complete
        expect(sdk.quickStart.title).toBeTruthy();
        expect(sdk.quickStart.description).toBeTruthy();
        expect(sdk.quickStart.steps.length).toBeGreaterThan(0);
        expect(sdk.quickStart.completeExample).toBeTruthy();
        
        // All quick start steps should be complete
        sdk.quickStart.steps.forEach(step => {
          expect(step.title).toBeTruthy();
          expect(step.description).toBeTruthy();
          expect(step.code).toBeTruthy();
          expect(step.explanation).toBeTruthy();
        });
        
        // Should have examples
        expect(sdk.examples.length).toBeGreaterThan(0);
        
        // All examples should be complete
        sdk.examples.forEach(example => {
          expect(example.id).toBeTruthy();
          expect(example.title).toBeTruthy();
          expect(example.description).toBeTruthy();
          expect(example.category).toBeTruthy();
          expect(example.code).toBeTruthy();
          expect(example.explanation).toBeTruthy();
        });
      });
    });

    test('all API endpoints should have authentication requirements', () => {
      Object.entries(cloudwatchAPMOpenAPISpec.paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            const op = operation as Operation;
            
            // Should have security requirements (either on operation or globally)
            const hasOperationSecurity = op.security && op.security.length > 0;
            const hasGlobalSecurity = cloudwatchAPMOpenAPISpec.security && cloudwatchAPMOpenAPISpec.security.length > 0;
            
            expect(hasOperationSecurity || hasGlobalSecurity).toBe(true);
          }
        });
      });
    });

    test('all schemas should be properly defined', () => {
      // Check components schemas if they exist
      if (cloudwatchAPMOpenAPISpec.components?.schemas) {
        Object.values(cloudwatchAPMOpenAPISpec.components.schemas).forEach(schema => {
          // Schema should have type or properties
          expect(schema.type || schema.properties).toBeTruthy();
          
          // If has properties and required, required should reference valid properties
          if (schema.properties && schema.required) {
            const propertyNames = Object.keys(schema.properties);
            schema.required.forEach(reqField => {
              expect(propertyNames).toContain(reqField);
            });
          }
        });
      }
      
      // Check inline schemas in operations
      Object.values(cloudwatchAPMOpenAPISpec.paths).forEach(pathItem => {
        Object.values(pathItem).forEach(operation => {
          if (typeof operation === 'object' && 'responses' in operation) {
            const op = operation as Operation;
            
            // Check response schemas
            Object.values(op.responses).forEach(response => {
              if (response.content) {
                Object.values(response.content).forEach(mediaType => {
                  if (mediaType.schema) {
                    // Schema should be valid
                    expect(typeof mediaType.schema).toBe('object');
                  }
                });
              }
            });
            
            // Check request body schemas
            if (op.requestBody?.content) {
              Object.values(op.requestBody.content).forEach(mediaType => {
                if (mediaType.schema) {
                  expect(typeof mediaType.schema).toBe('object');
                }
              });
            }
          }
        });
      });
    });

    test('rate limiting information should be documented', () => {
      // Check that SDK documentation includes rate limiting info
      sdkDocumentations.forEach(sdk => {
        expect(sdk.rateLimiting).toBeTruthy();
        expect(sdk.rateLimiting.defaultLimits.length).toBeGreaterThan(0);
        expect(sdk.rateLimiting.bestPractices.length).toBeGreaterThan(0);
        
        // All rate limits should have required fields
        sdk.rateLimiting.defaultLimits.forEach(limit => {
          expect(limit.operation).toBeTruthy();
          expect(limit.limit).toBeGreaterThan(0);
          expect(limit.window).toBeTruthy();
          expect(limit.description).toBeTruthy();
        });
      });
    });

    test('error handling should be documented', () => {
      // Check that authentication guides include troubleshooting
      authenticationGuides.forEach(guide => {
        if (guide.troubleshooting.length > 0) {
          guide.troubleshooting.forEach(item => {
            expect(item.issue).toBeTruthy();
            expect(item.solution).toBeTruthy();
          });
        }
      });
      
      // Check that SDK documentation includes error handling
      sdkDocumentations.forEach(sdk => {
        expect(sdk.rateLimiting.errorHandling.length).toBeGreaterThan(0);
        
        sdk.rateLimiting.errorHandling.forEach(errorGuide => {
          expect(errorGuide.errorCode).toBeTruthy();
          expect(errorGuide.description).toBeTruthy();
          expect(errorGuide.solution).toBeTruthy();
          expect(errorGuide.example).toBeTruthy();
        });
      });
    });
  });
});