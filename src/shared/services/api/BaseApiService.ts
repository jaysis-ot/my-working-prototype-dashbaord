// ===== DOMAIN SERVICE TEMPLATE =====

// src/shared/services/api/BaseApiService.ts
export abstract class BaseApiService<T extends BaseEntity> {
  constructor(protected baseUrl: string, protected endpoint: string) {}

  async getAll(): Promise<ApiResponse<T[]>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}`);
    return response.json();
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`);
    return response.json();
  }

  async create(entity: Omit<T, keyof BaseEntity>): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity),
    });
    return response.json();
  }

  async update(id: string, entity: Partial<T>): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity),
    });
    return response.json();
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}

// ===== CONTEXT TEMPLATE =====

// Template for domain contexts
interface BaseDomainContextValue<T extends BaseEntity> {
  // Data state
  items: T[];
  selectedItem: T | null;
  
  // UI state
  loading: LoadingState;
  error: string | null;
  filters: Record<string, unknown>;
  
  // Actions
  actions: {
    fetch: () => Promise<void>;
    create: (item: Omit<T, keyof BaseEntity>) => Promise<void>;
    update: (id: string, updates: Partial<T>) => Promise<void>;
    delete: (id: string) => Promise<void>;
    select: (item: T | null) => void;
    setFilters: (filters: Record<string, unknown>) => void;
    clearError: () => void;
  };
}