import React from 'react'
import { Platform } from '../../types/quickstart'
import Card from '../ui/Card'

interface PlatformSelectorProps {
  platforms: Platform[]
  selectedPlatforms: string[]
  onSelectionChange: (selectedPlatforms: string[]) => void
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  platforms,
  selectedPlatforms,
  onSelectionChange
}) => {
  const togglePlatform = (platformId: string) => {
    const isSelected = selectedPlatforms.includes(platformId)
    const newSelection = isSelected
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId]
    
    onSelectionChange(newSelection)
  }

  const platformsByCategory = platforms.reduce((acc, platform) => {
    if (!acc[platform.category]) {
      acc[platform.category] = []
    }
    acc[platform.category].push(platform)
    return acc
  }, {} as Record<string, Platform[]>)

  const categoryTitles = {
    language: 'Programming Languages',
    framework: 'Frameworks & Libraries',
    infrastructure: 'Infrastructure & Deployment'
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-gray-600">
          Select the platforms and technologies you're using. You can choose multiple options.
        </p>
      </div>

      {Object.entries(platformsByCategory).map(([category, categoryPlatforms]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {categoryTitles[category as keyof typeof categoryTitles]}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryPlatforms.map(platform => {
              const isSelected = selectedPlatforms.includes(platform.id)
              
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {platform.name}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {platform.description}
                      </p>
                      
                      {platform.prerequisites.length > 0 && (
                        <div className="mt-2">
                          <p className={`text-xs ${
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            Prerequisites: {platform.prerequisites.slice(0, 2).join(', ')}
                            {platform.prerequisites.length > 2 && '...'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedPlatforms.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center space-x-2">
            <div className="text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-green-800 font-medium">
                Great! You've selected {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}.
              </p>
              <p className="text-green-700 text-sm">
                We'll customize the installation guide for your selection.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default PlatformSelector