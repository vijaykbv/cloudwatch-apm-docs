/**
 * Unit tests for commenting system and thread management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentService, CommentUtils } from '../comments';
import { Comment, CommentThread, CommentAuthor, TextSelection } from '@/types/comments';

// Mock fetch
global.fetch = vi.fn();

describe('CommentService', () => {
  let commentService: CommentService;

  beforeEach(() => {
    commentService = new CommentService('/api/comments');
    vi.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const mockComment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: 'section-1',
        parentId: null,
        content: 'This is a test comment',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'avatar-url',
          role: 'reviewer',
        },
        mentions: ['user-2'],
        selectedText: {
          text: 'selected text',
          startOffset: 0,
          endOffset: 13,
          context: 'surrounding context',
        },
        reactions: [],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockComment),
      });

      const commentData = {
        pageId: 'page-1',
        sectionId: 'section-1',
        content: 'This is a test comment',
        mentions: ['user-2'],
        selectedText: {
          text: 'selected text',
          startOffset: 0,
          endOffset: 13,
          context: 'surrounding context',
        },
      };

      const result = await commentService.createComment(commentData);

      expect(result).toEqual(mockComment);
      expect(fetch).toHaveBeenCalledWith('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
    });

    it('should throw error when comment creation fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const commentData = {
        pageId: 'page-1',
        content: 'This is a test comment',
      };

      await expect(commentService.createComment(commentData)).rejects.toThrow(
        'Failed to create comment: Bad Request'
      );
    });
  });

  describe('getComments', () => {
    it('should fetch comments for a page', async () => {
      const mockThreads: CommentThread[] = [
        {
          id: 'thread-1',
          rootComment: {
            id: 'comment-1',
            pageId: 'page-1',
            sectionId: null,
            parentId: null,
            content: 'Root comment',
            author: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
              avatar: 'avatar-url',
              role: 'reviewer',
            },
            mentions: [],
            selectedText: null,
            reactions: [],
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          replies: [],
          totalReplies: 0,
          lastActivity: new Date(),
          participants: [],
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockThreads),
      });

      const result = await commentService.getComments('page-1');

      expect(result).toEqual(mockThreads);
      expect(fetch).toHaveBeenCalledWith('/api/comments?pageId=page-1');
    });
  });

  describe('extractMentions', () => {
    it('should extract mentions from comment content', () => {
      const content = 'Hey @john, can you review this? Also @jane might be interested.';
      const mentions = CommentUtils.extractMentions(content);

      expect(mentions).toEqual(['john', 'jane']);
    });

    it('should handle duplicate mentions', () => {
      const content = 'Hey @john, @john can you help?';
      const mentions = CommentUtils.extractMentions(content);

      expect(mentions).toEqual(['john']);
    });

    it('should return empty array when no mentions', () => {
      const content = 'This is a comment without mentions.';
      const mentions = CommentUtils.extractMentions(content);

      expect(mentions).toEqual([]);
    });
  });
});