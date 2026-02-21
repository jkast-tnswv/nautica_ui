import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('./useModalRoute', () => ({
  useModalRoute: vi.fn(() => ({
    modal: null,
    params: {},
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModal: vi.fn(),
    getParam: vi.fn(),
  })),
}));

import { useModalForm } from './useModalForm';

interface TestItem {
  id: string;
  name: string;
  value: number;
}

interface TestFormData {
  name: string;
  value: number;
}

const emptyFormData: TestFormData = { name: '', value: 0 };

const defaultOptions = {
  emptyFormData,
  itemToFormData: (item: TestItem): TestFormData => ({ name: item.name, value: item.value }),
  onCreate: vi.fn(async () => true),
  onUpdate: vi.fn(async () => true),
  getItemId: (item: TestItem) => item.id,
};

beforeEach(() => {
  vi.clearAllMocks();
  defaultOptions.onCreate = vi.fn(async () => true);
  defaultOptions.onUpdate = vi.fn(async () => true);
});

describe('useModalForm', () => {
  it('starts closed with empty form data', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.formData).toEqual(emptyFormData);
    expect(result.current.isEditing).toBe(false);
  });

  it('openAdd opens modal with empty form data', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    act(() => {
      result.current.openAdd();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.formData).toEqual(emptyFormData);
    expect(result.current.isEditing).toBe(false);
  });

  it('openEdit opens modal with item data', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));
    const item: TestItem = { id: '42', name: 'Widget', value: 100 };

    act(() => {
      result.current.openEdit(item);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingItem).toBe(item);
    expect(result.current.formData).toEqual({ name: 'Widget', value: 100 });
    expect(result.current.isEditing).toBe(true);
  });

  it('close resets state', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    act(() => {
      result.current.openAdd();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.formData).toEqual(emptyFormData);
    expect(result.current.isEditing).toBe(false);
  });

  it('setField updates single field', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    act(() => {
      result.current.openAdd();
    });

    act(() => {
      result.current.setField('name', 'Updated');
    });

    expect(result.current.formData.name).toBe('Updated');
    expect(result.current.formData.value).toBe(0);
  });

  it('setFields updates multiple fields', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    act(() => {
      result.current.openAdd();
    });

    act(() => {
      result.current.setFields({ name: 'Multi', value: 42 });
    });

    expect(result.current.formData).toEqual({ name: 'Multi', value: 42 });
  });

  it('submit calls onCreate in add mode', async () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    act(() => {
      result.current.openAdd();
    });

    act(() => {
      result.current.setFields({ name: 'New Item', value: 10 });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(defaultOptions.onCreate).toHaveBeenCalledWith({ name: 'New Item', value: 10 });
    expect(defaultOptions.onUpdate).not.toHaveBeenCalled();
  });

  it('submit calls onUpdate in edit mode', async () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));
    const item: TestItem = { id: '42', name: 'Widget', value: 100 };

    act(() => {
      result.current.openEdit(item);
    });

    act(() => {
      result.current.setField('name', 'Updated Widget');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(defaultOptions.onUpdate).toHaveBeenCalledWith('42', { name: 'Updated Widget', value: 100 });
    expect(defaultOptions.onCreate).not.toHaveBeenCalled();
  });

  it('submit closes modal on success', async () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    act(() => {
      result.current.openAdd();
    });
    expect(result.current.isOpen).toBe(true);

    await act(async () => {
      const success = await result.current.submit();
      expect(success).toBe(true);
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.formData).toEqual(emptyFormData);
  });

  it('getTitle returns add/edit title based on mode', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    // In add mode (default)
    expect(result.current.getTitle('Add Item', 'Edit Item')).toBe('Add Item');

    // Switch to edit mode
    const item: TestItem = { id: '1', name: 'Test', value: 5 };
    act(() => {
      result.current.openEdit(item);
    });

    expect(result.current.getTitle('Add Item', 'Edit Item')).toBe('Edit Item');
  });

  it('getSubmitText returns add/edit text based on mode', () => {
    const { result } = renderHook(() => useModalForm(defaultOptions));

    // In add mode (default)
    expect(result.current.getSubmitText('Create', 'Save')).toBe('Create');

    // Switch to edit mode
    const item: TestItem = { id: '1', name: 'Test', value: 5 };
    act(() => {
      result.current.openEdit(item);
    });

    expect(result.current.getSubmitText('Create', 'Save')).toBe('Save');
  });
});
