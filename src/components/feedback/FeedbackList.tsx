'use client';

import React, { useState } from 'react';
import { Feedback, FeedbackFilter, FeedbackStatus, FeedbackPriority, FeedbackType, FeedbackCategory } from '@/types/feedback';
import { FeedbackUtils } from '@/lib/feedback';
import { FeedbackItem } from './FeedbackItem';

interface FeedbackListProps {
  feedback: Feedback[];
  onUpdate: (id: string, updates: Partial<Feedback>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onVote: (id: string, type: 'upvote' | 'downvote') => Promise<void>;
  onAssign: (id: string, assigneeId: string) => Promise<void>;
  currentUserId: string;
  canModerate: boolean;
  className?: string;
}

export function FeedbackList({
  feedback,
  onUpdate,
  onDelete,
  onVote,
  onAssign,
  currentUserId,
  canModerate,
  className = '',
}: FeedbackListProps) {
  const [filter, setFilter] = useState<FeedbackFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'votes'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Apply filters and search
  const filteredFeedback = React.useMemo(() => {
    let result = [...feedback];

    // Apply search
    if (searchQuery) {
      result = FeedbackUtils.searchFeedback(result, searchQuery);
    }

    // Apply filters
    if (filter.status && filter.status.length > 0) {
      result = result.filter(item => filter.status!.includes(item.status));
    }

    if (filter.type && filter.type.length > 0) {
      result = result.filter(item => filter.type!.includes(item.type));
    }

    if (filter.category && filter.category.length > 0) {
      result = result.filter(item => filter.category!.includes(item.category));
    }

    if (filter.priority && filter.priority.length > 0) {
      result = result.filter(item => filter.priority!.includes(item.priority));
    }

    if (filter.assignee && filter.assignee.length > 0) {
      result = result.filter(item => 
        item.assignee && filter.assignee!.includes(item.assignee.id)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'votes':
          const aVotes = a.votes.filter(v => v.type === 'upvote').length - a.votes.filter(v => v.type === 'downvote').length;
          const bVotes = b.votes.filter(v => v.type === 'upvote').length - b.votes.filter(v => v.type === 'downvote').length;
          comparison = aVotes - bVotes;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [feedback, filter, searchQuery, sortBy, sortOrder]);

  const summary = FeedbackUtils.getSummary(filteredFeedback);

  const handleFilterChange = (key: keyof FeedbackFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({});
    setSearchQuery('');
  };

  return (
    <div className={`feedback-list ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Feedback ({filteredFeedback.length})
          </h2>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{summary.open} open</span>
            <span>{summary.resolved} resolved</span>
            {summary.critical > 0 && (
              <span className="text-red-600 font-medium">{summary.critical} critical</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Sort Controls */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="updated-desc">Recently Updated</option>
            <option value="priority-desc">High Priority First</option>
            <option value="votes-desc">Most Voted</option>
          </select>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              multiple
              value={filter.status || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as FeedbackStatus[];
                handleFilterChange('status', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              multiple
              value={filter.type || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as FeedbackType[];
                handleFilterChange('type', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="bug">Bug</option>
              <option value="improvement">Improvement</option>
              <option value="content_gap">Content Gap</option>
              <option value="technical_error">Technical Error</option>
              <option value="clarity">Clarity</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              multiple
              value={filter.priority || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as FeedbackPriority[];
                handleFilterChange('priority', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              multiple
              value={filter.category || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as FeedbackCategory[];
                handleFilterChange('category', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="content_accuracy">Content Accuracy</option>
              <option value="content_completeness">Content Completeness</option>
              <option value="content_clarity">Content Clarity</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="navigation">Navigation</option>
              <option value="search">Search</option>
              <option value="performance">Performance</option>
              <option value="accessibility">Accessibility</option>
              <option value="design">Design</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(Object.keys(filter).length > 0 || searchQuery) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Feedback Items */}
      {filteredFeedback.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
          <p className="text-gray-600">
            {searchQuery || Object.keys(filter).length > 0
              ? 'Try adjusting your search or filters.'
              : 'No feedback has been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredFeedback.map((item) => (
            <FeedbackItem
              key={item.id}
              feedback={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onVote={onVote}
              onAssign={onAssign}
              currentUserId={currentUserId}
              canModerate={canModerate}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}