// src/components/views/StandardsView.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, FileCheck, TrendingUp, Settings, Shield, CheckCircle } from 'lucide-react';
import NISTCSFAssessment from '../standards/NISTCSFAssessment';

/**
 * Standards & Frameworks View
 * 
 * Main hub for compliance framework assessments and management.
 * Provides access to multiple frameworks including NIST CSF 2.0,
 * ISO 27001, SOC 2, and other standards.
 */
const StandardsView = ({ state, dispatch }) => {
  const [selectedFramework, setSelectedFramework] = useState('nist-csf-2.0');

  // Framework data structure
  const frameworks = [
    {
      id: 'nist-csf-2.0',
      name: 'NIST CSF 2.0',
      description: 'Comprehensive cybersecurity framework with 6 functions and 106 subcategories',
      status: 'available',
      progress: state.standards?.frameworks?.nistCsf?.completionRate || 0,
      icon: Shield,
      color: 'blue',
      category: 'Cybersecurity',
      subcategories: 106,
      functions: 6
    },
    {
      id: 'iso-27001',
      name: 'ISO 27001:2022',
      description: 'International standard for information security management systems',
      status: 'coming-soon',
      progress: 0,
      icon: Award,
      color: 'green',
      category: 'Information Security',
      controls: 93,
      themes: 4
    },
    {
      id: 'soc-2',
      name: 'SOC 2 Type II',
      description: 'Service organization controls for security and availability',
      status: 'coming-soon',
      progress: 0,
      icon: FileCheck,
      color: 'purple',
      category: 'Audit & Compliance',
      criteria: 5,
      points: 64
    },
    {
      id: 'pci-dss',
      name: 'PCI DSS v4.0',
      description: 'Payment Card Industry Data Security Standard',
      status: 'coming-soon',
      progress: 0,
      icon: TrendingUp,
      color: 'orange',
      category: 'Payment Security',
      requirements: 12,
      controls: 320
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { variant: 'default', label: 'Available', icon: CheckCircle },
      'coming-soon': { variant: 'secondary', label: 'Coming Soon', icon: Settings },
      beta: { variant: 'outline', label: 'Beta', icon: Settings }
    };
    
    const config = statusConfig[status] || statusConfig['coming-soon'];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const renderFrameworkCard = (framework) => (
    <Card 
      key={framework.id}
      className={`cursor-pointer transition-all duration-200 ${
        selectedFramework === framework.id 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md hover:border-gray-300'
      } ${framework.status !== 'available' ? 'opacity-75' : ''}`}
      onClick={() => framework.status === 'available' && setSelectedFramework(framework.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-${framework.color}-100 flex-shrink-0`}>
              <framework.icon className={`w-5 h-5 text-${framework.color}-600`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{framework.name}</CardTitle>
                {getStatusBadge(framework.status)}
              </div>
              <p className="text-sm text-gray-600 mb-2">{framework.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">{framework.category}</span>
                {framework.subcategories && (
                  <span>{framework.subcategories} subcategories</span>
                )}
                {framework.controls && (
                  <span>{framework.controls} controls</span>
                )}
                {framework.requirements && (
                  <span>{framework.requirements} requirements</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {framework.status === 'available' && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Assessment Progress</span>
              <span className="font-medium">{framework.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-${framework.color}-600 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${framework.progress}%` }}
              />
            </div>
            {framework.progress > 0 && (
              <div className="text-xs text-gray-500">
                Last updated: {new Date(state.standards?.frameworks?.nistCsf?.lastUpdated || Date.now()).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {framework.status === 'coming-soon' && (
        <CardContent className="pt-0">
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">Assessment framework in development</p>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderOverviewStats = () => {
    const availableFrameworks = frameworks.filter(f => f.status === 'available').length;
    const totalFrameworks = frameworks.length;
    const averageProgress = frameworks
      .filter(f => f.status === 'available')
      .reduce((sum, f) => sum + f.progress, 0) / availableFrameworks || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{availableFrameworks}</div>
            <div className="text-sm text-gray-600">Available Frameworks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalFrameworks - availableFrameworks}</div>
            <div className="text-sm text-gray-600">Coming Soon</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{averageProgress.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Average Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {frameworks.reduce((sum, f) => sum + (f.subcategories || f.controls || f.requirements || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Controls</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFrameworkContent = () => {
    switch (selectedFramework) {
      case 'nist-csf-2.0':
        return <NISTCSFAssessment state={state} dispatch={dispatch} />;
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Framework Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                This framework assessment will be available in a future update.
              </p>
              <p className="text-sm text-gray-500">
                We're working on bringing you comprehensive assessments for all major 
                cybersecurity and compliance frameworks.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Standards & Frameworks</h1>
          <p className="text-gray-600 mt-2">
            Assess and manage compliance across multiple cybersecurity and governance frameworks
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Framework Settings
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      {renderOverviewStats()}

      {/* Tabs for different views */}
      <Tabs defaultValue="frameworks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frameworks" className="space-y-6">
          {/* Framework Selection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {frameworks.map(renderFrameworkCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="assessment" className="space-y-6">
          {/* Active Framework Assessment */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {frameworks.find(f => f.id === selectedFramework)?.name || 'Select Framework'}
            </h2>
            <p className="text-gray-600">
              Complete your assessment to track compliance and identify improvement areas
            </p>
          </div>
          {renderFrameworkContent()}
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports Coming Soon</h3>
              <p className="text-gray-600">
                Comprehensive compliance reports and executive dashboards will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StandardsView;