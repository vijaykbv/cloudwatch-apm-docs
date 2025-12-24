'use client'

import React, { useState, useEffect } from 'react'
import { SearchSystem, type SearchFilters, type SearchResult } from '../../lib/search-system'
import { SearchBar } from './SearchBar'
import { SearchFilters as SearchFiltersComponent } from './SearchFilters'
import { SearchResults } from './SearchResults'

interface SearchInterfaceProps {
  searchSystem: SearchSystem
  onSearch?: (query: string, resultsCount: number) => void
  className?: string
}

export function SearchInterface({ searchSystem, onSearch, className = "" }: SearchInterfaceProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true)
      
      try {
        // Add small delay to debounce rapid changes
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const searchResults = searchSystem.search(query, filters, {
          limit: 50,
          includeMatches: true
        })
        
        setResults(searchResults)
        
        // Call onSearch callback if provided
        if (onSearch && query) {
          onSearch(query, searchResults.length)
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query, filters, searchSystem, onSearch])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const hasActiveFilters = Object.keys(filters).length > 0
  const totalIndexed = searchSystem.getIndexSize()

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Search header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Documentation</h1>
            <p className="text-gray-600 mt-2">
              Search through {totalIndexed} documentation pages to find what you need
            </p>
          </div>
          
          <button
            onClick={toggleFilters}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <SearchBar
          searchSystem={searchSystem}
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </div>

      {/* Main content area */}
      <div className="flex gap-8">
        {/* Filters sidebar */}
        {showFilters && (
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-4">
              <SearchFiltersComponent
                searchSystem={searchSystem}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                query={query}
                className="bg-white border border-gray-200 rounded-lg p-6"
              />
            </div>
          </aside>
        )}

        {/* Results area */}
        <main className="flex-1 min-w-0">
          {/* Quick stats */}
          {(query || hasActiveFilters) && !loading && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                  {query && ` for "${query}"`}
                </span>
                <span>
                  Search completed in {loading ? '...' : '< 1'}s
                </span>
              </div>
            </div>
          )}

          {/* Popular content when no search */}
          {!query && !hasActiveFilters && !loading && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Content</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchSystem.getPopularContent(undefined, 6).map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{item.category.replace('-', ' ')}</span>
                      <span>{item.estimatedReadTime} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          <SearchResults
            results={results}
            query={query}
            loading={loading}
          />

          {/* No results suggestions */}
          {!loading && results.length === 0 && (query || hasActiveFilters) && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Try these suggestions:</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Check your spelling and try different keywords</li>
                <li>• Use broader search terms</li>
                <li>• Remove some filters to see more results</li>
                <li>• Browse by category in the main navigation</li>
              </ul>
              
              {query && (
                <div className="mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Popular searches:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['getting started', 'configuration', 'troubleshooting', 'examples', 'API'].map(term => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}