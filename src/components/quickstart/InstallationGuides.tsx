import React, { useState } from 'react'
import { Platform } from '../../types/quickstart'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface InstallationGuidesProps {
  platforms: Platform[]
  selectedPlatform?: string
  onPlatformSelect?: (platformId: string) => void
}

interface PrerequisiteCheck {
  prerequisite: string
  isChecked: boolean
  isValid?: boolean
  notes?: string
}

const InstallationGuides: React.FC<InstallationGuidesProps> = ({
  platforms,
  selectedPlatform,
  onPlatformSelect
}) => {
  const [prerequisiteChecks, setPrerequisiteChecks] = useState<Record<string, PrerequisiteCheck[]>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const initializePrerequisites = (platform: Platform) => {
    if (!prerequisiteChecks[platform.id]) {
      setPrerequisiteChecks(prev => ({
        ...prev,
        [platform.id]: platform.prerequisites.map(prereq => ({
          prerequisite: prereq,
          isChecked: false
        }))
      }))
    }
  }

  const updatePrerequisiteCheck = (platformId: string, index: number, updates: Partial<PrerequisiteCheck>) => {
    setPrerequisiteChecks(prev => ({
      ...prev,
      [platformId]: prev[platformId]?.map((check, i) => 
        i === index ? { ...check, ...updates } : check
      ) || []
    }))
  }

  const toggleStepCompletion = (stepKey: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepKey)) {
        newSet.delete(stepKey)
      } else {
        newSet.add(stepKey)
      }
      return newSet
    })
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const getPrerequisiteStatus = (platformId: string) => {
    const checks = prerequisiteChecks[platformId] || []
    const checkedCount = checks.filter(check => check.isChecked).length
    const validCount = checks.filter(check => check.isValid).length
    return { total: checks.length, checked: checkedCount, valid: validCount }
  }

  const canProceedWithInstallation = (platformId: string) => {
    const status = getPrerequisiteStatus(platformId)
    return status.checked === status.total && status.valid === status.total
  }

  React.useEffect(() => {
    platforms.forEach(platform => {
      initializePrerequisites(platform)
      if (selectedPlatform === platform.id) {
        setExpandedSections(prev => new Set([...prev, `prereq-${platform.id}`, `install-${platform.id}`]))
      }
    })
  }, [platforms, selectedPlatform])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Installation Guides
        </h2>
        <p className="text-gray-600">
          Step-by-step installation instructions for your selected platforms
        </p>
      </div>

      {platforms.map(platform => {
        const prerequisiteStatus = getPrerequisiteStatus(platform.id)
        const canProceed = canProceedWithInstallation(platform.id)
        const isSelected = selectedPlatform === platform.id
        
        return (
          <Card key={platform.id} className={isSelected ? 'border-blue-500 shadow-lg' : ''}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{platform.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {platform.name}
                  </h3>
                  <p className="text-gray-600">{platform.description}</p>
                </div>
              </div>
              
              {onPlatformSelect && (
                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  onClick={() => onPlatformSelect(platform.id)}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              )}
            </div>

            {/* Prerequisites Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection(`prereq-${platform.id}`)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">Prerequisites</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    prerequisiteStatus.valid === prerequisiteStatus.total && prerequisiteStatus.total > 0
                      ? 'bg-green-100 text-green-800'
                      : prerequisiteStatus.checked > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {prerequisiteStatus.valid}/{prerequisiteStatus.total} verified
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${
                    expandedSections.has(`prereq-${platform.id}`) ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedSections.has(`prereq-${platform.id}`) && (
                <div className="mt-4 space-y-3">
                  {platform.prerequisites.map((prereq, index) => {
                    const check = prerequisiteChecks[platform.id]?.[index]
                    
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{prereq}</p>
                          {check?.notes && (
                            <p className="text-xs text-gray-600 mt-1">{check.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updatePrerequisiteCheck(platform.id, index, { 
                              isChecked: true, 
                              isValid: true 
                            })}
                            className={`px-3 py-1 rounded text-xs ${
                              check?.isValid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                            }`}
                          >
                            ✓ Have it
                          </button>
                          
                          <button
                            onClick={() => updatePrerequisiteCheck(platform.id, index, { 
                              isChecked: true, 
                              isValid: false,
                              notes: 'Need to install this first'
                            })}
                            className={`px-3 py-1 rounded text-xs ${
                              check?.isChecked && !check?.isValid
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            ✗ Need this
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  {!canProceed && prerequisiteStatus.checked === prerequisiteStatus.total && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Please install the missing prerequisites before proceeding with installation.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Installation Steps Section */}
            <div>
              <button
                onClick={() => toggleSection(`install-${platform.id}`)}
                className={`flex items-center justify-between w-full p-3 rounded-lg ${
                  canProceed 
                    ? 'bg-blue-50 hover:bg-blue-100' 
                    : 'bg-gray-50 hover:bg-gray-100 opacity-75'
                }`}
                disabled={!canProceed}
              >
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">Installation Steps</h4>
                  {!canProceed && (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">
                      Complete prerequisites first
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${
                    expandedSections.has(`install-${platform.id}`) ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedSections.has(`install-${platform.id}`) && canProceed && (
                <div className="mt-4 space-y-4">
                  {platform.installationSteps.map((step, stepIndex) => {
                    const stepKey = `${platform.id}-${step.id}`
                    const isCompleted = completedSteps.has(stepKey)
                    
                    return (
                      <div key={step.id} className={`border rounded-lg p-4 ${
                        isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted 
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isCompleted ? '✓' : stepIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {step.title}
                                {step.isOptional && (
                                  <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => toggleStepCompletion(stepKey)}
                            className={`px-3 py-1 rounded text-sm ${
                              isCompleted
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isCompleted ? 'Completed' : 'Mark Done'}
                          </button>
                        </div>
                        
                        {step.code && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {step.language || 'Code'}
                              </span>
                              <button
                                onClick={() => navigator.clipboard.writeText(step.code!)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>{step.code}</code>
                            </pre>
                          </div>
                        )}
                        
                        {step.notes && step.notes.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-800 mb-1">Notes:</p>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {step.notes.map((note, noteIndex) => (
                                <li key={noteIndex} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">Next Steps</h5>
                    <p className="text-sm text-green-700">
                      Once you've completed all installation steps, proceed to the verification section 
                      to ensure everything is working correctly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default InstallationGuides