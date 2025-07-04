// src/domains/requirements/services/RequirementService.ts
export interface RequirementServiceInterface {
  getAll(): Promise<ApiResponse<Requirement[]>>;
  getById(id: string): Promise<ApiResponse<Requirement>>;
  getByCapability(capabilityId: string): Promise<ApiResponse<Requirement[]>>;
  getByFramework(framework: string): Promise<ApiResponse<Requirement[]>>;
  create(requirement: Omit<Requirement, keyof BaseEntity>): Promise<ApiResponse<Requirement>>;
  update(id: string, updates: Partial<Requirement>): Promise<ApiResponse<Requirement>>;
  delete(id: string): Promise<ApiResponse<void>>;
  linkToCapabilities(requirementId: string, capabilityIds: string[]): Promise<ApiResponse<void>>;
  attachEvidence(requirementId: string, evidenceIds: string[]): Promise<ApiResponse<void>>;
}

export class RequirementService extends BaseApiService<Requirement> implements RequirementServiceInterface {
  constructor() {
    super(process.env.REACT_APP_API_URL || '', 'requirements');
  }

  async getByCapability(capabilityId: string): Promise<ApiResponse<Requirement[]>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}?capabilityId=${capabilityId}`);
    return response.json();
  }

  async getByFramework(framework: string): Promise<ApiResponse<Requirement[]>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}?framework=${framework}`);
    return response.json();
  }

  async linkToCapabilities(requirementId: string, capabilityIds: string[]): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${requirementId}/capabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capabilityIds }),
    });
    return response.json();
  }

  async attachEvidence(requirementId: string, evidenceIds: string[]): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${requirementId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evidenceIds }),
    });
    return response.json();
  }
}