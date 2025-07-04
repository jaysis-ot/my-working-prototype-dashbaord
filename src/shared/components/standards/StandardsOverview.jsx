// src/components/standards/StandardsOverview.jsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  TrendingUp, 
  Award, 
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Building2,
  Shield,
  FileText,
  Users,
  Globe
} from 'lucide-react';
import FrameworkCard from './FrameworkCard';
import AssessmentProgress from './AssessmentProgress';
import { 
  FRAMEWORK_DEFINITIONS, 
  FRAMEWORK_STATUS, 
  FRAMEWORK_CATEGORIES,
  STANDARDS_FRAMEWORKS 
} from '../../constants/standardsConstants';

/**
 * Standards Overview Component
 * 
 * Main dashboard for standards and frameworks management.
 * Provides filtering, searching, progress tracking, and framework selection.
 */
const StandardsOverview = ({ 
  state, 
  onFrameworkSelect,
  onStartAssessment,
  onViewDetails,
  className = ''
}) => {
  // Local state for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedFramework, setSelectedFramework] = useState(null);

  // Get standards data from state
  const standardsState = state.standards || {};
  const frameworksData = standardsState.frameworks || {};

  // Process frameworks data
  const frameworks = useMemo(() => {
    return Object.entries(FRAMEWORK_DEFINITIONS).map(([id, definition]) => {
      const frameworkState = frameworksData[id.replace(/-/g, '').replace(/\./g, '').toLowerCase()] || {};
      
      return {
        id,
        ...definition,
        progress: frameworkState.completionRate || 0,
        overallScore: frameworkState.overallScore || 0,
        lastUpdated: frameworkState.lastUpdated,
        // Add icon and color based on framework type
        icon: getFrameworkIcon(definition.category),
        color: getFrameworkColor(definition.category)
      };
    });
  }, [frameworksData]);

  // Helper functions for icons and colors
  function getFrameworkIcon(category) {
    switch (category) {
      case FRAMEWORK_CATEGORIES.CYBERSECURITY: return Shield;
      case FRAMEWORK_CATEGORIES.PRIVACY: return Users;
      case FRAMEWORK_CATEGORIES.GOVERNANCE: return Building2;
      case FRAMEWORK_CATEGORIES.COMPLIANCE: return FileText;
      case FRAMEWORK_CATEGORIES.OPERATIONS: return BarChart3;
      default: return Award;
    }
  }

  function getFrameworkColor(category) {
    switch (category) {
      case FRAMEWORK_CATEGORIES.CYBERSECURITY: return 'blue';
      case FRAMEWORK_CATEGORIES.PRIVACY: return 'purple';
      case FRAMEWORK_CATEGORIES.GOVERNANCE: return 'green';
      case FRAMEWORK_CATEGORIES.COMPLIANCE: return 'orange';
      case FRAMEWORK_CATEGORIES.OPERATIONS: return 'teal';
      default: return 'gray';
    }
  }

  // Filter frameworks based on search and filters
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(framework => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          framework.name.toLowerCase().includes(term) ||
          framework.shortName?.toLowerCase().includes(term) ||
          framework.description.toLowerCase().includes(term) ||
          framework.category.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && framework.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && framework.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [frameworks, searchTerm, categoryFilter, statusFilter]);

  // Calculate overview statistics
  const statistics = useMemo(() => {
    const available = frameworks.filter(f => f.status === FRAMEWORK_STATUS.AVAILABLE);
    const inProgress = frameworks.filter(f => f.progress > 0);
    const completed = frameworks.filter(f => f.progress >= 90);
    
    const totalProgress = available.reduce((sum, f) => sum + f.progress, 0);
    const averageProgress = available.length > 0 ? totalProgress / available.length : 0;

    const totalScore = available.reduce((sum, f) => sum + f.overallScore, 0);
    const averageScore = available.length > 0 ? totalScore / available.length : 0;

    return {
      total: frameworks.length,
      available: available.length,
      inProgress: inProgress.length,
      completed: completed.length,
      averageProgress,
      averageScore
    };
  }, [frameworks]);

  // Handle framework selection
  const handleFrameworkSelect = (frameworkId) => {
    setSelectedFramework(frameworkId);
    onFrameworkSelect?.(frameworkId);
  };

  // Render framework grid
  const renderFrameworkGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFrameworks.map(framework => (
        <FrameworkCard
          key={framework.id}
          framework={framework}
          isSelected={selectedFramework === framework.id}
          progress={framework.progress}
          overallScore={framework.overallScore}
          lastUpdated={framework.lastUpdated}
          onSelect={handleFrameworkSelect}
          onStartAssessment={onStartAssessment}
          onViewDetails={onViewDetails}
          size="default"
        />
      ))}
    </div>
  );

  // Render framework list
  const renderFrameworkList = () => (
    <div className="space-y-4">
      {filteredFrameworks.map(framework => (
        <FrameworkCard
          key={framework.id}
          framework={framework}
          isSelected={selectedFramework === framework.id}
          progress={framework.progress}
          overallScore={framework.overallScore}
          lastUpdated={framework.lastUpdated}
          onSelect={handleFrameworkSelect}
          onStartAssessment={onStartAssessment}
          onViewDetails={onViewDetails}
          size="compact"
          className="w-full"
        />
      ))}
    </div>
  );

  // Render statistics cards
  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.available}</div>
          <div className="text-sm text-gray-600">Available Frameworks</div>
          <div className="text-xs text-gray-500 mt-1">of {statistics.total} total</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{statistics.completed}</div>
          <div className="text-sm text-gray-600">Completed Assessments</div>
          <div className="text-xs text-gray-500 mt-1">≥90% completion</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.averageProgress.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Average Progress</div>
          <div className="text-xs text-gray-500 mt-1">across all frameworks</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{statistics.averageScore.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="text-xs text-gray-500 mt-1">out of 100</div>
        </CardContent>
      </Card>
    </div>
  );

  // Render quick actions
  const renderQuickActions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start h-auto p-4"
            onClick={() => handleFrameworkSelect(STANDARDS_FRAMEWORKS.NIST_CSF)}
          >
            <div className="text-left">
              <div className="font-medium">Start NIST CSF Assessment</div>
              <div className="text-sm text-gray-600">Begin with core cybersecurity framework</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-auto p-4"
            onClick={() => onViewDetails?.('comparison')}
          >
            <div className="text-left">
              <div className="font-medium">Compare Frameworks</div>
              <div className="text-sm text-gray-600">Side-by-side framework analysis</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-auto p-4"
            onClick={() => onViewDetails?.('reports')}
          >
            <div className="text-left">
              <div className="font-medium">Generate Reports</div>
              <div className="text-sm text-gray-600">Export compliance documentation</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Standards & Frameworks</h1>
          <p className="text-gray-600 mt-2">
            Manage compliance assessments across multiple cybersecurity and governance frameworks
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      {renderStatistics()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search frameworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(FRAMEWORK_CATEGORIES).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={FRAMEWORK_STATUS.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={FRAMEWORK_STATUS.BETA}>Beta</SelectItem>
                  <SelectItem value={FRAMEWORK_STATUS.COMING_SOON}>Coming Soon</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Category: {categoryFilter}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {statusFilter}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs h-6"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="frameworks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frameworks">Frameworks ({filteredFrameworks.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Map</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frameworks" className="space-y-6">
          {filteredFrameworks.length > 0 ? (
            viewMode === 'grid' ? renderFrameworkGrid() : renderFrameworkList()
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Frameworks Found</h3>
                <p className="text-gray-600 mb-4">
                  No frameworks match your current search and filter criteria.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-6">
          {statistics.inProgress > 0 ? (
            <div className="space-y-6">
              {frameworks
                .filter(f => f.progress > 0)
                .map(framework => (
                  <AssessmentProgress
                    key={framework.id}
                    frameworkId={framework.id}
                    assessmentData={frameworksData[framework.id.replace(/-/g, '').replace(/\./g, '').toLowerCase()]?.assessmentData || {}}
                    showDetails={false}
                    onDrillDown={(funcId) => handleFrameworkSelect(framework.id)}
                  />
                ))
              }
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments in Progress</h3>
                <p className="text-gray-600 mb-4">
                  Start an assessment to track your compliance progress.
                </p>
                <Button onClick={() => handleFrameworkSelect(STANDARDS_FRAMEWORKS.NIST_CSF)}>
                  Start NIST CSF Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Mapping</h3>
              <p className="text-gray-600 mb-4">
                Cross-framework compliance mapping and gap analysis will be available soon.
              </p>
              <p className="text-sm text-gray-500">
                This feature will help you understand control overlaps and identify coverage gaps across multiple frameworks.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Insights</h3>
              <p className="text-gray-600 mb-4">
                AI-powered insights and recommendations based on your assessment data.
              </p>
              <p className="text-sm text-gray-500">
                Advanced analytics and benchmarking features coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StandardsOverview;