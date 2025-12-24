import React, { useState, useCallback } from 'react'
import { ConfigurationTemplate, UserPreferences } from '../../types/quickstart'
import { CONFIGURATION_TEMPLATES } from '../../data/configuration-templates'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface ConfigurationBuilderProps {
  selectedPlatforms: string[]
  userPreferences: UserPreferences
  onConfigurationGenerated?: (config: GeneratedConfiguration) => void
}

interface GeneratedConfiguration {
  template: ConfigurationTemplate
  customizedConfig: Record<string, unknown>
  exportFormats: ConfigurationExport[]
}

interface ConfigurationExport {
  format: string
  filename: string
  content: string
  language: string
}

interface ConfigurationForm {
  serviceName: string
  serviceVersion: string
  environment: string
  region: string
  samplingRate: number
  enableTracing: boolean
  enableMetrics: boolean
  enableLogs: boolean
  customSettings: Record<string, unknown>
}

const ConfigurationBuilder: React.FC<ConfigurationBuilderProps> = ({
  selectedPlatforms,
  userPreferences,
  onConfigurationGenerated
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigurationTemplate | null>(null)
  const [configForm, setConfigForm] = useState<ConfigurationForm>({
    serviceName: 'my-app',
    serviceVersion: '1.0.0',
    environment: userPreferences.environment,
    region: 'us-east-1',
    samplingRate: 0.1,
    enableTracing: true,
    enableMetrics: true,
    enableLogs: false,
    customSettings: {}
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfiguration | null>(null)

  // Filter templates based on selected platforms and use case
  const relevantTemplates = CONFIGURATION_TEMPLATES.filter(template => {
    const platformMatch = template.platforms.some(platform => 
      selectedPlatforms.includes(platform)
    )
    const useCaseMatch = template.useCase === userPreferences.useCase || 
                        template.useCase === 'monitoring' // Default fallback
    
    return platformMatch || useCaseMatch
  })

  const updateFormField = useCallback((field: keyof ConfigurationForm, value: unknown) => {
    setConfigForm(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [validationErrors])

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}

    if (!configForm.serviceName.trim()) {
      errors.serviceName = 'Service name is required'
    } else if (!/^[a-z0-9-]+$/.test(configForm.serviceName)) {
      errors.serviceName = 'Service name must be lowercase with hyphens only'
    }

    if (!configForm.serviceVersion.trim()) {
      errors.serviceVersion = 'Service version is required'
    }

    if (configForm.samplingRate < 0 || configForm.samplingRate > 1) {
      errors.samplingRate = 'Sampling rate must be between 0 and 1'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [configForm])

  const generateConfiguration = useCallback(() => {
    if (!selectedTemplate || !validateForm()) {
      return
    }

    // Merge template configuration with form values
    const customizedConfig = {
      ...selectedTemplate.configuration,
      serviceName: configForm.serviceName,
      serviceVersion: configForm.serviceVersion,
      environment: configForm.environment,
      region: configForm.region,
      samplingRate: configForm.samplingRate,
      enableTracing: configForm.enableTracing,
      enableMetrics: configForm.enableMetrics,
      enableLogs: configForm.enableLogs,
      ...configForm.customSettings
    }

    // Generate export formats for different platforms
    const exportFormats = generateExportFormats(customizedConfig, selectedPlatforms)

    const generated: GeneratedConfiguration = {
      template: selectedTemplate,
      customizedConfig,
      exportFormats
    }

    setGeneratedConfig(generated)
    onConfigurationGenerated?.(generated)
  }, [selectedTemplate, configForm, selectedPlatforms, validateForm, onConfigurationGenerated])

  const generateExportFormats = (config: Record<string, unknown>, platforms: string[]): ConfigurationExport[] => {
    const exports: ConfigurationExport[] = []

    // Environment variables format (universal)
    exports.push({
      format: 'Environment Variables',
      filename: '.env',
      language: 'bash',
      content: Object.entries(config)
        .map(([key, value]) => {
          const envKey = `CLOUDWATCH_APM_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
          return `${envKey}=${value}`
        })
        .join('\n')
    })

    // Java properties format
    if (platforms.some(p => ['java', 'spring-boot'].includes(p))) {
      exports.push({
        format: 'Java Properties',
        filename: 'application.properties',
        language: 'properties',
        content: Object.entries(config)
          .map(([key, value]) => {
            const propKey = `cloudwatch.apm.${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
            return `${propKey}=${value}`
          })
          .join('\n')
      })
    }

    // YAML format (for Spring Boot and Kubernetes)
    if (platforms.some(p => ['spring-boot', 'kubernetes'].includes(p))) {
      exports.push({
        format: 'YAML Configuration',
        filename: 'application.yml',
        language: 'yaml',
        content: generateYamlConfig(config)
      })
    }

    // JSON format (for Node.js)
    if (platforms.some(p => ['nodejs', 'express'].includes(p))) {
      exports.push({
        format: 'JSON Configuration',
        filename: 'apm-config.json',
        language: 'json',
        content: JSON.stringify(config, null, 2)
      })
    }

    // Docker Compose format
    if (platforms.includes('docker')) {
      exports.push({
        format: 'Docker Compose',
        filename: 'docker-compose.yml',
        language: 'yaml',
        content: generateDockerComposeConfig(config)
      })
    }

    // Kubernetes ConfigMap
    if (platforms.includes('kubernetes')) {
      exports.push({
        format: 'Kubernetes ConfigMap',
        filename: 'configmap.yaml',
        language: 'yaml',
        content: generateKubernetesConfigMap(config)
      })
    }

    return exports
  }

  const generateYamlConfig = (config: Record<string, unknown>): string => {
    const yamlLines = ['cloudwatch:', '  apm:']
    
    Object.entries(config).forEach(([key, value]) => {
      const yamlKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      yamlLines.push(`    ${yamlKey}: ${value}`)
    })
    
    return yamlLines.join('\n')
  }

  const generateDockerComposeConfig = (config: Record<string, unknown>): string => {
    const envVars = Object.entries(config)
      .map(([key, value]) => {
        const envKey = `CLOUDWATCH_APM_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
        return `      - ${envKey}=${value}`
      })
      .join('\n')

    return `version: '3.8'
services:
  app:
    image: \${APP_IMAGE}
    environment:
${envVars}
    ports:
      - "8080:8080"`
  }

  const generateKubernetesConfigMap = (config: Record<string, unknown>): string => {
    const dataEntries = Object.entries(config)
      .map(([key, value]) => {
        const envKey = `CLOUDWATCH_APM_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
        return `  ${envKey}: "${value}"`
      })
      .join('\n')

    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: cloudwatch-apm-config
  namespace: default
data:
${dataEntries}`
  }

  const downloadConfiguration = (exportFormat: ConfigurationExport) => {
    const blob = new Blob([exportFormat.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFormat.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (selectedPlatforms.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Platforms First
          </h3>
          <p className="text-gray-600">
            Choose your platforms to see relevant configuration templates
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card title="Choose Configuration Template">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`p-4 border rounded-lg text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <h4 className={`font-medium mb-2 ${
                selectedTemplate?.id === template.id ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {template.name}
              </h4>
              <p className={`text-sm ${
                selectedTemplate?.id === template.id ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {template.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {template.platforms.filter(p => selectedPlatforms.includes(p)).map(platform => (
                  <span
                    key={platform}
                    className={`px-2 py-1 rounded text-xs ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Configuration Form */}
      {selectedTemplate && (
        <Card title="Customize Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                id="serviceName"
                type="text"
                value={configForm.serviceName}
                onChange={(e) => updateFormField('serviceName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  validationErrors.serviceName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="my-app"
              />
              {validationErrors.serviceName && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.serviceName}</p>
              )}
            </div>

            <div>
              <label htmlFor="serviceVersion" className="block text-sm font-medium text-gray-700 mb-2">
                Service Version *
              </label>
              <input
                id="serviceVersion"
                type="text"
                value={configForm.serviceVersion}
                onChange={(e) => updateFormField('serviceVersion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  validationErrors.serviceVersion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1.0.0"
              />
              {validationErrors.serviceVersion && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.serviceVersion}</p>
              )}
            </div>

            <div>
              <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                id="environment"
                value={configForm.environment}
                onChange={(e) => updateFormField('environment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                AWS Region
              </label>
              <select
                id="region"
                value={configForm.region}
                onChange={(e) => updateFormField('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>

            <div>
              <label htmlFor="samplingRate" className="block text-sm font-medium text-gray-700 mb-2">
                Sampling Rate
              </label>
              <input
                id="samplingRate"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={configForm.samplingRate}
                onChange={(e) => updateFormField('samplingRate', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md ${
                  validationErrors.samplingRate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.samplingRate && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.samplingRate}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                0.1 = 10% of requests, 1.0 = 100% of requests
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Features
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center">
                  <input
                    id="enableTracing"
                    type="checkbox"
                    checked={configForm.enableTracing}
                    onChange={(e) => updateFormField('enableTracing', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enable Tracing</span>
                </label>
                <label className="flex items-center">
                  <input
                    id="enableMetrics"
                    type="checkbox"
                    checked={configForm.enableMetrics}
                    onChange={(e) => updateFormField('enableMetrics', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enable Metrics</span>
                </label>
                <label className="flex items-center">
                  <input
                    id="enableLogs"
                    type="checkbox"
                    checked={configForm.enableLogs}
                    onChange={(e) => updateFormField('enableLogs', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enable Logs</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={generateConfiguration} size="lg">
              Generate Configuration
            </Button>
          </div>
        </Card>
      )}

      {/* Generated Configuration */}
      {generatedConfig && (
        <Card title="Generated Configuration">
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                Configuration Generated Successfully!
              </h4>
              <p className="text-green-700 text-sm">
                Based on template: {generatedConfig.template.name}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedConfig.exportFormats.map(exportFormat => (
                <div key={exportFormat.format} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">
                      {exportFormat.format}
                    </h5>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(exportFormat.content)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => downloadConfiguration(exportFormat)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>{exportFormat.content}</code></pre>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    File: {exportFormat.filename}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ConfigurationBuilder