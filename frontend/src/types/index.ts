export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PRO' | 'AGENCY';
  createdAt: string;
}

export interface Analysis {
  id: string;
  userId: string;
  creativeUrl: string | null;
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText: string | null;
  headline: string | null;
  objective: Objective;
  industry: Industry;
  cpm: number | null;
  ctr: number | null;
  cpc: number | null;
  cpa: number | null;
  primaryReason: string;
  supportingLogic: string[];
  singleFix: string;
  failureReason: string | null;
  resultType: 'DEAD' | 'AVERAGE' | 'WINNING';
  createdAt: string;
  updatedAt: string;
}

export type Objective = 
  | 'AWARENESS'
  | 'TRAFFIC'
  | 'ENGAGEMENT'
  | 'LEADS'
  | 'APP_PROMOTION'
  | 'SALES';

export type Industry =
  | 'ECOMMERCE'
  | 'SAAS'
  | 'FINANCE'
  | 'HEALTH'
  | 'EDUCATION'
  | 'REAL_ESTATE'
  | 'TRAVEL'
  | 'FOOD'
  | 'FASHION'
  | 'TECHNOLOGY'
  | 'OTHER';

export interface AnalysisInput {
  creative?: File;
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText?: string;
  headline?: string;
  objective: Objective;
  industry: Industry;
  cpm?: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
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
