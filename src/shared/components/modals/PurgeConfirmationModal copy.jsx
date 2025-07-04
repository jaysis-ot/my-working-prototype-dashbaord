// src/components/modals/PurgeConfirmationModal.jsx
import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Shield } from 'lucide-react';

const PurgeConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isPurging, setIsPurging] = useState(false);
  const requiredText = 'DELETE ALL DATA';

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== requiredText) return;
    
    setIsPurging(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Purge failed:', error);
    } finally {
      setIsPurging(false);
    }
  };

  const isValid = confirmText === requiredText;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Purge All Data</h2>
            <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900 mb-2">
                Critical Warning
              </h3>
              <div className="text-sm text-red-700 space-y-2">
                <p>This action will permanently delete:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All requirements data</li>
                  <li>All capability information</li>
                  <li>All progress tracking</li>
                  <li>All business value assessments</li>
                  <li>All maturity assessments</li>
                  <li>All custom configurations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Consequences */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">
            What happens after purging?
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• The system will revert to its initial empty state</p>
            <p>• Demo data will be available for reload</p>
            <p>• All user configurations will be reset</p>
            <p>• Export your data before purging if you want to keep it</p>
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-mono bg-gray-100 px-1 rounded">{requiredText}</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              confirmText && !isValid 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
            placeholder="Type the confirmation text..."
            disabled={isPurging}
          />
          {confirmText && !isValid && (
            <p className="text-sm text-red-600 mt-1">
              Please type "{requiredText}" exactly as shown
            </p>
          )}
        </div>

        {/* Alternative Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Alternative Actions
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Export your data first using the "Export CSV" button</p>
            <p>• Consider filtering and deleting specific items instead</p>
            <p>• Contact your administrator for data archival options</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isPurging}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isValid || isPurging}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isValid && !isPurging
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPurging ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Purging...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Purge All Data
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PurgeConfirmationModal;