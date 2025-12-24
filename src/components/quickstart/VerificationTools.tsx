import React, { useState } from 'react'
import { Platform, VerificationStep } from '../../types/quickstart'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface VerificationToolsProps {
  platforms: Platform[]
  onVerificationComplete: () => void
}

interface VerificationResult {
  stepId: string
  status: 'pending' | 'success' | 'error'
  message?: string
  output?: string
}

const VerificationTools: React.FC<VerificationToolsProps> = ({
  platforms,
  onVerificationComplete
}) => {
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({})
  const [isRunningVerification, setIsRunningVerification] = useState(false)

  const runVerification = async (platform: Platform, step: VerificationStep) => {
    const stepKey = `${platform.id}-${step.id}`
    
    setVerificationResults(prev => ({
      ...prev,
      [stepKey]: { stepId: step.id, status: 'pending' }
    }))

    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate random success/failure for demo purposes
    const isSuccess = Math.random() > 0.3
    
    setVerificationResults(prev => ({
      ...prev,
      [stepKey]: {
        stepId: step.id,
        status: isSuccess ? 'success' : 'error',
        message: isSuccess 
          ? 'Verification completed successfully'
          : 'Verification failed - check your configuration',
        output: step.expectedOutput || 'CloudWatch APM agent is running correctly'
      }
    }))
  }

  const runAllVerifications = async () => {
    setIsRunningVerification(true)
    
    for (const platform of platforms) {
      for (const step of platform.verificationSteps) {
        await runVerification(platform, step)
      }
    }
    
    setIsRunningVerification(false)
    
    // Check if all verifications passed
    const allResults = Object.values(verificationResults)
    const allPassed = allResults.every(result => result.status === 'success')
    
    if (allPassed && allResults.length > 0) {
      onVerificationComplete()
    }
  }

  const getStepResult = (platformId: string, stepId: string) => {
    return verificationResults[`${platformId}-${stepId}`]
  }

  const allVerificationsPassed = platforms.every(platform =>
    platform.verificationSteps.every(step => {
      const result = getStepResult(platform.id, step.id)
      return result?.status === 'success'
    })
  )

  React.useEffect(() => {
    if (allVerificationsPassed && Object.keys(verificationResults).length > 0) {
      onVerificationComplete()
    }
  }, [allVerificationsPassed, verificationResults, onVerificationComplete])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Let's verify that CloudWatch APM is properly installed and configured.
        </p>
        
        <Button
          onClick={runAllVerifications}
          disabled={isRunningVerification}
          size="lg"
        >
          {isRunningVerification ? 'Running Verification...' : 'Run All Verifications'}
        </Button>
      </div>

      {platforms.map(platform => (
        <Card key={platform.id} title={`${platform.icon} ${platform.name} Verification`}>
          <div className="space-y-4">
            {platform.verificationSteps.map(step => {
              const result = getStepResult(platform.id, step.id)
              
              return (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {step.description}
                      </p>
                      
                      {step.command && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Command:</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {step.command}
                          </code>
                        </div>
                      )}
                      
                      {step.expectedOutput && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Expected output:</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {step.expectedOutput}
                          </code>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runVerification(platform, step)}
                        disabled={isRunningVerification}
                      >
                        {result?.status === 'pending' ? 'Running...' : 'Verify'}
                      </Button>
                      
                      {result && (
                        <div className={`flex items-center space-x-1 text-sm ${
                          result.status === 'success' 
                            ? 'text-green-600' 
                            : result.status === 'error'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                        }`}>
                          {result.status === 'success' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {result.status === 'error' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {result.status === 'pending' && (
                            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>{result.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {result?.output && result.status !== 'pending' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">Output:</p>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {result.output}
                      </pre>
                    </div>
                  )}
                  
                  {result?.status === 'error' && step.troubleshooting && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        Troubleshooting Tips:
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {step.troubleshooting.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ))}

      {allVerificationsPassed && Object.keys(verificationResults).length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                All Verifications Passed!
              </h3>
              <p className="text-green-700">
                CloudWatch APM is properly installed and configured on all selected platforms.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default VerificationTools