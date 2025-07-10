import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ShieldAlert,
  BarChart2,
  Filter,
  Plus,
  ArrowDownUp,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
// Modal to view & edit requirements linked to a risk
import RiskRequirementsModal from '../molecules/RiskRequirementsModal';
// Modal to edit a risk itself
import RiskEditModal from '../molecules/RiskEditModal';
// Modal to create a new risk
import RiskCreateModal from '../molecules/RiskCreateModal';

// --- Internal Molecules for RiskManagementView ---

/**
 * MetricCard: Displays a single key statistic for the risk overview.
 */
const MetricCard = ({ title, value, color }) => (
  <div className={`dashboard-card p-4 border-l-4 border-${color}-500`}>
    <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
    <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-1">{value}</p>
  </div>
);
MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
};
MetricCard.defaultProps = { color: 'primary' };


/**
 * RiskRatingIndicator: A visual indicator for the risk rating.
 */
const RiskRatingIndicator = ({ level, score }) => {
  const getRatingStyles = (lvl) => {
    switch (lvl) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-400 text-yellow-900';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-secondary-200 text-secondary-800';
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className={getRatingStyles(level)}>
        {level}
      </Badge>
      <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">({score})</span>
    </div>
  );
};
RiskRatingIndicator.propTypes = {
  level: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
};

// --- Main Organism Component ---

/**
 * RiskManagementView Organism Component
 * 
 * This is the main presentational component for displaying and interacting
 * with the risk register. It receives all data and handlers from its parent
 * page component, keeping it decoupled and reusable.
 */
const RiskManagementView = ({
  risks,
  metrics,
  filters,
  onFilterChange,
  onAddRisk,
  onUpdateRisk,
  onDeleteRisk,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'rating.score', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // ------------------ Requirement modal state ------------------ //
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);

  const openRequirementsModal = useCallback((risk) => {
    setSelectedRisk(risk);
    setIsReqModalOpen(true);
  }, []);

  const closeRequirementsModal = useCallback(() => {
    setIsReqModalOpen(false);
    setSelectedRisk(null);
  }, []);

  // ------------------ Edit Risk modal state ------------------ //
  const [riskToEdit, setRiskToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openEditModal = useCallback((risk) => {
    setRiskToEdit(risk);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setRiskToEdit(null);
  }, []);

  const handleUpdateRiskModal = useCallback((updatedRisk) => {
    onUpdateRisk(updatedRisk.id, updatedRisk);
    closeEditModal();
  }, [onUpdateRisk, closeEditModal]);

  // ------------------ Create Risk modal state ------------------ //
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateRisk = useCallback(
    (newRisk) => {
      onAddRisk(newRisk);
      closeCreateModal();
    },
    [onAddRisk, closeCreateModal]
  );

  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  }, []);

  const sortedAndPaginatedRisks = useMemo(() => {
    const sorted = [...risks].sort((a, b) => {
      const aVal = sortConfig.key === 'rating.score' ? a.rating.score : a[sortConfig.key];
      const bVal = sortConfig.key === 'rating.score' ? b.rating.score : b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(startIndex, startIndex + PAGE_SIZE);
  }, [risks, sortConfig, currentPage]);

  const totalPages = Math.ceil(risks.length / PAGE_SIZE);

  const columns = [
    { key: 'id', label: 'Risk ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'rating.score', label: 'Rating', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <>
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
            <ShieldAlert className="w-7 h-7 mr-3 text-primary-600" />
            Risk Register
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            Identify, assess, and manage organizational risks.
          </p>
        </div>
        <Button onClick={openCreateModal} leadingIcon={Plus}>
          Add New Risk
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Risks" value={metrics.total} color="blue" />
        <MetricCard title="Open Risks" value={metrics.open} color="orange" />
        <MetricCard title="Mitigated" value={metrics.mitigated} color="green" />
        <MetricCard title="Avg. Risk Score" value={metrics.avgScore} color="purple" />
      </div>

      {/* Filters & Table Section */}
      <div className="dashboard-card flex-grow flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search by ID or title..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              onClear={() => onFilterChange('search', '')}
              leadingIcon={Search}
              className="lg:col-span-2"
            />
            <select value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
              <option value="">All Statuses</option>
              {['Open', 'In Progress', 'Mitigated', 'Accepted'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
              <option value="">All Categories</option>
              {['Technical', 'Operational', 'Compliance', 'Strategic'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.rating} onChange={(e) => onFilterChange('rating', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
              <option value="">All Ratings</option>
              {['Low', 'Medium', 'High', 'Critical'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-grow overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead className="bg-secondary-50 dark:bg-secondary-700/50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {col.sortable ? (
                      <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 group">
                        {col.label}
                        <ArrowDownUp className="w-3 h-3 text-secondary-400 group-hover:text-secondary-600" />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
              {sortedAndPaginatedRisks.map(risk => (
                <tr key={risk.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600 dark:text-primary-300">{risk.id}</td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white truncate" title={risk.title}>{risk.title}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate" title={risk.description}>{risk.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge>{risk.status}</Badge></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{risk.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{risk.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><RiskRatingIndicator {...risk.rating} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openRequirementsModal(risk)}
                        title="View Requirements"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(risk)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteRisk(risk.id)} title="Delete"><Trash2 className="w-4 h-4 text-status-error" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
            <span className="text-sm text-secondary-600">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="secondary" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="px-2 text-sm font-semibold">{currentPage}</span>
              <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
              <Button size="sm" variant="secondary" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ----- Requirements Modal ----- */}
    <RiskRequirementsModal
      risk={selectedRisk}
      isOpen={isReqModalOpen}
      onClose={closeRequirementsModal}
    />

    {/* ----- Risk Edit Modal ----- */}
    <RiskEditModal
      risk={riskToEdit}
      isOpen={isEditModalOpen}
      onClose={closeEditModal}
      onSave={handleUpdateRiskModal}
    />

    {/* ----- Risk Create Modal ----- */}
    <RiskCreateModal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      onSave={handleCreateRisk}
    />
    </>
  );
};

RiskManagementView.propTypes = {
  risks: PropTypes.array.isRequired,
  metrics: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onAddRisk: PropTypes.func.isRequired,
  onUpdateRisk: PropTypes.func.isRequired,
  onDeleteRisk: PropTypes.func.isRequired,
};

export default RiskManagementView;
