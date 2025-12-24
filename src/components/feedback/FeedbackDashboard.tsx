'use client';

import React, { useState, useEffect } from 'react';
import { Feedback, FeedbackAnalytics, FeedbackFilter } from '@/types/feedback';
import { FeedbackService, FeedbackUtils } from '@/lib/feedback';
import { FeedbackList } from './FeedbackList';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackAnalyticsDashboard } from './FeedbackAnalyticsDashboard';
import { useAuth } from '@/components/auth';

interface FeedbackDashboardProps {
  pageId?: string;
  sectionId?: string;
  className?: string;
}

export function FeedbackDashboard({ pageId, sectionId, className = '' }: FeedbackDashboardProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'submit'>('list');
  const [feedbackService] = useState(() => new FeedbackService());

  useEffect(() => {
    loadFeedback();
    loadAnalytics();
  }, [pageId, sectionId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filter: FeedbackFilter = {};
      if (pageId) filter.pageId = pageId;
      if (sectionId) filter.sectionId = sectionId;
      
      const data = await feedbackService.getFeedback(filter);
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const filter: FeedbackFilter = {};
      if (pageId) filter.pageId = pageId;
      if (sectionId) filter.sectionId = sectionId;
      
      const data = await feedbackService.getAnalytics(filter);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleSubmitFeedback = async (data: {
    type: any;
    category: any;
    title: string;
    description: string;
    priority: any;
    tags: string[];
    attachments: File[];
  }) => {
    if (!user) return;

    try {
      await feedbackService.submitFeedback({
        pageId: pageId || window.location.pathname,
        sectionId,
        ...data,
      });
      
      setActiveTab('list');
      await loadFeedback();
      await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  const handleUpdateFeedback = async (id: string, updates: Partial<Feedback>) => {
    try {
      await feedbackService.updateFeedback(id, updates);
      await loadFeedback();
      await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feedback');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await feedbackService.deleteFeedback(id);
      await loadFeedback();
      await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feedback');
    }
  };

  const handleVoteFeedback = async (id: string, type: 'upvote' | 'downvote') => {
    try {
      await feedbackService.voteFeedback(id, type);
      await loadFeedback();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote on feedback');
    }
  };

  const handleAssignFeedback = async (id: string, assigneeId: string) => {
    try {
      await feedbackService.assignFeedback(id, assigneeId);
      await loadFeedback();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign feedback');
    }
  };

  const canModerate = user?.roles.includes('admin') || user?.roles.includes('editor');

  if (!user) {
    return (
      <div className={`feedback-dashboard ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">Please sign in to view and submit feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`feedback-dashboard ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Feedback Dashboard
          </h1>
          
          {analytics && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{analytics.totalFeedback} total</span>
              <span>{analytics.byStatus.open || 0} open</span>
              <span>{analytics.byStatus.resolved || 0} resolved</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Feedback List ({feedback.length})
          </button>
          
          {canModerate && (
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
          )}
          
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submit Feedback
          </button>
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
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      ) : (
        <>
          {activeTab === 'list' && (
            <FeedbackList
              feedback={feedback}
              onUpdate={handleUpdateFeedback}
              onDelete={handleDeleteFeedback}
              onVote={handleVoteFeedback}
              onAssign={handleAssignFeedback}
              currentUserId={user.id}
              canModerate={canModerate}
            />
          )}

          {activeTab === 'analytics' && analytics && canModerate && (
            <FeedbackAnalyticsDashboard analytics={analytics} />
          )}

          {activeTab === 'submit' && (
            <div className="max-w-4xl">
              <FeedbackForm
                pageId={pageId || window.location.pathname}
                sectionId={sectionId}
                onSubmit={handleSubmitFeedback}
                onCancel={() => setActiveTab('list')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}