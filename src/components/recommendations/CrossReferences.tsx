'use client'

import React from 'react'
import Link from 'next/link'

interface CrossReference {
  targetPageId: string
  linkText: string
  context: string
  type: 'see-also' | 'prerequisite' | 'next-step' | 'related'
}

interface CrossReferencesProps {
  crossReferences: CrossReference[]
  className?: string
}

export function CrossReferences({ crossReferences, className = "" }: CrossReferencesProps) {
  if (crossReferences.length === 0) {
    return null
  }

  // Group cross-references by type
  const groupedRefs = crossReferences.reduce((groups, ref) => {
    if (!groups[ref.type]) {
      groups[ref.type] = []
    }
    groups[ref.type].push(ref)
    return groups
  }, {} as Record<string, CrossReference[]>)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Prerequisites */}
      {groupedRefs.prerequisite && (
        <CrossReferenceSection
          title="Prerequisites"
          icon={<PrerequisiteIcon />}
          references={groupedRefs.prerequisite}
          description="Recommended reading before this content"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          textColor="text-blue-900"
        />
      )}

      {/* Next Steps */}
      {groupedRefs['next-step'] && (
        <CrossReferenceSection
          title="Next Steps"
          icon={<NextStepIcon />}
          references={groupedRefs['next-step']}
          description="Continue your learning journey"
          bgColor="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-900"
        />
      )}

      {/* See Also */}
      {groupedRefs['see-also'] && (
        <CrossReferenceSection
          title="See Also"
          icon={<SeeAlsoIcon />}
          references={groupedRefs['see-also']}
          description="Related documentation"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          textColor="text-purple-900"
        />
      )}

      {/* Related Content */}
      {groupedRefs.related && (
        <CrossReferenceSection
          title="Related Topics"
          icon={<RelatedIcon />}
          references={groupedRefs.related}
          description="Content covering similar topics"
          bgColor="bg-gray-50"
          borderColor="border-gray-200"
          textColor="text-gray-900"
        />
      )}
    </div>
  )
}

interface CrossReferenceSectionProps {
  title: string
  icon: React.ReactNode
  references: CrossReference[]
  description: string
  bgColor: string
  borderColor: string
  textColor: string
}

function CrossReferenceSection({
  title,
  icon,
  references,
  description,
  bgColor,
  borderColor,
  textColor
}: CrossReferenceSectionProps) {
  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4`}>
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div>
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {references.map((ref, index) => (
          <CrossReferenceItem
            key={`${ref.targetPageId}-${index}`}
            reference={ref}
            textColor={textColor}
          />
        ))}
      </div>
    </div>
  )
}

interface CrossReferenceItemProps {
  reference: CrossReference
  textColor: string
}

function CrossReferenceItem({ reference, textColor }: CrossReferenceItemProps) {
  const pageUrl = `/docs/${reference.targetPageId}`

  return (
    <div className="flex items-start space-x-3 p-2 rounded hover:bg-white hover:bg-opacity-50 transition-colors">
      <div className="flex-shrink-0 mt-1">
        <TypeIcon type={reference.type} />
      </div>
      
      <div className="flex-1 min-w-0">
        <Link 
          href={pageUrl}
          className={`font-medium hover:underline ${textColor}`}
        >
          {reference.linkText}
        </Link>
        
        {reference.context && (
          <p className="text-sm text-gray-600 mt-1">
            {reference.context}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        <Link 
          href={pageUrl}
          className="text-gray-400 hover:text-gray-600"
          aria-label={`Go to ${reference.linkText}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

// Icon components for different cross-reference types
function PrerequisiteIcon() {
  return (
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  )
}

function NextStepIcon() {
  return (
    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
}

function SeeAlsoIcon() {
  return (
    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </div>
  )
}

function RelatedIcon() {
  return (
    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    </div>
  )
}

function TypeIcon({ type }: { type: string }) {
  const iconClass = "w-3 h-3"
  
  switch (type) {
    case 'prerequisite':
      return (
        <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )
    case 'next-step':
      return (
        <svg className={`${iconClass} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )
    case 'see-also':
      return (
        <svg className={`${iconClass} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )
    case 'related':
      return (
        <svg className={`${iconClass} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    default:
      return (
        <svg className={`${iconClass} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}