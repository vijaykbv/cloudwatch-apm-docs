import React from 'react'
import { WizardStep } from '../../types/quickstart'

interface ProgressTrackerProps {
  steps: WizardStep[]
  currentStep: number
  completedSteps: string[]
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
  completedSteps
}) => {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completedSteps.length} of {steps.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedSteps.length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = index === currentStep
          const isPast = index < currentStep
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : isPast 
                      ? 'bg-gray-400 text-white'
                      : 'bg-gray-200 text-gray-600'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step title */}
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
                {step.isOptional && (
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                )}
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute top-5 left-1/2 w-full h-0.5 -z-10
                  ${isPast || (isCurrent && isCompleted) ? 'bg-blue-500' : 'bg-gray-200'}
                `} style={{ 
                  transform: 'translateX(50%)',
                  width: `calc(100% / ${steps.length} - 2.5rem)`
                }} />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Current step description */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {steps[currentStep]?.description}
        </p>
      </div>
    </div>
  )
}

export default ProgressTracker