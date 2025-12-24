export interface Feedback {
  id: string;
  pageId: string;
  sectionId?: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  description: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  author: FeedbackAuthor;
  assignee?: FeedbackAuthor;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  attachments: FeedbackAttachment[];
  votes: FeedbackVote[];
  comments: string[]; // Comment IDs
  metadata: FeedbackMetadata;
}

export type FeedbackType = 'bug' | 'improvement' | 'content_gap' | 'technical_error' | 'clarity' | 'suggestion';

export type FeedbackCategory = 
  | 'content_accuracy'
  | 'content_completeness'
  | 'content_clarity'
  | 'technical_issue'
  | 'navigation'
  | 'search'
  | 'performance'
  | 'accessibility'
  | 'design'
  | 'other';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate';

export interface FeedbackAuthor {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: string;
}

export interface FeedbackAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface FeedbackVote {
  userId: string;
  type: 'upvote' | 'downvote';
  createdAt: Date;
}

export interface FeedbackMetadata {
  userAgent?: string;
  url: string;
  viewport?: {
    width: number;
    height: number;
  };
  timestamp: Date;
  sessionId?: string;
  referrer?: string;
}

export interface FeedbackFilter {
  type?: FeedbackType[];
  category?: FeedbackCategory[];
  status?: FeedbackStatus[];
  priority?: FeedbackPriority[];
  author?: string[];
  assignee?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  pageId?: string;
  sectionId?: string;
  tags?: string[];
  hasAttachments?: boolean;
  sortBy?: 'created' | 'updated' | 'priority' | 'votes';
  sortOrder?: 'asc' | 'desc';
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  byType: Record<FeedbackType, number>;
  byCategory: Record<FeedbackCategory, number>;
  byStatus: Record<FeedbackStatus, number>;
  byPriority: Record<FeedbackPriority, number>;
  averageResolutionTime: number;
  topPages: Array<{
    pageId: string;
    title: string;
    count: number;
  }>;
  topIssues: Array<{
    category: FeedbackCategory;
    count: number;
    averagePriority: number;
  }>;
  trends: Array<{
    date: Date;
    count: number;
    resolved: number;
  }>;
}

export interface FeedbackExport {
  format: 'csv' | 'json' | 'xlsx';
  filter?: FeedbackFilter;
  includeComments?: boolean;
  includeAttachments?: boolean;
}

export interface FeedbackNotification {
  id: string;
  feedbackId: string;
  type: 'new_feedback' | 'status_change' | 'assignment' | 'comment' | 'resolution';
  recipient: string;
  sender: FeedbackAuthor;
  message: string;
  read: boolean;
  createdAt: Date;
}