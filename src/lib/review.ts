import { 
  ReviewRequest, 
  Review, 
  ReviewComment, 
  ReviewAssignment, 
  ReviewNotification, 
  ReviewAnalytics, 
  ReviewFilter,
  ReviewWorkflow,
  WorkflowStage,
  ReviewDecision,
  ReviewStatus,
  ReviewUser
} from '@/types/review';

export class ReviewService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/reviews') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create a new review request
   */
  async createReviewRequest(data: {
    title: string;
    description: string;
    type: ReviewRequest['type'];
    priority: ReviewRequest['priority'];
    contentId: string;
    contentType: ReviewRequest['contentType'];
    contentUrl: string;
    assignedReviewers?: string[];
    dueDate?: Date;
    tags?: string[];
    requiredApprovals?: number;
  }): Promise<ReviewRequest> {
    const response = await fetch(`${this.apiBaseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create review request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get review requests with filtering
   */
  async getReviewRequests(filter?: ReviewFilter): Promise<ReviewRequest[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item.toString()));
          } else if (typeof value === 'object' && 'start' in value) {
            // Date range
            params.append(`${key}[start]`, value.start.toISOString());
            params.append(`${key}[end]`, value.end.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch review requests: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get single review request
   */
  async getReviewRequest(id: string): Promise<ReviewRequest> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch review request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update review request
   */
  async updateReviewRequest(id: string, updates: Partial<ReviewRequest>): Promise<ReviewRequest> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update review request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Submit a review
   */
  async submitReview(reviewRequestId: string, data: {
    decision: ReviewDecision;
    comments: Omit<ReviewComment, 'id' | 'createdAt' | 'updatedAt' | 'resolved'>[];
    timeSpent?: number;
  }): Promise<Review> {
    const response = await fetch(`${this.apiBaseUrl}/${reviewRequestId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Add comment to review
   */
  async addReviewComment(reviewRequestId: string, reviewId: string, comment: Omit<ReviewComment, 'id' | 'createdAt' | 'updatedAt' | 'resolved'>): Promise<ReviewComment> {
    const response = await fetch(`${this.apiBaseUrl}/${reviewRequestId}/reviews/${reviewId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resolve review comment
   */
  async resolveComment(reviewRequestId: string, reviewId: string, commentId: string): Promise<ReviewComment> {
    const response = await fetch(`${this.apiBaseUrl}/${reviewRequestId}/reviews/${reviewId}/comments/${commentId}/resolve`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve comment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Assign reviewers
   */
  async assignReviewers(reviewRequestId: string, reviewerIds: string[]): Promise<ReviewAssignment[]> {
    const response = await fetch(`${this.apiBaseUrl}/${reviewRequestId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reviewerIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign reviewers: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Accept or decline review assignment
   */
  async respondToAssignment(assignmentId: string, response: 'accept' | 'decline', reason?: string): Promise<ReviewAssignment> {
    const res = await fetch(`${this.apiBaseUrl}/assignments/${assignmentId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response, reason }),
    });

    if (!res.ok) {
      throw new Error(`Failed to respond to assignment: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Approve or reject review request
   */
  async approveReviewRequest(reviewRequestId: string, decision: 'approved' | 'rejected', comments?: string, conditions?: string[]): Promise<ReviewRequest> {
    const response = await fetch(`${this.apiBaseUrl}/${reviewRequestId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision, comments, conditions }),
    });

    if (!response.ok) {
      throw new Error(`Failed to approve review request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Advance workflow stage
   */
  async advanceWorkflowStage(reviewRequestId: string, nextStage: WorkflowStage): Promise<ReviewRequest> {
    const response = await fetch(`${this.apiBaseUrl}/${reviewRequestId}/advance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nextStage }),
    });

    if (!response.ok) {
      throw new Error(`Failed to advance workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get review analytics
   */
  async getAnalytics(filter?: ReviewFilter): Promise<ReviewAnalytics> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item.toString()));
          } else if (typeof value === 'object' && 'start' in value) {
            params.append(`${key}[start]`, value.start.toISOString());
            params.append(`${key}[end]`, value.end.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.apiBaseUrl}/analytics?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notifications
   */
  async getNotifications(): Promise<ReviewNotification[]> {
    const response = await fetch(`${this.apiBaseUrl}/notifications`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/notifications/${notificationId}/read`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
  }

  /**
   * Get available workflows
   */
  async getWorkflows(): Promise<ReviewWorkflow[]> {
    const response = await fetch(`${this.apiBaseUrl}/workflows`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get reviewer workload
   */
  async getReviewerWorkload(reviewerId?: string): Promise<ReviewAnalytics['reviewerWorkload']> {
    const params = reviewerId ? `?reviewerId=${reviewerId}` : '';
    const response = await fetch(`${this.apiBaseUrl}/workload${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviewer workload: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Utility functions for review processing
 */
export class ReviewUtils {
  /**
   * Get status color class
   */
  static getStatusColor(status: ReviewStatus): string {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      pending: 'text-yellow-600 bg-yellow-100',
      in_review: 'text-blue-600 bg-blue-100',
      changes_requested: 'text-orange-600 bg-orange-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      completed: 'text-purple-600 bg-purple-100',
    };
    return colors[status];
  }

  /**
   * Get priority color class
   */
  static getPriorityColor(priority: ReviewRequest['priority']): string {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100',
    };
    return colors[priority];
  }

  /**
   * Get workflow stage display name
   */
  static getStageDisplayName(stage: WorkflowStage): string {
    const names = {
      draft: 'Draft',
      peer_review: 'Peer Review',
      technical_review: 'Technical Review',
      editorial_review: 'Editorial Review',
      final_approval: 'Final Approval',
      published: 'Published',
    };
    return names[stage];
  }

  /**
   * Calculate review progress
   */
  static calculateProgress(reviewRequest: ReviewRequest): number {
    const stages: WorkflowStage[] = ['draft', 'peer_review', 'technical_review', 'editorial_review', 'final_approval', 'published'];
    const currentIndex = stages.indexOf(reviewRequest.workflowStage);
    return ((currentIndex + 1) / stages.length) * 100;
  }

  /**
   * Check if review is overdue
   */
  static isOverdue(reviewRequest: ReviewRequest): boolean {
    if (!reviewRequest.dueDate) return false;
    return new Date() > reviewRequest.dueDate;
  }

  /**
   * Get time remaining
   */
  static getTimeRemaining(reviewRequest: ReviewRequest): string | null {
    if (!reviewRequest.dueDate) return null;
    
    const now = new Date();
    const due = reviewRequest.dueDate;
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) {
      const overdue = Math.abs(diff);
      const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h overdue`;
      } else {
        return `${hours}h overdue`;
      }
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h remaining`;
      } else {
        return `${hours}h remaining`;
      }
    }
  }

  /**
   * Check if user can approve
   */
  static canApprove(user: ReviewUser, reviewRequest: ReviewRequest): boolean {
    // Admins can always approve
    if (user.role === 'admin') return true;
    
    // Editors can approve most content
    if (user.role === 'editor' && reviewRequest.workflowStage !== 'final_approval') return true;
    
    // Check if user is assigned as approver
    return reviewRequest.assignedReviewers.some(reviewer => 
      reviewer.id === user.id && reviewer.role === 'admin'
    );
  }

  /**
   * Check if user can review
   */
  static canReview(user: ReviewUser, reviewRequest: ReviewRequest): boolean {
    // Can't review own content
    if (user.id === reviewRequest.author.id) return false;
    
    // Check if assigned as reviewer
    return reviewRequest.assignedReviewers.some(reviewer => reviewer.id === user.id);
  }

  /**
   * Get review completion percentage
   */
  static getReviewCompletion(reviewRequest: ReviewRequest): number {
    const totalReviewers = reviewRequest.assignedReviewers.length;
    if (totalReviewers === 0) return 0;
    
    const completedReviews = reviewRequest.reviews.filter(r => r.status === 'completed').length;
    return (completedReviews / totalReviewers) * 100;
  }

  /**
   * Get blocking issues count
   */
  static getBlockingIssuesCount(reviewRequest: ReviewRequest): number {
    return reviewRequest.reviews.reduce((count, review) => {
      return count + review.comments.filter(comment => 
        comment.severity === 'critical' && !comment.resolved
      ).length;
    }, 0);
  }

  /**
   * Check if ready for next stage
   */
  static isReadyForNextStage(reviewRequest: ReviewRequest): boolean {
    const completion = this.getReviewCompletion(reviewRequest);
    const blockingIssues = this.getBlockingIssuesCount(reviewRequest);
    const hasRequiredApprovals = reviewRequest.approvals.filter(a => a.decision === 'approved').length >= reviewRequest.requiredApprovals;
    
    return completion === 100 && blockingIssues === 0 && hasRequiredApprovals;
  }

  /**
   * Format review time
   */
  static formatReviewTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  /**
   * Group reviews by status
   */
  static groupByStatus(reviews: ReviewRequest[]): Record<ReviewStatus, ReviewRequest[]> {
    return reviews.reduce((groups, review) => {
      if (!groups[review.status]) {
        groups[review.status] = [];
      }
      groups[review.status].push(review);
      return groups;
    }, {} as Record<ReviewStatus, ReviewRequest[]>);
  }

  /**
   * Sort reviews by priority and due date
   */
  static sortByPriority(reviews: ReviewRequest[]): ReviewRequest[] {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    return [...reviews].sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date (overdue first)
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }
      
      // Finally by creation date
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
}