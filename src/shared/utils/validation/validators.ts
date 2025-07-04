// ===== UTILITY TEMPLATES =====

// src/shared/utils/validation/validators.ts
export const validators = {
  required: (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Must be a valid email address';
    }
    return null;
  },

  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Must be a valid URL';
    }
  },
};