// src/domains/requirements/context/RequirementsContext.tsx
interface RequirementsState {
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  loading: LoadingState;
  error: string | null;
  filters: {
    category?: RequirementCategory;
    priority?: Priority;
    status?: RequirementStatus;
    framework?: string;
    search?: string;
  };
}

interface RequirementsContextValue extends RequirementsState {
  actions: {
    fetchRequirements: () => Promise<void>;
    createRequirement: (requirement: Omit<Requirement, keyof BaseEntity>) => Promise<void>;
    updateRequirement: (id: string, updates: Partial<Requirement>) => Promise<void>;
    deleteRequirement: (id: string) => Promise<void>;
    selectRequirement: (requirement: Requirement | null) => void;
    setFilters: (filters: Partial<RequirementsState['filters']>) => void;
    clearError: () => void;
    linkToCapabilities: (requirementId: string, capabilityIds: string[]) => Promise<void>;
  };
}

const RequirementsContext = React.createContext<RequirementsContextValue | undefined>(undefined);

export const useRequirements = () => {
  const context = useContext(RequirementsContext);
  if (!context) {
    throw new Error('useRequirements must be used within a RequirementsProvider');
  }
  return context;
};