import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from 'react-use';
import { 
  SOC2_CATEGORIES, 
  SOC2_STRUCTURE, 
  SOC2_STATS, 
  SOC2_STATUS, 
  DEFAULT_STATUS,
  createDefaultAssessment, 
  getCountsForCategories, 
  getCategoryProgress, 
  getSectionProgress 
} from './soc2Data';

import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Badge from '../atoms/Badge';

const SOC2Assessment = () => {
  const [assessment, setAssessment] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('security');
  const [selectedCategories, setSelectedCategories] = useState(['security']);
  const [auditType, setAuditType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const STORAGE_KEY = 'cyberTrustDashboard.soc2Assessment';

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAssessment(parsed.assessment || createDefaultAssessment());
        setSelectedCategories(parsed.selectedCategories || ['security']);
        setAuditType(parsed.auditType || '');
        setServiceType(parsed.serviceType || '');
      } catch (e) {
        console.error('Error parsing saved assessment data', e);
        setAssessment(createDefaultAssessment());
      }
    } else {
      setAssessment(createDefaultAssessment());
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    const dataToSave = {
      assessment,
      selectedCategories,
      auditType,
      serviceType,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [assessment, selectedCategories, auditType, serviceType]);

  useDebounce(saveToLocalStorage, 1000, [assessment, selectedCategories, auditType, serviceType]);

  const getDynamicTotals = useCallback((categories) => {
    let total = 0;
    
    categories.forEach(categoryId => {
      if (SOC2_STRUCTURE[categoryId]) {
        const category = SOC2_STRUCTURE[categoryId];
        Object.keys(category.sections).forEach(sectionId => {
          const section = category.sections[sectionId];
          total += section.points.length;
        });
      }
    });
    
    return total;
  }, []);

  const setStatus = useCallback((criteriaId, status) => {
    setAssessment(prev => ({
      ...prev,
      [criteriaId]: status
    }));
  }, []);

  const toggleCategory = useCallback((id) => {
    if (id === 'security') return; // Security is mandatory
    
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const serviceRecommendations = {
    saas: ['security', 'availability'],
    iaas: ['security', 'availability', 'processing', 'confidentiality'],
    dataprocessor: ['security', 'processing', 'confidentiality', 'privacy'],
    healthcare: ['security', 'availability', 'privacy'],
    financial: ['security', 'processing', 'confidentiality'],
    msp: ['security', 'availability', 'confidentiality']
  };

  const applyServiceRecommendations = useCallback((type) => {
    if (!type || !serviceRecommendations[type]) return;
    
    setServiceType(type);
    setSelectedCategories(serviceRecommendations[type]);
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const resetAssessment = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the assessment? All progress will be lost.')) {
      setAssessment(createDefaultAssessment());
    }
  }, []);

  const exportAssessment = useCallback(() => {
    const dataToExport = {
      assessment,
      selectedCategories,
      auditType,
      serviceType,
      stats: getCountsForCategories(assessment, selectedCategories),
      exportDate: new Date().toISOString(),
      framework: 'SOC 2 Trust Services Criteria'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soc2-assessment-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [assessment, selectedCategories, auditType, serviceType]);

  const stats = useMemo(() => 
    getCountsForCategories(assessment, selectedCategories), 
    [assessment, selectedCategories]
  );

  const filteredPoints = useCallback((categoryId, sectionId) => {
    if (!SOC2_STRUCTURE[categoryId] || !SOC2_STRUCTURE[categoryId].sections[sectionId]) {
      return [];
    }
    
    const section = SOC2_STRUCTURE[categoryId].sections[sectionId];
    return section.points.filter(point => {
      const status = assessment[point.id] || DEFAULT_STATUS;
      const matchesSearch = search === '' || 
        point.id.toLowerCase().includes(search.toLowerCase()) || 
        point.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [assessment, search, statusFilter]);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            SOC 2 Assessment 
            <span className="ml-2 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              2017 TSC + 2022 PoF
            </span>
          </h1>
        </div>
        <p className="mt-2 text-white text-opacity-90">
          Trust Services Criteria assessment for service organizations - demonstrating control effectiveness through AICPA framework
        </p>
      </div>

      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-sm">Audit Type:</label>
            <div className="flex gap-2">
              <Button 
                variant={auditType === 'type1' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => setAuditType('type1')}
              >
                Type I
              </Button>
              <Button 
                variant={auditType === 'type2' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => setAuditType('type2')}
              >
                Type II
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-sm">Service Type:</label>
            <Select
              value={serviceType}
              onChange={(e) => applyServiceRecommendations(e.target.value)}
              className="w-48"
            >
              <option value="">Select service type...</option>
              <option value="saas">SaaS Provider</option>
              <option value="iaas">IaaS/Cloud Infrastructure</option>
              <option value="dataprocessor">Data Processor</option>
              <option value="healthcare">Healthcare Technology</option>
              <option value="financial">Financial Services</option>
              <option value="msp">Managed Service Provider</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="font-semibold text-gray-700 text-sm block mb-2">
            Trust Service Categories:
          </label>
          <div className="flex flex-wrap gap-2">
            {SOC2_CATEGORIES.map(category => (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors
                  ${category.mandatory ? 'bg-green-50 border-2 border-green-500' : 'border-2'}
                  ${selectedCategories.includes(category.id) 
                    ? (category.mandatory ? 'bg-green-50 border-green-500' : 'bg-blue-500 text-white border-blue-500') 
                    : 'bg-white border-gray-300 hover:border-blue-300'}
                `}
              >
                {category.name}
                {category.mandatory && <span className="ml-1">(Mandatory)</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-100">
        <div className="bg-white p-3 rounded shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{selectedCategories.length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{getDynamicTotals(selectedCategories)}</div>
          <div className="text-sm text-gray-600">Total Criteria</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{SOC2_STATS.commonCriteria}</div>
          <div className="text-sm text-gray-600">Common Criteria</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{SOC2_STATS.pointsOfFocus}+</div>
          <div className="text-sm text-gray-600">Points of Focus</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{Math.round(stats.completionPct)}%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700 text-sm">Search:</label>
            <Input
              type="text"
              placeholder="Search criteria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700 text-sm">Category:</label>
            <Select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-48"
            >
              {selectedCategories.map(categoryId => {
                const category = SOC2_CATEGORIES.find(c => c.id === categoryId);
                return (
                  <option key={categoryId} value={categoryId}>
                    {category ? category.name : categoryId}
                  </option>
                );
              })}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700 text-sm">Status:</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Statuses</option>
              <option value="implemented">Implemented</option>
              <option value="partial">Partially Implemented</option>
              <option value="not-implemented">Not Implemented</option>
              <option value="not-assessed">Not Assessed</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex overflow-x-auto pb-2 mb-2 border-b border-gray-200">
          {selectedCategories.map(categoryId => {
            const category = SOC2_CATEGORIES.find(c => c.id === categoryId);
            return (
              <button
                key={categoryId}
                onClick={() => setActiveCategory(categoryId)}
                className={`
                  px-4 py-2 whitespace-nowrap mr-2 text-sm font-medium
                  ${activeCategory === categoryId 
                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' 
                    : 'text-gray-600 hover:text-blue-500'}
                `}
              >
                {category ? category.name : categoryId}
              </button>
            );
          })}
        </div>

        {SOC2_STRUCTURE[activeCategory] && (
          <div className="space-y-4">
            {Object.keys(SOC2_STRUCTURE[activeCategory].sections).map(sectionId => {
              const section = SOC2_STRUCTURE[activeCategory].sections[sectionId];
              const progress = getSectionProgress(assessment, activeCategory, sectionId);
              const isExpanded = expandedSections[sectionId] || false;
              const filtered = filteredPoints(activeCategory, sectionId);
              
              if (filtered.length === 0 && (search !== '' || statusFilter !== 'all')) {
                return null;
              }
              
              return (
                <div key={sectionId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSection(sectionId)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge color="primary" className="font-bold">
                        {section.id}
                      </Badge>
                      <span className="font-semibold text-gray-800">{section.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${progress.completionPct}%` }}
                        />
                      </div>
                      <span className="transform transition-transform duration-200" style={{ 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 bg-white">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/6">Criteria</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-2/5">Description</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-2/5">Assessment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(point => {
                            const status = assessment[point.id] || DEFAULT_STATUS;
                            return (
                              <tr key={point.id} className="border-t border-gray-200">
                                <td className="px-4 py-3">
                                  <span className="text-blue-600 font-semibold">{point.id}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-800">
                                  {point.name}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1">
                                    <Button
                                      size="xs"
                                      variant={status === 'not-implemented' ? 'danger' : 'secondary'}
                                      onClick={() => setStatus(point.id, 'not-implemented')}
                                    >
                                      Not Implemented
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant={status === 'partial' ? 'warning' : 'secondary'}
                                      onClick={() => setStatus(point.id, 'partial')}
                                    >
                                      Partial
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant={status === 'implemented' ? 'success' : 'secondary'}
                                      onClick={() => setStatus(point.id, 'implemented')}
                                    >
                                      Implemented
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600">{stats.implemented}</div>
              <div className="text-gray-600">Implemented</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-yellow-500">{stats.partial}</div>
              <div className="text-gray-600">Partially Implemented</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-red-500">{stats.notImplemented}</div>
              <div className="text-gray-600">Not Implemented</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-gray-500">{stats.notAssessed}</div>
              <div className="text-gray-600">Not Assessed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-100 flex flex-wrap justify-center gap-4">
        <Button variant="primary" onClick={exportAssessment}>
          Export SOC 2 Assessment
        </Button>
        <Button variant="secondary" onClick={resetAssessment}>
          Reset Assessment
        </Button>
        <Button variant="secondary" onClick={saveToLocalStorage}>
          Save Progress
        </Button>
      </div>
    </div>
  );
};

export default SOC2Assessment;
