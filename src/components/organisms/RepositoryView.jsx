import React from 'react';
import PropTypes from 'prop-types';
import { Edit, Trash2, Database, Plus, ExternalLink, Eye } from 'lucide-react';
import Button from '../atoms/Button';

/**
 * RepositoryView Organism Component
 * 
 * This component displays and manages evidence repositories.
 * It shows either a placeholder when no repositories exist,
 * or a table of repositories with actions.
 */
const RepositoryView = ({
  repositories,
  onAddRepository,
  onEditRepository,
  onDeleteRepository,
  onViewEvidence
}) => {
  // If no repositories, show placeholder
  if (!repositories || repositories.length === 0) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-dashed border-secondary-300 dark:border-secondary-700 p-8 text-center">
        <div className="flex justify-center mb-4">
          <Database className="w-12 h-12 text-secondary-400 dark:text-secondary-600" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No Repositories Found</h3>
        <p className="text-secondary-500 dark:text-secondary-400 max-w-md mx-auto mb-6">
          Add your first evidence repository to start organizing and managing your artifacts.
        </p>
        <Button
          variant="primary"
          leadingIcon={Plus}
          onClick={onAddRepository}
        >
          Add Repository
        </Button>
      </div>
    );
  }

  // Render table of repositories
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="sticky top-0 z-10 bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
            {repositories.map((repo) => (
              <tr 
                key={repo.id}
                className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-primary-500 mr-3" />
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {repo.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {repo.url.length > 40 ? `${repo.url.substring(0, 40)}...` : repo.url}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                  {new Date(repo.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                  {new Date(repo.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* View Evidence */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewEvidence(repo.id)}
                      title="View Evidence"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditRepository(repo.id)}
                      title="Edit Repository"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteRepository(repo.id)}
                      title="Delete Repository"
                    >
                      <Trash2 className="w-4 h-4 text-status-error" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add repository button at bottom */}
      <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button
          variant="secondary"
          leadingIcon={Plus}
          onClick={onAddRepository}
        >
          Add Repository
        </Button>
      </div>
    </div>
  );
};

RepositoryView.propTypes = {
  /**
   * Array of repository objects
   */
  repositories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired
    })
  ).isRequired,
  
  /**
   * Handler for adding a new repository
   */
  onAddRepository: PropTypes.func.isRequired,
  
  /**
   * Handler for editing a repository
   */
  onEditRepository: PropTypes.func,
  
  /**
   * Handler for deleting a repository
   */
  onDeleteRepository: PropTypes.func,

  /**
   * Handler for viewing evidence for a repository
   */
  onViewEvidence: PropTypes.func
};

RepositoryView.defaultProps = {
  onEditRepository: () => {},
  onDeleteRepository: () => {},
  onViewEvidence: () => {}
};

export default RepositoryView;
