import React from 'react';

export interface ProgressStep {
  id: string;
  title: string;
  completed: boolean;
  current?: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  className = '',
  variant = 'horizontal'
}) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className={`progress-indicator ${variant} ${className}`} role="progressbar" 
         aria-valuenow={completedSteps} aria-valuemin={0} aria-valuemax={steps.length}
         aria-label={`Progress: ${completedSteps} of ${steps.length} steps completed`}>
      
      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <ol className="progress-steps">
        {steps.map((step, index) => (
          <li 
            key={step.id} 
            className={`progress-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
          >
            <div className="step-indicator">
              {step.completed ? (
                <svg className="step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            <span className="step-title">{step.title}</span>
          </li>
        ))}
      </ol>

      {/* Progress summary */}
      <div className="progress-summary">
        <span className="progress-text">
          {completedSteps} of {steps.length} steps completed
        </span>
        <span className="progress-percentage">
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;