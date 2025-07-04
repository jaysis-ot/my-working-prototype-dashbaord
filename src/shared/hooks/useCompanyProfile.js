// src/hooks/useCompanyProfile.js
import { useState } from 'react';

export const useCompanyProfile = () => {
  const [profile, setProfile] = useState({
    companyName: 'My Company',
    profileCompleted: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveProfile = async (newProfile, isDraft = false) => {
    console.log('Saving profile:', newProfile, 'isDraft:', isDraft);
    setProfile(newProfile);
    return true;
  };

  return {
    profile,
    loading,
    error,
    saveProfile
  };
};