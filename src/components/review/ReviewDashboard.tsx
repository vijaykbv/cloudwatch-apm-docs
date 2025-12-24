'use client';

import React, { useState, useEffect } from 'react';
import { ReviewRequest, ReviewFilter, ReviewAnalytics } from '@/types/review';
import { ReviewService, ReviewUtils } from '@/lib/review';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';
import { ReviewAnalyticsDashboard } from './ReviewAnalyticsDashboard';
import { useAuth } from '@/components/auth';

interface ReviewDashboardProps {
  className?: string;
}

export function ReviewDashboard({ className = '' }: ReviewDashboardProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'my_reviews' | 'all_reviews' | 'analytics' | 'create'>('my_reviews');
  const [filter, setFilter] = useState<ReviewFilter>({});
  const [reviewService] = useState(() => new ReviewService());

  useEffect(() => {
    loadReviews();
    if (user?.roles.includes('admin') || user?.roles.includes('editor')) {
      loadAnalytics();
    }
  }, [activeTab, filter, user]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      let reviewFilter = { ...filter };
      
      // Apply tab-specific filters
      if (activeTab === 'my_reviews' && user) {
        reviewFilter = {
          ...reviewFilter,
          assignedTo: [user.id],
        };
      }
      
      const data = await reviewService.getReviewRequests(reviewFilter);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await reviewService.getAnalytics(filter);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleCreateReview = async (data: any) => {
    try {
      await reviewService.createReviewRequest(data);
      setActiveTab('my_reviews');
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
    }
  };

  const handleUpdateReview = async (id: string, updates: Partial<ReviewRequest>) => {
    try {
      await reviewService.updateReviewRequest(id, updates);
      await loadReviews();
      if (analytics) await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
    }
  };

  const handleSubmitReview = async (reviewRequestId: string, reviewData: any) => {
    try {
      await reviewService.submitReview(reviewRequestId, reviewData);
      await loadReviews();
      if (analytics) await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const handleApproveReview = async (reviewRequestId: string, decision: 'approved' | 'rejected', comments?: string) => {
    try {
      await reviewService.approveReviewRequest(reviewRequestId, decision, comments);
      await loadReviews();
      if (analytics) await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve review');
    }
  };

  const canCreateReview = user?.roles.includes('editor') || user?.roles.includes('admin');
  const canViewAnalytics = user?.roles.includes('admin') || user?.roles.includes('editor');

  if (!user) {
    return (
      <div className={`review-dashboard ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">Please sign in to access the review dashboard.</p>
        </div>
      </div>
    );
  }

  // Filter reviews for current user
  const myReviews = reviews.filter(review => 
    review.assignedReviewers.some(reviewer => reviewer.id === user.id) ||
    review.author.id === user.id
  );

  const pendingReviews = myReviews.filter(review => 
    review.status === 'pending' || review.status === 'in_review'
  );

  return (
    <div className={`review-dashboard ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Review Dashboard
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{pendingReviews.length} pending reviews</span>
            <span>{myReviews.length} total assigned</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('my_reviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my_reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Reviews ({myReviews.length})
          </button>
          
          {canViewAnalytics && (
            <>
              <button
                onClick={() => setActiveTab('all_reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all_reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Reviews ({reviews.length})
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </>
          )}
          
          {canCreateReview && (
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Review
            </button>
          )}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : (
        <>
          {(activeTab === 'my_reviews' || activeTab === 'all_reviews') && (
            <ReviewList
              reviews={activeTab === 'my_reviews' ? myReviews : reviews}
              currentUser={user}
              onUpdate={handleUpdateReview}
              onSubmitReview={handleSubmitReview}
              onApprove={handleApproveReview}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}

          {activeTab === 'analytics' && analytics && canViewAnalytics && (
            <ReviewAnalyticsDashboard analytics={analytics} />
          )}

          {activeTab === 'create' && canCreateReview && (
            <div className="max-w-4xl">
              <ReviewForm
                onSubmit={handleCreateReview}
                onCancel={() => setActiveTab('my_reviews')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}