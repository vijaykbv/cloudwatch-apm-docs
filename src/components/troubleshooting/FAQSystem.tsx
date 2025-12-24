'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { FAQ, FAQCategory } from '../../types/troubleshooting'
import { faqs, searchFAQs, getFAQsByCategory } from '../../data/troubleshooting-data'

interface FAQSystemProps {
  className?: string
}

export default function FAQSystem({ className = '' }: FAQSystemProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all')
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([])
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const categories: FAQCategory[] = [
    'general', 'setup', 'configuration', 'troubleshooting', 'billing', 'integration'
  ]

  useEffect(() => {
    let faqList: FAQ[] = []

    if (searchQuery) {
      faqList = searchFAQs(searchQuery)
    } else {
      if (selectedCategory !== 'all') {
        faqList = getFAQsByCategory(selectedCategory)
      } else {
        faqList = [...faqs].sort((a, b) => b.popularity - a.popularity)
      }
    }

    setFilteredFAQs(faqList)
  }, [searchQuery, selectedCategory])

  const getCategoryIcon = (category: FAQCategory) => {
    const icons = {
      general: '❓',
      setup: '🚀',
      configuration: '⚙️',
      troubleshooting: '🔧',
      billing: '💰',
      integration: '🔗'
    }
    return icons[category] || '❓'
  }

  const getCategoryColor = (category: FAQCategory) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      setup: 'bg-blue-100 text-blue-800',
      configuration: 'bg-green-100 text-green-800',
      troubleshooting: 'bg-orange-100 text-orange-800',
      billing: 'bg-yellow-100 text-yellow-800',
      integration: 'bg-purple-100 text-purple-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getPopularityStars = (popularity: number) => {
    const stars = Math.min(5, Math.max(1, Math.round(popularity / 20)))
    return '⭐'.repeat(stars)
  }

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  return (
    <div className={`faq-system ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">
          Find quick answers to common questions about CloudWatch APM.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="faq-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search FAQs
            </label>
            <Input
              id="faq-search"
              type="text"
              placeholder="Search questions and answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="faq-category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="faq-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FAQCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Popular FAQs */}
      {!searchQuery && selectedCategory === 'all' && (
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Questions</h2>
          <div className="grid gap-3">
            {filteredFAQs.slice(0, 3).map(faq => (
              <button
                key={faq.id}
                onClick={() => toggleFAQ(faq.id)}
                className="text-left p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">{faq.question}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getPopularityStars(faq.popularity)}</span>
                    <span className="text-gray-400">{expandedFAQ === faq.id ? '−' : '+'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery ? `Search Results (${filteredFAQs.length})` : `All FAQs (${filteredFAQs.length})`}
          </h2>
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <Card key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getCategoryIcon(faq.category)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                          {faq.category}
                        </span>
                        <span className="text-sm text-gray-500">{getPopularityStars(faq.popularity)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{faq.question}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Updated {faq.lastUpdated.toLocaleDateString()}</span>
                        {faq.relatedIssues.length > 0 && (
                          <span>{faq.relatedIssues.length} related issue{faq.relatedIssues.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl text-gray-400">
                        {expandedFAQ === faq.id ? '−' : '+'}
                      </span>
                    </div>
                  </div>
                </button>

                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      <div className="prose max-w-none">
                        <div className="text-gray-700 whitespace-pre-wrap">{faq.answer}</div>
                      </div>

                      {/* Tags */}
                      {faq.tags.length > 0 && (
                        <div className="mt-4">
                          <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                          <div className="inline-flex flex-wrap gap-1">
                            {faq.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Issues */}
                      {faq.relatedIssues.length > 0 && (
                        <div className="mt-4">
                          <span className="text-sm font-medium text-gray-700 mr-2">Related Issues:</span>
                          <div className="inline-flex flex-wrap gap-1">
                            {faq.relatedIssues.map((issueId, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {issueId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Was this helpful?</span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              👍 Yes
                            </Button>
                            <Button size="sm" variant="outline">
                              👎 No
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">❓</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or category filter.
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Suggest New FAQ */}
      <Card className="p-6 mt-8 bg-green-50 border-green-200">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can't Find What You're Looking For?</h3>
            <p className="text-gray-700 mb-4">
              If you have a question that's not covered in our FAQ, we'd love to hear from you. 
              Your question might help other users too!
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                Suggest a Question
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}