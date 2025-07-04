// src/components/views/CompanyProfileView.jsx
import React from 'react';

const CompanyProfileView = ({ onProfileUpdate, existingProfile }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Profile</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Company profile configuration coming soon...</p>
        {existingProfile && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-900">Current Profile:</h3>
            <p className="text-sm text-gray-600">{existingProfile.companyName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfileView;