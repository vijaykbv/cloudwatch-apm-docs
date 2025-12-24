'use client'

import React from 'react'
import Link from 'next/link'
import type { RecommendationScore, RecommendationReason } from '../../lib/recommendation-system'
import type { DocumentationPage } from '../../types'

interface RelatedContentProps {
  recommendations: RecommendationScore[]
  pages: Map<string, DocumentationPage>
  title?: string
  showReasons?: boolean
  maxItems?: number
  className?: string
}

export function RelatedContent({
  recommendations,
  pages,
  title = "Related Content",
  showReasons = false,
  maxItems = 5,
  className = ""
}: RelatedContentProps) {
  const displayedRecommendations = recommendations.slice(0, maxItems)

  if (displayedRecommendations.length === 0) {
    return null
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {displayedRecommendations.map((recommendation) => {
          const page = pages.get(recommendation.pageId)
          if (!page) return null

          return (
            <RelatedContentItem
              key={recommendation.pageId}
              page={page}
              score={recommendation.score}
              reasons={recommendation.reasons}
              showReasons={showReasons}
            />
          )
        })}
      </div>

      {recommendations.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Show {recommendations.length - maxItems} more related items
          </button>
        </div>
      )}
    </div>
  )
}

interface RelatedContentItemProps {
  page: DocumentationPage
  score: number
  reasons: RecommendationReason[]
  showReasons: boolean
}

function RelatedContentItem({ page, score, reasons, showReasons }: RelatedContentItemProps) {
  const pageUrl = `/docs/${page.id}`

  return (
    <article className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-2">
        <Link 
          href={pageUrl}
          className="flex-1 group"
        >
          <h4 className="font-medium text-blue-600 group-hover:text-blue-800 mb-1">
            {page.title}
          </h4>
        </Link>
        
        <div className="flex items-center ml-4">
          <RecommendationScoreBadge score={score} />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {page.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
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
          
          <span>{page.estimatedReadTime} min read</span>
        </div>
      </div>

      {showReasons && reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Why recommended:</span>
            <ul className="mt-1 space-y-1">
              {reasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-center">
                  <ReasonIcon type={reason.type} />
                  <span className="ml-1">{reason.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {page.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
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
    </article>
  )
}

interface RecommendationScoreBadgeProps {
  score: number
}

function RecommendationScoreBadge({ score }: RecommendationScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 40) return 'bg-green-100 text-green-800'
    if (score >= 20) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 40) return 'High'
    if (score >= 20) return 'Medium'
    return 'Low'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(score)}`}>
      {getScoreLabel(score)}
    </span>
  )
}

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

function ReasonIcon({ type }: { type: string }) {
  const iconClass = "w-3 h-3 text-gray-400"
  
  switch (type) {
    case 'category':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    case 'audience':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    case 'tags':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    case 'difficulty':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'explicit':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}