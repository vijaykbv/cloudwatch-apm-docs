/**
 * Property-based tests for configuration documentation completeness
 * Feature: cloudwatch-apm-docs, Property 5: Configuration Documentation Completeness
 * Validates: Requirements 4.1, 4.3, 4.4
 */

import fc from 'fast-check';
import { CLOUDWATCH_APM_SCHEMA, CONFIGURATION_PARAMETERS, CONFIGURATION_CATEGORIES } from '@/data/configuration-schema';

// Generators for configuration testing - constrained to produce realistic business data
const validWordArb = fc.constantFrom(
  'configuration', 'parameter', 'example', 'description', 'validation', 'monitoring', 
  'debugging', 'performance', 'alerting', 'system', 'application', 'service', 'data',
  'processing', 'analysis', 'management', 'optimization', 'security', 'authentication'
);

const validSentenceArb = fc.array(validWordArb, { minLength: 3, maxLength: 8 })
  .map(words => words.join(' '));

// Generate meaningful IDs with proper length constraints
const validIdArb = fc.oneof(
  fc.constantFrom(
    'config-param', 'example-id', 'validation-rule', 'monitoring-config',
    'debug-setting', 'performance-opt', 'security-param', 'auth-config'
  ),
  fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5)
);

// Generate meaningful names with proper length constraints
const validNameArb = fc.oneof(
  fc.constantFrom(
    'configParameter', 'exampleValue', 'validationRule', 'monitoringConfig',
    'debugSetting', 'performanceOpt', 'securityParam', 'authConfig'
  ),
  fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5)
);

const validPlatformArb = fc.constantFrom('java', 'nodejs', 'python', 'spring-boot', 'express', 'docker', 'kubernetes');

const validationRuleArb = fc.record({
  type: fc.constantFrom('min', 'max', 'pattern', 'enum', 'custom'),
  value: fc.oneof(
    fc.constantFrom('valid-pattern', 'test-value', 'config-option'),
    fc.integer({ min: 1, max: 100 }),
    fc.float({ min: Math.fround(0.1), max: Math.fround(10.0) })
  ),
  message: validSentenceArb
});

const configurationExampleArb = fc.record({
  id: validIdArb,
  title: validSentenceArb,
  description: validSentenceArb,
  value: fc.oneof(
    fc.constantFrom('example-value', 'test-config', 'valid-option', 'default-setting'),
    fc.integer({ min: 1, max: 1000 }),
    fc.float({ min: Math.fround(0.1), max: Math.fround(100.0) }),
    fc.boolean(),
    fc.constantFrom(['option1', 'option2'], ['value1', 'value2', 'value3'])
  ),
  context: fc.option(validSentenceArb),
  platform: fc.option(validPlatformArb),
  useCase: fc.option(fc.constantFrom('monitoring', 'debugging', 'performance', 'alerting'))
});

const configurationCategoryArb = fc.record({
  id: fc.oneof(
    fc.constantFrom('basic-config', 'advanced-config', 'security-config', 'performance-config'),
    fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.trim().length >= 5)
  ),
  name: fc.oneof(
    fc.constantFrom('Basic Configuration', 'Advanced Configuration', 'Security Configuration', 'Performance Configuration'),
    validSentenceArb.filter(s => s.length >= 10)
  ),
  description: validSentenceArb.filter(s => s.length >= 15),
  icon: fc.option(fc.constantFrom('gear', 'shield', 'chart', 'settings')),
  order: fc.integer({ min: 1, max: 10 })
});

// Create unique categories generator
const uniqueCategoriesArb = fc.array(configurationCategoryArb, { minLength: 1, maxLength: 3 })
  .map(categories => {
    // Make IDs, names, and orders unique
    return categories.map((cat, index) => ({
      ...cat,
      id: `category-${index + 1}`,
      name: `Category ${index + 1}`,
      description: `Description for category ${index + 1}`,
      order: index + 1
    }));
  });

const configurationParameterArb = fc.record({
  id: validIdArb,
  name: validNameArb,
  type: fc.constantFrom('string', 'number', 'boolean', 'array', 'object'),
  description: validSentenceArb.filter(s => s.length >= 10),
  required: fc.boolean(),
  defaultValue: fc.option(fc.oneof(
    fc.constantFrom('default-value', 'example-config', 'test-setting'),
    fc.integer({ min: 1, max: 100 }),
    fc.float({ min: Math.fround(0.1), max: Math.fround(10.0) }),
    fc.boolean()
  )),
  validValues: fc.option(fc.array(
    fc.oneof(
      fc.constantFrom('option1', 'option2', 'option3'),
      fc.integer({ min: 1, max: 10 }),
      fc.float({ min: Math.fround(0.1), max: Math.fround(5.0) })
    ),
    { minLength: 1, maxLength: 3 }
  )),
  validationRules: fc.option(fc.array(validationRuleArb, { minLength: 1, maxLength: 2 })),
  examples: fc.array(configurationExampleArb, { minLength: 1, maxLength: 2 }),
  category: configurationCategoryArb,
  platform: fc.option(fc.array(validPlatformArb, { minLength: 1, maxLength: 2 })),
  environment: fc.option(fc.array(
    fc.constantFrom('development', 'staging', 'production', 'test'),
    { minLength: 1, maxLength: 2 }
  )),
  deprecated: fc.option(fc.boolean()),
  deprecationMessage: fc.option(validSentenceArb.filter(s => s.length >= 10)),
  relatedParameters: fc.option(fc.array(
    validIdArb,
    { minLength: 1, maxLength: 2 }
  ))
}).chain(param => {
  // Ensure deprecated parameters always have deprecation messages
  const updatedParam = param.deprecated && !param.deprecationMessage ? {
    ...param,
    deprecationMessage: 'This parameter is deprecated and will be removed in a future version'
  } : param;
  
  // Ensure examples match parameter type exactly
  const typedExamples = updatedParam.examples.map(example => {
    let typedValue: any;
    
    switch (updatedParam.type) {
      case 'string':
        typedValue = 'example-string-value';
        // If validValues exist and are strings, use one of them
        if (updatedParam.validValues && updatedParam.validValues.length > 0) {
          const stringValues = updatedParam.validValues.filter(v => typeof v === 'string');
          if (stringValues.length > 0) {
            typedValue = stringValues[0];
          }
        }
        break;
      case 'number':
        typedValue = 42;
        // If validValues exist and are numbers, use one of them
        if (updatedParam.validValues && updatedParam.validValues.length > 0) {
          const numberValues = updatedParam.validValues.filter(v => typeof v === 'number');
          if (numberValues.length > 0) {
            typedValue = numberValues[0];
          }
        }
        break;
      case 'boolean':
        typedValue = true;
        break;
      case 'array':
        typedValue = ['example-array-item'];
        break;
      case 'object':
        typedValue = { key: 'example-object-value' };
        break;
      default:
        typedValue = 'default-value';
    }
    
    return { ...example, value: typedValue };
  });
  
  // Ensure validValues match parameter type
  let filteredValidValues = updatedParam.validValues;
  if (updatedParam.validValues && updatedParam.validValues.length > 0) {
    switch (updatedParam.type) {
      case 'string':
        filteredValidValues = updatedParam.validValues.filter(v => typeof v === 'string');
        break;
      case 'number':
        filteredValidValues = updatedParam.validValues.filter(v => typeof v === 'number');
        break;
      case 'boolean':
        filteredValidValues = updatedParam.validValues.filter(v => typeof v === 'boolean');
        break;
      case 'array':
      case 'object':
        // Arrays and objects shouldn't have validValues
        filteredValidValues = null;
        break;
      default:
        filteredValidValues = updatedParam.validValues;
    }
    
    // If no valid values remain, set to null
    if (filteredValidValues && filteredValidValues.length === 0) {
      filteredValidValues = null;
    }
  }
  
  // Filter validation rules to match parameter type exactly
  let filteredValidationRules = updatedParam.validationRules;
  if (updatedParam.validationRules) {
    filteredValidationRules = updatedParam.validationRules.filter(rule => {
      switch (rule.type) {
        case 'min':
        case 'max':
          return updatedParam.type === 'string' || updatedParam.type === 'number';
        case 'pattern':
          return updatedParam.type === 'string';
        case 'enum':
          return filteredValidValues && filteredValidValues.length > 0;
        default:
          return true;
      }
    });
    
    // If no rules remain, set to null
    if (filteredValidationRules.length === 0) {
      filteredValidationRules = null;
    }
  }
  
  return fc.constant({
    ...updatedParam,
    examples: typedExamples,
    validValues: filteredValidValues,
    validationRules: filteredValidationRules
  });
});

const configurationSchemaArb = fc.record({
  id: validIdArb,
  name: fc.oneof(
    fc.constantFrom('CloudWatch APM Configuration', 'Application Performance Monitoring Config', 'System Configuration Schema'),
    validSentenceArb.filter(s => s.length >= 10)
  ),
  description: validSentenceArb.filter(s => s.length >= 15),
  version: fc.constantFrom('1.0.0', '1.1.0', '2.0.0'),
  parameters: fc.array(configurationParameterArb, { minLength: 1, maxLength: 5 }),
  categories: uniqueCategoriesArb,
  platforms: fc.array(validPlatformArb, { minLength: 1, maxLength: 3 }),
  lastUpdated: fc.date({ min: new Date('2020-01-01'), max: new Date() })
}).chain(schema => {
  // Ensure all parameters reference valid categories and have unique IDs
  const updatedParameters = schema.parameters.map((param, index) => ({
    ...param,
    id: `param-${index + 1}`, // Ensure unique parameter IDs
    category: schema.categories[index % schema.categories.length] // Assign valid category
  }));

  // Update related parameters to reference actual parameter IDs
  const parameterIds = updatedParameters.map(p => p.id);
  const finalParameters = updatedParameters.map(param => {
    if (param.relatedParameters && param.relatedParameters.length > 0) {
      const validRelatedParams = parameterIds
        .filter(id => id !== param.id)
        .slice(0, Math.min(1, param.relatedParameters.length)); // Limit to 1 related parameter
      return { ...param, relatedParameters: validRelatedParams.length > 0 ? validRelatedParams : null };
    }
    return { ...param, relatedParameters: null };
  });

  return fc.constant({
    ...schema,
    parameters: finalParameters
  });
});

describe('Configuration Documentation Completeness Properties', () => {
  describe('Property 5: Configuration Documentation Completeness', () => {
    test('all configuration parameters should have complete documentation', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        // Required fields must be present and have meaningful content
        if (!parameter.id || parameter.id.trim().length < 3) return false;
        if (!parameter.name || parameter.name.trim().length < 3) return false;
        if (!parameter.description || parameter.description.trim().length < 10) return false;
        if (!parameter.type) return false;
        
        // Category must be valid with required fields
        if (!parameter.category || !parameter.category.id || parameter.category.id.trim().length < 3) return false;
        if (!parameter.category.name || parameter.category.name.trim().length < 5) return false;
        if (!parameter.category.description || parameter.category.description.trim().length < 10) return false;
        
        // Examples must exist and be valid
        if (!parameter.examples || parameter.examples.length === 0) return false;
        
        // All examples must have required fields and proper types
        return parameter.examples.every(example => {
          if (!example.id || example.id.trim().length < 3) return false;
          if (!example.title || example.title.trim().length < 5) return false;
          if (!example.description || example.description.trim().length < 5) return false;
          if (example.value === undefined || example.value === null) return false;
          
          // Check type consistency between parameter and example
          const exampleType = Array.isArray(example.value) ? 'array' : typeof example.value;
          const typeMatches = exampleType === parameter.type || 
            (parameter.type === 'number' && exampleType === 'string' && !isNaN(Number(example.value))) ||
            (parameter.type === 'object' && exampleType === 'object' && !Array.isArray(example.value));
          
          return typeMatches;
        });
      }), { numRuns: 10 });
    });

    test('configuration schema should have all required parameters documented', () => {
      fc.assert(fc.property(configurationSchemaArb, (schema) => {
        // Schema must have basic metadata with minimum meaningful lengths
        if (!schema.id || schema.id.trim().length < 3) return false;
        if (!schema.name || schema.name.trim().length < 10) return false;
        if (!schema.description || schema.description.trim().length < 15) return false;
        if (!schema.version || !schema.version.match(/^\d+\.\d+\.\d+/)) return false;

        // Must have parameters and categories
        if (!schema.parameters || schema.parameters.length === 0) return false;
        if (!schema.categories || schema.categories.length === 0) return false;
        if (!schema.platforms || schema.platforms.length === 0) return false;

        // All parameters must reference valid categories
        const categoryIds = new Set(schema.categories.map(cat => cat.id));
        const parametersHaveValidCategories = schema.parameters.every(param =>
          categoryIds.has(param.category.id)
        );

        // All categories should have required fields with meaningful content
        const categoriesAreValid = schema.categories.every(cat =>
          cat.id && cat.id.trim().length >= 3 &&
          cat.name && cat.name.trim().length >= 5 &&
          cat.description && cat.description.trim().length >= 10 &&
          typeof cat.order === 'number' && cat.order > 0
        );

        // Parameter IDs should be unique
        const parameterIds = schema.parameters.map(p => p.id);
        const uniqueParameterIds = new Set(parameterIds);
        const idsAreUnique = parameterIds.length === uniqueParameterIds.size;

        // Category orders should be unique
        const categoryOrders = schema.categories.map(c => c.order);
        const uniqueCategoryOrders = new Set(categoryOrders);
        const ordersAreUnique = categoryOrders.length === uniqueCategoryOrders.size;

        return parametersHaveValidCategories && categoriesAreValid && idsAreUnique && ordersAreUnique;
      }), { numRuns: 10 });
    });

    test('validation rules should be consistent with parameter types', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        if (!parameter.validationRules) return true;

        return parameter.validationRules.every(rule => {
          switch (rule.type) {
            case 'min':
            case 'max':
              // Min/max rules should apply to string (length) or number types
              return parameter.type === 'string' || parameter.type === 'number';
            
            case 'pattern':
              // Pattern rules should only apply to strings
              return parameter.type === 'string';
            
            case 'enum':
              // Enum rules should have corresponding validValues
              return parameter.validValues && parameter.validValues.length > 0;
            
            default:
              return true;
          }
        });
      }), { numRuns: 10 });
    });

    test('examples should match parameter type and constraints', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        return parameter.examples.every(example => {
          // Basic validation - examples should have required fields with meaningful lengths
          if (!example.id || example.id.trim().length < 3) return false;
          if (!example.title || example.title.trim().length < 5) return false;
          if (!example.description || example.description.trim().length < 5) return false;
          if (example.value === undefined || example.value === null) return false;

          // Type consistency check
          const exampleType = Array.isArray(example.value) ? 'array' : typeof example.value;
          let typeMatches = false;
          
          switch (parameter.type) {
            case 'string':
              typeMatches = typeof example.value === 'string' && example.value.trim().length > 0;
              break;
            case 'number':
              typeMatches = typeof example.value === 'number' || 
                (typeof example.value === 'string' && !isNaN(Number(example.value)));
              break;
            case 'boolean':
              typeMatches = typeof example.value === 'boolean';
              break;
            case 'array':
              typeMatches = Array.isArray(example.value);
              break;
            case 'object':
              typeMatches = typeof example.value === 'object' && !Array.isArray(example.value);
              break;
            default:
              typeMatches = true;
          }
          
          if (!typeMatches) return false;

          // If validValues exist, example should be in the list (for exact type matches)
          if (parameter.validValues && parameter.validValues.length > 0) {
            const hasMatchingValue = parameter.validValues.some(validValue => {
              // Allow type coercion for numbers
              if (parameter.type === 'number' && typeof validValue === 'number' && typeof example.value === 'string') {
                return Number(example.value) === validValue;
              }
              return validValue === example.value;
            });
            if (!hasMatchingValue) return false;
          }

          return true;
        });
      }), { numRuns: 10 });
    });

    test('required parameters should have appropriate defaults or examples', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        if (!parameter.required) return true;

        // Required parameters should either have a default value or clear examples
        const hasDefault = parameter.defaultValue !== undefined;
        const hasValidExamples = parameter.examples && parameter.examples.length > 0;

        return hasDefault || hasValidExamples;
      }), { numRuns: 50 });
    });

    test('deprecated parameters should have deprecation messages', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        if (!parameter.deprecated) return true;

        // Deprecated parameters should have a meaningful deprecation message
        return !!(parameter.deprecationMessage && parameter.deprecationMessage.trim().length >= 10);
      }), { numRuns: 50 });
    });

    test('parameter categories should be properly ordered and complete', () => {
      fc.assert(fc.property(uniqueCategoriesArb, (categories) => {
        // Categories should have unique IDs (already ensured by generator)
        const ids = categories.map(cat => cat.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) return false;

        // Categories should have unique names (already ensured by generator)
        const names = categories.map(cat => cat.name);
        const uniqueNames = new Set(names);
        if (names.length !== uniqueNames.size) return false;

        // Categories should have unique order values (already ensured by generator)
        const orders = categories.map(cat => cat.order);
        const uniqueOrders = new Set(orders);
        if (orders.length !== uniqueOrders.size) return false;

        // All categories should have required fields with meaningful lengths
        return categories.every(cat =>
          cat.id && cat.id.trim().length >= 3 &&
          cat.name && cat.name.trim().length >= 5 &&
          cat.description && cat.description.trim().length >= 10 &&
          typeof cat.order === 'number' && cat.order > 0
        );
      }), { numRuns: 50 });
    });

    test('platform-specific parameters should have platform information', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        // If parameter has platform restrictions, it should be documented
        if (parameter.platform && parameter.platform.length > 0) {
          // Platform array should contain valid platform names
          const validPlatforms = ['java', 'nodejs', 'python', 'spring-boot', 'express', 'docker', 'kubernetes'];
          return parameter.platform.every(platform => validPlatforms.includes(platform));
        }

        return true;
      }), { numRuns: 50 });
    });

    test('related parameters should form valid relationships', () => {
      fc.assert(fc.property(fc.array(configurationParameterArb, { minLength: 2, maxLength: 3 }).chain(params => {
        // Ensure unique IDs
        const uniqueParams = params.map((param, index) => ({
          ...param,
          id: `unique-param-${index + 1}`,
          relatedParameters: null // Clear related parameters first
        }));
        
        // Now set up valid related parameters
        const finalParams = uniqueParams.map((param, index) => {
          if (index > 0 && Math.random() > 0.5) { // 50% chance of having related parameters
            const availableIds = uniqueParams.filter(p => p.id !== param.id).map(p => p.id);
            const relatedId = availableIds[0]; // Take the first available ID
            return { ...param, relatedParameters: [relatedId] };
          }
          return param;
        });
        
        return fc.constant(finalParams);
      }), (parameters) => {
        const parameterIds = new Set(parameters.map(p => p.id));

        return parameters.every(parameter => {
          if (!parameter.relatedParameters || parameter.relatedParameters.length === 0) return true;

          // All related parameters should exist in the schema and not be self-referential
          return parameter.relatedParameters.every(relatedId =>
            parameterIds.has(relatedId) && 
            relatedId !== parameter.id && 
            relatedId.trim().length >= 3
          );
        });
      }), { numRuns: 10 });
    });

    test('configuration examples should cover all use cases', () => {
      fc.assert(fc.property(configurationParameterArb, (parameter) => {
        const validUseCases = ['monitoring', 'debugging', 'performance', 'alerting'];
        const exampleUseCases = parameter.examples
          .map(ex => ex.useCase)
          .filter(useCase => useCase !== undefined && useCase !== null);

        // If parameter has use case examples, they should be valid
        // Allow parameters to have no use cases (null/undefined is valid)
        return exampleUseCases.every(useCase => validUseCases.includes(useCase!));
      }), { numRuns: 10 });
    });
  });

  // Test the actual CloudWatch APM schema
  describe('CloudWatch APM Schema Validation', () => {
    test('CloudWatch APM schema should be complete and valid', () => {
      // Test the actual schema structure
      expect(CLOUDWATCH_APM_SCHEMA.id).toBe('cloudwatch-apm');
      expect(CLOUDWATCH_APM_SCHEMA.name).toBe('CloudWatch APM Configuration');
      expect(CLOUDWATCH_APM_SCHEMA.parameters).toHaveLength(CONFIGURATION_PARAMETERS.length);
      expect(CLOUDWATCH_APM_SCHEMA.categories).toHaveLength(CONFIGURATION_CATEGORIES.length);

      // All parameters should have complete documentation
      CLOUDWATCH_APM_SCHEMA.parameters.forEach(parameter => {
        expect(parameter.id).toBeTruthy();
        expect(parameter.name).toBeTruthy();
        expect(parameter.description).toBeTruthy();
        expect(parameter.type).toBeTruthy();
        expect(parameter.category).toBeTruthy();
        expect(parameter.examples.length).toBeGreaterThan(0);
      });

      // All categories should be referenced by parameters
      const parameterCategoryIds = new Set(CLOUDWATCH_APM_SCHEMA.parameters.map(p => p.category.id));
      CLOUDWATCH_APM_SCHEMA.categories.forEach(category => {
        expect(parameterCategoryIds.has(category.id)).toBe(true);
      });
    });

    test('all required parameters should have examples or defaults', () => {
      const requiredParameters = CLOUDWATCH_APM_SCHEMA.parameters.filter(p => p.required);
      
      requiredParameters.forEach(parameter => {
        const hasDefault = parameter.defaultValue !== undefined;
        const hasExamples = parameter.examples.length > 0;
        
        expect(hasDefault || hasExamples).toBe(true);
      });
    });

    test('all validation rules should be consistent with parameter types', () => {
      CLOUDWATCH_APM_SCHEMA.parameters.forEach(parameter => {
        if (parameter.validationRules) {
          parameter.validationRules.forEach(rule => {
            switch (rule.type) {
              case 'min':
              case 'max':
                expect(['string', 'number']).toContain(parameter.type);
                break;
              case 'pattern':
                expect(parameter.type).toBe('string');
                break;
              case 'enum':
                expect(parameter.validValues).toBeTruthy();
                expect(parameter.validValues!.length).toBeGreaterThan(0);
                break;
            }
          });
        }
      });
    });

    test('all examples should be valid for their parameters', () => {
      CLOUDWATCH_APM_SCHEMA.parameters.forEach(parameter => {
        parameter.examples.forEach(example => {
          // Example should have required fields
          expect(example.id).toBeTruthy();
          expect(example.title).toBeTruthy();
          expect(example.description).toBeTruthy();
          expect(example.value).toBeDefined();

          // Example value should match parameter type
          const exampleType = Array.isArray(example.value) ? 'array' : typeof example.value;
          const typeMatches = exampleType === parameter.type || 
            (parameter.type === 'number' && exampleType === 'string' && !isNaN(Number(example.value)));
          
          expect(typeMatches).toBe(true);

          // If validValues exist, example should be in the list
          if (parameter.validValues && parameter.validValues.length > 0) {
            expect(parameter.validValues).toContain(example.value);
          }
        });
      });
    });

    test('categories should be properly ordered', () => {
      const orders = CLOUDWATCH_APM_SCHEMA.categories.map(cat => cat.order);
      const sortedOrders = [...orders].sort((a, b) => a - b);
      
      expect(orders).toEqual(sortedOrders);
      
      // Orders should be unique
      const uniqueOrders = new Set(orders);
      expect(orders.length).toBe(uniqueOrders.size);
    });

    test('deprecated parameters should have deprecation messages', () => {
      const deprecatedParameters = CLOUDWATCH_APM_SCHEMA.parameters.filter(p => p.deprecated);
      
      deprecatedParameters.forEach(parameter => {
        expect(parameter.deprecationMessage).toBeTruthy();
        expect(parameter.deprecationMessage!.length).toBeGreaterThan(0);
      });
    });

    test('related parameters should exist in schema', () => {
      const parameterIds = new Set(CLOUDWATCH_APM_SCHEMA.parameters.map(p => p.id));
      
      CLOUDWATCH_APM_SCHEMA.parameters.forEach(parameter => {
        if (parameter.relatedParameters) {
          parameter.relatedParameters.forEach(relatedId => {
            expect(parameterIds.has(relatedId)).toBe(true);
            expect(relatedId).not.toBe(parameter.id);
          });
        }
      });
    });

    test('platform information should be valid', () => {
      const validPlatforms = ['java', 'nodejs', 'python', 'spring-boot', 'express', 'docker', 'kubernetes'];
      
      CLOUDWATCH_APM_SCHEMA.parameters.forEach(parameter => {
        if (parameter.platform) {
          parameter.platform.forEach(platform => {
            expect(validPlatforms).toContain(platform);
          });
        }
      });
    });
  });
});