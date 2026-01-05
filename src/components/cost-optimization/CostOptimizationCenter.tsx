import React, { useState } from 'react';
import { CostCalculator } from './CostCalculator';
import { CostOptimizationGuide } from './CostOptimizationGuide';
import { CostTroubleshootingGuide } from './CostTroubleshootingGuide';

type CostOptimizationTab = 'guide' | 'calculator' | 'troubleshooting';

export const CostOptimizationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CostOptimizationTab>('guide');

  const tabs = [
    { id: 'guide' as CostOptimizationTab, title: 'Optimization Guide', icon: '📋' },
    { id: 'calculator' as CostOptimizationTab, title: 'Cost Calculator', icon: '🧮' },
    { id: 'troubleshooting' as CostOptimizationTab, title: 'Cost Troubleshooting', icon: '🔧' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guide':
        return <CostOptimizationGuide />;
      case 'calculator':
        return <CostCalculator />;
      case 'troubleshooting':
        return <CostTroubleshootingGuide />;
      default:
        return <CostOptimizationGuide />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">💰 APM Cost Optimization</h1>
        <p className="text-xl text-gray-600 mb-8">
          Maximize observability while minimizing costs with smart optimization strategies
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default CostOptimizationCenter;