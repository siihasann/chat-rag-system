import { useState, useCallback } from "react";
import { z } from "zod";

interface UseFormStateOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useFormState<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormStateOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  });

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!validationSchema) return "";

      const result = validationSchema.safeParse({
        ...state.values,
        [name]: value,
      });

      if (result.success) return "";

      const fieldError = result.error.errors.find(
        (err) => err.path[0] === name
      );

      return fieldError?.message || "";
    },
    [validationSchema, state.values]
  );

  const validateForm = useCallback(
    (values: T) => {
      if (!validationSchema) return {};

      try {
        validationSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors.reduce((acc, err) => {
            acc[err.path[0] as keyof T] = err.message;
            return acc;
          }, {} as Partial<Record<keyof T, string>>);
        }
        return {};
      }
    },
    [validationSchema]
  );

  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const error = validateField(name, value);
        const newErrors = { ...prev.errors, [name]: error };
        const newTouched = { ...prev.touched, [name]: true };

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          touched: newTouched,
          isValid: Object.keys(newErrors).every(
            (key) => !newErrors[key as keyof T]
          ),
        };
      });
    },
    [validateField]
  );

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: {} }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
    });
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const errors = validateForm(state.values);
      const isValid = Object.keys(errors).length === 0;

      setState((prev) => ({
        ...prev,
        errors,
        isValid,
      }));

      if (!isValid) return;

      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit?.(state.values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, validateForm, onSubmit]
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setFieldError,
    clearErrors,
    resetForm,
    handleSubmit,
  };
}
