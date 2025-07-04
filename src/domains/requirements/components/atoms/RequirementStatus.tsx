// src/domains/requirements/components/atoms/RequirementStatus.tsx
interface RequirementStatusProps {
  status: RequirementStatus;
  className?: string;
}

export const RequirementStatus: React.FC<RequirementStatusProps> = ({
  status,
  className = '',
}) => {
  const getStatusConfig = (status: RequirementStatus) => {
    switch (status) {
      case RequirementStatus.DRAFT:
        return { color: 'gray', label: 'Draft' };
      case RequirementStatus.ACTIVE:
        return { color: 'blue', label: 'Active' };
      case RequirementStatus.IMPLEMENTED:
        return { color: 'green', label: 'Implemented' };
      case RequirementStatus.DEPRECATED:
        return { color: 'red', label: 'Deprecated' };
      default:
        return { color: 'gray', label: 'Unknown' };
    }
  };

  const { color, label } = getStatusConfig(status);
  
  return (
    <Badge variant={color} className={className}>
      {label}
    </Badge>
  );
};