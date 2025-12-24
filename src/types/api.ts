// API documentation type definitions
import { z } from 'zod'

export interface OpenAPISpec {
  openapi: string
  info: APIInfo
  servers: APIServer[]
  paths: Record<string, PathItem>
  components?: APIComponents
  security?: SecurityRequirement[]
  tags?: APITag[]
}

export interface APIInfo {
  title: string
  description: string
  version: string
  contact?: {
    name?: string
    url?: string
    email?: string
  }
  license?: {
    name: string
    url?: string
  }
}

export interface APIServer {
  url: string
  description?: string
  variables?: Record<string, ServerVariable>
}

export interface ServerVariable {
  enum?: string[]
  default: string
  description?: string
}

export interface PathItem {
  summary?: string
  description?: string
  get?: Operation
  post?: Operation
  put?: Operation
  delete?: Operation
  patch?: Operation
  head?: Operation
  options?: Operation
  trace?: Operation
  parameters?: Parameter[]
}

export interface Operation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, Response>
  security?: SecurityRequirement[]
  deprecated?: boolean
}

export interface Parameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  deprecated?: boolean
  schema?: Schema
  example?: unknown
  examples?: Record<string, Example>
}

export interface RequestBody {
  description?: string
  content: Record<string, MediaType>
  required?: boolean
}

export interface Response {
  description: string
  headers?: Record<string, Header>
  content?: Record<string, MediaType>
}

export interface MediaType {
  schema?: Schema
  example?: unknown
  examples?: Record<string, Example>
}

export interface Schema {
  type?: string
  format?: string
  title?: string
  description?: string
  enum?: unknown[]
  properties?: Record<string, Schema>
  required?: string[]
  items?: Schema
  additionalProperties?: boolean | Schema
  example?: unknown
  default?: unknown
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  nullable?: boolean
  readOnly?: boolean
  writeOnly?: boolean
  deprecated?: boolean
}

export interface Header {
  description?: string
  required?: boolean
  deprecated?: boolean
  schema?: Schema
  example?: unknown
}

export interface Example {
  summary?: string
  description?: string
  value?: unknown
  externalValue?: string
}

export interface APIComponents {
  schemas?: Record<string, Schema>
  responses?: Record<string, Response>
  parameters?: Record<string, Parameter>
  examples?: Record<string, Example>
  requestBodies?: Record<string, RequestBody>
  headers?: Record<string, Header>
  securitySchemes?: Record<string, SecurityScheme>
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
  flows?: OAuthFlows
  openIdConnectUrl?: string
}

export interface OAuthFlows {
  implicit?: OAuthFlow
  password?: OAuthFlow
  clientCredentials?: OAuthFlow
  authorizationCode?: OAuthFlow
}

export interface OAuthFlow {
  authorizationUrl?: string
  tokenUrl?: string
  refreshUrl?: string
  scopes: Record<string, string>
}

export interface SecurityRequirement {
  [name: string]: string[]
}

export interface APITag {
  name: string
  description?: string
  externalDocs?: ExternalDocumentation
}

export interface ExternalDocumentation {
  description?: string
  url: string
}

// API Explorer specific types
export interface APIExplorerState {
  selectedOperation?: Operation
  selectedPath?: string
  selectedMethod?: string
  parameters: Record<string, unknown>
  requestBody?: unknown
  response?: APIResponse
  loading: boolean
  error?: string
}

export interface APIResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: unknown
  timestamp: Date
}

// Authentication guide types
export interface AuthenticationGuide {
  id: string
  title: string
  description: string
  type: 'apiKey' | 'oauth2' | 'jwt' | 'iam'
  steps: AuthenticationStep[]
  examples: AuthenticationExample[]
  troubleshooting: TroubleshootingItem[]
}

export interface AuthenticationStep {
  id: string
  title: string
  description: string
  code?: string
  language?: string
  required: boolean
}

export interface AuthenticationExample {
  id: string
  title: string
  description: string
  language: string
  code: string
  explanation: string
}

export interface TroubleshootingItem {
  id: string
  issue: string
  solution: string
  code?: string
  language?: string
}

// SDK documentation types
export interface SDKDocumentation {
  id: string
  language: string
  version: string
  title: string
  description: string
  installation: InstallationGuide
  quickStart: QuickStartGuide
  apiReference: SDKAPIReference
  examples: SDKExample[]
  rateLimiting: RateLimitingInfo
  changelog: ChangelogEntry[]
}

export interface InstallationGuide {
  packageManager: string
  command: string
  requirements: string[]
  additionalSteps?: InstallationStep[]
}

export interface InstallationStep {
  title: string
  description: string
  code?: string
  platform?: string
}

export interface QuickStartGuide {
  title: string
  description: string
  steps: QuickStartStep[]
  completeExample: string
}

export interface QuickStartStep {
  title: string
  description: string
  code: string
  explanation: string
}

export interface SDKAPIReference {
  classes: SDKClass[]
  functions: SDKFunction[]
  types: SDKType[]
}

export interface SDKClass {
  name: string
  description: string
  constructor: SDKConstructor
  methods: SDKMethod[]
  properties: SDKProperty[]
  examples: string[]
}

export interface SDKConstructor {
  parameters: SDKParameter[]
  description: string
  example: string
}

export interface SDKMethod {
  name: string
  description: string
  parameters: SDKParameter[]
  returnType: string
  returnDescription: string
  examples: string[]
  deprecated?: boolean
}

export interface SDKFunction {
  name: string
  description: string
  parameters: SDKParameter[]
  returnType: string
  returnDescription: string
  examples: string[]
  deprecated?: boolean
}

export interface SDKParameter {
  name: string
  type: string
  description: string
  required: boolean
  default?: unknown
}

export interface SDKProperty {
  name: string
  type: string
  description: string
  readOnly?: boolean
  deprecated?: boolean
}

export interface SDKType {
  name: string
  description: string
  properties: SDKProperty[]
  examples: string[]
}

export interface SDKExample {
  id: string
  title: string
  description: string
  category: string
  code: string
  explanation: string
  relatedMethods: string[]
}

export interface RateLimitingInfo {
  defaultLimits: RateLimit[]
  quotaInformation: QuotaInfo[]
  bestPractices: string[]
  errorHandling: ErrorHandlingGuide[]
}

export interface RateLimit {
  operation: string
  limit: number
  window: string
  description: string
}

export interface QuotaInfo {
  resource: string
  limit: number
  period: string
  description: string
}

export interface ErrorHandlingGuide {
  errorCode: string
  description: string
  solution: string
  example: string
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: ChangelogChange[]
}

export interface ChangelogChange {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'
  description: string
  breaking?: boolean
}

// Zod validation schemas
export const APIInfoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().min(1),
  contact: z.object({
    name: z.string().optional(),
    url: z.string().url().optional(),
    email: z.string().email().optional()
  }).optional(),
  license: z.object({
    name: z.string().min(1),
    url: z.string().url().optional()
  }).optional()
})

export const ServerVariableSchema = z.object({
  enum: z.array(z.string()).optional(),
  default: z.string(),
  description: z.string().optional()
})

export const APIServerSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
  variables: z.record(ServerVariableSchema).optional()
})

export const SchemaSchema: z.ZodType<Schema> = z.lazy(() => z.object({
  type: z.string().optional(),
  format: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  enum: z.array(z.unknown()).optional(),
  properties: z.record(SchemaSchema).optional(),
  required: z.array(z.string()).optional(),
  items: SchemaSchema.optional(),
  additionalProperties: z.union([z.boolean(), SchemaSchema]).optional(),
  example: z.unknown().optional(),
  default: z.unknown().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  nullable: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  writeOnly: z.boolean().optional(),
  deprecated: z.boolean().optional()
}))

export const ParameterSchema = z.object({
  name: z.string().min(1),
  in: z.enum(['query', 'header', 'path', 'cookie']),
  description: z.string().optional(),
  required: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  schema: SchemaSchema.optional(),
  example: z.unknown().optional(),
  examples: z.record(z.object({
    summary: z.string().optional(),
    description: z.string().optional(),
    value: z.unknown().optional(),
    externalValue: z.string().optional()
  })).optional()
})

export const AuthenticationGuideSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['apiKey', 'oauth2', 'jwt', 'iam']),
  steps: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    code: z.string().optional(),
    language: z.string().optional(),
    required: z.boolean()
  })),
  examples: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    language: z.string().min(1),
    code: z.string().min(1),
    explanation: z.string().min(1)
  })),
  troubleshooting: z.array(z.object({
    id: z.string().min(1),
    issue: z.string().min(1),
    solution: z.string().min(1),
    code: z.string().optional(),
    language: z.string().optional()
  }))
})

export const SDKDocumentationSchema = z.object({
  id: z.string().min(1),
  language: z.string().min(1),
  version: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  installation: z.object({
    packageManager: z.string().min(1),
    command: z.string().min(1),
    requirements: z.array(z.string()),
    additionalSteps: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      code: z.string().optional(),
      platform: z.string().optional()
    })).optional()
  }),
  quickStart: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    steps: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      code: z.string().min(1),
      explanation: z.string().min(1)
    })),
    completeExample: z.string().min(1)
  }),
  apiReference: z.object({
    classes: z.array(z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      constructor: z.object({
        parameters: z.array(z.object({
          name: z.string().min(1),
          type: z.string().min(1),
          description: z.string().min(1),
          required: z.boolean(),
          default: z.unknown().optional()
        })),
        description: z.string().min(1),
        example: z.string().min(1)
      }),
      methods: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        parameters: z.array(z.object({
          name: z.string().min(1),
          type: z.string().min(1),
          description: z.string().min(1),
          required: z.boolean(),
          default: z.unknown().optional()
        })),
        returnType: z.string().min(1),
        returnDescription: z.string().min(1),
        examples: z.array(z.string()),
        deprecated: z.boolean().optional()
      })),
      properties: z.array(z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        description: z.string().min(1),
        readOnly: z.boolean().optional(),
        deprecated: z.boolean().optional()
      })),
      examples: z.array(z.string())
    })),
    functions: z.array(z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      parameters: z.array(z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        description: z.string().min(1),
        required: z.boolean(),
        default: z.unknown().optional()
      })),
      returnType: z.string().min(1),
      returnDescription: z.string().min(1),
      examples: z.array(z.string()),
      deprecated: z.boolean().optional()
    })),
    types: z.array(z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      properties: z.array(z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        description: z.string().min(1),
        readOnly: z.boolean().optional(),
        deprecated: z.boolean().optional()
      })),
      examples: z.array(z.string())
    }))
  }),
  examples: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    code: z.string().min(1),
    explanation: z.string().min(1),
    relatedMethods: z.array(z.string())
  })),
  rateLimiting: z.object({
    defaultLimits: z.array(z.object({
      operation: z.string().min(1),
      limit: z.number().positive(),
      window: z.string().min(1),
      description: z.string().min(1)
    })),
    quotaInformation: z.array(z.object({
      resource: z.string().min(1),
      limit: z.number().positive(),
      period: z.string().min(1),
      description: z.string().min(1)
    })),
    bestPractices: z.array(z.string()),
    errorHandling: z.array(z.object({
      errorCode: z.string().min(1),
      description: z.string().min(1),
      solution: z.string().min(1),
      example: z.string().min(1)
    }))
  }),
  changelog: z.array(z.object({
    version: z.string().min(1),
    date: z.string().min(1),
    changes: z.array(z.object({
      type: z.enum(['added', 'changed', 'deprecated', 'removed', 'fixed', 'security']),
      description: z.string().min(1),
      breaking: z.boolean().optional()
    }))
  }))
})