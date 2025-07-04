// src/components/modals/PurgeConfirmationModal.jsx
import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

const PurgeConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [purging, setPurging] = useState(false);
  
  const handleConfirm = async () => {
    if (confirmText === 'DELETE ALL DATA') {
      setPurging(true);
      try {
        await onConfirm();
        setPurging(false);
        setConfirmText('');
        onClose();
      } catch (error) {
        setPurging(false);
        console.error('Error during purge:', error);
      }
    }
  };

  const handleClose = () => {
    if (!purging) {
      setConfirmText('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Confirm Data Purge</h2>
          </div>
          
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">⚠️ WARNING: This action cannot be undone!</p>
              <p className="text-red-700 text-sm">
                This will permanently delete all requirements data including:
              </p>
              <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                <li>All requirement records</li>
                <li>Business justifications</li>
                <li>Progress tracking</li>
                <li>Cost estimates and ROI data</li>
              </ul>
            </div>
            
            <p className="text-gray-700 mb-4">
              To confirm this action, please type <strong className="text-red-600">DELETE ALL DATA</strong> in the field below:
            </p>
            
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE ALL DATA"
              disabled={purging}
              autoFocus
            />
            
            {confirmText && confirmText !== 'DELETE ALL DATA' && (
              <p className="text-sm text-red-600 mt-2">
                Text must match exactly: "DELETE ALL DATA"
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleConfirm}
              disabled={confirmText !== 'DELETE ALL DATA' || purging}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purging ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {purging ? 'Purging...' : 'Delete All Data'}
            </button>
            <button
              onClick={handleClose}
              disabled={purging}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
          
          {purging && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center text-sm text-gray-600">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deleting all data... Please wait.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurgeConfirmationModal;