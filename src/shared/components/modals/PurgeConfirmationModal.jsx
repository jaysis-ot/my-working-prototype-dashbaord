import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const PurgeConfirmationModal = ({ onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Failed to purge data:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Confirm Data Purge
        </h3>
        <p className="text-gray-600">
          This action will permanently delete all requirements, capabilities, and associated data. 
          This cannot be undone.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm font-medium mb-2">
          Type "DELETE" to confirm:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="DELETE"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirmText !== 'DELETE' || isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete All Data'}
        </button>
      </div>
    </div>
  );
};

export default PurgeConfirmationModal;