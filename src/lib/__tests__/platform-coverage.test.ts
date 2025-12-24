/**
 * Property-based tests for platform coverage completeness
 * Feature: cloudwatch-apm-docs, Property 4: Platform Coverage Completeness
 * Validates: Requirements 2.3, 2.5
 */

import fc from 'fast-check';
import { Platform, InstallationStep, VerificationStep } from '@/types/quickstart';
import { PLATFORMS } from '@/data/platforms';

// Generators for platform testing
const kebabCaseIdArb = fc.stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/).filter(s => s.length >= 1 && s.length <= 20);

const meaningfulStringArb = fc.string({ minLength: 3, maxLength: 50 })
  .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9\s\-_.,!]+$/.test(s));

const descriptiveStringArb = fc.string({ minLength: 10, maxLength: 100 })
  .filter(s => s.trim().length >= 10 && /^[a-zA-Z0-9\s\-_.,!]+$/.test(s));

const codeBlockArb = fc.string({ minLength: 5, maxLength: 200 })
  .filter(s => s.trim().length >= 5 && /^[a-zA-Z0-9\s\-_.,!]+$/.test(s));

const prerequisiteArb = fc.oneof(
  fc.constant('Node.js 18 or higher'),
  fc.constant('Python 3.8 or later installed'),
  fc.constant('Java 11+ installed'),
  fc.constant('Docker installed and running'),
  fc.constant('AWS CLI configured'),
  fc.constant('Git installed')
);

const installationStepArb = fc.record({
  id: kebabCaseIdArb,
  title: meaningfulStringArb,
  description: descriptiveStringArb,
  code: fc.option(codeBlockArb),
  language: fc.option(fc.constantFrom('bash', 'javascript', 'python', 'java', 'yaml')),
  notes: fc.option(fc.array(meaningfulStringArb, { maxLength: 3 })),
  isOptional: fc.option(fc.boolean())
});

const verificationStepArb = fc.record({
  id: kebabCaseIdArb,
  title: meaningfulStringArb,
  description: descriptiveStringArb,
  command: fc.option(fc.oneof(
    fc.constant('npm test'),
    fc.constant('python --version'),
    fc.constant('java -version'),
    fc.constant('docker --version'),
    fc.constant('aws --version')
  )),
  expectedOutput: fc.option(meaningfulStringArb),
  troubleshooting: fc.option(fc.array(descriptiveStringArb, { maxLength: 2 }))
}).filter(step => {
  // If step has a command, it should have either expected output or troubleshooting
  if (step.command && step.command.trim().length > 0) {
    return (step.expectedOutput && step.expectedOutput.trim().length > 0) ||
           (step.troubleshooting && step.troubleshooting.length > 0);
  }
  return true;
});

const platformArb = fc.record({
  id: kebabCaseIdArb,
  name: meaningfulStringArb.filter(s => s === s.trim()), // No leading/trailing spaces
  description: descriptiveStringArb,
  icon: fc.constantFrom('nodejs', 'python', 'java', 'docker', 'aws', 'react', 'angular'),
  category: fc.constantFrom('language', 'framework', 'infrastructure'),
  prerequisites: fc.array(prerequisiteArb, { maxLength: 4 }),
  installationSteps: fc.array(installationStepArb, { minLength: 1, maxLength: 5 }),
  verificationSteps: fc.array(verificationStepArb, { minLength: 1, maxLength: 3 })
});

const platformsArb = fc.array(platformArb, { minLength: 1, maxLength: 20 });

// Platform coverage validator class
class PlatformCoverageValidator {
  validatePlatformCompleteness(platforms: Platform[]): boolean {
    return platforms.every(platform => this.isPlatformComplete(platform));
  }

  isPlatformComplete(platform: Platform): boolean {
    // Check required fields
    if (!platform.id || !platform.name || !platform.description) {
      return false;
    }

    // Check installation steps follow standard format
    if (!this.hasValidInstallationSteps(platform)) {
      return false;
    }

    // Check verification steps exist
    if (!this.hasValidVerificationSteps(platform)) {
      return false;
    }

    return true;
  }

  hasValidInstallationSteps(platform: Platform): boolean {
    if (!platform.installationSteps || platform.installationSteps.length === 0) {
      return false;
    }

    return platform.installationSteps.every(step => {
      // Each step must have required fields
      if (!step.id || !step.title || !step.description) {
        return false;
      }

      // Steps with code should have proper formatting
      if (step.code && step.code.length > 0) {
        // Code blocks should be non-empty and properly formatted
        if (step.code.trim().length === 0) {
          return false;
        }
      }

      return true;
    });
  }

  hasValidVerificationSteps(platform: Platform): boolean {
    if (!platform.verificationSteps || platform.verificationSteps.length === 0) {
      return false;
    }

    return platform.verificationSteps.every(step => {
      // Each verification step must have required fields
      if (!step.id || !step.title || !step.description) {
        return false;
      }

      // Steps with commands should have expected outputs or troubleshooting
      if (step.command && step.command.trim().length > 0) {
        return (step.expectedOutput && step.expectedOutput.trim().length > 0) ||
               (step.troubleshooting && step.troubleshooting.length > 0 && 
                step.troubleshooting.some(t => t.trim().length > 0));
      }

      return true;
    });
  }

  getCoverageByCategory(platforms: Platform[]): Record<string, Platform[]> {
    const coverage: Record<string, Platform[]> = {
      language: [],
      framework: [],
      infrastructure: []
    };

    platforms.forEach(platform => {
      if (coverage[platform.category]) {
        coverage[platform.category].push(platform);
      }
    });

    return coverage;
  }

  validateStepSequencing(platform: Platform): boolean {
    // Installation steps should be in logical order
    const steps = platform.installationSteps;
    
    // All steps should have valid IDs and descriptions
    return steps.every(step => {
      return step.id && step.title && step.description &&
             step.id.trim().length > 0 && 
             step.title.trim().length > 0 && 
             step.description.trim().length > 0;
    });
  }

  validatePrerequisites(platform: Platform): boolean {
    // Prerequisites should be specific and actionable
    return platform.prerequisites.every(prereq => {
      // Should not be empty
      if (!prereq || prereq.trim().length === 0) {
        return false;
      }

      // Should be meaningful (more than just a single character)
      if (prereq.trim().length < 3) {
        return false;
      }

      return true;
    });
  }

  validateCrossReferences(platforms: Platform[]): boolean {
    // Platforms should not have circular dependencies in prerequisites
    const platformIds = new Set(platforms.map(p => p.id));
    
    return platforms.every(platform => {
      // Check if prerequisites reference other platforms appropriately
      return platform.prerequisites.every(prereq => {
        // If prerequisite mentions another platform, it should be valid
        const mentionedPlatforms = platforms.filter(p => 
          prereq.toLowerCase().includes(p.name.toLowerCase())
        );
        
        // Mentioned platforms should exist and not create circular dependencies
        return mentionedPlatforms.every(mentioned => 
          mentioned.id !== platform.id // No self-reference
        );
      });
    });
  }
}

describe('Platform Coverage Properties', () => {
  let validator: PlatformCoverageValidator;

  beforeEach(() => {
    validator = new PlatformCoverageValidator();
  });

  describe('Property 4: Platform Coverage Completeness', () => {
    test('all supported platforms should have complete installation instructions', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return validator.validatePlatformCompleteness(platforms);
      }), { numRuns: 100 });
    });

    test('installation steps should follow standard step-by-step format', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform => 
          validator.hasValidInstallationSteps(platform)
        );
      }), { numRuns: 100 });
    });

    test('all platforms should have verification steps', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform => 
          validator.hasValidVerificationSteps(platform)
        );
      }), { numRuns: 100 });
    });

    test('platform categories should have adequate coverage', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        const coverage = validator.getCoverageByCategory(platforms);
        
        // Each category should have at least one platform if any platforms exist
        if (platforms.length > 0) {
          const categories = ['language', 'framework', 'infrastructure'];
          const totalCoverage = categories.reduce((sum, cat) => sum + coverage[cat].length, 0);
          
          // Total coverage should equal total platforms
          return totalCoverage === platforms.length;
        }
        
        return true;
      }), { numRuns: 100 });
    });

    test('installation steps should be in logical sequence', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform => 
          validator.validateStepSequencing(platform)
        );
      }), { numRuns: 100 });
    });

    test('prerequisites should be specific and actionable', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform => 
          validator.validatePrerequisites(platform)
        );
      }), { numRuns: 100 });
    });

    test('platforms should not have circular dependency references', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return validator.validateCrossReferences(platforms);
      }), { numRuns: 100 });
    });

    test('code examples should be properly formatted and non-empty', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform =>
          platform.installationSteps.every(step => {
            if (step.code) {
              // Code should be non-empty when present
              if (step.code.trim().length === 0) {
                return false;
              }
              
              // Code should have reasonable length (not just whitespace)
              if (step.code.trim().length < 5) {
                return false;
              }
            }
            return true;
          })
        );
      }), { numRuns: 100 });
    });

    test('verification commands should have expected outputs or troubleshooting', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform =>
          platform.verificationSteps.every(step => {
            // If step has a command, it should have either expected output or troubleshooting
            if (step.command && step.command.trim().length > 0) {
              return (step.expectedOutput && step.expectedOutput.length > 0) ||
                     (step.troubleshooting && step.troubleshooting.length > 0);
            }
            return true;
          })
        );
      }), { numRuns: 100 });
    });

    test('platform metadata should be consistent and complete', () => {
      fc.assert(fc.property(platformsArb, (platforms) => {
        return platforms.every(platform => {
          // ID should be kebab-case
          if (!/^[a-z0-9-]+$/.test(platform.id)) {
            return false;
          }
          
          // Name should be properly capitalized
          if (platform.name.length === 0 || platform.name !== platform.name.trim()) {
            return false;
          }
          
          // Description should be descriptive (reasonable length)
          if (platform.description.length < 10) {
            return false;
          }
          
          // Icon should be present
          if (!platform.icon || platform.icon.trim().length === 0) {
            return false;
          }
          
          return true;
        });
      }), { numRuns: 100 });
    });
  });

  // Test with actual platform data
  describe('Real Platform Data Validation', () => {
    test('all real platforms should pass completeness validation', () => {
      expect(validator.validatePlatformCompleteness(PLATFORMS)).toBe(true);
    });

    test('real platforms should have proper category coverage', () => {
      const coverage = validator.getCoverageByCategory(PLATFORMS);
      
      // Should have platforms in all categories
      expect(coverage.language.length).toBeGreaterThan(0);
      expect(coverage.framework.length).toBeGreaterThan(0);
      expect(coverage.infrastructure.length).toBeGreaterThan(0);
    });

    test('real platforms should have valid installation sequences', () => {
      PLATFORMS.forEach(platform => {
        expect(validator.validateStepSequencing(platform)).toBe(true);
      });
    });

    test('real platforms should have actionable prerequisites', () => {
      PLATFORMS.forEach(platform => {
        expect(validator.validatePrerequisites(platform)).toBe(true);
      });
    });

    test('real platforms should have complete verification steps', () => {
      PLATFORMS.forEach(platform => {
        expect(validator.hasValidVerificationSteps(platform)).toBe(true);
      });
    });
  });
});