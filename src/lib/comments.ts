import { Comment, CommentThread, CommentFilter, CommentNotification, CommentModerationAction, CommentAuthor, TextSelection } from '@/types/comments';

export class CommentService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/comments') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create a new comment
   */
  async createComment(data: {
    pageId: string;
    sectionId?: string;
    parentId?: string;
    content: string;
    mentions?: string[];
    selectedText?: TextSelection;
  }): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get comments for a page or section
   */
  async getComments(pageId: string, sectionId?: string): Promise<CommentThread[]> {
    const params = new URLSearchParams({ pageId });
    if (sectionId) {
      params.append('sectionId', sectionId);
    }

    const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, updates: {
    content?: string;
    status?: Comment['status'];
    mentions?: string[];
  }): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  }

  /**
   * Resolve a comment thread
   */
  async resolveComment(commentId: string): Promise<Comment> {
    return this.updateComment(commentId, { status: 'resolved' });
  }

  /**
   * Add reaction to a comment
   */
  async addReaction(commentId: string, emoji: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${commentId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add reaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Remove reaction from a comment
   */
  async removeReaction(commentId: string, emoji: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${commentId}/reactions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove reaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get filtered comments
   */
  async getFilteredComments(filter: CommentFilter): Promise<CommentThread[]> {
    const params = new URLSearchParams();
    
    if (filter.status) {
      filter.status.forEach(status => params.append('status', status));
    }
    if (filter.author) {
      filter.author.forEach(author => params.append('author', author));
    }
    if (filter.pageId) {
      params.append('pageId', filter.pageId);
    }
    if (filter.sectionId) {
      params.append('sectionId', filter.sectionId);
    }
    if (filter.hasAttachments) {
      params.append('hasAttachments', 'true');
    }
    if (filter.mentionsMe) {
      params.append('mentionsMe', 'true');
    }
    if (filter.dateRange) {
      params.append('startDate', filter.dateRange.start.toISOString());
      params.append('endDate', filter.dateRange.end.toISOString());
    }

    const response = await fetch(`${this.apiBaseUrl}/filter?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch filtered comments: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notifications for current user
   */
  async getNotifications(): Promise<CommentNotification[]> {
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
   * Moderate a comment (admin only)
   */
  async moderateComment(commentId: string, action: CommentModerationAction['action'], reason?: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${commentId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to moderate comment: ${response.statusText}`);
    }
  }
}

/**
 * Utility functions for comment processing
 */
export class CommentUtils {
  /**
   * Extract mentions from comment content
   */
  static extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  /**
   * Format comment content with mentions highlighted
   */
  static formatContentWithMentions(content: string, users: CommentAuthor[]): string {
    const userMap = new Map(users.map(user => [user.id, user]));
    
    return content.replace(/@(\w+)/g, (match, userId) => {
      const user = userMap.get(userId);
      if (user) {
        return `<span class="mention" data-user-id="${userId}">@${user.name}</span>`;
      }
      return match;
    });
  }

  /**
   * Get comment thread depth
   */
  static getThreadDepth(comment: Comment, allComments: Comment[]): number {
    let depth = 0;
    let currentComment = comment;

    while (currentComment.parentId) {
      depth++;
      const parent = allComments.find(c => c.id === currentComment.parentId);
      if (!parent) break;
      currentComment = parent;
    }

    return depth;
  }

  /**
   * Build comment thread tree
   */
  static buildCommentTree(comments: Comment[]): CommentThread[] {
    const commentMap = new Map(comments.map(c => [c.id, c]));
    const threads: CommentThread[] = [];
    const processedIds = new Set<string>();

    // Find root comments (no parent)
    const rootComments = comments.filter(c => !c.parentId);

    for (const rootComment of rootComments) {
      if (processedIds.has(rootComment.id)) continue;

      const replies = this.getReplies(rootComment.id, comments, commentMap);
      const participants = this.getThreadParticipants(rootComment, replies);
      
      threads.push({
        id: rootComment.id,
        rootComment,
        replies,
        totalReplies: replies.length,
        lastActivity: this.getLastActivity(rootComment, replies),
        participants,
      });

      // Mark all comments in this thread as processed
      processedIds.add(rootComment.id);
      replies.forEach(reply => processedIds.add(reply.id));
    }

    return threads;
  }

  /**
   * Get all replies for a comment
   */
  private static getReplies(parentId: string, allComments: Comment[], commentMap: Map<string, Comment>): Comment[] {
    const replies: Comment[] = [];
    const directReplies = allComments.filter(c => c.parentId === parentId);

    for (const reply of directReplies) {
      replies.push(reply);
      // Recursively get nested replies
      replies.push(...this.getReplies(reply.id, allComments, commentMap));
    }

    return replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get all participants in a comment thread
   */
  private static getThreadParticipants(rootComment: Comment, replies: Comment[]): CommentAuthor[] {
    const participants = new Map<string, CommentAuthor>();
    
    participants.set(rootComment.author.id, rootComment.author);
    
    for (const reply of replies) {
      participants.set(reply.author.id, reply.author);
    }

    return Array.from(participants.values());
  }

  /**
   * Get last activity timestamp for a thread
   */
  private static getLastActivity(rootComment: Comment, replies: Comment[]): Date {
    const allComments = [rootComment, ...replies];
    const timestamps = allComments.map(c => Math.max(c.createdAt.getTime(), c.updatedAt.getTime()));
    return new Date(Math.max(...timestamps));
  }

  /**
   * Check if user can moderate comment
   */
  static canModerateComment(user: CommentAuthor, comment: Comment): boolean {
    // Admins can moderate any comment
    if (user.role === 'admin') {
      return true;
    }

    // Users can moderate their own comments
    if (user.id === comment.author.id) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can resolve comment
   */
  static canResolveComment(user: CommentAuthor, comment: Comment): boolean {
    // Admins and editors can resolve any comment
    if (user.role === 'admin' || user.role === 'editor') {
      return true;
    }

    // Comment author can resolve their own comment
    if (user.id === comment.author.id) {
      return true;
    }

    return false;
  }
}