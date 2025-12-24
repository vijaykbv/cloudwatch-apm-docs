export interface ReviewRequest {
  id: string;
  title: string;
  description: string;
  type: ReviewType;
  status: ReviewStatus;
  priority: ReviewPriority;
  author: ReviewUser;
  assignedReviewers: ReviewUser[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Content being reviewed
  contentId: string;
  contentType: 'page' | 'section' | 'document' | 'code' | 'configuration';
  contentUrl: string;
  changes: ContentChange[];
  
  // Review process
  reviews: Review[];
  approvals: Approval[];
  requiredApprovals: number;
  
  // Workflow
  workflowStage: WorkflowStage;
  nextStage?: WorkflowStage;
  
  // Metadata
  tags: string[];
  metadata: ReviewMetadata;
}

export type ReviewType = 'content_review' | 'technical_review' | 'editorial_review' | 'compliance_review' | 'final_approval';

export type ReviewStatus = 'draft' | 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'rejected' | 'completed';

export type ReviewPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ReviewUser {
  id: string;
  name: string;
  email: string;
  role: 'reviewer' | 'editor' | 'admin' | 'author';
  department?: string;
  expertise: string[];
}

export interface ContentChange {
  id: string;
  type: 'addition' | 'modification' | 'deletion';
  section: string;
  oldContent?: string;
  newContent?: string;
  lineNumber?: number;
  author: ReviewUser;
  timestamp: Date;
  description: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer: ReviewUser;
  status: 'pending' | 'in_progress' | 'completed';
  decision: ReviewDecision;
  comments: ReviewComment[];
  submittedAt?: Date;
  timeSpent?: number; // in minutes
}

export type ReviewDecision = 'approve' | 'request_changes' | 'reject' | 'abstain';

export interface ReviewComment {
  id: string;
  content: string;
  type: 'general' | 'suggestion' | 'issue' | 'question';
  severity: 'info' | 'minor' | 'major' | 'critical';
  lineNumber?: number;
  section?: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Approval {
  id: string;
  approverId: string;
  approver: ReviewUser;
  decision: 'approved' | 'rejected';
  comments?: string;
  timestamp: Date;
  conditions?: string[];
}

export type WorkflowStage = 'draft' | 'peer_review' | 'technical_review' | 'editorial_review' | 'final_approval' | 'published';

export interface ReviewMetadata {
  estimatedReviewTime: number; // in minutes
  complexity: 'low' | 'medium' | 'high';
  impactLevel: 'low' | 'medium' | 'high';
  audience: string[];
  relatedReviews: string[];
  externalReferences: string[];
}

export interface ReviewWorkflow {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStageConfig[];
  rules: WorkflowRule[];
  isDefault: boolean;
  contentTypes: string[];
}

export interface WorkflowStageConfig {
  stage: WorkflowStage;
  name: string;
  description: string;
  requiredReviewers: number;
  requiredApprovals: number;
  reviewerRoles: string[];
  approverRoles: string[];
  timeLimit?: number; // in hours
  autoAdvance: boolean;
  conditions: StageCondition[];
}

export interface WorkflowRule {
  id: string;
  condition: string;
  action: 'assign_reviewer' | 'require_approval' | 'skip_stage' | 'notify' | 'escalate';
  parameters: Record<string, any>;
}

export interface StageCondition {
  type: 'all_reviews_complete' | 'minimum_approvals' | 'no_blocking_issues' | 'time_elapsed';
  parameters: Record<string, any>;
}

export interface ReviewAssignment {
  id: string;
  reviewRequestId: string;
  reviewerId: string;
  reviewer: ReviewUser;
  assignedBy: ReviewUser;
  assignedAt: Date;
  dueDate?: Date;
  workload: number; // estimated hours
  expertise: string[];
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
}

export interface ReviewNotification {
  id: string;
  type: 'assignment' | 'reminder' | 'status_change' | 'comment' | 'approval_request' | 'completion';
  recipient: string;
  sender: ReviewUser;
  reviewRequestId: string;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
}

export interface ReviewAnalytics {
  totalReviews: number;
  byStatus: Record<ReviewStatus, number>;
  byType: Record<ReviewType, number>;
  byPriority: Record<ReviewPriority, number>;
  averageReviewTime: number;
  averageApprovalTime: number;
  reviewerWorkload: Array<{
    reviewerId: string;
    reviewer: ReviewUser;
    activeReviews: number;
    completedReviews: number;
    averageTime: number;
  }>;
  bottlenecks: Array<{
    stage: WorkflowStage;
    averageTime: number;
    pendingCount: number;
  }>;
  trends: Array<{
    date: Date;
    created: number;
    completed: number;
    avgTime: number;
  }>;
}

export interface ReviewFilter {
  status?: ReviewStatus[];
  type?: ReviewType[];
  priority?: ReviewPriority[];
  assignedTo?: string[];
  author?: string[];
  stage?: WorkflowStage[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  contentType?: string[];
  overdue?: boolean;
}