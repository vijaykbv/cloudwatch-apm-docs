'use client';

import React, { useState } from 'react';
import { Comment, CommentAuthor } from '@/types/comments';
import { CommentForm } from './CommentForm';
import { CommentUtils } from '@/lib/comments';

interface CommentItemProps {
  comment: Comment;
  currentUser: CommentAuthor;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReaction: (commentId: string, emoji: string, add: boolean) => Promise<void>;
  onResolve?: () => Promise<void>;
  depth?: number;
  showResolveButton?: boolean;
}

export function CommentItem({
  comment,
  currentUser,
  onUpdate,
  onDelete,
  onReaction,
  onResolve,
  depth = 0,
  showResolveButton = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const canEdit = currentUser.id === comment.author.id || currentUser.role === 'admin';
  const canDelete = CommentUtils.canModerateComment(currentUser, comment);

  const handleEdit = async (content: string) => {
    await onUpdate(comment.id, content);
    setIsEditing(false);
  };

  const handleReaction = async (emoji: string) => {
    const userReacted = comment.reactions.some(r => 
      r.emoji === emoji && r.users.includes(currentUser.id)
    );
    await onReaction(comment.id, emoji, !userReacted);
    setShowReactions(false);
  };

  const marginLeft = Math.min(depth * 24, 72); // Max 3 levels of nesting

  return (
    <div 
      className="comment-item"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div className="flex space-x-3">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {comment.author.name.charAt(0)}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.author.name}
            </span>
            
            {comment.author.department && (
              <span className="text-xs text-gray-500">
                {comment.author.department}
              </span>
            )}
            
            <span className="text-xs text-gray-500">
              {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
            </span>
            
            {comment.updatedAt > comment.createdAt && (
              <span className="text-xs text-gray-400 italic">
                (edited)
              </span>
            )}

            {comment.status === 'resolved' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Resolved
              </span>
            )}
          </div>

          {/* Selected Text Context */}
          {comment.selectedText && (
            <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-200 rounded">
              <div className="text-xs text-gray-600 mb-1">Commenting on:</div>
              <div className="text-sm text-gray-800 italic">
                "{comment.selectedText.selectedText}"
              </div>
            </div>
          )}

          {/* Comment Body */}
          {isEditing ? (
            <CommentForm
              initialContent={comment.content}
              onSubmit={(content) => handleEdit(content)}
              onCancel={() => setIsEditing(false)}
              submitLabel="Update"
            />
          ) : (
            <div className="text-sm text-gray-700 mb-2">
              <div 
                dangerouslySetInnerHTML={{
                  __html: CommentUtils.formatContentWithMentions(comment.content, [comment.author])
                }}
              />
            </div>
          )}

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">Attachments:</div>
              <div className="space-y-1">
                {comment.attachments.map((attachment) => (
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

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              {comment.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    reaction.users.includes(currentUser.id)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Reaction Button */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="text-gray-500 hover:text-gray-700"
              >
                React
              </button>
              
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                  <div className="flex space-x-1">
                    {['👍', '👎', '❤️', '😄', '😮', '😢', '😡'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
            )}

            {/* Delete Button */}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}

            {/* Resolve Button */}
            {showResolveButton && onResolve && (
              <button
                onClick={onResolve}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}