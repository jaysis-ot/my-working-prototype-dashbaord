/ ===== REQUIREMENTS DOMAIN EXAMPLE =====

// src/domains/requirements/models/Requirement.ts
export interface Requirement extends AuditableEntity {
  title: string;
  description: string;
  category: RequirementCategory;
  priority: Priority;
  status: RequirementStatus;
  framework: string;
  frameworkId: string;
  capabilityIds: string[];
  evidenceIds: string[];
  tags: string[];
  source: string;
  lastReviewed?: Date;
  nextReview?: Date;
  riskLevel: RiskLevel;
}

export enum RequirementCategory {
  TECHNICAL = 'technical',
  OPERATIONAL = 'operational',
  GOVERNANCE = 'governance',
  COMPLIANCE = 'compliance',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RequirementStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IMPLEMENTED = 'implemented',
  DEPRECATED = 'deprecated',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}