import { useState, useCallback } from 'react';
import { ValidationRules, ValidationErrors, validateForm, validateField } from '@/utils/validation';

interface UseFormValidationOptions {
  rules: ValidationRules;
  onSubmit?: (data: { [key: string]: string }) => void | Promise<void>;
}

export function useFormValidation({ rules, onSubmit }: UseFormValidationOptions) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSingleField = useCallback((field: string, value: string) => {
    const fieldRules = rules[field];
    if (!fieldRules) return null;

    const error = validateField(value, fieldRules);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    return error;
  }, [rules]);

  const validateAllFields = useCallback((data: { [key: string]: string }) => {
    const newErrors = validateForm(data, rules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  const handleSubmit = useCallback(async (data: { [key: string]: string }) => {
    if (!onSubmit) return false;

    const isValid = validateAllFields(data);
    if (!isValid) return false;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateAllFields]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    errors,
    isSubmitting,
    validateField: validateSingleField,
    validateForm: validateAllFields,
    handleSubmit,
    clearErrors,
    clearFieldError,
    setFieldError,
  };
}