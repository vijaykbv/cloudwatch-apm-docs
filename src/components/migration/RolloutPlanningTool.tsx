'use client'

import React, { useState, useCallback, useMemo } from 'react'

interface RolloutPhase {
  id: string
  name: string
  description: string
  duration: string
  prerequisites: string[]
  activities: RolloutActivity[]
  successCriteria: string[]
  rollbackTriggers: string[]
  estimatedRisk: 'low' | 'medium' | 'high'
}

interface RolloutActivity {
  id: string
  name: string
  description: string
  type: 'preparation' | 'deployment' | 'validation' | 'monitoring'
  estimatedTime: string
  owner: string
  dependencies: string[]
}

interface RolloutPlan {
  id: string
  name: string
  description: string
  totalDuration: string
  phases: RolloutPhase[]
  overallRisk: 'low' | 'medium' | 'high'
  createdAt: Date
}

interface RolloutPlanningToolProps {
  onPlanGenerated?: (plan: RolloutPlan) => void
  className?: string
}

const DEFAULT_PHASES: RolloutPhase[] = [
  {
    id: 'phase-1-pilot',
    name: 'Phase 1: Pilot Deployment',
    description: 'Deploy CloudWatch APM to a small, non-critical subset of services',
    duration: '1-2 weeks',
    prerequisites: [
      'CloudWatch APM account setup completed',
      'IAM roles and permissions configured',
      'Pilot services identified and documented',
      'Monitoring baselines established'
    ],
    activities: [
      {
        id: 'pilot-service-selection',
        name: 'Select Pilot Services',
        description: 'Choose 1-2 non-critical services with minimal dependencies',
        type: 'preparation',
        estimatedTime: '4 hours',
        owner: 'DevOps Team',
        dependencies: []
      },
      {
        id: 'pilot-deployment',
        name: 'Deploy APM to Pilot Services',
        description: 'Install and configure CloudWatch APM on selected services',
        type: 'deployment',
        estimatedTime: '1 day',
        owner: 'DevOps Team',
        dependencies: ['pilot-service-selection']
      },
      {
        id: 'pilot-validation',
        name: 'Validate Pilot Deployment',
        description: 'Verify APM data collection and dashboard functionality',
        type: 'validation',
        estimatedTime: '2 days',
        owner: 'SRE Team',
        dependencies: ['pilot-deployment']
      },
      {
        id: 'pilot-monitoring',
        name: 'Monitor Pilot Performance',
        description: 'Track performance impact and data quality for 1 week',
        type: 'monitoring',
        estimatedTime: '1 week',
        owner: 'SRE Team',
        dependencies: ['pilot-validation']
      }
    ],
    successCriteria: [
      'APM data successfully collected from pilot services',
      'No performance degradation observed',
      'Dashboards and alerts functioning correctly',
      'Team comfortable with CloudWatch APM interface'
    ],
    rollbackTriggers: [
      'Service performance degradation > 5%',
      'APM data collection failures > 10%',
      'Critical alerts not functioning',
      'Unresolvable technical issues'
    ],
    estimatedRisk: 'low'
  },
  {
    id: 'phase-2-expansion',
    name: 'Phase 2: Controlled Expansion',
    description: 'Expand to additional services while maintaining parallel monitoring',
    duration: '2-4 weeks',
    prerequisites: [
      'Pilot phase completed successfully',
      'Lessons learned documented and applied',
      'Additional services prioritized',
      'Team training completed'
    ],
    activities: [
      {
        id: 'service-prioritization',
        name: 'Prioritize Next Services',
        description: 'Select next batch of services based on risk and business value',
        type: 'preparation',
        estimatedTime: '4 hours',
        owner: 'Architecture Team',
        dependencies: []
      },
      {
        id: 'parallel-deployment',
        name: 'Deploy with Parallel Monitoring',
        description: 'Deploy CloudWatch APM while maintaining existing APM',
        type: 'deployment',
        estimatedTime: '1 week',
        owner: 'DevOps Team',
        dependencies: ['service-prioritization']
      },
      {
        id: 'data-comparison',
        name: 'Compare APM Data',
        description: 'Validate data consistency between old and new APM systems',
        type: 'validation',
        estimatedTime: '1 week',
        owner: 'SRE Team',
        dependencies: ['parallel-deployment']
      },
      {
        id: 'gradual-cutover',
        name: 'Gradual Alert Migration',
        description: 'Migrate alerting rules and dashboards incrementally',
        type: 'deployment',
        estimatedTime: '1 week',
        owner: 'SRE Team',
        dependencies: ['data-comparison']
      }
    ],
    successCriteria: [
      'All expanded services reporting to CloudWatch APM',
      'Data consistency validated between APM systems',
      'Critical alerts migrated and functioning',
      'No service disruptions during deployment'
    ],
    rollbackTriggers: [
      'Data inconsistencies between APM systems',
      'Alert migration failures',
      'Service performance issues',
      'Team unable to operate new system effectively'
    ],
    estimatedRisk: 'medium'
  },
  {
    id: 'phase-3-full-migration',
    name: 'Phase 3: Full Migration',
    description: 'Complete migration of all services and decommission legacy APM',
    duration: '2-3 weeks',
    prerequisites: [
      'Expansion phase completed successfully',
      'All critical services validated',
      'Team fully trained on CloudWatch APM',
      'Legacy APM decommission plan approved'
    ],
    activities: [
      {
        id: 'remaining-services',
        name: 'Migrate Remaining Services',
        description: 'Deploy CloudWatch APM to all remaining services',
        type: 'deployment',
        estimatedTime: '1 week',
        owner: 'DevOps Team',
        dependencies: []
      },
      {
        id: 'final-validation',
        name: 'Final System Validation',
        description: 'Comprehensive validation of entire APM system',
        type: 'validation',
        estimatedTime: '3 days',
        owner: 'SRE Team',
        dependencies: ['remaining-services']
      },
      {
        id: 'legacy-decommission',
        name: 'Decommission Legacy APM',
        description: 'Safely remove legacy APM system and dependencies',
        type: 'deployment',
        estimatedTime: '2 days',
        owner: 'DevOps Team',
        dependencies: ['final-validation']
      },
      {
        id: 'post-migration-monitoring',
        name: 'Post-Migration Monitoring',
        description: 'Monitor system stability for 1 week after full migration',
        type: 'monitoring',
        estimatedTime: '1 week',
        owner: 'SRE Team',
        dependencies: ['legacy-decommission']
      }
    ],
    successCriteria: [
      'All services successfully migrated to CloudWatch APM',
      'Legacy APM system decommissioned',
      'No data loss or service disruptions',
      'Team operating confidently on new system'
    ],
    rollbackTriggers: [
      'Critical service failures',
      'Significant data loss',
      'Unable to resolve system issues within 24 hours',
      'Business operations significantly impacted'
    ],
    estimatedRisk: 'high'
  }
]

export const RolloutPlanningTool: React.FC<RolloutPlanningToolProps> = ({
  onPlanGenerated,
  className = ''
}) => {
  const [planName, setPlanName] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [phases, setPhases] = useState<RolloutPhase[]>(DEFAULT_PHASES)
  const [selectedPhase, setSelectedPhase] = useState<RolloutPhase | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const overallRisk = useMemo(() => {
    const riskLevels = phases.map(phase => phase.estimatedRisk)
    if (riskLevels.includes('high')) return 'high'
    if (riskLevels.includes('medium')) return 'medium'
    return 'low'
  }, [phases])

  const totalDuration = useMemo(() => {
    // Simple calculation - in a real implementation, this would be more sophisticated
    const weeks = phases.reduce((total, phase) => {
      const match = phase.duration.match(/(\d+)-?(\d+)?/)
      if (match) {
        const min = parseInt(match[1])
        const max = match[2] ? parseInt(match[2]) : min
        return total + Math.ceil((min + max) / 2)
      }
      return total + 2 // default
    }, 0)
    return `${weeks} weeks`
  }, [phases])

  const generatePlan = useCallback(() => {
    const plan: RolloutPlan = {
      id: `rollout-plan-${Date.now()}`,
      name: planName || 'CloudWatch APM Migration Plan',
      description: planDescription || 'Gradual rollout plan for migrating to CloudWatch APM',
      totalDuration,
      phases,
      overallRisk,
      createdAt: new Date()
    }
    
    onPlanGenerated?.(plan)
  }, [planName, planDescription, totalDuration, phases, overallRisk, onPlanGenerated])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'preparation':
        return '📋'
      case 'deployment':
        return '🚀'
      case 'validation':
        return '✅'
      case 'monitoring':
        return '📊'
      default:
        return '📝'
    }
  }

  const renderPhaseCard = (phase: RolloutPhase, index: number) => (
    <div
      key={phase.id}
      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedPhase(phase)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{phase.name}</h3>
          <p className="text-gray-600 text-sm">{phase.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(phase.estimatedRisk)}`}>
            {phase.estimatedRisk} risk
          </span>
          <span className="text-sm text-gray-500">{phase.duration}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-2">Key Activities ({phase.activities.length})</h4>
          <div className="flex flex-wrap gap-2">
            {phase.activities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                <span>{getActivityTypeIcon(activity.type)}</span>
                <span>{activity.name}</span>
              </div>
            ))}
            {phase.activities.length > 3 && (
              <span className="text-xs text-gray-500">+{phase.activities.length - 3} more</span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-1">Success Criteria</h4>
          <p className="text-xs text-gray-600">
            {phase.successCriteria.length} criteria defined
          </p>
        </div>
      </div>
    </div>
  )

  const renderPhaseDetails = (phase: RolloutPhase) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{phase.name}</h2>
          <p className="text-gray-600">{phase.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(phase.estimatedRisk)}`}>
            {phase.estimatedRisk} risk
          </span>
          <span className="text-gray-500">{phase.duration}</span>
          <button
            onClick={() => setSelectedPhase(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Prerequisites */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
          <ul className="space-y-2">
            {phase.prerequisites.map((prereq, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{prereq}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activities */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Activities</h3>
          <div className="space-y-4">
            {phase.activities.map((activity, index) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getActivityTypeIcon(activity.type)}</span>
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{activity.estimatedTime}</div>
                    <div className="font-medium">{activity.owner}</div>
                  </div>
                </div>
                
                {activity.dependencies.length > 0 && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Dependencies: </span>
                    <span className="text-sm text-gray-600">
                      {activity.dependencies.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Criteria */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Success Criteria</h3>
          <ul className="space-y-2">
            {phase.successCriteria.map((criteria, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rollback Triggers */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Rollback Triggers</h3>
          <ul className="space-y-2">
            {phase.rollbackTriggers.map((trigger, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-600 mt-1">⚠️</span>
                <span className="text-gray-700">{trigger}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {!selectedPhase ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Rollout Planning Tool</h1>
            <p className="text-gray-600">
              Create a structured plan for gradually rolling out CloudWatch APM across your organization.
              This tool helps you plan phases, manage risks, and ensure a smooth migration.
            </p>
          </div>

          {/* Plan Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Plan Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="CloudWatch APM Migration Plan"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Duration</label>
                <input
                  type="text"
                  value={totalDuration}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Describe your migration plan objectives and scope..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Plan Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Plan Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{phases.length}</div>
                <div className="text-sm text-blue-800">Phases</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{totalDuration}</div>
                <div className="text-sm text-gray-800">Duration</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {phases.reduce((total, phase) => total + phase.activities.length, 0)}
                </div>
                <div className="text-sm text-gray-800">Activities</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${getRiskColor(overallRisk)}`}>
                <div className="text-2xl font-bold capitalize">{overallRisk}</div>
                <div className="text-sm">Overall Risk</div>
              </div>
            </div>
          </div>

          {/* Phases */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Migration Phases</h2>
            <div className="space-y-6">
              {phases.map((phase, index) => renderPhaseCard(phase, index))}
            </div>
          </div>

          {/* Generate Plan */}
          <div className="text-center">
            <button
              onClick={generatePlan}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Generate Rollout Plan
            </button>
          </div>
        </>
      ) : (
        renderPhaseDetails(selectedPhase)
      )}
    </div>
  )
}