'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CommentAuthor } from '@/types/comments';
import { CommentUtils } from '@/lib/comments';

interface CommentFormProps {
  onSubmit: (content: string, mentions: string[]) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  placeholder?: string;
  submitLabel?: string;
  availableUsers?: CommentAuthor[];
  className?: string;
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = '',
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  availableUsers = [],
  className = '',
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const mentions = CommentUtils.extractMentions(content);
      await onSubmit(content.trim(), mentions);
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }

    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(value);

    // Check for mention trigger
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPosition - mentionMatch[0].length);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: CommentAuthor) => {
    const beforeMention = content.substring(0, mentionPosition);
    const afterMention = content.substring(mentionPosition + mentionQuery.length + 1);
    const newContent = `${beforeMention}@${user.id} ${afterMention}`;
    
    setContent(newContent);
    setShowMentions(false);
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPosition = mentionPosition + user.id.length + 2;
      textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className={`comment-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isSubmitting}
          />

          {/* Mention Dropdown */}
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute z-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
              <div className="p-2 text-xs text-gray-600 border-b border-gray-100">
                Mention someone
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredUsers.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => insertMention(user)}
                    className="w-full p-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.department}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Use @ to mention someone • {content.length}/2000 characters
          </div>
          
          <div className="flex items-center space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting || content.length > 2000}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : submitLabel}
            </button>
          </div>
        </div>
      </form>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-400 mt-2">
        <span className="font-mono">Cmd/Ctrl + Enter</span> to submit • <span className="font-mono">Esc</span> to cancel
      </div>
    </div>
  );
}