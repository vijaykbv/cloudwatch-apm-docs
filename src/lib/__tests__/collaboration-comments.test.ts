/**
 * Unit tests for commenting system and thread management in collaboration features
 */

import { CommentService, CommentUtils } from '../comments';
import { Comment, CommentThread, CommentAuthor, CommentFilter } from '@/types/comments';

// Mock fetch
global.fetch = jest.fn();

describe('Collaboration Comments System', () => {
  let commentService: CommentService;

  beforeEach(() => {
    commentService = new CommentService('/api/comments');
    jest.clearAllMocks();
  });

  describe('Comment Creation and Management', () => {
    it('should create comments with proper collaboration metadata', async () => {
      const mockComment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: 'section-1',
        parentId: undefined,
        content: 'This section needs clarification @john',
        author: {
          id: 'user-1',
          name: 'Jane Doe',
          email: 'jane@amazon.com',
          avatar: 'avatar-url',
          role: 'editor',
        },
        mentions: ['john'],
        selectedText: {
          startOffset: 0,
          endOffset: 13,
          selectedText: 'selected text',
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
        content: 'This section needs clarification @john',
        mentions: ['john'],
        selectedText: {
          startOffset: 0,
          endOffset: 13,
          selectedText: 'selected text',
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

    it('should handle comment creation failures', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const commentData = {
        pageId: 'page-1',
        content: 'Test comment',
      };

      await expect(commentService.createComment(commentData)).rejects.toThrow(
        'Failed to create comment: Bad Request'
      );
    });

    it('should update comments with collaboration tracking', async () => {
      const updatedComment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: undefined,
        parentId: undefined,
        content: 'Updated comment content',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          avatar: 'avatar-url',
          role: 'reviewer',
        },
        mentions: [],
        selectedText: undefined,
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

  describe('Thread Management', () => {
    it('should fetch comment threads with proper structure', async () => {
      const mockThreads: CommentThread[] = [
        {
          id: 'thread-1',
          rootComment: {
            id: 'comment-1',
            pageId: 'page-1',
            sectionId: undefined,
            parentId: undefined,
            content: 'Root comment',
            author: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@amazon.com',
              avatar: 'avatar-url',
              role: 'reviewer',
            },
            mentions: [],
            selectedText: undefined,
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

    it('should build comment thread trees correctly', () => {
      const comments: Comment[] = [
        {
          id: 'comment-1',
          pageId: 'page-1',
          sectionId: undefined,
          parentId: undefined,
          content: 'Root comment',
          author: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@amazon.com',
            avatar: 'avatar-url',
            role: 'reviewer',
          },
          mentions: [],
          selectedText: undefined,
          reactions: [],
          status: 'open',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'comment-2',
          pageId: 'page-1',
          sectionId: undefined,
          parentId: 'comment-1',
          content: 'Reply to root',
          author: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@amazon.com',
            avatar: 'avatar-url-2',
            role: 'editor',
          },
          mentions: [],
          selectedText: undefined,
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

    it('should calculate thread depth correctly', () => {
      const comments: Comment[] = [
        {
          id: 'comment-1',
          pageId: 'page-1',
          sectionId: undefined,
          parentId: undefined,
          content: 'Root comment',
          author: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@amazon.com',
            avatar: 'avatar-url',
            role: 'reviewer',
          },
          mentions: [],
          selectedText: undefined,
          reactions: [],
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment-2',
          pageId: 'page-1',
          sectionId: undefined,
          parentId: 'comment-1',
          content: 'Reply to root',
          author: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@amazon.com',
            avatar: 'avatar-url-2',
            role: 'editor',
          },
          mentions: [],
          selectedText: undefined,
          reactions: [],
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment-3',
          pageId: 'page-1',
          sectionId: undefined,
          parentId: 'comment-2',
          content: 'Reply to reply',
          author: {
            id: 'user-3',
            name: 'Bob Smith',
            email: 'bob@amazon.com',
            avatar: 'avatar-url-3',
            role: 'reviewer',
          },
          mentions: [],
          selectedText: undefined,
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

  describe('Comment Reactions and Interactions', () => {
    it('should add reactions to comments', async () => {
      const commentWithReaction: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: undefined,
        parentId: undefined,
        content: 'Comment content',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          avatar: 'avatar-url',
          role: 'reviewer',
        },
        mentions: [],
        selectedText: undefined,
        reactions: [
          {
            emoji: '👍',
            users: ['user-2'],
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
      expect(result.reactions[0].count).toBe(1);
    });

    it('should resolve comment threads', async () => {
      const resolvedComment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: undefined,
        parentId: undefined,
        content: 'Comment content',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          avatar: 'avatar-url',
          role: 'reviewer',
        },
        mentions: [],
        selectedText: undefined,
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

  describe('Comment Filtering and Search', () => {
    it('should filter comments by various criteria', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const filter: CommentFilter = {
        status: ['open', 'resolved'],
        author: ['user-1'],
        pageId: 'page-1',
        mentionsMe: true,
      };

      await commentService.getFilteredComments(filter);

      expect(fetch).toHaveBeenCalledWith(
        '/api/comments/filter?status=open&status=resolved&author=user-1&pageId=page-1&mentionsMe=true'
      );
    });

    it('should handle date range filters', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const filter: CommentFilter = {
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
      };

      await commentService.getFilteredComments(filter);

      const expectedUrl = '/api/comments/filter?startDate=2023-01-01T00%3A00%3A00.000Z&endDate=2023-12-31T00%3A00%3A00.000Z';
      expect(fetch).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('Comment Moderation', () => {
    it('should moderate comments with proper authorization', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await commentService.moderateComment('comment-1', 'approve', 'Content is appropriate');

      expect(fetch).toHaveBeenCalledWith('/api/comments/comment-1/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          reason: 'Content is appropriate',
        }),
      });
    });

    it('should check moderation permissions correctly', () => {
      const adminUser: CommentAuthor = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@amazon.com',
        avatar: 'admin-avatar',
        role: 'admin',
      };

      const regularUser: CommentAuthor = {
        id: 'user-1',
        name: 'Regular User',
        email: 'user@amazon.com',
        avatar: 'user-avatar',
        role: 'reviewer',
      };

      const comment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: undefined,
        parentId: undefined,
        content: 'Test comment',
        author: regularUser,
        mentions: [],
        selectedText: undefined,
        reactions: [],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Admin should be able to moderate any comment
      expect(CommentUtils.canModerateComment(adminUser, comment)).toBe(true);

      // User should be able to moderate their own comment
      expect(CommentUtils.canModerateComment(regularUser, comment)).toBe(true);

      // Other users should not be able to moderate
      const otherUser: CommentAuthor = {
        id: 'user-2',
        name: 'Other User',
        email: 'other@amazon.com',
        avatar: 'other-avatar',
        role: 'reviewer',
      };

      expect(CommentUtils.canModerateComment(otherUser, comment)).toBe(false);
    });

    it('should check resolution permissions correctly', () => {
      const adminUser: CommentAuthor = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@amazon.com',
        avatar: 'admin-avatar',
        role: 'admin',
      };

      const editorUser: CommentAuthor = {
        id: 'editor-1',
        name: 'Editor User',
        email: 'editor@amazon.com',
        avatar: 'editor-avatar',
        role: 'editor',
      };

      const regularUser: CommentAuthor = {
        id: 'user-1',
        name: 'Regular User',
        email: 'user@amazon.com',
        avatar: 'user-avatar',
        role: 'reviewer',
      };

      const comment: Comment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: undefined,
        parentId: undefined,
        content: 'Test comment',
        author: regularUser,
        mentions: [],
        selectedText: undefined,
        reactions: [],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Admin and editor should be able to resolve any comment
      expect(CommentUtils.canResolveComment(adminUser, comment)).toBe(true);
      expect(CommentUtils.canResolveComment(editorUser, comment)).toBe(true);

      // Comment author should be able to resolve their own comment
      expect(CommentUtils.canResolveComment(regularUser, comment)).toBe(true);

      // Other regular users should not be able to resolve
      const otherUser: CommentAuthor = {
        id: 'user-2',
        name: 'Other User',
        email: 'other@amazon.com',
        avatar: 'other-avatar',
        role: 'reviewer',
      };

      expect(CommentUtils.canResolveComment(otherUser, comment)).toBe(false);
    });
  });

  describe('Mention Processing', () => {
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

    it('should format content with mention highlights', () => {
      const content = 'Hey @user1, can you help @user2?';
      const users: CommentAuthor[] = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@amazon.com',
          avatar: 'avatar1',
          role: 'reviewer',
        },
        {
          id: 'user2',
          name: 'Jane Doe',
          email: 'jane@amazon.com',
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

  describe('Notification Management', () => {
    it('should fetch comment notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'mention' as const,
          commentId: 'comment-1',
          recipient: 'user-1',
          sender: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@amazon.com',
            avatar: 'avatar-url',
            role: 'editor' as const,
          },
          message: 'You were mentioned in a comment',
          read: false,
          createdAt: new Date(),
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotifications),
      });

      const result = await commentService.getNotifications();

      expect(result).toEqual(mockNotifications);
      expect(fetch).toHaveBeenCalledWith('/api/comments/notifications');
    });

    it('should mark notifications as read', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await commentService.markNotificationRead('notif-1');

      expect(fetch).toHaveBeenCalledWith('/api/comments/notifications/notif-1/read', {
        method: 'POST',
      });
    });
  });
});