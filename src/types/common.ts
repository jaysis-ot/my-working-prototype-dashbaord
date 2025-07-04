export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: string;
  updatedBy: string;
}

export interface DomainEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}