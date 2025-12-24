'use client';

import React, { useState } from 'react';
import { Feedback, FeedbackStatus, FeedbackPriority } from '@/types/feedback';
import { FeedbackUtils } from '@/lib/feedback';

interface FeedbackItemProps {
  feedback: Feedback;
  onUpdate: (id: string, updates: Partial<Feedback>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onVote: (id: string, type: 'upvote' | 'downvote') => Promise<void>;
  onAssign: (id: string, assigneeId: string) => Promise<void>;
  currentUserId: string;
  canModerate: boolean;
  viewMode?: 'list' | 'grid';
}

export function FeedbackItem({
  feedback,
  onUpdate,
  onDelete,
  onVote,
  onAssign,
  currentUserId,
  canModerate,
  viewMode = 'list',
}: FeedbackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: feedback.status,
    priority: feedback.priority,
  });

  const userVote = feedback.votes.find(v => v.userId === currentUserId);
  const upvotes = feedback.votes.filter(v => v.type === 'upvote').length;
  const downvotes = feedback.votes.filter(v => v.type === 'downvote').length;
  const score = upvotes - downvotes;

  const canEdit = canModerate || feedback.author.id === currentUserId;
  const canDelete = canModerate || feedback.author.id === currentUserId;

  const handleStatusChange = async (status: FeedbackStatus) => {
    await onUpdate(feedback.id, { status });
    setEditData(prev => ({ ...prev, status }));
  };

  const handlePriorityChange = async (priority: FeedbackPriority) => {
    await onUpdate(feedback.id, { priority });
    setEditData(prev => ({ ...prev, priority }));
  };

  const handleVote = async (type: 'upvote' | 'downvote') => {
    await onVote(feedback.id, type);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      await onDelete(feedback.id);
    }
  };

  const resolutionTime = FeedbackUtils.getResolutionTime(feedback);

  if (viewMode === 'grid') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{FeedbackUtils.getTypeIcon(feedback.type)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${FeedbackUtils.getPriorityColor(feedback.priority)}`}>
              {feedback.priority}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${FeedbackUtils.getStatusColor(feedback.status)}`}>
            {feedback.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {feedback.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {feedback.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>{feedback.author.name}</span>
            <span>•</span>
            <span>{feedback.createdAt.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Votes */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleVote('upvote')}
                className={`p-1 rounded ${
                  userVote?.type === 'upvote'
                    ? 'text-green-600 bg-green-100'
                    : 'text-gray-400 hover:text-green-600'
                }`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className={score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-500'}>
                {score}
              </span>
              <button
                onClick={() => handleVote('downvote')}
                className={`p-1 rounded ${
                  userVote?.type === 'downvote'
                    ? 'text-red-600 bg-red-100'
                    : 'text-gray-400 hover:text-red-600'
                }`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Comments */}
            {feedback.comments.length > 0 && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                {feedback.comments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Vote Controls */}
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={() => handleVote('upvote')}
              className={`p-1 rounded ${
                userVote?.type === 'upvote'
                  ? 'text-green-600 bg-green-100'
                  : 'text-gray-400 hover:text-green-600'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className={`text-sm font-medium ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {score}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              className={`p-1 rounded ${
                userVote?.type === 'downvote'
                  ? 'text-red-600 bg-red-100'
                  : 'text-gray-400 hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{FeedbackUtils.getTypeIcon(feedback.type)}</span>
              <h3 className="font-medium text-gray-900">{feedback.title}</h3>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${FeedbackUtils.getPriorityColor(feedback.priority)}`}>
                {feedback.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${FeedbackUtils.getStatusColor(feedback.status)}`}>
                {feedback.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">{feedback.category.replace('_', ' ')}</span>
            </div>

            <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {feedback.description}
            </p>

            {feedback.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}

            {/* Tags */}
            {feedback.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {feedback.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Attachments */}
            {feedback.attachments.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Attachments:</div>
                <div className="space-y-1">
                  {feedback.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(canEdit || canDelete) && (
          <div className="flex items-center space-x-2">
            {canEdit && (
              <>
                <select
                  value={feedback.status}
                  onChange={(e) => handleStatusChange(e.target.value as FeedbackStatus)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={feedback.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as FeedbackPriority)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete feedback"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span>By {feedback.author.name}</span>
          <span>{feedback.createdAt.toLocaleDateString()}</span>
          {feedback.assignee && (
            <span>Assigned to {feedback.assignee.name}</span>
          )}
          {resolutionTime && (
            <span>Resolved in {FeedbackUtils.formatResolutionTime(resolutionTime)}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {feedback.comments.length > 0 && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              {feedback.comments.length} comments
            </span>
          )}
        </div>
      </div>
    </div>
  );
}