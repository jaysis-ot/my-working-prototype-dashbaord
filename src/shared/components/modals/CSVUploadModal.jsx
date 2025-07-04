import React, { useState } from 'react';
import { Upload, AlertCircle, FileText, CheckCircle } from 'lucide-react';

const CSVUploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Preview first few lines
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(0, 5);
        setPreview(lines);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target.result;
        // Parse CSV and call onUpload
        const rows = csvText.split('\n').filter(row => row.trim());
        await onUpload(rows);
      };
      reader.readAsText(file);
    } catch (error) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h3>
        <p className="text-gray-600">
          Upload a CSV file containing requirement data. The file should include columns for ID, description, status, etc.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        <label 
          htmlFor="csv-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <FileText className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">
            Click to select a CSV file or drag and drop
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {file && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">File selected: {file.name}</p>
          </div>
        </div>
      )}

      {preview && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
          <pre className="text-xs text-gray-600 overflow-auto max-h-32 bg-white p-3 rounded border">
            {preview.join('\n')}
          </pre>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          disabled={uploading}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>
    </div>
  );
};

export default CSVUploadModal;