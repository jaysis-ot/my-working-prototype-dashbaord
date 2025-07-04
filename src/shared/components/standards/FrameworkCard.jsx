// src/components/standards/FrameworkCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Settings, 
  Calendar, 
  Users, 
  ExternalLink,
  Play,
  BarChart3,
  FileText,
  Clock,
  Award,
  Shield,
  AlertCircle
} from 'lucide-react';
import { FRAMEWORK_STATUS } from '../../constants/standardsConstants';

/**
 * Framework Card Component
 * 
 * Displays framework information, progress, and actions in a consistent card format.
 * Supports different states (available, coming soon, beta) and progress tracking.
 */
const FrameworkCard = ({ 
  framework,
  isSelected = false,
  progress = 0,
  overallScore = 0,
  lastUpdated = null,
  onSelect = null,
  onStartAssessment = null,
  onViewDetails = null,
  className = '',
  size = 'default' // 'compact', 'default', 'detailed'
}) => {
  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      [FRAMEWORK_STATUS.AVAILABLE]: { 
        icon: CheckCircle,
        className: 'text-green-600 bg-green-100 border-green-200',
        label: 'Available'
      },
      [FRAMEWORK_STATUS.BETA]: { 
        icon: Settings,
        className: 'text-blue-600 bg-blue-100 border-blue-200',
        label: 'Beta'
      },
      [FRAMEWORK_STATUS.COMING_SOON]: { 
        icon: Clock,
        className: 'text-gray-600 bg-gray-100 border-gray-200',
        label: 'Coming Soon'
      }
    };
    return configs[status] || configs[FRAMEWORK_STATUS.COMING_SOON];
  };

  // Progress configuration
  const getProgressConfig = (progress) => {
    if (progress >= 90) return { color: 'text-green-600', bgColor: 'bg-green-600', status: 'Complete' };
    if (progress >= 70) return { color: 'text-blue-600', bgColor: 'bg-blue-600', status: 'Advanced' };
    if (progress >= 40) return { color: 'text-yellow-600', bgColor: 'bg-yellow-600', status: 'In Progress' };
    if (progress > 0) return { color: 'text-orange-600', bgColor: 'bg-orange-600', status: 'Started' };
    return { color: 'text-gray-400', bgColor: 'bg-gray-400', status: 'Not Started' };
  };

  const statusConfig = getStatusConfig(framework.status);
  const progressConfig = getProgressConfig(progress);
  const StatusIcon = statusConfig.icon;
  const FrameworkIcon = framework.icon || Shield;

  // Handle card click
  const handleCardClick = () => {
    if (framework.status === FRAMEWORK_STATUS.AVAILABLE && onSelect) {
      onSelect(framework.id);
    }
  };

  // Render compact version
  if (size === 'compact') {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
        } ${framework.status !== FRAMEWORK_STATUS.AVAILABLE ? 'opacity-75' : ''} ${className}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${framework.color}-100 flex-shrink-0`}>
              <FrameworkIcon className={`w-4 h-4 text-${framework.color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{framework.shortName || framework.name}</h3>
                <Badge className={`text-xs ${statusConfig.className}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              {framework.status === FRAMEWORK_STATUS.AVAILABLE && (
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1 h-1" />
                  <span className="text-xs text-gray-600 font-medium">{progress.toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render detailed version
  if (size === 'detailed') {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md hover:border-gray-300'
        } ${framework.status !== FRAMEWORK_STATUS.AVAILABLE ? 'opacity-75' : ''} ${className}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-lg bg-${framework.color}-100 flex-shrink-0`}>
                <FrameworkIcon className={`w-6 h-6 text-${framework.color}-600`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl">{framework.name}</CardTitle>
                  <Badge className={statusConfig.className}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{framework.description}</p>
                
                {/* Framework Details */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                  <div className="bg-gray-50 px-2 py-1 rounded">
                    <span className="font-medium">Category:</span> {framework.category}
                  </div>
                  <div className="bg-gray-50 px-2 py-1 rounded">
                    <span className="font-medium">Version:</span> {framework.version}
                  </div>
                  {framework.subcategories && (
                    <div className="bg-gray-50 px-2 py-1 rounded">
                      <span className="font-medium">Controls:</span> {framework.subcategories} subcategories
                    </div>
                  )}
                  {framework.controls && (
                    <div className="bg-gray-50 px-2 py-1 rounded">
                      <span className="font-medium">Controls:</span> {framework.controls} controls
                    </div>
                  )}
                  {framework.requirements && (
                    <div className="bg-gray-50 px-2 py-1 rounded">
                      <span className="font-medium">Requirements:</span> {framework.requirements} requirements
                    </div>
                  )}
                  {framework.estimatedHours && (
                    <div className="bg-gray-50 px-2 py-1 rounded col-span-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      <span className="font-medium">Effort:</span> {framework.estimatedHours}
                    </div>
                  )}
                </div>

                {/* Applicability */}
                {framework.applicability && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Applicable to:</h4>
                    <div className="flex flex-wrap gap-1">
                      {framework.applicability.slice(0, 3).map(item => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {framework.applicability.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{framework.applicability.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {framework.status === FRAMEWORK_STATUS.AVAILABLE ? (
            <div className="space-y-4">
              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assessment Progress</span>
                  <span className={`font-medium ${progressConfig.color}`}>
                    {progress.toFixed(1)}% - {progressConfig.status}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                
                {overallScore > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Overall Score</span>
                    <span className="font-medium">{overallScore.toFixed(1)}/100</span>
                  </div>
                )}
                
                {lastUpdated && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last updated: {new Date(lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {progress === 0 ? (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartAssessment?.(framework.id);
                    }}
                    className="flex-1"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Assessment
                  </Button>
                ) : (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(framework.id);
                    }}
                    className="flex-1"
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Continue Assessment
                  </Button>
                )}
                
                {progress > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(framework.id);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">
                {framework.status === FRAMEWORK_STATUS.BETA ? 'Beta Framework' : 'Coming Soon'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {framework.status === FRAMEWORK_STATUS.BETA 
                  ? 'This framework is available in beta. Some features may be limited.'
                  : 'Assessment framework in development'
                }
              </p>
              {framework.estimatedHours && (
                <p className="text-xs text-gray-400">
                  Estimated effort when available: {framework.estimatedHours}
                </p>
              )}
              
              {framework.status === FRAMEWORK_STATUS.BETA && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(framework.id);
                  }}
                >
                  Try Beta
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default size
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md hover:border-gray-300'
      } ${framework.status !== FRAMEWORK_STATUS.AVAILABLE ? 'opacity-75' : ''} ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-${framework.color}-100 flex-shrink-0`}>
              <FrameworkIcon className={`w-5 h-5 text-${framework.color}-600`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{framework.name}</CardTitle>
                <Badge className={`text-xs ${statusConfig.className}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
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
              {framework.estimatedHours && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{framework.estimatedHours}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      {framework.status === FRAMEWORK_STATUS.AVAILABLE && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Assessment Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {overallScore > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Overall Score</span>
                <span className="font-medium">{overallScore.toFixed(1)}/100</span>
              </div>
            )}
            
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {framework.status === FRAMEWORK_STATUS.COMING_SOON && (
        <CardContent className="pt-0">
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-2">Assessment framework in development</p>
            {framework.estimatedHours && (
              <p className="text-xs text-gray-400">
                Estimated effort: {framework.estimatedHours}
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FrameworkCard;