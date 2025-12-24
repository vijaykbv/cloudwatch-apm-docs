'use client'

import React from 'react'
import Link from 'next/link'
import type { RecommendationScore } from '../../lib/recommendation-system'
import type { DocumentationPage, ContentCategory, UserAudience } from '../../types'

interface PopularContentProps {
  recommendations: RecommendationScore[]
  pages: Map<string, DocumentationPage>
  title?: string
  category?: ContentCategory
  audience?: UserAudience
  showStats?: boolean
  maxItems?: number
  className?: string
}

export function PopularContent({
  recommendations,
  pages,
  title = "Popular Content",
  category,
  audience,
  showStats = false,
  maxItems = 6,
  className = ""
}: PopularContentProps) {
  const displayedRecommendations = recommendations.slice(0, maxItems)

  if (displayedRecommendations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500 mb-2">
          <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">No popular content available</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {(category || audience) && (
            <p className="text-sm text-gray-600 mt-1">
              {category && `Category: ${formatCategoryName(category)}`}
              {category && audience && ' • '}
              {audience && `For ${audience.type} (${audience.experience})`}
            </p>
          )}
        </div>
        
        {showStats && (
          <div className="text-sm text-gray-500">
            Showing {displayedRecommendations.length} of {recommendations.length} items
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedRecommendations.map((recommendation, index) => {
          const page = pages.get(recommendation.pageId)
          if (!page) return null

          return (
            <PopularContentCard
              key={recommendation.pageId}
              page={page}
              score={recommendation.score}
              rank={index + 1}
              showRank={showStats}
            />
          )
        })}
      </div>

      {recommendations.length > maxItems && (
        <div className="mt-6 text-center">
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Show {recommendations.length - maxItems} more popular items
          </button>
        </div>
      )}
    </div>
  )
}

interface PopularContentCardProps {
  page: DocumentationPage
  score: number
  rank: number
  showRank: boolean
}

function PopularContentCard({ page, score, rank, showRank }: PopularContentCardProps) {
  const pageUrl = `/docs/${page.id}`

  return (
    <article className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
      {showRank && (
        <div className="absolute top-2 right-2">
          <PopularityRankBadge rank={rank} />
        </div>
      )}

      <Link href={pageUrl} className="block">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 pr-8">
            {page.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {page.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center">
              <CategoryIcon category={page.category} />
              <span className="ml-1 capitalize">
                {page.category.replace('-', ' ')}
              </span>
            </span>
            
            <span className="inline-flex items-center">
              <DifficultyIcon difficulty={page.difficulty} />
              <span className="ml-1 capitalize">{page.difficulty}</span>
            </span>
          </div>
          
          <span className="flex items-center">
            <ClockIcon />
            <span className="ml-1">{page.estimatedReadTime} min</span>
          </span>
        </div>

        {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {page.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {page.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{page.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Updated {new Date(page.lastUpdated).toLocaleDateString()}
          </div>
          
          <div className="flex items-center text-xs text-gray-400">
            <TrendingIcon />
            <span className="ml-1">Popular</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

interface PopularityRankBadgeProps {
  rank: number
}

function PopularityRankBadge({ rank }: PopularityRankBadgeProps) {
  const getBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (rank <= 3) return 'bg-gray-100 text-gray-700 border-gray-200'
    return 'bg-blue-50 text-blue-600 border-blue-200'
  }

  const getBadgeIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded-full ${getBadgeColor(rank)}`}>
      {getBadgeIcon(rank)}
      <span className={rank === 1 ? 'ml-1' : ''}>#{rank}</span>
    </div>
  )
}

// Icon components
function CategoryIcon({ category }: { category: string }) {
  const iconClass = "w-3 h-3"
  
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
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

function DifficultyIcon({ difficulty }: { difficulty: string }) {
  const iconClass = "w-3 h-3"
  
  switch (difficulty) {
    case 'beginner':
      return <div className={`${iconClass} bg-green-500 rounded-full`} />
    case 'intermediate':
      return <div className={`${iconClass} bg-yellow-500 rounded-full`} />
    case 'advanced':
      return <div className={`${iconClass} bg-red-500 rounded-full`} />
    default:
      return null
  }
}

function ClockIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

// Helper function
function formatCategoryName(category: ContentCategory): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}