import { Feedback, FeedbackFilter, FeedbackAnalytics, FeedbackExport, FeedbackNotification, FeedbackType, FeedbackCategory, FeedbackPriority, FeedbackStatus } from '@/types/feedback';

export class FeedbackService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/feedback') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Submit new feedback
   */
  async submitFeedback(data: {
    pageId: string;
    sectionId?: string;
    type: FeedbackType;
    category: FeedbackCategory;
    title: string;
    description: string;
    priority?: FeedbackPriority;
    tags?: string[];
    attachments?: File[];
  }): Promise<Feedback> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'attachments' && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add attachments
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    // Add metadata
    const metadata = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: new Date(),
      referrer: document.referrer,
    };
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.apiBaseUrl}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get feedback items with filtering
   */
  async getFeedback(filter?: FeedbackFilter): Promise<Feedback[]> {
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
      throw new Error(`Failed to fetch feedback: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get single feedback item
   */
  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feedback: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update feedback
   */
  async updateFeedback(id: string, updates: Partial<Feedback>): Promise<Feedback> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update feedback: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete feedback: ${response.statusText}`);
    }
  }

  /**
   * Vote on feedback
   */
  async voteFeedback(id: string, type: 'upvote' | 'downvote'): Promise<Feedback> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error(`Failed to vote on feedback: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Remove vote from feedback
   */
  async removeVote(id: string): Promise<Feedback> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/vote`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove vote: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Assign feedback to user
   */
  async assignFeedback(id: string, assigneeId: string): Promise<Feedback> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assigneeId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign feedback: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get feedback analytics
   */
  async getAnalytics(filter?: FeedbackFilter): Promise<FeedbackAnalytics> {
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
   * Export feedback data
   */
  async exportFeedback(exportConfig: FeedbackExport): Promise<Blob> {
    const response = await fetch(`${this.apiBaseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportConfig),
    });

    if (!response.ok) {
      throw new Error(`Failed to export feedback: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Get notifications
   */
  async getNotifications(): Promise<FeedbackNotification[]> {
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
}

/**
 * Utility functions for feedback processing
 */
export class FeedbackUtils {
  /**
   * Get priority color class
   */
  static getPriorityColor(priority: FeedbackPriority): string {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[priority];
  }

  /**
   * Get status color class
   */
  static getStatusColor(status: FeedbackStatus): string {
    const colors = {
      open: 'text-blue-600 bg-blue-100',
      in_progress: 'text-yellow-600 bg-yellow-100',
      resolved: 'text-green-600 bg-green-100',
      closed: 'text-gray-600 bg-gray-100',
      duplicate: 'text-purple-600 bg-purple-100',
    };
    return colors[status];
  }

  /**
   * Get type icon
   */
  static getTypeIcon(type: FeedbackType): string {
    const icons = {
      bug: '🐛',
      improvement: '💡',
      content_gap: '📝',
      technical_error: '⚠️',
      clarity: '❓',
      suggestion: '💭',
    };
    return icons[type];
  }

  /**
   * Format feedback for display
   */
  static formatFeedback(feedback: Feedback): string {
    return `${this.getTypeIcon(feedback.type)} ${feedback.title}`;
  }

  /**
   * Calculate resolution time
   */
  static getResolutionTime(feedback: Feedback): number | null {
    if (!feedback.resolvedAt) return null;
    return feedback.resolvedAt.getTime() - feedback.createdAt.getTime();
  }

  /**
   * Format resolution time
   */
  static formatResolutionTime(milliseconds: number): string {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m`;
    }
  }

  /**
   * Group feedback by category
   */
  static groupByCategory(feedback: Feedback[]): Record<FeedbackCategory, Feedback[]> {
    return feedback.reduce((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    }, {} as Record<FeedbackCategory, Feedback[]>);
  }

  /**
   * Sort feedback by priority and date
   */
  static sortByPriority(feedback: Feedback[]): Feedback[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return [...feedback].sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Filter feedback by search query
   */
  static searchFeedback(feedback: Feedback[], query: string): Feedback[] {
    const lowercaseQuery = query.toLowerCase();
    
    return feedback.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      item.author.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get feedback summary
   */
  static getSummary(feedback: Feedback[]): {
    total: number;
    open: number;
    resolved: number;
    critical: number;
    averageAge: number;
  } {
    const now = Date.now();
    const total = feedback.length;
    const open = feedback.filter(f => f.status === 'open').length;
    const resolved = feedback.filter(f => f.status === 'resolved').length;
    const critical = feedback.filter(f => f.priority === 'critical').length;
    
    const totalAge = feedback.reduce((sum, f) => sum + (now - f.createdAt.getTime()), 0);
    const averageAge = total > 0 ? totalAge / total : 0;

    return {
      total,
      open,
      resolved,
      critical,
      averageAge,
    };
  }
}