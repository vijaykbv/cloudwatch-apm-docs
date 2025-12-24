/**
 * Unit tests for commenting system and thread management
 */

import { CommentService, CommentUtils } from '../comments';
import { Comment, CommentThread, CommentAuthor, TextSelection } from '@/types/comments';

// Mock fetch
global.fetch = jest.fn();

describe('CommentService', () => {
  let commentService: CommentService;

  beforeEach(() => {
    commentService = new CommentService('/api/comments');
    jest.clearAllMocks();
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

      (fetch as jest.Mock).mockResolvedValueOnce({
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
      (fetch as jest.Mock).mockResolvedValueOnce({
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockThreads),
      });

      const result = await commentService.getComments('page-1');

      expect(result).toEqual(mockThreads);
      expect(fetch).toHaveBeenCalledWith('/api/comments?pageId=page-1');
    });

    it('should fetch comments for a specific section', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await commentService.getComments('page-1', 'section-1');

      expect(fetch).toHaveBeenCalledWith('/api/comments?pageId=page-1&sectionId=section-1');
    });

    it('should throw error when fetching comments fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(commentService.getComments('invalid-page')).rejects.toThrow(
        'Failed to fetch comments: Not Found'
      );
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const updatedComment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: null,
        parentId: null,
        content: 'Updated comment content',
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
        status: 'resolved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedComment),
      });

      const updates = {
        content: 'Updated comment content',
        status: 'resolved' as const,
      };

      const result = await commentService.updateComment('comment-1', updates);

      expect(result).toEqual(updatedComment);
      expect(fetch).toHaveBeenCalledWith('/api/comments/comment-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await commentService.deleteComment('comment-1');

      expect(fetch).toHaveBeenCalledWith('/api/comments/comment-1', {
        method: 'DELETE',
      });
    });
  });

  describe('resolveComment', () => {
    it('should resolve a comment', async () => {
      const resolvedComment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: null,
        parentId: null,
        content: 'Comment content',
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
        status: 'resolved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(resolvedComment),
      });

      const result = await commentService.resolveComment('comment-1');

      expect(result.status).toBe('resolved');
    });
  });

  describe('addReaction', () => {
    it('should add reaction to comment', async () => {
      const commentWithReaction: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: null,
        parentId: null,
        content: 'Comment content',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'avatar-url',
          role: 'reviewer',
        },
        mentions: [],
        selectedText: null,
        reactions: [
          {
            emoji: '👍',
            users: [
              {
                id: 'user-2',
                name: 'Jane Doe',
                email: 'jane@example.com',
                avatar: 'avatar-url-2',
                role: 'editor',
              },
            ],
            count: 1,
          },
        ],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(commentWithReaction),
      });

      const result = await commentService.addReaction('comment-1', '👍');

      expect(result.reactions).toHaveLength(1);
      expect(result.reactions[0].emoji).toBe('👍');
    });
  });

  describe('getFilteredComments', () => {
    it('should fetch filtered comments', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const filter = {
        status: ['open', 'resolved'] as const,
        author: ['user-1'],
        pageId: 'page-1',
        mentionsMe: true,
      };

      await commentService.getFilteredComments(filter);

      expect(fetch).toHaveBeenCalledWith(
        '/api/comments/filter?status=open&status=resolved&author=user-1&pageId=page-1&mentionsMe=true'
      );
    });
  });

  describe('moderateComment', () => {
    it('should moderate a comment', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await commentService.moderateComment('comment-1', 'hide', 'Inappropriate content');

      expect(fetch).toHaveBeenCalledWith('/api/comments/comment-1/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'hide',
          reason: 'Inappropriate content',
        }),
      });
    });
  });
});

describe('CommentUtils', () => {
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

  describe('formatContentWithMentions', () => {
    it('should format content with mention highlights', () => {
      const content = 'Hey @user1, can you help @user2?';
      const users: CommentAuthor[] = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'avatar1',
          role: 'reviewer',
        },
        {
          id: 'user2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          avatar: 'avatar2',
          role: 'editor',
        },
      ];

      const formatted = CommentUtils.formatContentWithMentions(content, users);

      expect(formatted).toContain('<span class="mention" data-user-id="user1">@John Doe</span>');
      expect(formatted).toContain('<span class="mention" data-user-id="user2">@Jane Doe</span>');
    });

    it('should leave unknown mentions unchanged', () => {
      const content = 'Hey @unknown, how are you?';
      const users: CommentAuthor[] = [];

      const formatted = CommentUtils.formatContentWithMentions(content, users);

      expect(formatted).toBe('Hey @unknown, how are you?');
    });
  });

  describe('getThreadDepth', () => {
    it('should calculate thread depth correctly', () => {
      const comments: Comment[] = [
        {
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
        {
          id: 'comment-2',
          pageId: 'page-1',
          sectionId: null,
          parentId: 'comment-1',
          content: 'Reply to root',
          author: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            avatar: 'avatar-url-2',
            role: 'editor',
          },
          mentions: [],
          selectedText: null,
          reactions: [],
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment-3',
          pageId: 'page-1',
          sectionId: null,
          parentId: 'comment-2',
          content: 'Reply to reply',
          author: {
            id: 'user-3',
            name: 'Bob Smith',
            email: 'bob@example.com',
            avatar: 'avatar-url-3',
            role: 'reviewer',
          },
          mentions: [],
          selectedText: null,
          reactions: [],
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(CommentUtils.getThreadDepth(comments[0], comments)).toBe(0); // Root
      expect(CommentUtils.getThreadDepth(comments[1], comments)).toBe(1); // First level reply
      expect(CommentUtils.getThreadDepth(comments[2], comments)).toBe(2); // Second level reply
    });
  });

  describe('buildCommentTree', () => {
    it('should build comment thread tree correctly', () => {
      const comments: Comment[] = [
        {
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
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'comment-2',
          pageId: 'page-1',
          sectionId: null,
          parentId: 'comment-1',
          content: 'Reply to root',
          author: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            avatar: 'avatar-url-2',
            role: 'editor',
          },
          mentions: [],
          selectedText: null,
          reactions: [],
          status: 'open',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      const threads = CommentUtils.buildCommentTree(comments);

      expect(threads).toHaveLength(1);
      expect(threads[0].rootComment.id).toBe('comment-1');
      expect(threads[0].replies).toHaveLength(1);
      expect(threads[0].replies[0].id).toBe('comment-2');
      expect(threads[0].totalReplies).toBe(1);
      expect(threads[0].participants).toHaveLength(2);
    });

    it('should handle multiple root comments', () => {
      const comments: Comment[] = [
        {
          id: 'comment-1',
          pageId: 'page-1',
          sectionId: null,
          parentId: null,
          content: 'First root comment',
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
        {
          id: 'comment-2',
          pageId: 'page-1',
          sectionId: null,
          parentId: null,
          content: 'Second root comment',
          author: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            avatar: 'avatar-url-2',
            role: 'editor',
          },
          mentions: [],
          selectedText: null,
          reactions: [],
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const threads = CommentUtils.buildCommentTree(comments);

      expect(threads).toHaveLength(2);
      expect(threads[0].rootComment.id).toBe('comment-1');
      expect(threads[1].rootComment.id).toBe('comment-2');
    });
  });

  describe('canModerateComment', () => {
    const adminUser: CommentAuthor = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      avatar: 'admin-avatar',
      role: 'admin',
    };

    const regularUser: CommentAuthor = {
      id: 'user-1',
      name: 'Regular User',
      email: 'user@example.com',
      avatar: 'user-avatar',
      role: 'reviewer',
    };

    const comment: Comment = {
      id: 'comment-1',
      pageId: 'page-1',
      sectionId: null,
      parentId: null,
      content: 'Test comment',
      author: regularUser,
      mentions: [],
      selectedText: null,
      reactions: [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should allow admin to moderate any comment', () => {
      const canModerate = CommentUtils.canModerateComment(adminUser, comment);
      expect(canModerate).toBe(true);
    });

    it('should allow user to moderate their own comment', () => {
      const canModerate = CommentUtils.canModerateComment(regularUser, comment);
      expect(canModerate).toBe(true);
    });

    it('should not allow user to moderate others comments', () => {
      const otherUser: CommentAuthor = {
        id: 'user-2',
        name: 'Other User',
        email: 'other@example.com',
        avatar: 'other-avatar',
        role: 'reviewer',
      };

      const canModerate = CommentUtils.canModerateComment(otherUser, comment);
      expect(canModerate).toBe(false);
    });
  });

  describe('canResolveComment', () => {
    const adminUser: CommentAuthor = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      avatar: 'admin-avatar',
      role: 'admin',
    };

    const editorUser: CommentAuthor = {
      id: 'editor-1',
      name: 'Editor User',
      email: 'editor@example.com',
      avatar: 'editor-avatar',
      role: 'editor',
    };

    const regularUser: CommentAuthor = {
      id: 'user-1',
      name: 'Regular User',
      email: 'user@example.com',
      avatar: 'user-avatar',
      role: 'reviewer',
    };

    const comment: Comment = {
      id: 'comment-1',
      pageId: 'page-1',
      sectionId: null,
      parentId: null,
      content: 'Test comment',
      author: regularUser,
      mentions: [],
      selectedText: null,
      reactions: [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should allow admin to resolve any comment', () => {
      const canResolve = CommentUtils.canResolveComment(adminUser, comment);
      expect(canResolve).toBe(true);
    });

    it('should allow editor to resolve any comment', () => {
      const canResolve = CommentUtils.canResolveComment(editorUser, comment);
      expect(canResolve).toBe(true);
    });

    it('should allow comment author to resolve their own comment', () => {
      const canResolve = CommentUtils.canResolveComment(regularUser, comment);
      expect(canResolve).toBe(true);
    });

    it('should not allow regular user to resolve others comments', () => {
      const otherUser: CommentAuthor = {
        id: 'user-2',
        name: 'Other User',
        email: 'other@example.com',
        avatar: 'other-avatar',
        role: 'reviewer',
      };

      const canResolve = CommentUtils.canResolveComment(otherUser, comment);
      expect(canResolve).toBe(false);
    });
  });
});