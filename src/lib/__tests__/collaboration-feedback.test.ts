/**
 * Unit tests for feedback collection and notification systems in collaboration features
 */

import { FeedbackService, FeedbackUtils } from '../feedback';
import { Feedback, FeedbackFilter, FeedbackAnalytics, FeedbackType, FeedbackCategory, FeedbackPriority, FeedbackStatus } from '@/types/feedback';

// Mock fetch
global.fetch = jest.fn();

// Mock browser APIs
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: {
    href: 'https://docs.cloudwatch-apm.aws.amazon.com/getting-started',
  },
  writable: true,
});

Object.defineProperty(document, 'referrer', {
  value: 'https://google.com',
  writable: true,
});

describe('Collaboration Feedback System', () => {
  let feedbackService: FeedbackService;

  beforeEach(() => {
    feedbackService = new FeedbackService('/api/feedback');
    jest.clearAllMocks();
  });

  describe('Feedback Submission', () => {
    it('should submit feedback with comprehensive metadata', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        sectionId: 'section-1',
        type: 'content_gap',
        category: 'content_completeness',
        title: 'Missing Java examples',
        description: 'The getting started guide lacks Java code examples',
        priority: 'medium',
        status: 'open',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          department: 'Engineering',
          role: 'developer',
        },
        assignee: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: undefined,
        tags: ['java', 'examples', 'getting-started'],
        attachments: [],
        votes: [],
        comments: [],
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          url: 'https://docs.cloudwatch-apm.aws.amazon.com/getting-started',
          viewport: {
            width: 1920,
            height: 1080,
          },
          timestamp: new Date(),
          referrer: 'https://google.com',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const feedbackData = {
        pageId: 'page-1',
        sectionId: 'section-1',
        type: 'content_gap' as FeedbackType,
        category: 'content_completeness' as FeedbackCategory,
        title: 'Missing Java examples',
        description: 'The getting started guide lacks Java code examples',
        priority: 'medium' as FeedbackPriority,
        tags: ['java', 'examples', 'getting-started'],
      };

      const result = await feedbackService.submitFeedback(feedbackData);

      expect(result).toEqual(mockFeedback);
      expect(fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    it('should handle feedback submission with attachments', async () => {
      const mockFile = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      
      const mockFeedback: Feedback = {
        id: 'feedback-2',
        pageId: 'page-1',
        type: 'technical_error',
        category: 'technical_issue',
        title: 'Page loading error',
        description: 'Page fails to load with console errors',
        priority: 'high',
        status: 'open',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        attachments: [
          {
            id: 'att-1',
            name: 'screenshot.png',
            url: '/uploads/screenshot.png',
            type: 'image/png',
            size: 1024,
            uploadedAt: new Date(),
          },
        ],
        votes: [],
        comments: [],
        metadata: {
          url: 'https://docs.cloudwatch-apm.aws.amazon.com/getting-started',
          timestamp: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const feedbackData = {
        pageId: 'page-1',
        type: 'technical_error' as FeedbackType,
        category: 'technical_issue' as FeedbackCategory,
        title: 'Page loading error',
        description: 'Page fails to load with console errors',
        priority: 'high' as FeedbackPriority,
        attachments: [mockFile],
      };

      const result = await feedbackService.submitFeedback(feedbackData);

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].name).toBe('screenshot.png');
    });

    it('should handle feedback submission failures', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const feedbackData = {
        pageId: 'page-1',
        type: 'bug' as FeedbackType,
        category: 'technical_issue' as FeedbackCategory,
        title: 'Test feedback',
        description: 'Test description',
      };

      await expect(feedbackService.submitFeedback(feedbackData)).rejects.toThrow(
        'Failed to submit feedback: Bad Request'
      );
    });
  });

  describe('Feedback Retrieval and Filtering', () => {
    it('should fetch feedback with complex filters', async () => {
      const mockFeedback: Feedback[] = [
        {
          id: 'feedback-1',
          pageId: 'page-1',
          type: 'bug',
          category: 'technical_issue',
          title: 'Test feedback',
          description: 'Test description',
          priority: 'high',
          status: 'open',
          author: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@amazon.com',
            role: 'developer',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          attachments: [],
          votes: [],
          comments: [],
          metadata: {
            url: 'https://example.com',
            timestamp: new Date(),
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const filter: FeedbackFilter = {
        type: ['bug', 'improvement'],
        status: ['open', 'in_progress'],
        priority: ['high', 'critical'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
        tags: ['urgent'],
        sortBy: 'priority',
        sortOrder: 'desc',
      };

      const result = await feedbackService.getFeedback(filter);

      expect(result).toEqual(mockFeedback);
      
      // Verify the URL construction with complex filters
      const expectedParams = new URLSearchParams();
      expectedParams.append('type[]', 'bug');
      expectedParams.append('type[]', 'improvement');
      expectedParams.append('status[]', 'open');
      expectedParams.append('status[]', 'in_progress');
      expectedParams.append('priority[]', 'high');
      expectedParams.append('priority[]', 'critical');
      expectedParams.append('dateRange[start]', '2023-01-01T00:00:00.000Z');
      expectedParams.append('dateRange[end]', '2023-12-31T00:00:00.000Z');
      expectedParams.append('tags[]', 'urgent');
      expectedParams.append('sortBy', 'priority');
      expectedParams.append('sortOrder', 'desc');

      expect(fetch).toHaveBeenCalledWith(`/api/feedback?${expectedParams.toString()}`);
    });

    it('should fetch single feedback item with details', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        type: 'suggestion',
        category: 'content_clarity',
        title: 'Improve documentation clarity',
        description: 'The configuration section could be clearer',
        priority: 'medium',
        status: 'in_progress',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        assignee: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@amazon.com',
          role: 'editor',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['documentation', 'clarity'],
        attachments: [],
        votes: [
          {
            userId: 'user-3',
            type: 'upvote',
            createdAt: new Date(),
          },
        ],
        comments: ['comment-1', 'comment-2'],
        metadata: {
          url: 'https://example.com',
          timestamp: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const result = await feedbackService.getFeedbackById('feedback-1');

      expect(result).toEqual(mockFeedback);
      expect(fetch).toHaveBeenCalledWith('/api/feedback/feedback-1');
    });
  });

  describe('Feedback Voting and Engagement', () => {
    it('should handle feedback voting', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        type: 'improvement',
        category: 'content_completeness',
        title: 'Add more examples',
        description: 'Need more code examples',
        priority: 'medium',
        status: 'open',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        attachments: [],
        votes: [
          {
            userId: 'user-2',
            type: 'upvote',
            createdAt: new Date(),
          },
        ],
        comments: [],
        metadata: {
          url: 'https://example.com',
          timestamp: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const result = await feedbackService.voteFeedback('feedback-1', 'upvote');

      expect(result.votes).toHaveLength(1);
      expect(result.votes[0].type).toBe('upvote');
      expect(fetch).toHaveBeenCalledWith('/api/feedback/feedback-1/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'upvote' }),
      });
    });

    it('should remove votes from feedback', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        type: 'improvement',
        category: 'content_completeness',
        title: 'Add more examples',
        description: 'Need more code examples',
        priority: 'medium',
        status: 'open',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        attachments: [],
        votes: [],
        comments: [],
        metadata: {
          url: 'https://example.com',
          timestamp: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const result = await feedbackService.removeVote('feedback-1');

      expect(result.votes).toHaveLength(0);
      expect(fetch).toHaveBeenCalledWith('/api/feedback/feedback-1/vote', {
        method: 'DELETE',
      });
    });
  });

  describe('Feedback Assignment and Management', () => {
    it('should assign feedback to team members', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        type: 'bug',
        category: 'technical_issue',
        title: 'Fix broken link',
        description: 'Link to API documentation is broken',
        priority: 'high',
        status: 'in_progress',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        assignee: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@amazon.com',
          role: 'editor',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        attachments: [],
        votes: [],
        comments: [],
        metadata: {
          url: 'https://example.com',
          timestamp: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const result = await feedbackService.assignFeedback('feedback-1', 'user-2');

      expect(result.assignee?.id).toBe('user-2');
      expect(result.status).toBe('in_progress');
      expect(fetch).toHaveBeenCalledWith('/api/feedback/feedback-1/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigneeId: 'user-2' }),
      });
    });

    it('should update feedback status and metadata', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        type: 'bug',
        category: 'technical_issue',
        title: 'Fix broken link',
        description: 'Link to API documentation is broken',
        priority: 'high',
        status: 'resolved',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: new Date(),
        tags: [],
        attachments: [],
        votes: [],
        comments: [],
        metadata: {
          url: 'https://example.com',
          timestamp: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      });

      const updates = {
        status: 'resolved' as FeedbackStatus,
        resolvedAt: new Date(),
      };

      const result = await feedbackService.updateFeedback('feedback-1', updates);

      expect(result.status).toBe('resolved');
      expect(result.resolvedAt).toBeDefined();
    });
  });

  describe('Feedback Analytics and Reporting', () => {
    it('should fetch comprehensive feedback analytics', async () => {
      const mockAnalytics: FeedbackAnalytics = {
        totalFeedback: 150,
        byType: {
          bug: 45,
          improvement: 60,
          content_gap: 25,
          technical_error: 15,
          clarity: 3,
          suggestion: 2,
        },
        byCategory: {
          content_accuracy: 20,
          content_completeness: 35,
          content_clarity: 25,
          technical_issue: 40,
          navigation: 15,
          search: 8,
          performance: 5,
          accessibility: 2,
          design: 0,
          other: 0,
        },
        byStatus: {
          open: 80,
          in_progress: 35,
          resolved: 30,
          closed: 5,
          duplicate: 0,
        },
        byPriority: {
          low: 40,
          medium: 70,
          high: 35,
          critical: 5,
        },
        averageResolutionTime: 172800000, // 2 days in milliseconds
        topPages: [
          {
            pageId: 'getting-started',
            title: 'Getting Started',
            count: 45,
          },
          {
            pageId: 'configuration',
            title: 'Configuration',
            count: 32,
          },
        ],
        topIssues: [
          {
            category: 'content_completeness',
            count: 35,
            averagePriority: 2.5,
          },
          {
            category: 'technical_issue',
            count: 40,
            averagePriority: 3.2,
          },
        ],
        trends: [
          {
            date: new Date('2023-01-01'),
            count: 10,
            resolved: 8,
          },
          {
            date: new Date('2023-01-02'),
            count: 15,
            resolved: 12,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalytics),
      });

      const result = await feedbackService.getAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(result.totalFeedback).toBe(150);
      expect(result.byType.bug).toBe(45);
      expect(result.topPages).toHaveLength(2);
    });

    it('should export feedback data in different formats', async () => {
      const mockBlob = new Blob(['feedback,data'], { type: 'text/csv' });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const exportConfig = {
        format: 'csv' as const,
        filter: {
          status: ['open', 'in_progress'] as FeedbackStatus[],
        },
        includeComments: true,
        includeAttachments: false,
      };

      const result = await feedbackService.exportFeedback(exportConfig);

      expect(result).toEqual(mockBlob);
      expect(fetch).toHaveBeenCalledWith('/api/feedback/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportConfig),
      });
    });
  });

  describe('Feedback Notifications', () => {
    it('should fetch feedback notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          feedbackId: 'feedback-1',
          type: 'new_feedback' as const,
          recipient: 'user-1',
          sender: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@amazon.com',
            role: 'developer',
          },
          message: 'New feedback submitted for your page',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 'notif-2',
          feedbackId: 'feedback-2',
          type: 'assignment' as const,
          recipient: 'user-1',
          sender: {
            id: 'user-3',
            name: 'Bob Smith',
            email: 'bob@amazon.com',
            role: 'admin',
          },
          message: 'You have been assigned feedback to review',
          read: true,
          createdAt: new Date(),
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotifications),
      });

      const result = await feedbackService.getNotifications();

      expect(result).toEqual(mockNotifications);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('new_feedback');
      expect(result[1].read).toBe(true);
    });

    it('should mark notifications as read', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await feedbackService.markNotificationRead('notif-1');

      expect(fetch).toHaveBeenCalledWith('/api/feedback/notifications/notif-1/read', {
        method: 'POST',
      });
    });
  });

  describe('Feedback Utility Functions', () => {
    it('should get correct priority colors', () => {
      expect(FeedbackUtils.getPriorityColor('low')).toBe('text-green-600 bg-green-100');
      expect(FeedbackUtils.getPriorityColor('medium')).toBe('text-yellow-600 bg-yellow-100');
      expect(FeedbackUtils.getPriorityColor('high')).toBe('text-orange-600 bg-orange-100');
      expect(FeedbackUtils.getPriorityColor('critical')).toBe('text-red-600 bg-red-100');
    });

    it('should get correct status colors', () => {
      expect(FeedbackUtils.getStatusColor('open')).toBe('text-blue-600 bg-blue-100');
      expect(FeedbackUtils.getStatusColor('in_progress')).toBe('text-yellow-600 bg-yellow-100');
      expect(FeedbackUtils.getStatusColor('resolved')).toBe('text-green-600 bg-green-100');
      expect(FeedbackUtils.getStatusColor('closed')).toBe('text-gray-600 bg-gray-100');
      expect(FeedbackUtils.getStatusColor('duplicate')).toBe('text-purple-600 bg-purple-100');
    });

    it('should get correct type icons', () => {
      expect(FeedbackUtils.getTypeIcon('bug')).toBe('🐛');
      expect(FeedbackUtils.getTypeIcon('improvement')).toBe('💡');
      expect(FeedbackUtils.getTypeIcon('content_gap')).toBe('📝');
      expect(FeedbackUtils.getTypeIcon('technical_error')).toBe('⚠️');
      expect(FeedbackUtils.getTypeIcon('clarity')).toBe('❓');
      expect(FeedbackUtils.getTypeIcon('suggestion')).toBe('💭');
    });

    it('should calculate resolution time correctly', () => {
      const feedback: Feedback = {
        id: 'feedback-1',
        pageId: 'page-1',
        type: 'bug',
        category: 'technical_issue',
        title: 'Test feedback',
        description: 'Test description',
        priority: 'medium',
        status: 'resolved',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'developer',
        },
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-03T10:00:00Z'),
        resolvedAt: new Date('2023-01-03T10:00:00Z'),
        tags: [],
        attachments: [],
        votes: [],
        comments: [],
        metadata: {
          url: 'https://example.com',
          timestamp: new Date(),
        },
      };

      const resolutionTime = FeedbackUtils.getResolutionTime(feedback);
      expect(resolutionTime).toBe(172800000); // 2 days in milliseconds
    });

    it('should format resolution time correctly', () => {
      expect(FeedbackUtils.formatResolutionTime(172800000)).toBe('2d 0h'); // 2 days
      expect(FeedbackUtils.formatResolutionTime(7200000)).toBe('2h'); // 2 hours
      expect(FeedbackUtils.formatResolutionTime(1800000)).toBe('30m'); // 30 minutes
    });

    it('should group feedback by category', () => {
      const feedback: Feedback[] = [
        {
          id: 'feedback-1',
          pageId: 'page-1',
          type: 'bug',
          category: 'technical_issue',
          title: 'Bug 1',
          description: 'Description 1',
          priority: 'high',
          status: 'open',
          author: { id: 'user-1', name: 'User 1', email: 'user1@amazon.com', role: 'developer' },
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          attachments: [],
          votes: [],
          comments: [],
          metadata: { url: 'https://example.com', timestamp: new Date() },
        },
        {
          id: 'feedback-2',
          pageId: 'page-2',
          type: 'improvement',
          category: 'content_completeness',
          title: 'Improvement 1',
          description: 'Description 2',
          priority: 'medium',
          status: 'open',
          author: { id: 'user-2', name: 'User 2', email: 'user2@amazon.com', role: 'developer' },
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          attachments: [],
          votes: [],
          comments: [],
          metadata: { url: 'https://example.com', timestamp: new Date() },
        },
      ];

      const grouped = FeedbackUtils.groupByCategory(feedback);

      expect(grouped.technical_issue).toHaveLength(1);
      expect(grouped.content_completeness).toHaveLength(1);
      expect(grouped.technical_issue[0].id).toBe('feedback-1');
      expect(grouped.content_completeness[0].id).toBe('feedback-2');
    });

    it('should sort feedback by priority and date', () => {
      const feedback: Feedback[] = [
        {
          id: 'feedback-1',
          pageId: 'page-1',
          type: 'bug',
          category: 'technical_issue',
          title: 'Low priority',
          description: 'Description 1',
          priority: 'low',
          status: 'open',
          author: { id: 'user-1', name: 'User 1', email: 'user1@amazon.com', role: 'developer' },
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
          tags: [],
          attachments: [],
          votes: [],
          comments: [],
          metadata: { url: 'https://example.com', timestamp: new Date() },
        },
        {
          id: 'feedback-2',
          pageId: 'page-2',
          type: 'bug',
          category: 'technical_issue',
          title: 'Critical priority',
          description: 'Description 2',
          priority: 'critical',
          status: 'open',
          author: { id: 'user-2', name: 'User 2', email: 'user2@amazon.com', role: 'developer' },
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date(),
          tags: [],
          attachments: [],
          votes: [],
          comments: [],
          metadata: { url: 'https://example.com', timestamp: new Date() },
        },
      ];

      const sorted = FeedbackUtils.sortByPriority(feedback);

      expect(sorted[0].priority).toBe('critical');
      expect(sorted[1].priority).toBe('low');
    });
  });
});