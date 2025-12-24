import React, { useState, useEffect } from 'react'
import { Platform } from '../../types/quickstart'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface SystemRequirement {
  id: string
  name: string
  description: string
  checkCommand?: string
  expectedPattern?: RegExp
  isRequired: boolean
  platforms: string[]
}

interface RequirementCheck {
  requirement: SystemRequirement
  status: 'unchecked' | 'checking' | 'passed' | 'failed'
  result?: string
  message?: string
}

const SYSTEM_REQUIREMENTS: SystemRequirement[] = [
  {
    id: 'java-version',
    name: 'Java Version',
    description: 'Java 8 or higher required',
    checkCommand: 'java -version',
    expectedPattern: /version "([0-9]+)\.([0-9]+)/,
    isRequired: true,
    platforms: ['java', 'spring-boot']
  },
  {
    id: 'node-version',
    name: 'Node.js Version',
    description: 'Node.js 14 or higher required',
    checkCommand: 'node --version',
    expectedPattern: /v([0-9]+)\.([0-9]+)/,
    isRequired: true,
    platforms: ['nodejs', 'express']
  },
  {
    id: 'python-version',
    name: 'Python Version',
    description: 'Python 3.7 or higher required',
    checkCommand: 'python --version',
    expectedPattern: /Python ([0-9]+)\.([0-9]+)/,
    isRequired: true,
    platforms: ['python']
  },
  {
    id: 'docker-version',
    name: 'Docker',
    description: 'Docker engine for containerized deployments',
    checkCommand: 'docker --version',
    expectedPattern: /Docker version ([0-9]+)\.([0-9]+)/,
    isRequired: true,
    platforms: ['docker']
  },
  {
    id: 'kubectl-version',
    name: 'kubectl',
    description: 'Kubernetes command-line tool',
    checkCommand: 'kubectl version --client',
    expectedPattern: /GitVersion:"v([0-9]+)\.([0-9]+)/,
    isRequired: true,
    platforms: ['kubernetes']
  },
  {
    id: 'aws-cli',
    name: 'AWS CLI',
    description: 'AWS Command Line Interface for authentication',
    checkCommand: 'aws --version',
    expectedPattern: /aws-cli\/([0-9]+)\.([0-9]+)/,
    isRequired: false,
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express', 'docker', 'kubernetes']
  },
  {
    id: 'maven',
    name: 'Maven',
    description: 'Apache Maven build tool',
    checkCommand: 'mvn --version',
    expectedPattern: /Apache Maven ([0-9]+)\.([0-9]+)/,
    isRequired: false,
    platforms: ['java', 'spring-boot']
  },
  {
    id: 'gradle',
    name: 'Gradle',
    description: 'Gradle build tool',
    checkCommand: 'gradle --version',
    expectedPattern: /Gradle ([0-9]+)\.([0-9]+)/,
    isRequired: false,
    platforms: ['java', 'spring-boot']
  },
  {
    id: 'npm',
    name: 'npm',
    description: 'Node Package Manager',
    checkCommand: 'npm --version',
    expectedPattern: /([0-9]+)\.([0-9]+)/,
    isRequired: false,
    platforms: ['nodejs', 'express']
  },
  {
    id: 'pip',
    name: 'pip',
    description: 'Python Package Installer',
    checkCommand: 'pip --version',
    expectedPattern: /pip ([0-9]+)\.([0-9]+)/,
    isRequired: false,
    platforms: ['python']
  }
]

interface SystemRequirementsProps {
  selectedPlatforms: string[]
  onRequirementsCheck?: (results: RequirementCheck[]) => void
}

const SystemRequirements: React.FC<SystemRequirementsProps> = ({
  selectedPlatforms,
  onRequirementsCheck
}) => {
  const [checks, setChecks] = useState<RequirementCheck[]>([])
  const [isRunningChecks, setIsRunningChecks] = useState(false)

  const relevantRequirements = SYSTEM_REQUIREMENTS.filter(req =>
    req.platforms.some(platform => selectedPlatforms.includes(platform))
  )

  useEffect(() => {
    setChecks(relevantRequirements.map(req => ({
      requirement: req,
      status: 'unchecked'
    })))
  }, [selectedPlatforms])

  const simulateSystemCheck = async (requirement: SystemRequirement): Promise<{ passed: boolean; result: string; message: string }> => {
    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Simulate different outcomes based on requirement
    const outcomes = {
      'java-version': { passed: true, result: 'openjdk version "11.0.2"', message: 'Java 11 detected - compatible' },
      'node-version': { passed: true, result: 'v16.14.0', message: 'Node.js 16 detected - compatible' },
      'python-version': { passed: true, result: 'Python 3.9.7', message: 'Python 3.9 detected - compatible' },
      'docker-version': { passed: true, result: 'Docker version 20.10.12', message: 'Docker detected - compatible' },
      'kubectl-version': { passed: Math.random() > 0.3, result: 'GitVersion:"v1.23.0"', message: 'kubectl detected' },
      'aws-cli': { passed: Math.random() > 0.4, result: 'aws-cli/2.4.6', message: 'AWS CLI v2 detected' },
      'maven': { passed: Math.random() > 0.5, result: 'Apache Maven 3.8.4', message: 'Maven detected' },
      'gradle': { passed: Math.random() > 0.6, result: 'Gradle 7.3.3', message: 'Gradle detected' },
      'npm': { passed: true, result: '8.3.1', message: 'npm detected' },
      'pip': { passed: true, result: 'pip 21.3.1', message: 'pip detected' }
    }

    const outcome = outcomes[requirement.id as keyof typeof outcomes] || { 
      passed: false, 
      result: 'Command not found', 
      message: `${requirement.name} not found` 
    }

    return outcome
  }

  const runSingleCheck = async (index: number) => {
    const requirement = checks[index].requirement

    setChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status: 'checking' } : check
    ))

    try {
      const result = await simulateSystemCheck(requirement)
      
      setChecks(prev => prev.map((check, i) => 
        i === index ? {
          ...check,
          status: result.passed ? 'passed' : 'failed',
          result: result.result,
          message: result.message
        } : check
      ))
    } catch (error) {
      setChecks(prev => prev.map((check, i) => 
        i === index ? {
          ...check,
          status: 'failed',
          message: 'Failed to run system check'
        } : check
      ))
    }
  }

  const runAllChecks = async () => {
    setIsRunningChecks(true)
    
    for (let i = 0; i < checks.length; i++) {
      await runSingleCheck(i)
    }
    
    setIsRunningChecks(false)
    onRequirementsCheck?.(checks)
  }

  const getOverallStatus = () => {
    const requiredChecks = checks.filter(check => check.requirement.isRequired)
    const passedRequired = requiredChecks.filter(check => check.status === 'passed').length
    const failedRequired = requiredChecks.filter(check => check.status === 'failed').length
    
    const optionalChecks = checks.filter(check => !check.requirement.isRequired)
    const passedOptional = optionalChecks.filter(check => check.status === 'passed').length
    
    return {
      requiredTotal: requiredChecks.length,
      requiredPassed: passedRequired,
      requiredFailed: failedRequired,
      optionalTotal: optionalChecks.length,
      optionalPassed: passedOptional,
      allRequiredPassed: passedRequired === requiredChecks.length && failedRequired === 0
    }
  }

  const status = getOverallStatus()

  if (selectedPlatforms.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Platforms First
          </h3>
          <p className="text-gray-600">
            Choose your platforms to see relevant system requirements
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              System Requirements Check
            </h3>
            <p className="text-gray-600">
              Verify your system meets the requirements for selected platforms
            </p>
          </div>
          
          <Button
            onClick={runAllChecks}
            disabled={isRunningChecks}
            variant="primary"
          >
            {isRunningChecks ? 'Checking...' : 'Check All Requirements'}
          </Button>
        </div>

        {/* Overall Status */}
        {checks.some(check => check.status !== 'unchecked') && (
          <div className={`p-4 rounded-lg mb-6 ${
            status.allRequiredPassed 
              ? 'bg-green-50 border border-green-200'
              : status.requiredFailed > 0
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                status.allRequiredPassed 
                  ? 'bg-green-500'
                  : status.requiredFailed > 0
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`} />
              <h4 className={`font-medium ${
                status.allRequiredPassed 
                  ? 'text-green-800'
                  : status.requiredFailed > 0
                    ? 'text-red-800'
                    : 'text-yellow-800'
              }`}>
                {status.allRequiredPassed 
                  ? 'All Requirements Met'
                  : status.requiredFailed > 0
                    ? 'Missing Required Components'
                    : 'Checking Requirements...'
                }
              </h4>
            </div>
            <div className={`text-sm ${
              status.allRequiredPassed 
                ? 'text-green-700'
                : status.requiredFailed > 0
                  ? 'text-red-700'
                  : 'text-yellow-700'
            }`}>
              Required: {status.requiredPassed}/{status.requiredTotal} • 
              Optional: {status.optionalPassed}/{status.optionalTotal}
            </div>
          </div>
        )}

        {/* Requirements List */}
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div key={check.requirement.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900">
                      {check.requirement.name}
                    </h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      check.requirement.isRequired
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {check.requirement.isRequired ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {check.requirement.description}
                  </p>
                  
                  {check.requirement.checkCommand && (
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {check.requirement.checkCommand}
                    </code>
                  )}
                  
                  {check.result && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">Result: </span>
                      <code className="text-gray-800">{check.result}</code>
                    </div>
                  )}
                  
                  {check.message && (
                    <p className={`text-sm mt-2 ${
                      check.status === 'passed' 
                        ? 'text-green-600'
                        : check.status === 'failed'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}>
                      {check.message}
                    </p>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runSingleCheck(index)}
                    disabled={check.status === 'checking' || isRunningChecks}
                  >
                    {check.status === 'checking' ? 'Checking...' : 'Check'}
                  </Button>
                  
                  {check.status !== 'unchecked' && check.status !== 'checking' && (
                    <div className={`flex items-center space-x-1 text-sm ${
                      check.status === 'passed' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {check.status === 'passed' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span>{check.status === 'passed' ? 'Passed' : 'Failed'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {status.requiredFailed > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-medium text-red-800 mb-2">Installation Required</h5>
            <p className="text-sm text-red-700 mb-3">
              Some required components are missing. Please install them before proceeding:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              {checks
                .filter(check => check.requirement.isRequired && check.status === 'failed')
                .map(check => (
                  <li key={check.requirement.id} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{check.requirement.name}: {check.requirement.description}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SystemRequirements