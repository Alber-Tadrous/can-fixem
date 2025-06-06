export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    // Required check
    if (rule.required && (!value || value.trim() === '')) {
      return rule.message;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      continue;
    }

    // Min length check
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }

    // Max length check
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return null;
}

export function validateForm(data: { [key: string]: string }, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field] || '';
    const error = validateField(value, fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

// Common validation rules
export const commonRules = {
  name: [
    {
      required: true,
      message: 'Name is required',
    },
    {
      minLength: 2,
      message: 'Name must be at least 2 characters',
    },
    {
      maxLength: 50,
      message: 'Name must be less than 50 characters',
    },
    {
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name can only contain letters and spaces',
    },
  ],
  email: [
    {
      required: true,
      message: 'Email is required',
    },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  ],
  password: [
    {
      required: true,
      message: 'Password is required',
    },
    {
      minLength: 6,
      message: 'Password must be at least 6 characters long',
    },
  ],
  phone: [
    {
      required: true,
      message: 'Phone number is required',
    },
    {
      pattern: /^[\d\s\-\+\(\)]{10,}$/,
      message: 'Please enter a valid phone number',
    },
  ],
  address: [
    {
      required: true,
      message: 'Address is required',
    },
    {
      minLength: 5,
      message: 'Address must be at least 5 characters',
    },
  ],
  city: [
    {
      required: true,
      message: 'City is required',
    },
    {
      minLength: 2,
      message: 'City must be at least 2 characters',
    },
  ],
  state: [
    {
      required: true,
      message: 'State is required',
    },
  ],
  zipCode: [
    {
      required: true,
      message: 'ZIP code is required',
    },
    {
      pattern: /^\d{5}(-\d{4})?$/,
      message: 'Please enter a valid ZIP code',
    },
  ],
};