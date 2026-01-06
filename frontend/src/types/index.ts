export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PRO' | 'AGENCY';
  proExpiresAt?: string | null;
  apiUsageCount?: number;
  lastResetDate?: string;
  createdAt: string;
}

export interface Analysis {
  id: string;
  userId: string;
  imageUrl?: string | null;
  creativeUrl: string | null;
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText: string | null;
  headline: string | null;
  objective: Objective;
  problemFaced: ProblemFaced;
  whatChanged: WhatChanged;
  audienceType: AudienceType;
  cpm: number;
  ctr: number;
  cpa: number;
  industry?: string | null;
  primaryReason: string;
  supportingLogic: string | string[];
  singleFix: string;
  failureReason: string | null;
  resultType: 'DEAD' | 'AVERAGE' | 'WINNING';
  createdAt: string;
  updatedAt: string;
}

export type Objective = 
  | 'LEADS'
  | 'WHATSAPP'
  | 'SALES';

export type ProblemFaced =
  | 'LOW_CLICKS'
  | 'CLICKS_NO_ACTION'
  | 'MESSAGES_NO_CONVERSION';

export type WhatChanged =
  | 'CREATIVE_CHANGED'
  | 'AUDIENCE_CHANGED'
  | 'BUDGET_CHANGED'
  | 'NOTHING_NEW_AD';

export type AudienceType =
  | 'BROAD'
  | 'INTEREST_BASED'
  | 'LOOKALIKE';

export interface AnalysisInput {
  creative?: File;
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText?: string;
  headline?: string;
  objective: Objective;
  problemFaced: ProblemFaced;
  whatChanged: WhatChanged;
  audienceType: AudienceType;
  cpm: number;
  ctr: number;
  cpa: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down' | null;
  createdAt: string;
}

export interface ConversationDetail {
  conversationId: string;
  title?: string | null;
  messages: ChatMessage[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    analyses: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
