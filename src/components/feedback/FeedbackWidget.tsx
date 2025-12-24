'use client';

import React, { useState } from 'react';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackService } from '@/lib/feedback';
import { useAuth } from '@/components/auth';

interface FeedbackWidgetProps {
  pageId?: string;
  sectionId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function FeedbackWidget({
  pageId,
  sectionId,
  position = 'bottom-right',
  className = '',
}: FeedbackWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackService] = useState(() => new FeedbackService());

  const handleSubmit = async (data: any) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      await feedbackService.submitFeedback({
        pageId: pageId || window.location.pathname,
        sectionId,
        ...data,
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Feedback Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors group"
          title="Send Feedback"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Send Feedback
          </span>
        </button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Send Feedback
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Thank you!
                </h4>
                <p className="text-gray-600">
                  Your feedback has been submitted successfully.
                </p>
              </div>
            ) : (
              <FeedbackForm
                pageId={pageId || window.location.pathname}
                sectionId={sectionId}
                onSubmit={handleSubmit}
                onCancel={() => setIsOpen(false)}
                className="space-y-4"
              />
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Quick feedback buttons for common actions
export function QuickFeedbackButtons({
  pageId,
  sectionId,
  className = '',
}: {
  pageId?: string;
  sectionId?: string;
  className?: string;
}) {
  const { user } = useAuth();
  const [feedbackService] = useState(() => new FeedbackService());
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleQuickFeedback = async (type: 'helpful' | 'not_helpful' | 'unclear') => {
    if (!user) return;

    try {
      setSubmitting(type);
      
      const feedbackData = {
        helpful: {
          type: 'improvement' as const,
          category: 'content_accuracy' as const,
          title: 'Helpful content',
          description: 'This content was helpful.',
          priority: 'low' as const,
        },
        not_helpful: {
          type: 'improvement' as const,
          category: 'content_completeness' as const,
          title: 'Content not helpful',
          description: 'This content was not helpful.',
          priority: 'medium' as const,
        },
        unclear: {
          type: 'clarity' as const,
          category: 'content_clarity' as const,
          title: 'Content unclear',
          description: 'This content was unclear or confusing.',
          priority: 'medium' as const,
        },
      };

      await feedbackService.submitFeedback({
        pageId: pageId || window.location.pathname,
        sectionId,
        ...feedbackData[type],
        tags: ['quick-feedback'],
        attachments: [],
      });
    } catch (error) {
      console.error('Failed to submit quick feedback:', error);
    } finally {
      setSubmitting(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600">Was this helpful?</span>
      
      <button
        onClick={() => handleQuickFeedback('helpful')}
        disabled={submitting === 'helpful'}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>Yes</span>
      </button>
      
      <button
        onClick={() => handleQuickFeedback('not_helpful')}
        disabled={submitting === 'not_helpful'}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        <span>No</span>
      </button>
      
      <button
        onClick={() => handleQuickFeedback('unclear')}
        disabled={submitting === 'unclear'}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Unclear</span>
      </button>
    </div>
  );
}