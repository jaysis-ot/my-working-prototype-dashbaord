// src/components/modals/CSVUploadModal.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';

const CSVUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    setUploadError('');
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please select a CSV file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Parse CSV for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const preview = lines.slice(1, 4).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        
        setPreviewData({ headers, preview, totalRows: lines.length - 1 });
      } catch (error) {
        setUploadError('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || '';
              return obj;
            }, {});
          });

          onUpload(data);
          onClose();
        } catch (error) {
          setUploadError('Error processing CSV file');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      setUploadError('Error uploading file');
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `ID,Description,Category,Capability,Status,Priority,Business Value,Progress Status,Applicability,Maturity Level,Cost Estimate,Assignee,Due Date
REQ-001,Sample requirement description,Network Security,CAP-001,Not Started,High,4.5,Feasibility,Essential,Initial,50000,John Doe,2024-12-31
REQ-002,Another sample requirement,Access Control,CAP-002,In Progress,Medium,3.8,Gathering more context,Applicable,Developing,25000,Jane Smith,2024-11-30`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'requirements_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setUploadError('');
    setIsUploading(false);
  };

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Import Requirements from CSV</h2>
          <p className="text-sm text-gray-600 mt-1">Upload a CSV file to import multiple requirements</p>
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
        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Need a template?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Download a CSV template with the correct format and sample data.
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center">
            {selectedFile ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={reset}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Choose a different file
                </button>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <FileText className="h-4 w-4 mr-1" />
                  CSV files only • Max 10MB
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Upload Error</h3>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewData && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Preview ({previewData.totalRows} rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.headers.slice(0, 6).map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                    {previewData.headers.length > 6 && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        +{previewData.headers.length - 6} more
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.preview.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewData.headers.slice(0, 6).map((header, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 max-w-32 truncate">
                          {row[header] || '-'}
                        </td>
                      ))}
                      {previewData.headers.length > 6 && (
                        <td className="px-3 py-2 text-sm text-gray-500">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.totalRows > 3 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 3 rows of {previewData.totalRows} total rows
              </p>
            )}
          </div>
        )}

        {/* Format Requirements */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• First row must contain column headers</li>
            <li>• Required columns: ID, Description, Category</li>
            <li>• Optional columns: Capability, Status, Priority, Business Value, etc.</li>
            <li>• Use comma-separated values</li>
            <li>• Enclose text with commas in quotes</li>
            <li>• UTF-8 encoding recommended</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            selectedFile && !isUploading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Requirements
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CSVUploadModal;