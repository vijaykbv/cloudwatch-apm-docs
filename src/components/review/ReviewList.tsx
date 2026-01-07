'use client';

import React, { useState } from 'react';
import { ReviewRequest, ReviewFilter, ReviewUser } from '@/types/review';
import { ReviewUtils } from '@/lib/review';
// import { ReviewItem } from './ReviewItem'; // TODO: Create ReviewItem component

interface ReviewListProps {
  reviews: ReviewRequest[];
  currentUser: ReviewUser;
  onUpdate: (id: string, updates: Partial<ReviewRequest>) => Promise<void>;
  onSubmitReview: (reviewRequestId: string, reviewData: any) => Promise<void>;
  onApprove: (reviewRequestId: string, decision: 'approved' | 'rejected', comments?: string) => Promise<void>;
  filter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
  className?: string;
}

export function ReviewList({
  reviews,
  currentUser,
  onUpdate,
  onSubmitReview,
  onApprove,
  filter,
  onFilterChange,
  className = '',
}: ReviewListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'dueDate'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Apply search and sorting
  const processedReviews = React.useMemo(() => {
    let result = [...reviews];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(review =>
        review.title.toLowerCase().includes(query) ||
        review.description.toLowerCase().includes(query) ||
        review.author.name.toLowerCase().includes(query) ||
        review.tags.some(tag => tag.toLowerCase().includes(query))
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
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (a.dueDate && b.dueDate) {
            comparison = a.dueDate.getTime() - b.dueDate.getTime();
          } else if (a.dueDate) {
            comparison = -1;
          } else if (b.dueDate) {
            comparison = 1;
          }
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [reviews, searchQuery, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof ReviewFilter, value: any) => {
    onFilterChange({ ...filter, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
    setSearchQuery('');
  };

  // Group reviews by status for kanban view
  const reviewsByStatus = React.useMemo(() => {
    return ReviewUtils.groupByStatus(processedReviews);
  }, [processedReviews]);

  const statusColumns = [
    { status: 'pending' as const, title: 'Pending', color: 'bg-yellow-100 border-yellow-300' },
    { status: 'in_review' as const, title: 'In Review', color: 'bg-blue-100 border-blue-300' },
    { status: 'changes_requested' as const, title: 'Changes Requested', color: 'bg-orange-100 border-orange-300' },
    { status: 'approved' as const, title: 'Approved', color: 'bg-green-100 border-green-300' },
  ];

  return (
    <div className={`review-list ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviews ({processedReviews.length})
          </h2>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{reviewsByStatus.pending?.length || 0} pending</span>
            <span>{reviewsByStatus.in_review?.length || 0} in review</span>
            <span>{reviewsByStatus.approved?.length || 0} approved</span>
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
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kanban
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
            <option value="priority-desc">High Priority First</option>
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="created-desc">Newest First</option>
            <option value="updated-desc">Recently Updated</option>
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
            placeholder="Search reviews..."
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
                const values = Array.from(e.target.selectedOptions, option => option.value) as any[];
                handleFilterChange('status', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
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
                const values = Array.from(e.target.selectedOptions, option => option.value) as any[];
                handleFilterChange('type', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="content_review">Content Review</option>
              <option value="technical_review">Technical Review</option>
              <option value="editorial_review">Editorial Review</option>
              <option value="compliance_review">Compliance Review</option>
              <option value="final_approval">Final Approval</option>
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
                const values = Array.from(e.target.selectedOptions, option => option.value) as any[];
                handleFilterChange('priority', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              multiple
              value={filter.stage || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as any[];
                handleFilterChange('stage', values.length > 0 ? values : undefined);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              size={3}
            >
              <option value="draft">Draft</option>
              <option value="peer_review">Peer Review</option>
              <option value="technical_review">Technical Review</option>
              <option value="editorial_review">Editorial Review</option>
              <option value="final_approval">Final Approval</option>
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

      {/* Content */}
      {processedReviews.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">
            {searchQuery || Object.keys(filter).length > 0
              ? 'Try adjusting your search or filters.'
              : 'No reviews have been created yet.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {processedReviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="text-gray-500">ReviewItem component not yet implemented</div>
              <div className="text-sm text-gray-400">Review ID: {review.id}</div>
            </div>
            /* <ReviewItem
              key={review.id}
              review={review}
              currentUser={currentUser}
              onUpdate={onUpdate}
              onSubmitReview={onSubmitReview}
              onApprove={onApprove}
            /> */
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusColumns.map((column) => (
            <div key={column.status} className={`rounded-lg border-2 ${column.color} p-4`}>
              <h3 className="font-medium text-gray-900 mb-4">
                {column.title} ({reviewsByStatus[column.status]?.length || 0})
              </h3>
              <div className="space-y-3">
                {(reviewsByStatus[column.status] || []).map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                      {review.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{review.author.name}</span>
                      <span className={`px-2 py-1 rounded-full ${ReviewUtils.getPriorityColor(review.priority)}`}>
                        {review.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{ReviewUtils.getStageDisplayName(review.workflowStage)}</span>
                      {review.dueDate && (
                        <span className={ReviewUtils.isOverdue(review) ? 'text-red-600' : ''}>
                          {ReviewUtils.getTimeRemaining(review)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${ReviewUtils.getReviewCompletion(review)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}