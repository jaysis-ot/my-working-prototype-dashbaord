// src/components/modals/CSVUploadModal.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, RefreshCw, CheckCircle } from 'lucide-react';
import { parseCSV } from '../../utils/csvUtils';

const CSVUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    
    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const { headers, data } = parseCSV(csvText);
        setPreview({ headers, data: data.slice(0, 5), totalRows: data.length, fullData: data });
        setUploading(false);
      } catch (err) {
        alert('Error parsing CSV file. Please check the format.');
        setUploading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const confirmUpload = () => {
    if (preview?.fullData) {
      onUpload(preview.fullData);
      setPreview(null);
      onClose();
    }
  };

  const resetUpload = () => {
    setPreview(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upload Requirements CSV</h2>
          <button 
            onClick={() => {
              resetUpload();
              onClose();
            }} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                className="hidden"
                aria-label="Choose CSV file"
              />
              
              {uploading ? (
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Processing CSV file...</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</p>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </button>
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="mb-2"><strong>Expected format:</strong></p>
                    <p>• Headers: id, description, category, status, businessValueScore, etc.</p>
                    <p>• File encoding: UTF-8</p>
                    <p>• Maximum file size: 10MB</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium text-green-900">
                    CSV parsed successfully! Found {preview.totalRows} rows
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Preview (first 5 rows):</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.headers.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {preview.headers.map((header, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 truncate max-w-32">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmUpload}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Upload
                </button>
                <button
                  onClick={resetUpload}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Choose Different File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;