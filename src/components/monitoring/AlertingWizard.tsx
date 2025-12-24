'use client'

import React, { useState, useCallback } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  AlertConfiguration,
  AlertingWizardStep,
  MetricDefinition,
  AlertThreshold,
  NotificationConfiguration,
  ValidationRule
} from '../../types/monitoring'
import { alertingWizardSteps, performanceMetrics } from '../../data/monitoring-data'

interface AlertingWizardProps {
  onAlertCreated?: (alert: AlertConfiguration) => void
  onCancel?: () => void
}

interface WizardState {
  currentStep: string
  alertConfig: Partial<AlertConfiguration>
  validationErrors: Record<string, string>
}

export function AlertingWizard({ onAlertCreated, onCancel }: AlertingWizardProps) {
  const [state, setState] = useState<WizardState>({
    currentStep: 'metric_selection',
    alertConfig: {
      enabled: true,
      notifications: [],
      actions: [],
      tags: {}
    },
    validationErrors: {}
  })

  const currentStepData = alertingWizardSteps.find(step => step.id === state.currentStep)
  const currentStepIndex = alertingWizardSteps.findIndex(step => step.id === state.currentStep)

  const validateStep = useCallback((step: AlertingWizardStep, config: Partial<AlertConfiguration>): Record<string, string> => {
    const errors: Record<string, string> = {}

    step.validation.forEach(rule => {
      const value = getNestedValue(config, rule.field)
      
      if (rule.type === 'required' && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors[rule.field] = rule.message
      } else if (rule.type === 'custom' && rule.validator && !rule.validator(value)) {
        errors[rule.field] = rule.message
      }
    })

    return errors
  }, [])

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
    return { ...obj }
  }

  const handleNext = useCallback(() => {
    if (!currentStepData) return

    const errors = validateStep(currentStepData, state.alertConfig)
    
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }))
      return
    }

    if (currentStepData.nextStep) {
      setState(prev => ({
        ...prev,
        currentStep: currentStepData.nextStep!,
        validationErrors: {}
      }))
    } else {
      // Final step - create the alert
      handleCreateAlert()
    }
  }, [currentStepData, state.alertConfig, validateStep])

  const handlePrevious = useCallback(() => {
    if (currentStepData?.previousStep) {
      setState(prev => ({
        ...prev,
        currentStep: currentStepData.previousStep!,
        validationErrors: {}
      }))
    }
  }, [currentStepData])

  const handleCreateAlert = useCallback(() => {
    const alert: AlertConfiguration = {
      id: `alert_${Date.now()}`,
      name: state.alertConfig.name || 'Unnamed Alert',
      description: state.alertConfig.description || '',
      metric: state.alertConfig.metric || '',
      threshold: state.alertConfig.threshold || {
        condition: 'greater_than',
        value: 0,
        duration: '5m',
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        treatMissingData: 'notBreaching'
      },
      notifications: state.alertConfig.notifications || [],
      actions: state.alertConfig.actions || [],
      tags: state.alertConfig.tags || {},
      enabled: state.alertConfig.enabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onAlertCreated?.(alert)
  }, [state.alertConfig, onAlertCreated])

  const updateAlertConfig = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      alertConfig: setNestedValue(prev.alertConfig, field, value),
      validationErrors: { ...prev.validationErrors, [field]: '' }
    }))
  }, [])

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'metric_selection':
        return <MetricSelector 
          selectedMetric={state.alertConfig.metric}
          onMetricSelect={(metric) => updateAlertConfig('metric', metric)}
          error={state.validationErrors.metric}
        />
      
      case 'threshold_configuration':
        return <ThresholdConfiguration
          threshold={state.alertConfig.threshold}
          onThresholdChange={(threshold) => updateAlertConfig('threshold', threshold)}
          errors={state.validationErrors}
        />
      
      case 'notification_setup':
        return <NotificationSetup
          notifications={state.alertConfig.notifications || []}
          onNotificationsChange={(notifications) => updateAlertConfig('notifications', notifications)}
          error={state.validationErrors.notifications}
        />
      
      case 'review_and_create':
        return <AlertReview
          alertConfig={state.alertConfig}
          onNameChange={(name) => updateAlertConfig('name', name)}
          onDescriptionChange={(description) => updateAlertConfig('description', description)}
          error={state.validationErrors.name}
        />
      
      default:
        return <div>Unknown step</div>
    }
  }

  if (!currentStepData) {
    return <div>Invalid step</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Alert</h1>
        <p className="text-gray-600">Set up monitoring alerts to stay informed about your application's health</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {alertingWizardSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStepIndex 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              <div className="ml-2 text-sm">
                <div className={`font-medium ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              </div>
              {index < alertingWizardSteps.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-4
                  ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentStepData.title}</h2>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>
          
          {renderStepContent()}
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <div>
          {currentStepData.previousStep && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="ml-2">
              Cancel
            </Button>
          )}
        </div>
        
        <Button onClick={handleNext}>
          {currentStepData.nextStep ? 'Next' : 'Create Alert'}
        </Button>
      </div>
    </div>
  )
}

// Step components
function MetricSelector({ selectedMetric, onMetricSelect, error }: {
  selectedMetric?: string
  onMetricSelect: (metric: string) => void
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Metric to Monitor
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performanceMetrics.map(metric => (
          <div
            key={metric.id}
            className={`
              p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedMetric === metric.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => onMetricSelect(metric.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{metric.displayName}</h3>
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${metric.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  metric.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  metric.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }
              `}>
                {metric.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
            <div className="text-xs text-gray-500">
              Unit: {metric.unit} | Namespace: {metric.namespace}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function ThresholdConfiguration({ threshold, onThresholdChange, errors }: {
  threshold?: AlertThreshold
  onThresholdChange: (threshold: AlertThreshold) => void
  errors: Record<string, string>
}) {
  const updateThreshold = (field: keyof AlertThreshold, value: any) => {
    const updated = { ...threshold, [field]: value } as AlertThreshold
    onThresholdChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            value={threshold?.condition || 'greater_than'}
            onChange={(e) => updateThreshold('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="greater_than">Greater than</option>
            <option value="less_than">Less than</option>
            <option value="equal_to">Equal to</option>
            <option value="not_equal_to">Not equal to</option>
          </select>
          {errors['threshold.condition'] && (
            <p className="mt-1 text-sm text-red-600">{errors['threshold.condition']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Threshold Value
          </label>
          <Input
            type="number"
            value={threshold?.value || ''}
            onChange={(e) => updateThreshold('value', parseFloat(e.target.value))}
            placeholder="Enter threshold value"
          />
          {errors['threshold.value'] && (
            <p className="mt-1 text-sm text-red-600">{errors['threshold.value']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={threshold?.duration || '5m'}
            onChange={(e) => updateThreshold('duration', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">1 minute</option>
            <option value="5m">5 minutes</option>
            <option value="10m">10 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="30m">30 minutes</option>
            <option value="1h">1 hour</option>
          </select>
          {errors['threshold.duration'] && (
            <p className="mt-1 text-sm text-red-600">{errors['threshold.duration']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evaluation Periods
          </label>
          <Input
            type="number"
            min="1"
            max="10"
            value={threshold?.evaluationPeriods || 1}
            onChange={(e) => updateThreshold('evaluationPeriods', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}

function NotificationSetup({ notifications, onNotificationsChange, error }: {
  notifications: NotificationConfiguration[]
  onNotificationsChange: (notifications: NotificationConfiguration[]) => void
  error?: string
}) {
  const addNotification = () => {
    const newNotification: NotificationConfiguration = {
      type: 'email',
      target: '',
      enabled: true,
      conditions: [
        { state: 'alarm', enabled: true },
        { state: 'ok', enabled: false }
      ]
    }
    onNotificationsChange([...notifications, newNotification])
  }

  const updateNotification = (index: number, field: keyof NotificationConfiguration, value: any) => {
    const updated = [...notifications]
    updated[index] = { ...updated[index], [field]: value }
    onNotificationsChange(updated)
  }

  const removeNotification = (index: number) => {
    const updated = notifications.filter((_, i) => i !== index)
    onNotificationsChange(updated)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Notification Methods</h3>
        <Button variant="outline" onClick={addNotification}>
          Add Notification
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notifications configured. Add at least one notification method.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={notification.type}
                    onChange={(e) => updateNotification(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="slack">Slack</option>
                    <option value="webhook">Webhook</option>
                    <option value="sns">SNS Topic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target
                  </label>
                  <Input
                    value={notification.target}
                    onChange={(e) => updateNotification(index, 'target', e.target.value)}
                    placeholder={
                      notification.type === 'email' ? 'email@example.com' :
                      notification.type === 'slack' ? '#channel-name' :
                      notification.type === 'webhook' ? 'https://...' :
                      'Target identifier'
                    }
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => removeNotification(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function AlertReview({ alertConfig, onNameChange, onDescriptionChange, error }: {
  alertConfig: Partial<AlertConfiguration>
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
  error?: string
}) {
  const selectedMetric = performanceMetrics.find(m => m.id === alertConfig.metric)

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alert Name *
        </label>
        <Input
          value={alertConfig.name || ''}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter a descriptive name for this alert"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={alertConfig.description || ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description for this alert"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Configuration Summary</h3>
        
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Metric:</span>
            <span className="ml-2 text-gray-900">{selectedMetric?.displayName || 'Unknown'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Condition:</span>
            <span className="ml-2 text-gray-900">
              {alertConfig.threshold?.condition?.replace('_', ' ')} {alertConfig.threshold?.value}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <span className="ml-2 text-gray-900">{alertConfig.threshold?.duration}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Notifications:</span>
            <span className="ml-2 text-gray-900">
              {alertConfig.notifications?.length || 0} configured
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}