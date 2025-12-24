'use client'

import React from 'react'
import Link from 'next/link'
import type { SearchResult } from '../../lib/search-system'
import { highlightSearchMatches } from '../../lib/search-system'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  loading?: boolean
  className?: string
}

export function SearchResults({ 
  results, 
  query, 
  loading = false,
  className = ""
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 mb-4">
          {query 
            ? `No documentation found for "${query}". Try different keywords or check your spelling.`
            : "No content matches your current filters. Try adjusting your search criteria."
          }
        </p>
        <div className="text-sm text-gray-400">
          <p>Suggestions:</p>
          <ul className="mt-2 space-y-1">
            <li>• Try broader search terms</li>
            <li>• Check for typos in your search</li>
            <li>• Remove some filters to see more results</li>
            <li>• Browse by category instead</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-sm text-gray-600 mb-4">
        Found {results.length} result{results.length !== 1 ? 's' : ''}
        {query && ` for "${query}"`}
      </div>

      {results.map((result) => (
        <SearchResultItem 
          key={result.item.id} 
          result={result} 
          query={query}
        />
      ))}
    </div>
  )
}

interface SearchResultItemProps {
  result: SearchResult
  query: string
}

function SearchResultItem({ result, query }: SearchResultItemProps) {
  const { item, score, matches } = result

  // Generate URL for the documentation page
  const pageUrl = `/docs/${item.id}`

  // Get highlighted title and description
  const titleMatches = matches?.filter(m => m.key === 'title')
  const descriptionMatches = matches?.filter(m => m.key === 'description')
  const contentMatches = matches?.filter(m => m.key === 'content')

  const highlightedTitle = titleMatches && titleMatches.length > 0
    ? highlightSearchMatches(item.title, titleMatches)
    : item.title

  const highlightedDescription = descriptionMatches && descriptionMatches.length > 0
    ? highlightSearchMatches(item.description, descriptionMatches)
    : item.description

  // Get content snippet with highlights
  const getContentSnippet = (): string => {
    if (contentMatches && contentMatches.length > 0) {
      // Find the first match and create a snippet around it
      const firstMatch = contentMatches[0]
      if (firstMatch.indices && firstMatch.indices.length > 0) {
        const [start] = firstMatch.indices[0]
        const snippetStart = Math.max(0, start - 100)
        const snippetEnd = Math.min(item.content.length, start + 200)
        let snippet = item.content.slice(snippetStart, snippetEnd)
        
        if (snippetStart > 0) snippet = '...' + snippet
        if (snippetEnd < item.content.length) snippet = snippet + '...'
        
        return highlightSearchMatches(snippet, contentMatches)
      }
    }
    
    // Fallback to description or truncated content
    return item.description || item.content.slice(0, 200) + (item.content.length > 200 ? '...' : '')
  }

  return (
    <article className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link 
            href={pageUrl}
            className="block group"
          >
            <h3 
              className="text-lg font-semibold text-blue-600 group-hover:text-blue-800 mb-2"
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
          </Link>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span className="inline-flex items-center">
              <CategoryIcon category={item.category} />
              <span className="ml-1 capitalize">
                {item.category.replace('-', ' ')}
              </span>
            </span>
            
            <span className="inline-flex items-center">
              <DifficultyIcon difficulty={item.difficulty} />
              <span className="ml-1 capitalize">{item.difficulty}</span>
            </span>
            
            <span className="inline-flex items-center">
              <ClockIcon />
              <span className="ml-1">{item.estimatedReadTime} min read</span>
            </span>

            {score !== undefined && (
              <span className="text-xs text-gray-400">
                Score: {Math.round((1 - score) * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div 
        className="text-gray-700 mb-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: getContentSnippet() }}
      />

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.slice(0, 5).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 5 && (
            <span className="text-xs text-gray-500">
              +{item.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Audience info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            For: {item.audience.map(a => `${a.type} (${a.experience})`).join(', ')}
          </span>
        </div>
        <span>
          Updated {new Date(item.lastUpdated).toLocaleDateString()}
        </span>
      </div>
    </article>
  )
}

// Icon components
function CategoryIcon({ category }: { category: string }) {
  const iconClass = "w-4 h-4"
  
  switch (category) {
    case 'getting-started':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'implementation':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    case 'configuration':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'troubleshooting':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

function DifficultyIcon({ difficulty }: { difficulty: string }) {
  const iconClass = "w-4 h-4"
  
  switch (difficulty) {
    case 'beginner':
      return (
        <svg className={`${iconClass} text-green-500`} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'intermediate':
      return (
        <svg className={`${iconClass} text-yellow-500`} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
        </svg>
      )
    case 'advanced':
      return (
        <svg className={`${iconClass} text-red-500`} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </svg>
      )
    default:
      return null
  }
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}