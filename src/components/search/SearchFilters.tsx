'use client'

import React from 'react'
import type { SearchFilters, SearchSystem } from '../../lib/search-system'
import type { ContentCategory, DifficultyLevel, UserAudience } from '../../types'

interface SearchFiltersProps {
  searchSystem: SearchSystem
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  query?: string
  className?: string
}

export function SearchFilters({ 
  searchSystem, 
  filters, 
  onFiltersChange, 
  query,
  className = ""
}: SearchFiltersProps) {
  const facets = searchSystem.getFacets(query, filters)

  const updateFilter = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value as ContentCategory || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All categories</option>
          {facets.categories.map(({ value, count }) => (
            <option key={value} value={value}>
              {formatCategoryName(value)} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty
        </label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => updateFilter('difficulty', e.target.value as DifficultyLevel || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All levels</option>
          {facets.difficulties.map(({ value, count }) => (
            <option key={value} value={value}>
              {formatDifficultyName(value)} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Audience type filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audience
        </label>
        <select
          value={filters.audienceType || ''}
          onChange={(e) => updateFilter('audienceType', e.target.value as UserAudience['type'] || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All audiences</option>
          {facets.audienceTypes.map(({ value, count }) => (
            <option key={value} value={value}>
              {formatAudienceType(value)} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Experience level filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Level
        </label>
        <select
          value={filters.audienceExperience || ''}
          onChange={(e) => updateFilter('audienceExperience', e.target.value as UserAudience['experience'] || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All levels</option>
          {facets.audienceExperiences.map(({ value, count }) => (
            <option key={value} value={value}>
              {formatExperienceLevel(value)} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Read time filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Read Time
        </label>
        <select
          value={filters.maxReadTime || ''}
          onChange={(e) => updateFilter('maxReadTime', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Any length</option>
          <option value="5">5 minutes or less</option>
          <option value="10">10 minutes or less</option>
          <option value="20">20 minutes or less</option>
          <option value="30">30 minutes or less</option>
        </select>
      </div>

      {/* Popular tags */}
      {facets.tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Popular Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {facets.tags.slice(0, 10).map(({ value, count }) => {
              const isSelected = filters.tags?.includes(value) || false
              return (
                <button
                  key={value}
                  onClick={() => {
                    const currentTags = filters.tags || []
                    const newTags = isSelected
                      ? currentTags.filter(tag => tag !== value)
                      : [...currentTags, value]
                    updateFilter('tags', newTags.length > 0 ? newTags : undefined)
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {value} ({count})
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Category: {formatCategoryName(filters.category)}
                <button
                  onClick={() => updateFilter('category', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.difficulty && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Difficulty: {formatDifficultyName(filters.difficulty)}
                <button
                  onClick={() => updateFilter('difficulty', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.audienceType && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Audience: {formatAudienceType(filters.audienceType)}
                <button
                  onClick={() => updateFilter('audienceType', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.maxReadTime && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Max: {filters.maxReadTime}min
                <button
                  onClick={() => updateFilter('maxReadTime', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.tags && filters.tags.length > 0 && (
              filters.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Tag: {tag}
                  <button
                    onClick={() => {
                      const newTags = filters.tags!.filter(t => t !== tag)
                      updateFilter('tags', newTags.length > 0 ? newTags : undefined)
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions for formatting display names
function formatCategoryName(category: ContentCategory): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDifficultyName(difficulty: DifficultyLevel): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

function formatAudienceType(type: UserAudience['type']): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatExperienceLevel(level: UserAudience['experience']): string {
  return level.charAt(0).toUpperCase() + level.slice(1)
}