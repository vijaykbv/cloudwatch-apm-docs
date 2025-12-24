'use client';

import React, { useState } from 'react';
import { Comment, CommentThread as CommentThreadType, CommentAuthor } from '@/types/comments';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { CommentUtils } from '@/lib/comments';

interface CommentThreadProps {
  thread: CommentThreadType;
  currentUser: CommentAuthor;
  onReply: (parentId: string, content: string, mentions: string[]) => Promise<void>;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onResolve: (commentId: string) => Promise<void>;
  onReaction: (commentId: string, emoji: string, add: boolean) => Promise<void>;
  className?: string;
}

export function CommentThread({
  thread,
  currentUser,
  onReply,
  onUpdate,
  onDelete,
  onResolve,
  onReaction,
  className = '',
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReply = async (content: string, mentions: string[]) => {
    await onReply(thread.rootComment.id, content, mentions);
    setShowReplyForm(false);
  };

  const canResolve = CommentUtils.canResolveComment(currentUser, thread.rootComment);
  const isResolved = thread.rootComment.status === 'resolved';

  return (
    <div className={`comment-thread ${className}`}>
      {/* Thread Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label={isCollapsed ? 'Expand thread' : 'Collapse thread'}
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {thread.totalReplies + 1} comment{thread.totalReplies !== 0 ? 's' : ''}
            </span>
            
            {thread.participants.length > 1 && (
              <div className="flex -space-x-1">
                {thread.participants.slice(0, 3).map((participant) => (
                  <div
                    key={participant.id}
                    className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    title={participant.name}
                  >
                    {participant.name.charAt(0)}
                  </div>
                ))}
                {thread.participants.length > 3 && (
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                    +{thread.participants.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isResolved && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Resolved
            </span>
          )}
          
          <span className="text-xs text-gray-500">
            Last activity: {thread.lastActivity.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Thread Content */}
      {!isCollapsed && (
        <div className="space-y-4">
          {/* Root Comment */}
          <CommentItem
            comment={thread.rootComment}
            currentUser={currentUser}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onReaction={onReaction}
            depth={0}
            showResolveButton={canResolve && !isResolved}
            onResolve={() => onResolve(thread.rootComment.id)}
          />

          {/* Replies */}
          {thread.replies.map((reply) => {
            const depth = CommentUtils.getThreadDepth(reply, [thread.rootComment, ...thread.replies]);
            return (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onReaction={onReaction}
                depth={Math.min(depth, 3)} // Limit visual nesting
              />
            );
          })}

          {/* Reply Form */}
          {!isResolved && (
            <div className="ml-12">
              {showReplyForm ? (
                <CommentForm
                  onSubmit={handleReply}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder="Write a reply..."
                  submitLabel="Reply"
                  availableUsers={thread.participants}
                />
              ) : (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reply to thread
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}