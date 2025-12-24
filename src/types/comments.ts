export interface Comment {
  id: string;
  pageId: string;
  sectionId?: string;
  parentId?: string; // For threaded comments
  content: string;
  author: CommentAuthor;
  createdAt: Date;
  updatedAt: Date;
  status: CommentStatus;
  mentions: string[]; // User IDs mentioned in the comment
  attachments?: CommentAttachment[];
  reactions: CommentReaction[];
  selectedText?: TextSelection; // For inline comments
}

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role: 'reviewer' | 'editor' | 'admin';
}

export type CommentStatus = 'open' | 'resolved' | 'archived';

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  users: string[]; // User IDs who reacted
}

export interface TextSelection {
  startOffset: number;
  endOffset: number;
  selectedText: string;
  context: string; // Surrounding text for context
}

export interface CommentThread {
  id: string;
  rootComment: Comment;
  replies: Comment[];
  totalReplies: number;
  lastActivity: Date;
  participants: CommentAuthor[];
}

export interface CommentFilter {
  status?: CommentStatus[];
  author?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  pageId?: string;
  sectionId?: string;
  hasAttachments?: boolean;
  mentionsMe?: boolean;
}

export interface CommentNotification {
  id: string;
  type: 'mention' | 'reply' | 'resolution' | 'assignment';
  commentId: string;
  recipient: string;
  sender: CommentAuthor;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CommentModerationAction {
  id: string;
  commentId: string;
  action: 'approve' | 'reject' | 'edit' | 'delete' | 'archive';
  moderator: CommentAuthor;
  reason?: string;
  timestamp: Date;
}