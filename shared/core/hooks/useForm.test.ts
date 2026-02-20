import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';
import type { ValidationResult } from '../utils/validation';

interface TestForm {
  name: string;
  email: string;
}

const defaults: TestForm = { name: '', email: '' };

describe('useForm', () => {
  it('initializes with provided data', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: { name: 'Alice', email: 'a@b.com' }, onSubmit: async () => {} }),
    );
    expect(result.current.formData).toEqual({ name: 'Alice', email: 'a@b.com' });
    expect(result.current.errors).toEqual({});
    expect(result.current.saving).toBe(false);
  });

  it('handleChange updates a single field', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit: async () => {} }),
    );
    act(() => result.current.handleChange('name', 'Bob'));
    expect(result.current.formData.name).toBe('Bob');
  });

  it('handleChange clears the error for that field', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit: async () => {} }),
    );
    act(() => result.current.setFieldError('name', 'required'));
    expect(result.current.errors.name).toBe('required');
    act(() => result.current.handleChange('name', 'Bob'));
    expect(result.current.errors.name).toBeUndefined();
  });

  it('updateFormData batch-updates multiple fields', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit: async () => {} }),
    );
    act(() => result.current.updateFormData({ name: 'Eve', email: 'e@e.com' }));
    expect(result.current.formData).toEqual({ name: 'Eve', email: 'e@e.com' });
  });

  it('resetForm resets to initial data', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit: async () => {} }),
    );
    act(() => result.current.handleChange('name', 'changed'));
    act(() => result.current.resetForm());
    expect(result.current.formData).toEqual(defaults);
  });

  it('resetForm accepts new data', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit: async () => {} }),
    );
    act(() => result.current.resetForm({ name: 'New', email: 'new@new.com' }));
    expect(result.current.formData.name).toBe('New');
  });

  it('handleSubmit calls onSubmit and returns true on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useForm({ initialData: { name: 'Alice', email: 'a@b.com' }, onSubmit, onSuccess }),
    );
    let success: boolean;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice', email: 'a@b.com' });
    expect(onSuccess).toHaveBeenCalled();
    expect(success!).toBe(true);
  });

  it('handleSubmit runs validation and blocks on failure', async () => {
    const onSubmit = vi.fn();
    const validate = (data: TestForm): ValidationResult => ({
      valid: false,
      errors: { name: 'Name is required' },
    });
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit, validate }),
    );
    let success: boolean;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(success!).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe('Name is required');
  });

  it('handleSubmit catches errors and calls onError', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network fail'));
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit, onError }),
    );
    let success: boolean;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(success!).toBe(false);
    expect(onError).toHaveBeenCalledWith('Network fail');
  });

  it('setFieldError and clearErrors work correctly', () => {
    const { result } = renderHook(() =>
      useForm({ initialData: defaults, onSubmit: async () => {} }),
    );
    act(() => {
      result.current.setFieldError('name', 'too short');
      result.current.setFieldError('email', 'invalid');
    });
    expect(result.current.errors).toEqual({ name: 'too short', email: 'invalid' });
    act(() => result.current.clearErrors());
    expect(result.current.errors).toEqual({});
  });
});
