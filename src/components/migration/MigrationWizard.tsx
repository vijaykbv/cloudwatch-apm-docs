'use client'

import React, { useState, useCallback } from 'react'
import { APMSolution, ApplicationContext, MigrationPlan } from '../../types/migration'
import { APM_SOLUTIONS } from '../../data/apm-solutions'

interface MigrationWizardProps {
  onPlanGenerated?: (plan: MigrationPlan) => void
  className?: string
}

interface WizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'source-selection',
    title: 'Select Current APM',
    description: 'Choose your current APM solution',
    completed: false
  },
  {
    id: 'application-context',
    title: 'Application Details',
    description: 'Provide information about your application',
    completed: false
  },
  {
    id: 'migration-preferences',
    title: 'Migration Preferences',
    description: 'Configure migration approach and timeline',
    completed: false
  },
  {
    id: 'plan-generation',
    title: 'Generate Plan',
    description: 'Review and generate your migration plan',
    completed: false
  }
]

export const MigrationWizard: React.FC<MigrationWizardProps> = ({
  onPlanGenerated,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState(WIZARD_STEPS)
  const [selectedAPM, setSelectedAPM] = useState<APMSolution | null>(null)
  const [applicationContext, setApplicationContext] = useState<Partial<ApplicationContext>>({})
  const [migrationPreferences, setMigrationPreferences] = useState({
    approach: 'gradual' as 'gradual' | 'big-bang',
    timeline: 'flexible' as 'aggressive' | 'moderate' | 'flexible',
    riskTolerance: 'low' as 'low' | 'medium' | 'high'
  })
  const [generatedPlan, setGeneratedPlan] = useState<MigrationPlan | null>(null)

  const updateStepCompletion = useCallback((stepIndex: number, completed: boolean) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed } : step
    ))
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      updateStepCompletion(currentStep, true)
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length, updateStepCompletion])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const generateMigrationPlan = useCallback(() => {
    if (!selectedAPM || !applicationContext.language) return

    const plan: MigrationPlan = {
      id: `migration-${Date.now()}`,
      sourceAPM: selectedAPM.id,
      targetAPM: 'cloudwatch-apm',
      applicationContext: applicationContext as ApplicationContext,
      steps: [], // This would be populated based on the selected APM and context
      estimatedTotalTime: selectedAPM.estimatedMigrationTime,
      riskLevel: selectedAPM.migrationComplexity === 'low' ? 'low' : 
                selectedAPM.migrationComplexity === 'medium' ? 'medium' : 'high',
      rollbackPlan: [],
      validationChecklist: []
    }

    setGeneratedPlan(plan)
    updateStepCompletion(currentStep, true)
    onPlanGenerated?.(plan)
  }, [selectedAPM, applicationContext, currentStep, updateStepCompletion, onPlanGenerated])

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Current APM Solution</h3>
              <p className="text-gray-600 mb-6">
                Choose the APM solution you're currently using. This will help us create a tailored migration plan.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {APM_SOLUTIONS.map((apm) => (
                <div
                  key={apm.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAPM?.id === apm.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAPM(apm)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{apm.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{apm.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{apm.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Complexity: {apm.migrationComplexity}</span>
                        <span>Time: {apm.estimatedMigrationTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Application Details</h3>
              <p className="text-gray-600 mb-6">
                Tell us about your application to create a customized migration plan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Programming Language</label>
                <select
                  value={applicationContext.language || ''}
                  onChange={(e) => setApplicationContext(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select language</option>
                  <option value="java">Java</option>
                  <option value="nodejs">Node.js</option>
                  <option value="python">Python</option>
                  <option value="dotnet">.NET</option>
                  <option value="go">Go</option>
                  <option value="ruby">Ruby</option>
                  <option value="php">PHP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Framework (Optional)</label>
                <input
                  type="text"
                  value={applicationContext.framework || ''}
                  onChange={(e) => setApplicationContext(prev => ({ ...prev, framework: e.target.value }))}
                  placeholder="e.g., Spring Boot, Express, Django"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Infrastructure</label>
                <select
                  value={applicationContext.infrastructure || ''}
                  onChange={(e) => setApplicationContext(prev => ({ ...prev, infrastructure: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select infrastructure</option>
                  <option value="aws-ec2">AWS EC2</option>
                  <option value="aws-ecs">AWS ECS</option>
                  <option value="aws-eks">AWS EKS</option>
                  <option value="aws-lambda">AWS Lambda</option>
                  <option value="on-premises">On-premises</option>
                  <option value="other-cloud">Other Cloud Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Criticality</label>
                <select
                  value={applicationContext.businessCriticality || ''}
                  onChange={(e) => setApplicationContext(prev => ({ 
                    ...prev, 
                    businessCriticality: e.target.value as 'low' | 'medium' | 'high'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select criticality</option>
                  <option value="low">Low - Development/Testing</option>
                  <option value="medium">Medium - Important but not critical</option>
                  <option value="high">High - Business critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deployment Frequency</label>
                <select
                  value={applicationContext.deploymentFrequency || ''}
                  onChange={(e) => setApplicationContext(prev => ({ 
                    ...prev, 
                    deploymentFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current APM Features Used</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedAPM?.commonFeatures.map((feature) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={applicationContext.currentAPMFeatures?.includes(feature) || false}
                      onChange={(e) => {
                        const features = applicationContext.currentAPMFeatures || []
                        if (e.target.checked) {
                          setApplicationContext(prev => ({
                            ...prev,
                            currentAPMFeatures: [...features, feature]
                          }))
                        } else {
                          setApplicationContext(prev => ({
                            ...prev,
                            currentAPMFeatures: features.filter(f => f !== feature)
                          }))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Migration Preferences</h3>
              <p className="text-gray-600 mb-6">
                Configure your migration approach based on your requirements and constraints.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Migration Approach</label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="approach"
                      value="gradual"
                      checked={migrationPreferences.approach === 'gradual'}
                      onChange={(e) => setMigrationPreferences(prev => ({ 
                        ...prev, 
                        approach: e.target.value as 'gradual' | 'big-bang'
                      }))}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Gradual Migration</span>
                      <p className="text-sm text-gray-600">
                        Run both APM solutions in parallel, gradually transitioning monitoring responsibilities.
                        Lower risk but longer timeline.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="approach"
                      value="big-bang"
                      checked={migrationPreferences.approach === 'big-bang'}
                      onChange={(e) => setMigrationPreferences(prev => ({ 
                        ...prev, 
                        approach: e.target.value as 'gradual' | 'big-bang'
                      }))}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Big Bang Migration</span>
                      <p className="text-sm text-gray-600">
                        Switch completely to CloudWatch APM in a single deployment.
                        Faster but higher risk approach.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Timeline Preference</label>
                <div className="space-y-2">
                  {[
                    { value: 'aggressive', label: 'Aggressive', desc: 'Complete migration as quickly as possible' },
                    { value: 'moderate', label: 'Moderate', desc: 'Balance speed with risk management' },
                    { value: 'flexible', label: 'Flexible', desc: 'Take time needed to ensure smooth transition' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="timeline"
                        value={option.value}
                        checked={migrationPreferences.timeline === option.value}
                        onChange={(e) => setMigrationPreferences(prev => ({ 
                          ...prev, 
                          timeline: e.target.value as 'aggressive' | 'moderate' | 'flexible'
                        }))}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Risk Tolerance</label>
                <select
                  value={migrationPreferences.riskTolerance}
                  onChange={(e) => setMigrationPreferences(prev => ({ 
                    ...prev, 
                    riskTolerance: e.target.value as 'low' | 'medium' | 'high'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low - Minimize any risk of service disruption</option>
                  <option value="medium">Medium - Accept some risk for faster migration</option>
                  <option value="high">High - Willing to accept higher risk for speed</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Migration Plan Summary</h3>
              <p className="text-gray-600 mb-6">
                Review your selections and generate your customized migration plan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Source APM</h4>
                  <p className="text-gray-600">{selectedAPM?.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Target APM</h4>
                  <p className="text-gray-600">AWS CloudWatch APM</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Application</h4>
                  <p className="text-gray-600">
                    {applicationContext.language}
                    {applicationContext.framework && ` (${applicationContext.framework})`}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Infrastructure</h4>
                  <p className="text-gray-600">{applicationContext.infrastructure}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Approach</h4>
                  <p className="text-gray-600">
                    {migrationPreferences.approach === 'gradual' ? 'Gradual Migration' : 'Big Bang Migration'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Estimated Time</h4>
                  <p className="text-gray-600">{selectedAPM?.estimatedMigrationTime}</p>
                </div>
              </div>
            </div>

            {generatedPlan ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium text-green-800">Migration Plan Generated</span>
                </div>
                <p className="text-green-700 mt-1">
                  Your customized migration plan has been created and is ready for review.
                </p>
              </div>
            ) : (
              <button
                onClick={generateMigrationPlan}
                disabled={!selectedAPM || !applicationContext.language}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Generate Migration Plan
              </button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedAPM !== null
      case 1:
        return applicationContext.language && applicationContext.infrastructure && applicationContext.businessCriticality
      case 2:
        return true
      case 3:
        return generatedPlan !== null
      default:
        return false
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : step.completed
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => {/* Handle completion */}}
            disabled={!generatedPlan}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  )
}