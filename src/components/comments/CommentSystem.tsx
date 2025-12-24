'use client';

import React, { useState, useEffect } from 'react';
import { Comment, CommentThread as CommentThreadType, CommentFilter, CommentAuthor } from '@/types/comments';
import { CommentService, CommentUtils } from '@/lib/comments';
import { CommentThread } from './CommentThread';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/components/auth';

interface CommentSystemProps {
  pageId: string;
  sectionId?: string;
  className?: string;
}

export function CommentSystem({ pageId, sectionId, className = '' }: CommentSystemProps) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<CommentThreadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);
  const [filter, setFilter] = useState<CommentFilter>({});
  const [commentService] = useState(() => new CommentService());

  useEffect(() => {
    loadComments();
  }, [pageId, sectionId, filter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      
      let comments: Comment[];
      
      if (Object.keys(filter).length > 0) {
        const filteredThreads = await commentService.getFilteredComments({
          ...filter,
          pageId,
          sectionId,
        });
        comments = filteredThreads.flatMap(thread => [thread.rootComment, ...thread.replies]);
      } else {
        const fetchedThreads = await commentService.getComments(pageId, sectionId);
        comments = fetchedThreads.flatMap(thread => [thread.rootComment, ...thread.replies]);
      }
      
      const commentThreads = CommentUtils.buildCommentTree(comments);
      setThreads(commentThreads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleNewComment = async (content: string, mentions: string[]) => {
    if (!user) return;

    try {
      await commentService.createComment({
        pageId,
        sectionId,
        content,
        mentions,
      });
      
      setShowNewCommentForm(false);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
    }
  };

  const handleReply = async (parentId: string, content: string, mentions: string[]) => {
    if (!user) return;

    try {
      await commentService.createComment({
        pageId,
        sectionId,
        parentId,
        content,
        mentions,
      });
      
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reply');
    }
  };

  const handleUpdate = async (commentId: string, content: string) => {
    try {
      await commentService.updateComment(commentId, { content });
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await commentService.resolveComment(commentId);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve comment');
    }
  };

  const handleReaction = async (commentId: string, emoji: string, add: boolean) => {
    try {
      if (add) {
        await commentService.addReaction(commentId, emoji);
      } else {
        await commentService.removeReaction(commentId, emoji);
      }
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reaction');
    }
  };

  const handleFilterChange = (newFilter: Partial<CommentFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  if (!user) {
    return (
      <div className={`comment-system ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">Please sign in to view and add comments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`comment-system ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({threads.reduce((total, thread) => total + thread.totalReplies + 1, 0)})
        </h3>
        
        <div className="flex items-center space-x-3">
          {/* Filter Dropdown */}
          <select
            value={filter.status?.[0] || 'all'}
            onChange={(e) => {
              const status = e.target.value;
              handleFilterChange({
                status: status === 'all' ? undefined : [status as any],
              });
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Comments</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={() => setShowNewCommentForm(!showNewCommentForm)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Comment
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* New Comment Form */}
      {showNewCommentForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <CommentForm
            onSubmit={handleNewComment}
            onCancel={() => setShowNewCommentForm(false)}
            placeholder="Start a new discussion..."
            availableUsers={threads.flatMap(t => t.participants)}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading comments...</p>
        </div>
      )}

      {/* Comments */}
      {!loading && (
        <div className="space-y-6">
          {threads.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <p className="text-gray-600">No comments yet.</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to start a discussion!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <CommentThread
                key={thread.id}
                thread={thread}
                currentUser={user}
                onReply={handleReply}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onResolve={handleResolve}
                onReaction={handleReaction}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}