/**
 * Unit tests for review and approval workflow system in collaboration features
 */

import { ReviewService, ReviewUtils } from '../review';
import { ReviewRequest, Review, ReviewComment, ReviewAssignment, ReviewAnalytics, ReviewFilter, ReviewStatus, ReviewDecision, WorkflowStage } from '@/types/review';

// Mock fetch
global.fetch = jest.fn();

describe('Collaboration Review System', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService('/api/reviews');
    jest.clearAllMocks();
  });

  describe('Review Request Management', () => {
    it('should create review requests with proper workflow configuration', async () => {
      const mockReviewRequest: ReviewRequest = {
        id: 'review-1',
        title: 'Update Getting Started Guide',
        description: 'Comprehensive update to the getting started documentation',
        type: 'content_review',
        status: 'pending',
        priority: 'medium',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'author',
          department: 'Documentation',
          expertise: ['documentation', 'aws-services'],
        },
        assignedReviewers: [
          {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@amazon.com',
            role: 'reviewer',
            department: 'Engineering',
            expertise: ['cloudwatch', 'monitoring'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        contentId: 'getting-started-guide',
        contentType: 'page',
        contentUrl: '/getting-started',
        changes: [
          {
            id: 'change-1',
            type: 'modification',
            section: 'Prerequisites',
            oldContent: 'Old prerequisite text',
            newContent: 'Updated prerequisite text',
            author: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@amazon.com',
              role: 'author',
              expertise: [],
            },
            timestamp: new Date(),
            description: 'Updated prerequisites for clarity',
          },
        ],
        reviews: [],
        approvals: [],
        requiredApprovals: 2,
        workflowStage: 'peer_review',
        tags: ['documentation', 'getting-started'],
        metadata: {
          estimatedReviewTime: 60,
          complexity: 'medium',
          impactLevel: 'high',
          audience: ['developer', 'operations'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviewRequest),
      });

      const reviewData = {
        title: 'Update Getting Started Guide',
        description: 'Comprehensive update to the getting started documentation',
        type: 'content_review' as const,
        priority: 'medium' as const,
        contentId: 'getting-started-guide',
        contentType: 'page' as const,
        contentUrl: '/getting-started',
        assignedReviewers: ['user-2'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['documentation', 'getting-started'],
        requiredApprovals: 2,
      };

      const result = await reviewService.createReviewRequest(reviewData);

      expect(result).toEqual(mockReviewRequest);
      expect(result.workflowStage).toBe('peer_review');
      expect(result.assignedReviewers).toHaveLength(1);
      expect(result.requiredApprovals).toBe(2);
    });

    it('should fetch review requests with complex filtering', async () => {
      const mockReviewRequests: ReviewRequest[] = [
        {
          id: 'review-1',
          title: 'Content Review 1',
          description: 'Description 1',
          type: 'content_review',
          status: 'pending',
          priority: 'high',
          author: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@amazon.com',
            role: 'author',
            expertise: [],
          },
          assignedReviewers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          contentId: 'content-1',
          contentType: 'page',
          contentUrl: '/page-1',
          changes: [],
          reviews: [],
          approvals: [],
          requiredApprovals: 1,
          workflowStage: 'peer_review',
          tags: [],
          metadata: {
            estimatedReviewTime: 30,
            complexity: 'low',
            impactLevel: 'medium',
            audience: ['developer'],
            relatedReviews: [],
            externalReferences: [],
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviewRequests),
      });

      const filter: ReviewFilter = {
        status: ['pending', 'in_review'],
        type: ['content_review'],
        priority: ['high', 'urgent'],
        assignedTo: ['user-2'],
        stage: ['peer_review'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
        overdue: false,
      };

      const result = await reviewService.getReviewRequests(filter);

      expect(result).toEqual(mockReviewRequests);
      
      // Verify URL construction
      const expectedParams = new URLSearchParams();
      expectedParams.append('status[]', 'pending');
      expectedParams.append('status[]', 'in_review');
      expectedParams.append('type[]', 'content_review');
      expectedParams.append('priority[]', 'high');
      expectedParams.append('priority[]', 'urgent');
      expectedParams.append('assignedTo[]', 'user-2');
      expectedParams.append('stage[]', 'peer_review');
      expectedParams.append('dateRange[start]', '2023-01-01T00:00:00.000Z');
      expectedParams.append('dateRange[end]', '2023-12-31T00:00:00.000Z');
      expectedParams.append('overdue', 'false');

      expect(fetch).toHaveBeenCalledWith(`/api/reviews?${expectedParams.toString()}`);
    });
  });

  describe('Review Submission and Management', () => {
    it('should submit comprehensive reviews with comments', async () => {
      const mockReview: Review = {
        id: 'review-1',
        reviewerId: 'user-2',
        reviewer: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@amazon.com',
          role: 'reviewer',
          department: 'Engineering',
          expertise: ['cloudwatch', 'monitoring'],
        },
        status: 'completed',
        decision: 'request_changes',
        comments: [
          {
            id: 'comment-1',
            content: 'The prerequisites section needs more detail about IAM permissions',
            type: 'suggestion',
            severity: 'major',
            lineNumber: 15,
            section: 'Prerequisites',
            resolved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'comment-2',
            content: 'Consider adding a troubleshooting section',
            type: 'suggestion',
            severity: 'minor',
            resolved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        submittedAt: new Date(),
        timeSpent: 45,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReview),
      });

      const reviewData = {
        decision: 'request_changes' as ReviewDecision,
        comments: [
          {
            content: 'The prerequisites section needs more detail about IAM permissions',
            type: 'suggestion' as const,
            severity: 'major' as const,
            lineNumber: 15,
            section: 'Prerequisites',
          },
          {
            content: 'Consider adding a troubleshooting section',
            type: 'suggestion' as const,
            severity: 'minor' as const,
          },
        ],
        timeSpent: 45,
      };

      const result = await reviewService.submitReview('review-request-1', reviewData);

      expect(result).toEqual(mockReview);
      expect(result.decision).toBe('request_changes');
      expect(result.comments).toHaveLength(2);
      expect(result.timeSpent).toBe(45);
    });

    it('should handle review comment resolution', async () => {
      const mockResolvedComment: ReviewComment = {
        id: 'comment-1',
        content: 'The prerequisites section needs more detail',
        type: 'suggestion',
        severity: 'major',
        lineNumber: 15,
        section: 'Prerequisites',
        resolved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResolvedComment),
      });

      const result = await reviewService.resolveComment('review-1', 'review-1', 'comment-1');

      expect(result.resolved).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/reviews/review-1/reviews/review-1/comments/comment-1/resolve', {
        method: 'POST',
      });
    });
  });

  describe('Reviewer Assignment and Workload Management', () => {
    it('should assign reviewers with expertise matching', async () => {
      const mockAssignments: ReviewAssignment[] = [
        {
          id: 'assignment-1',
          reviewRequestId: 'review-1',
          reviewerId: 'user-2',
          reviewer: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@amazon.com',
            role: 'reviewer',
            department: 'Engineering',
            expertise: ['cloudwatch', 'monitoring', 'aws-services'],
          },
          assignedBy: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@amazon.com',
            role: 'admin',
            expertise: [],
          },
          assignedAt: new Date(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          workload: 2, // 2 hours estimated
          expertise: ['cloudwatch', 'monitoring'],
          status: 'assigned',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAssignments),
      });

      const result = await reviewService.assignReviewers('review-1', ['user-2']);

      expect(result).toEqual(mockAssignments);
      expect(result[0].expertise).toContain('cloudwatch');
      expect(result[0].expertise).toContain('monitoring');
      expect(result[0].workload).toBe(2);
    });

    it('should handle reviewer assignment responses', async () => {
      const mockAssignment: ReviewAssignment = {
        id: 'assignment-1',
        reviewRequestId: 'review-1',
        reviewerId: 'user-2',
        reviewer: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@amazon.com',
          role: 'reviewer',
          expertise: [],
        },
        assignedBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'admin',
          expertise: [],
        },
        assignedAt: new Date(),
        workload: 2,
        expertise: [],
        status: 'accepted',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAssignment),
      });

      const result = await reviewService.respondToAssignment('assignment-1', 'accept', 'I can review this within the timeline');

      expect(result.status).toBe('accepted');
      expect(fetch).toHaveBeenCalledWith('/api/reviews/assignments/assignment-1/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          response: 'accept', 
          reason: 'I can review this within the timeline' 
        }),
      });
    });

    it('should fetch reviewer workload analytics', async () => {
      const mockWorkload = [
        {
          reviewerId: 'user-2',
          reviewer: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@amazon.com',
            role: 'reviewer',
            expertise: ['cloudwatch'],
          },
          activeReviews: 3,
          completedReviews: 15,
          averageTime: 90, // minutes
        },
        {
          reviewerId: 'user-3',
          reviewer: {
            id: 'user-3',
            name: 'Bob Johnson',
            email: 'bob@amazon.com',
            role: 'reviewer',
            expertise: ['documentation'],
          },
          activeReviews: 1,
          completedReviews: 8,
          averageTime: 60,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkload),
      });

      const result = await reviewService.getReviewerWorkload();

      expect(result).toEqual(mockWorkload);
      expect(result[0].activeReviews).toBe(3);
      expect(result[1].averageTime).toBe(60);
    });
  });

  describe('Workflow Management', () => {
    it('should advance workflow stages correctly', async () => {
      const mockAdvancedRequest: ReviewRequest = {
        id: 'review-1',
        title: 'Content Review',
        description: 'Review description',
        type: 'content_review',
        status: 'in_review',
        priority: 'medium',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'author',
          expertise: [],
        },
        assignedReviewers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        contentId: 'content-1',
        contentType: 'page',
        contentUrl: '/page-1',
        changes: [],
        reviews: [],
        approvals: [],
        requiredApprovals: 1,
        workflowStage: 'technical_review', // Advanced from peer_review
        nextStage: 'editorial_review',
        tags: [],
        metadata: {
          estimatedReviewTime: 30,
          complexity: 'low',
          impactLevel: 'medium',
          audience: ['developer'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAdvancedRequest),
      });

      const result = await reviewService.advanceWorkflowStage('review-1', 'technical_review');

      expect(result.workflowStage).toBe('technical_review');
      expect(result.nextStage).toBe('editorial_review');
    });

    it('should fetch available workflows', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Standard Content Review',
          description: 'Standard workflow for content reviews',
          stages: [
            {
              stage: 'peer_review' as WorkflowStage,
              name: 'Peer Review',
              description: 'Initial peer review stage',
              requiredReviewers: 1,
              requiredApprovals: 1,
              reviewerRoles: ['reviewer'],
              approverRoles: ['editor'],
              timeLimit: 72, // 3 days
              autoAdvance: false,
              conditions: [
                {
                  type: 'all_reviews_complete',
                  parameters: {},
                },
              ],
            },
            {
              stage: 'editorial_review' as WorkflowStage,
              name: 'Editorial Review',
              description: 'Editorial review for content quality',
              requiredReviewers: 1,
              requiredApprovals: 1,
              reviewerRoles: ['editor'],
              approverRoles: ['admin'],
              timeLimit: 48, // 2 days
              autoAdvance: true,
              conditions: [
                {
                  type: 'minimum_approvals',
                  parameters: { count: 1 },
                },
              ],
            },
          ],
          rules: [
            {
              id: 'rule-1',
              condition: 'high_priority',
              action: 'assign_reviewer',
              parameters: { role: 'senior_reviewer' },
            },
          ],
          isDefault: true,
          contentTypes: ['page', 'document'],
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkflows),
      });

      const result = await reviewService.getWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(result[0].stages).toHaveLength(2);
      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('Approval Management', () => {
    it('should handle review approvals with conditions', async () => {
      const mockApprovedRequest: ReviewRequest = {
        id: 'review-1',
        title: 'Content Review',
        description: 'Review description',
        type: 'content_review',
        status: 'approved',
        priority: 'medium',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'author',
          expertise: [],
        },
        assignedReviewers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        contentId: 'content-1',
        contentType: 'page',
        contentUrl: '/page-1',
        changes: [],
        reviews: [],
        approvals: [
          {
            id: 'approval-1',
            approverId: 'user-2',
            approver: {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane@amazon.com',
              role: 'editor',
              expertise: [],
            },
            decision: 'approved',
            comments: 'Content looks good with minor suggestions addressed',
            timestamp: new Date(),
            conditions: ['Fix typos in section 3', 'Update screenshot'],
          },
        ],
        requiredApprovals: 1,
        workflowStage: 'final_approval',
        tags: [],
        metadata: {
          estimatedReviewTime: 30,
          complexity: 'low',
          impactLevel: 'medium',
          audience: ['developer'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApprovedRequest),
      });

      const result = await reviewService.approveReviewRequest(
        'review-1', 
        'approved', 
        'Content looks good with minor suggestions addressed',
        ['Fix typos in section 3', 'Update screenshot']
      );

      expect(result.status).toBe('approved');
      expect(result.approvals).toHaveLength(1);
      expect(result.approvals[0].conditions).toContain('Fix typos in section 3');
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('Review Analytics and Reporting', () => {
    it('should fetch comprehensive review analytics', async () => {
      const mockAnalytics: ReviewAnalytics = {
        totalReviews: 150,
        byStatus: {
          draft: 5,
          pending: 25,
          in_review: 40,
          changes_requested: 30,
          approved: 35,
          rejected: 10,
          completed: 5,
        },
        byType: {
          content_review: 80,
          technical_review: 40,
          editorial_review: 20,
          compliance_review: 8,
          final_approval: 2,
        },
        byPriority: {
          low: 50,
          medium: 70,
          high: 25,
          urgent: 5,
        },
        averageReviewTime: 120, // 2 hours
        averageApprovalTime: 180, // 3 hours
        reviewerWorkload: [
          {
            reviewerId: 'user-2',
            reviewer: {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane@amazon.com',
              role: 'reviewer',
              expertise: [],
            },
            activeReviews: 5,
            completedReviews: 25,
            averageTime: 90,
          },
        ],
        bottlenecks: [
          {
            stage: 'editorial_review',
            averageTime: 240, // 4 hours
            pendingCount: 15,
          },
        ],
        trends: [
          {
            date: new Date('2023-01-01'),
            created: 10,
            completed: 8,
            avgTime: 120,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalytics),
      });

      const result = await reviewService.getAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(result.totalReviews).toBe(150);
      expect(result.bottlenecks[0].stage).toBe('editorial_review');
      expect(result.reviewerWorkload[0].activeReviews).toBe(5);
    });
  });

  describe('Review Utility Functions', () => {
    it('should get correct status colors', () => {
      expect(ReviewUtils.getStatusColor('draft')).toBe('text-gray-600 bg-gray-100');
      expect(ReviewUtils.getStatusColor('pending')).toBe('text-yellow-600 bg-yellow-100');
      expect(ReviewUtils.getStatusColor('in_review')).toBe('text-blue-600 bg-blue-100');
      expect(ReviewUtils.getStatusColor('approved')).toBe('text-green-600 bg-green-100');
      expect(ReviewUtils.getStatusColor('rejected')).toBe('text-red-600 bg-red-100');
    });

    it('should get correct priority colors', () => {
      expect(ReviewUtils.getPriorityColor('low')).toBe('text-green-600 bg-green-100');
      expect(ReviewUtils.getPriorityColor('medium')).toBe('text-yellow-600 bg-yellow-100');
      expect(ReviewUtils.getPriorityColor('high')).toBe('text-orange-600 bg-orange-100');
      expect(ReviewUtils.getPriorityColor('urgent')).toBe('text-red-600 bg-red-100');
    });

    it('should get workflow stage display names', () => {
      expect(ReviewUtils.getStageDisplayName('draft')).toBe('Draft');
      expect(ReviewUtils.getStageDisplayName('peer_review')).toBe('Peer Review');
      expect(ReviewUtils.getStageDisplayName('technical_review')).toBe('Technical Review');
      expect(ReviewUtils.getStageDisplayName('editorial_review')).toBe('Editorial Review');
      expect(ReviewUtils.getStageDisplayName('final_approval')).toBe('Final Approval');
      expect(ReviewUtils.getStageDisplayName('published')).toBe('Published');
    });

    it('should calculate review progress correctly', () => {
      const reviewRequest: ReviewRequest = {
        id: 'review-1',
        title: 'Test Review',
        description: 'Test description',
        type: 'content_review',
        status: 'in_review',
        priority: 'medium',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'author',
          expertise: [],
        },
        assignedReviewers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        contentId: 'content-1',
        contentType: 'page',
        contentUrl: '/page-1',
        changes: [],
        reviews: [],
        approvals: [],
        requiredApprovals: 1,
        workflowStage: 'technical_review', // 3rd stage out of 6
        tags: [],
        metadata: {
          estimatedReviewTime: 30,
          complexity: 'low',
          impactLevel: 'medium',
          audience: ['developer'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      const progress = ReviewUtils.calculateProgress(reviewRequest);
      expect(progress).toBeCloseTo(50, 0); // 3/6 * 100 = 50%
    });

    it('should detect overdue reviews', () => {
      const overdueReview: ReviewRequest = {
        id: 'review-1',
        title: 'Overdue Review',
        description: 'Test description',
        type: 'content_review',
        status: 'pending',
        priority: 'high',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'author',
          expertise: [],
        },
        assignedReviewers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        contentId: 'content-1',
        contentType: 'page',
        contentUrl: '/page-1',
        changes: [],
        reviews: [],
        approvals: [],
        requiredApprovals: 1,
        workflowStage: 'peer_review',
        tags: [],
        metadata: {
          estimatedReviewTime: 30,
          complexity: 'low',
          impactLevel: 'medium',
          audience: ['developer'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      expect(ReviewUtils.isOverdue(overdueReview)).toBe(true);

      const timeRemaining = ReviewUtils.getTimeRemaining(overdueReview);
      expect(timeRemaining).toContain('overdue');
    });

    it('should check user permissions correctly', () => {
      const adminUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@amazon.com',
        role: 'admin' as const,
        expertise: [],
      };

      const editorUser = {
        id: 'editor-1',
        name: 'Editor User',
        email: 'editor@amazon.com',
        role: 'editor' as const,
        expertise: [],
      };

      const reviewerUser = {
        id: 'reviewer-1',
        name: 'Reviewer User',
        email: 'reviewer@amazon.com',
        role: 'reviewer' as const,
        expertise: [],
      };

      const reviewRequest: ReviewRequest = {
        id: 'review-1',
        title: 'Test Review',
        description: 'Test description',
        type: 'content_review',
        status: 'pending',
        priority: 'medium',
        author: reviewerUser,
        assignedReviewers: [reviewerUser],
        createdAt: new Date(),
        updatedAt: new Date(),
        contentId: 'content-1',
        contentType: 'page',
        contentUrl: '/page-1',
        changes: [],
        reviews: [],
        approvals: [],
        requiredApprovals: 1,
        workflowStage: 'peer_review',
        tags: [],
        metadata: {
          estimatedReviewTime: 30,
          complexity: 'low',
          impactLevel: 'medium',
          audience: ['developer'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      // Admin should be able to approve
      expect(ReviewUtils.canApprove(adminUser, reviewRequest)).toBe(true);

      // Editor should be able to approve most content
      expect(ReviewUtils.canApprove(editorUser, reviewRequest)).toBe(true);

      // Reviewer should be able to review if assigned
      expect(ReviewUtils.canReview(reviewerUser, reviewRequest)).toBe(false); // Can't review own content

      // Different reviewer should be able to review if assigned
      const otherReviewer = {
        id: 'reviewer-2',
        name: 'Other Reviewer',
        email: 'other@amazon.com',
        role: 'reviewer' as const,
        expertise: [],
      };

      const reviewRequestWithOtherReviewer = {
        ...reviewRequest,
        assignedReviewers: [otherReviewer],
      };

      expect(ReviewUtils.canReview(otherReviewer, reviewRequestWithOtherReviewer)).toBe(true);
    });

    it('should calculate review completion percentage', () => {
      const reviewRequest: ReviewRequest = {
        id: 'review-1',
        title: 'Test Review',
        description: 'Test description',
        type: 'content_review',
        status: 'in_review',
        priority: 'medium',
        author: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@amazon.com',
          role: 'author',
          expertise: [],
        },
        assignedReviewers: [
          {
            id: 'user-2',
            name: 'Reviewer 1',
            email: 'reviewer1@amazon.com',
            role: 'reviewer',
            expertise: [],
          },
          {
            id: 'user-3',
            name: 'Reviewer 2',
            email: 'reviewer2@amazon.com',
            role: 'reviewer',
            expertise: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        contentId: 'content-1',
        contentType: 'page',
        contentUrl: '/page-1',
        changes: [],
        reviews: [
          {
            id: 'review-1',
            reviewerId: 'user-2',
            reviewer: {
              id: 'user-2',
              name: 'Reviewer 1',
              email: 'reviewer1@amazon.com',
              role: 'reviewer',
              expertise: [],
            },
            status: 'completed',
            decision: 'approve',
            comments: [],
            submittedAt: new Date(),
          },
        ],
        approvals: [],
        requiredApprovals: 1,
        workflowStage: 'peer_review',
        tags: [],
        metadata: {
          estimatedReviewTime: 30,
          complexity: 'low',
          impactLevel: 'medium',
          audience: ['developer'],
          relatedReviews: [],
          externalReferences: [],
        },
      };

      const completion = ReviewUtils.getReviewCompletion(reviewRequest);
      expect(completion).toBe(50); // 1 out of 2 reviewers completed
    });
  });

  describe('Notification Management', () => {
    it('should fetch review notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'assignment' as const,
          recipient: 'user-2',
          sender: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@amazon.com',
            role: 'admin' as const,
            expertise: [],
          },
          reviewRequestId: 'review-1',
          title: 'New Review Assignment',
          message: 'You have been assigned to review "Update Getting Started Guide"',
          actionUrl: '/reviews/review-1',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 'notif-2',
          type: 'status_change' as const,
          recipient: 'user-1',
          sender: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@amazon.com',
            role: 'reviewer' as const,
            expertise: [],
          },
          reviewRequestId: 'review-1',
          title: 'Review Status Changed',
          message: 'Your review request has been approved',
          read: true,
          createdAt: new Date(),
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotifications),
      });

      const result = await reviewService.getNotifications();

      expect(result).toEqual(mockNotifications);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('assignment');
      expect(result[1].read).toBe(true);
    });

    it('should mark notifications as read', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await reviewService.markNotificationRead('notif-1');

      expect(fetch).toHaveBeenCalledWith('/api/reviews/notifications/notif-1/read', {
        method: 'POST',
      });
    });
  });
});