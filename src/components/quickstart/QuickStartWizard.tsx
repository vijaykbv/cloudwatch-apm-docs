import React, { useState, useCallback } from 'react'
import { Platform, QuickStartProgress, UserPreferences, WizardStep } from '../../types/quickstart'
import Button from '../ui/Button'
import Card from '../ui/Card'
import PlatformSelector from './PlatformSelector'
import ProgressTracker from './ProgressTracker'
import VerificationTools from './VerificationTools'

interface QuickStartWizardProps {
  platforms: Platform[]
  onComplete?: (progress: QuickStartProgress) => void
  onStepChange?: (step: number) => void
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'preferences',
    title: 'Tell us about your setup',
    description: 'Help us customize the experience for you',
    component: 'UserPreferencesStep',
    isCompleted: false
  },
  {
    id: 'platform',
    title: 'Select your platform',
    description: 'Choose the technologies you\'re using',
    component: 'PlatformSelector',
    isCompleted: false
  },
  {
    id: 'installation',
    title: 'Install CloudWatch APM',
    description: 'Follow the installation steps for your platform',
    component: 'InstallationGuide',
    isCompleted: false
  },
  {
    id: 'verification',
    title: 'Verify your setup',
    description: 'Confirm everything is working correctly',
    component: 'VerificationTools',
    isCompleted: false
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    description: 'Your CloudWatch APM setup is complete',
    component: 'CompletionStep',
    isCompleted: false
  }
]

const QuickStartWizard: React.FC<QuickStartWizardProps> = ({
  platforms,
  onComplete,
  onStepChange
}) => {
  const [progress, setProgress] = useState<QuickStartProgress>({
    currentStep: 0,
    completedSteps: [],
    selectedPlatforms: [],
    userPreferences: {
      experience: 'beginner',
      useCase: 'monitoring',
      environment: 'development'
    }
  })

  const [steps, setSteps] = useState<WizardStep[]>(WIZARD_STEPS)

  const updateProgress = useCallback((updates: Partial<QuickStartProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }))
  }, [])

  const completeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, isCompleted: true } : step
    ))
    
    setProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }))
  }, [])

  const goToNextStep = useCallback(() => {
    const nextStep = Math.min(progress.currentStep + 1, steps.length - 1)
    setProgress(prev => ({ ...prev, currentStep: nextStep }))
    onStepChange?.(nextStep)
  }, [progress.currentStep, steps.length, onStepChange])

  const goToPreviousStep = useCallback(() => {
    const prevStep = Math.max(progress.currentStep - 1, 0)
    setProgress(prev => ({ ...prev, currentStep: prevStep }))
    onStepChange?.(prevStep)
  }, [progress.currentStep, onStepChange])

  const handleComplete = useCallback(() => {
    onComplete?.(progress)
  }, [progress, onComplete])

  const currentStep = steps[progress.currentStep]
  const isLastStep = progress.currentStep === steps.length - 1
  const canProceed = progress.completedSteps.includes(currentStep.id) || currentStep.isOptional

  const renderStepContent = () => {
    switch (currentStep.component) {
      case 'UserPreferencesStep':
        return (
          <UserPreferencesStep
            preferences={progress.userPreferences}
            onUpdate={(preferences) => {
              updateProgress({ userPreferences: preferences })
              completeStep('preferences')
            }}
          />
        )
      
      case 'PlatformSelector':
        return (
          <PlatformSelector
            platforms={platforms}
            selectedPlatforms={progress.selectedPlatforms}
            onSelectionChange={(selectedPlatforms) => {
              updateProgress({ selectedPlatforms })
              if (selectedPlatforms.length > 0) {
                completeStep('platform')
              }
            }}
          />
        )
      
      case 'InstallationGuide':
        return (
          <InstallationGuide
            platforms={platforms.filter(p => progress.selectedPlatforms.includes(p.id))}
            userPreferences={progress.userPreferences}
            onComplete={() => completeStep('installation')}
          />
        )
      
      case 'VerificationTools':
        return (
          <VerificationTools
            platforms={platforms.filter(p => progress.selectedPlatforms.includes(p.id))}
            onVerificationComplete={() => completeStep('verification')}
          />
        )
      
      case 'CompletionStep':
        return (
          <CompletionStep
            progress={progress}
            onComplete={handleComplete}
          />
        )
      
      default:
        return <div>Step not implemented</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CloudWatch APM Quick Start
        </h1>
        <p className="text-lg text-gray-600">
          Get up and running with CloudWatch APM in just a few steps
        </p>
      </div>

      <ProgressTracker
        steps={steps}
        currentStep={progress.currentStep}
        completedSteps={progress.completedSteps}
      />

      <Card className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentStep.title}
          </h2>
          <p className="text-gray-600">
            {currentStep.description}
          </p>
        </div>

        <div className="mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={progress.currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-4">
            {!isLastStep && (
              <Button
                onClick={goToNextStep}
                disabled={!canProceed}
              >
                {canProceed ? 'Next' : 'Complete this step first'}
              </Button>
            )}
            
            {isLastStep && (
              <Button
                onClick={handleComplete}
                variant="primary"
              >
                Finish Setup
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

// Step Components
interface UserPreferencesStepProps {
  preferences: UserPreferences
  onUpdate: (preferences: UserPreferences) => void
}

const UserPreferencesStep: React.FC<UserPreferencesStepProps> = ({
  preferences,
  onUpdate
}) => {
  const handleChange = (field: keyof UserPreferences, value: string) => {
    onUpdate({ ...preferences, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your experience level?
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
            <button
              key={level}
              onClick={() => handleChange('experience', level)}
              className={`p-4 border rounded-lg text-center ${
                preferences.experience === level
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium capitalize">{level}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your primary use case?
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(['monitoring', 'debugging', 'performance', 'alerting'] as const).map(useCase => (
            <button
              key={useCase}
              onClick={() => handleChange('useCase', useCase)}
              className={`p-4 border rounded-lg text-center ${
                preferences.useCase === useCase
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium capitalize">{useCase}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What environment are you setting up?
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(['development', 'staging', 'production'] as const).map(env => (
            <button
              key={env}
              onClick={() => handleChange('environment', env)}
              className={`p-4 border rounded-lg text-center ${
                preferences.environment === env
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium capitalize">{env}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface InstallationGuideProps {
  platforms: Platform[]
  userPreferences: UserPreferences
  onComplete: () => void
}

const InstallationGuide: React.FC<InstallationGuideProps> = ({
  platforms,
  userPreferences,
  onComplete
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const allStepsCompleted = platforms.every(platform =>
    platform.installationSteps.every(step =>
      step.isOptional || completedSteps.has(`${platform.id}-${step.id}`)
    )
  )

  React.useEffect(() => {
    if (allStepsCompleted && platforms.length > 0) {
      onComplete()
    }
  }, [allStepsCompleted, platforms.length, onComplete])

  return (
    <div className="space-y-6">
      {platforms.map(platform => (
        <div key={platform.id} className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">{platform.icon}</span>
            {platform.name}
          </h3>
          
          {platform.prerequisites.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Prerequisites:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {platform.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {platform.installationSteps.map(step => {
              const stepKey = `${platform.id}-${step.id}`
              const isCompleted = completedSteps.has(stepKey)
              
              return (
                <div key={step.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {step.title}
                        {step.isOptional && (
                          <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                        )}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      
                      {step.code && (
                        <div className="mt-2">
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            <code>{step.code}</code>
                          </pre>
                        </div>
                      )}
                      
                      {step.notes && step.notes.length > 0 && (
                        <div className="mt-2">
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {step.notes.map((note, index) => (
                              <li key={index}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => toggleStepCompletion(stepKey)}
                      className={`ml-4 px-3 py-1 rounded text-sm ${
                        isCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isCompleted ? '✓ Done' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

interface CompletionStepProps {
  progress: QuickStartProgress
  onComplete: () => void
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  progress,
  onComplete
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Congratulations!
        </h3>
        <p className="text-gray-600">
          You've successfully set up CloudWatch APM for your {progress.selectedPlatforms.join(', ')} environment.
        </p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">What's Next?</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Start monitoring your application performance</li>
          <li>• Set up custom dashboards and alerts</li>
          <li>• Explore advanced configuration options</li>
          <li>• Check out our troubleshooting guides</li>
        </ul>
      </div>
      
      <Button onClick={onComplete} size="lg">
        Go to Documentation
      </Button>
    </div>
  )
}

export default QuickStartWizard