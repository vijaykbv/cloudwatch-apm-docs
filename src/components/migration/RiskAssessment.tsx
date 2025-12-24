'use client'

import React, { useState, useCallback, useMemo } from 'react'

interface RiskFactor {
  id: string
  category: 'technical' | 'operational' | 'business' | 'timeline'
  name: string
  description: string
  impact: 'low' | 'medium' | 'high'
  probability: 'low' | 'medium' | 'high'
  mitigation: string[]
  indicators: string[]
}

interface RiskAssessmentResult {
  overallRisk: 'low' | 'medium' | 'high'
  riskFactors: RiskFactor[]
  recommendations: string[]
  mitigationPlan: MitigationAction[]
}

interface MitigationAction {
  id: string
  riskId: string
  action: string
  owner: string
  timeline: string
  priority: 'high' | 'medium' | 'low'
}

interface RiskAssessmentProps {
  onAssessmentComplete?: (result: RiskAssessmentResult) => void
  className?: string
}

const RISK_FACTORS: RiskFactor[] = [
  {
    id: 'service-criticality',
    category: 'business',
    name: 'Business Critical Services',
    description: 'Migration of services that are critical to business operations',
    impact: 'high',
    probability: 'medium',
    mitigation: [
      'Implement comprehensive rollback procedures',
      'Schedule migration during low-traffic periods',
      'Maintain parallel monitoring during transition',
      'Establish clear escalation procedures'
    ],
    indicators: [
      'Services handle customer-facing transactions',
      'Services are part of revenue-generating workflows',
      'Services have strict SLA requirements',
      'Downtime would impact business operations'
    ]
  },
  {
    id: 'technical-complexity',
    category: 'technical',
    name: 'Technical Complexity',
    description: 'Complex application architectures or custom integrations',
    impact: 'medium',
    probability: 'high',
    mitigation: [
      'Conduct thorough technical assessment',
      'Create detailed migration documentation',
      'Implement extensive testing procedures',
      'Engage senior technical resources'
    ],
    indicators: [
      'Custom APM integrations or modifications',
      'Complex microservices architectures',
      'Legacy systems with limited documentation',
      'Multiple programming languages and frameworks'
    ]
  },
  {
    id: 'team-expertise',
    category: 'operational',
    name: 'Team Expertise Gap',
    description: 'Limited team experience with CloudWatch APM',
    impact: 'medium',
    probability: 'medium',
    mitigation: [
      'Provide comprehensive training programs',
      'Engage AWS support or consulting services',
      'Create detailed operational runbooks',
      'Establish mentorship programs'
    ],
    indicators: [
      'Team unfamiliar with CloudWatch APM',
      'Limited AWS experience',
      'No previous APM migration experience',
      'High team turnover expected'
    ]
  },
  {
    id: 'data-migration',
    category: 'technical',
    name: 'Historical Data Migration',
    description: 'Need to migrate or maintain access to historical APM data',
    impact: 'low',
    probability: 'high',
    mitigation: [
      'Plan data export and archival strategy',
      'Maintain legacy system access temporarily',
      'Document data mapping procedures',
      'Implement data validation processes'
    ],
    indicators: [
      'Compliance requirements for historical data',
      'Business need for trend analysis',
      'Audit requirements for data retention',
      'Custom reporting on historical data'
    ]
  },
  {
    id: 'integration-dependencies',
    category: 'technical',
    name: 'External Integration Dependencies',
    description: 'Dependencies on external systems or third-party integrations',
    impact: 'high',
    probability: 'medium',
    mitigation: [
      'Map all external dependencies',
      'Test integration compatibility',
      'Develop fallback procedures',
      'Coordinate with external teams'
    ],
    indicators: [
      'APM data feeds external systems',
      'Third-party tools depend on APM APIs',
      'Custom dashboards in external tools',
      'Automated processes triggered by APM alerts'
    ]
  },
  {
    id: 'timeline-pressure',
    category: 'timeline',
    name: 'Aggressive Timeline',
    description: 'Tight deadlines or external pressure to complete migration quickly',
    impact: 'medium',
    probability: 'medium',
    mitigation: [
      'Negotiate realistic timelines',
      'Prioritize critical services first',
      'Increase resource allocation',
      'Implement parallel work streams'
    ],
    indicators: [
      'Executive pressure for quick migration',
      'Contract renewal deadlines',
      'Budget cycle constraints',
      'Regulatory compliance deadlines'
    ]
  },
  {
    id: 'change-management',
    category: 'operational',
    name: 'Change Management Resistance',
    description: 'Organizational resistance to changing monitoring tools and processes',
    impact: 'medium',
    probability: 'low',
    mitigation: [
      'Develop comprehensive change management plan',
      'Engage stakeholders early in process',
      'Demonstrate clear benefits and ROI',
      'Provide extensive training and support'
    ],
    indicators: [
      'Previous resistance to tool changes',
      'Strong attachment to current APM solution',
      'Concerns about learning new tools',
      'Skepticism about cloud-based solutions'
    ]
  },
  {
    id: 'performance-impact',
    category: 'technical',
    name: 'Performance Impact',
    description: 'Potential performance impact during migration or from new APM agent',
    impact: 'high',
    probability: 'low',
    mitigation: [
      'Conduct thorough performance testing',
      'Implement gradual rollout strategy',
      'Monitor performance metrics closely',
      'Prepare immediate rollback procedures'
    ],
    indicators: [
      'Performance-sensitive applications',
      'High-traffic services',
      'Resource-constrained environments',
      'Strict performance SLAs'
    ]
  }
]

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  onAssessmentComplete,
  className = ''
}) => {
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set())
  const [riskInputs, setRiskInputs] = useState<Record<string, { impact: string; probability: string }>>({})
  const [assessmentResult, setAssessmentResult] = useState<RiskAssessmentResult | null>(null)
  const [currentStep, setCurrentStep] = useState<'identification' | 'assessment' | 'results'>('identification')

  const handleRiskToggle = useCallback((riskId: string) => {
    setSelectedRisks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(riskId)) {
        newSet.delete(riskId)
      } else {
        newSet.add(riskId)
      }
      return newSet
    })
  }, [])

  const handleRiskInputChange = useCallback((riskId: string, field: 'impact' | 'probability', value: string) => {
    setRiskInputs(prev => ({
      ...prev,
      [riskId]: {
        ...prev[riskId],
        [field]: value
      }
    }))
  }, [])

  const calculateRiskScore = (impact: string, probability: string): number => {
    const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1
    const probabilityScore = probability === 'high' ? 3 : probability === 'medium' ? 2 : 1
    return impactScore * probabilityScore
  }

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 6) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }

  const assessmentResults = useMemo(() => {
    if (selectedRisks.size === 0) return null

    const relevantRisks = RISK_FACTORS.filter(risk => selectedRisks.has(risk.id))
    const assessedRisks = relevantRisks.map(risk => {
      const inputs = riskInputs[risk.id]
      const impact = inputs?.impact || risk.impact
      const probability = inputs?.probability || risk.probability
      
      return {
        ...risk,
        impact: impact as 'low' | 'medium' | 'high',
        probability: probability as 'low' | 'medium' | 'high'
      }
    })

    const totalScore = assessedRisks.reduce((sum, risk) => 
      sum + calculateRiskScore(risk.impact, risk.probability), 0
    )
    const averageScore = totalScore / assessedRisks.length
    const overallRisk = getRiskLevel(averageScore)

    const recommendations = generateRecommendations(assessedRisks, overallRisk)
    const mitigationPlan = generateMitigationPlan(assessedRisks)

    return {
      overallRisk,
      riskFactors: assessedRisks,
      recommendations,
      mitigationPlan
    }
  }, [selectedRisks, riskInputs])

  const generateRecommendations = (risks: RiskFactor[], overallRisk: string): string[] => {
    const recommendations = []

    if (overallRisk === 'high') {
      recommendations.push('Consider extending timeline to reduce risk')
      recommendations.push('Implement comprehensive rollback procedures')
      recommendations.push('Engage additional technical resources')
    }

    if (risks.some(r => r.category === 'business' && r.impact === 'high')) {
      recommendations.push('Schedule migration during maintenance windows')
      recommendations.push('Implement parallel monitoring during transition')
    }

    if (risks.some(r => r.category === 'technical' && r.probability === 'high')) {
      recommendations.push('Conduct extensive testing in staging environment')
      recommendations.push('Create detailed technical documentation')
    }

    if (risks.some(r => r.category === 'operational')) {
      recommendations.push('Invest in team training and knowledge transfer')
      recommendations.push('Establish clear operational procedures')
    }

    return recommendations
  }

  const generateMitigationPlan = (risks: RiskFactor[]): MitigationAction[] => {
    const actions: MitigationAction[] = []

    risks.forEach(risk => {
      risk.mitigation.forEach((mitigation, index) => {
        actions.push({
          id: `${risk.id}-mitigation-${index}`,
          riskId: risk.id,
          action: mitigation,
          owner: 'TBD',
          timeline: risk.impact === 'high' ? '1 week' : '2 weeks',
          priority: risk.impact === 'high' ? 'high' : risk.impact === 'medium' ? 'medium' : 'low'
        })
      })
    })

    return actions
  }

  const completeAssessment = useCallback(() => {
    if (assessmentResults) {
      setAssessmentResult(assessmentResults)
      setCurrentStep('results')
      onAssessmentComplete?.(assessmentResults)
    }
  }, [assessmentResults, onAssessmentComplete])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderIdentificationStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Risk Identification</h2>
        <p className="text-gray-600">
          Select the risk factors that apply to your migration project. This will help create a tailored risk assessment and mitigation plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RISK_FACTORS.map(risk => (
          <div
            key={risk.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedRisks.has(risk.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRiskToggle(risk.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{risk.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{risk.category} Risk</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${getRiskColor(risk.impact)}`}>
                  {risk.impact}
                </span>
                <input
                  type="checkbox"
                  checked={selectedRisks.has(risk.id)}
                  onChange={() => handleRiskToggle(risk.id)}
                  className="rounded"
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{risk.description}</p>
            
            <div>
              <h4 className="font-medium text-xs text-gray-900 mb-1">Risk Indicators:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {risk.indicators.slice(0, 2).map((indicator, index) => (
                  <li key={index}>• {indicator}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <div className="text-sm text-gray-600">
          {selectedRisks.size} risk factors selected
        </div>
        <button
          onClick={() => setCurrentStep('assessment')}
          disabled={selectedRisks.size === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue to Assessment
        </button>
      </div>
    </div>
  )

  const renderAssessmentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Risk Assessment</h2>
        <p className="text-gray-600">
          Assess the impact and probability of each selected risk factor for your specific situation.
        </p>
      </div>

      <div className="space-y-4">
        {RISK_FACTORS.filter(risk => selectedRisks.has(risk.id)).map(risk => (
          <div key={risk.id} className="border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="font-medium text-lg">{risk.name}</h3>
              <p className="text-gray-600">{risk.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Impact Level</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map(level => (
                    <label key={level} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`${risk.id}-impact`}
                        value={level}
                        checked={riskInputs[risk.id]?.impact === level || (!riskInputs[risk.id] && risk.impact === level)}
                        onChange={(e) => handleRiskInputChange(risk.id, 'impact', e.target.value)}
                        className="rounded"
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Probability</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map(level => (
                    <label key={level} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`${risk.id}-probability`}
                        value={level}
                        checked={riskInputs[risk.id]?.probability === level || (!riskInputs[risk.id] && risk.probability === level)}
                        onChange={(e) => handleRiskInputChange(risk.id, 'probability', e.target.value)}
                        className="rounded"
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('identification')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={completeAssessment}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Complete Assessment
        </button>
      </div>
    </div>
  )

  const renderResultsStep = () => {
    if (!assessmentResult) return null

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Risk Assessment Results</h2>
          <p className="text-gray-600">
            Based on your inputs, here's your comprehensive risk assessment and mitigation plan.
          </p>
        </div>

        {/* Overall Risk */}
        <div className={`border rounded-lg p-6 ${getRiskColor(assessmentResult.overallRisk)}`}>
          <div className="text-center">
            <h3 className="text-2xl font-bold capitalize">{assessmentResult.overallRisk} Risk</h3>
            <p className="mt-2">Overall Migration Risk Level</p>
          </div>
        </div>

        {/* Risk Factors Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Risk Factors Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessmentResult.riskFactors.map(risk => {
              const score = calculateRiskScore(risk.impact, risk.probability)
              const level = getRiskLevel(score)
              
              return (
                <div key={risk.id} className={`border rounded-lg p-4 ${getRiskColor(level)}`}>
                  <h4 className="font-medium mb-2">{risk.name}</h4>
                  <div className="text-sm space-y-1">
                    <div>Impact: <span className="capitalize">{risk.impact}</span></div>
                    <div>Probability: <span className="capitalize">{risk.probability}</span></div>
                    <div>Score: {score}/9</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {assessmentResult.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">💡</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mitigation Plan */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Mitigation Action Plan</h3>
          <div className="space-y-3">
            {assessmentResult.mitigationPlan
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              })
              .map(action => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{action.action}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Timeline: {action.timeline} | Owner: {action.owner}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      action.priority === 'high' ? 'bg-red-100 text-red-800' :
                      action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {action.priority} priority
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('assessment')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Assessment
          </button>
          <button
            onClick={() => {/* Export or save results */}}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export Results
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'identification', title: 'Risk Identification' },
              { id: 'assessment', title: 'Risk Assessment' },
              { id: 'results', title: 'Results & Mitigation' }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.id
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : index < ['identification', 'assessment', 'results'].indexOf(currentStep)
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {index < ['identification', 'assessment', 'results'].indexOf(currentStep) ? '✓' : index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index < ['identification', 'assessment', 'results'].indexOf(currentStep) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold">
              {currentStep === 'identification' && 'Risk Identification'}
              {currentStep === 'assessment' && 'Risk Assessment'}
              {currentStep === 'results' && 'Results & Mitigation'}
            </h2>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'identification' && renderIdentificationStep()}
        {currentStep === 'assessment' && renderAssessmentStep()}
        {currentStep === 'results' && renderResultsStep()}
      </div>
    </div>
  )
}