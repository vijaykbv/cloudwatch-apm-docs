'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TextSelection } from '@/types/comments';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/components/auth';

interface InlineCommentTriggerProps {
  pageId: string;
  sectionId?: string;
  onCommentCreate: (content: string, mentions: string[], selectedText: TextSelection) => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function InlineCommentTrigger({
  pageId,
  sectionId,
  onCommentCreate,
  children,
  className = '',
}: InlineCommentTriggerProps) {
  const { user } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedText, setSelectedText] = useState<TextSelection | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !containerRef.current) {
        setSelectedText(null);
        setShowCommentForm(false);
        return;
      }

      // Check if selection is within our container
      const range = selection.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      const text = selection.toString().trim();
      if (text.length === 0) return;

      // Get context around the selection
      const containerText = containerRef.current.textContent || '';
      const startOffset = containerText.indexOf(text);
      const contextStart = Math.max(0, startOffset - 50);
      const contextEnd = Math.min(containerText.length, startOffset + text.length + 50);
      const context = containerText.substring(contextStart, contextEnd);

      const textSelection: TextSelection = {
        startOffset,
        endOffset: startOffset + text.length,
        selectedText: text,
        context,
      };

      setSelectedText(textSelection);

      // Position the comment button
      const rect = range.getBoundingClientRect();
      setButtonPosition({
        x: rect.right + 10,
        y: rect.top + window.scrollY,
      });
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedText(null);
        setShowCommentForm(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = async (content: string, mentions: string[]) => {
    if (!selectedText) return;

    try {
      await onCommentCreate(content, mentions, selectedText);
      setShowCommentForm(false);
      setSelectedText(null);
      
      // Clear selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Failed to create inline comment:', error);
    }
  };

  if (!user) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}

      {/* Comment Button */}
      {selectedText && !showCommentForm && (
        <button
          onClick={() => setShowCommentForm(true)}
          className="fixed z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
          }}
          title="Add comment to selected text"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </button>
      )}

      {/* Comment Form Popup */}
      {showCommentForm && selectedText && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-96"
          style={{
            left: `${Math.min(buttonPosition.x, window.innerWidth - 400)}px`,
            top: `${buttonPosition.y + 40}px`,
          }}
        >
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">Commenting on:</div>
            <div className="p-2 bg-yellow-50 border-l-4 border-yellow-200 rounded text-sm">
              <span className="text-gray-800 italic">"{selectedText.selectedText}"</span>
            </div>
          </div>

          <CommentForm
            onSubmit={handleCommentSubmit}
            onCancel={() => {
              setShowCommentForm(false);
              setSelectedText(null);
              window.getSelection()?.removeAllRanges();
            }}
            placeholder="Comment on this selection..."
            submitLabel="Add Comment"
          />
        </div>
      )}

      {/* Overlay to close form when clicking outside */}
      {showCommentForm && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCommentForm(false);
            setSelectedText(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </div>
  );
}