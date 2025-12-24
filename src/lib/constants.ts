// Application constants
export const SITE_CONFIG = {
  name: 'CloudWatch APM Documentation',
  description: 'Comprehensive documentation for CloudWatch Application Performance Monitoring',
  url: 'https://docs.cloudwatch-apm.aws.amazon.com',
  version: '1.0.0',
} as const

export const NAVIGATION_SECTIONS = {
  GETTING_STARTED: 'getting-started',
  IMPLEMENTATION: 'implementation',
  CONFIGURATION: 'configuration',
  EXAMPLES: 'examples',
  API_REFERENCE: 'api-reference',
  TROUBLESHOOTING: 'troubleshooting',
  MONITORING: 'monitoring',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
} as const

export const USER_AUDIENCES = {
  DEVELOPER: 'developer',
  OPERATIONS: 'operations',
  ARCHITECT: 'architect',
  SECURITY: 'security',
} as const

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const