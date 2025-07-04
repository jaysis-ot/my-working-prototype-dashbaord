// src/components/views/StandardsView.jsx
import React from 'react';

const StandardsView = ({ state, dispatch }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Standards & Frameworks</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Standards and frameworks assessment coming soon...</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">NIST CSF 2.0</h3>
            <p className="text-sm text-gray-600 mt-1">Cybersecurity Framework</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">ISO 27001</h3>
            <p className="text-sm text-gray-600 mt-1">Information Security Management</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">SOC 2</h3>
            <p className="text-sm text-gray-600 mt-1">Service Organization Control</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardsView;