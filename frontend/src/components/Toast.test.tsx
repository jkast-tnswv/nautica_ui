import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ToastProvider, useToast, useToastActions } from './Toast';
import type { ReactNode } from 'react';

// Mock the addNotification import
vi.mock('@core', async () => {
  const actual = await vi.importActual('@core');
  return {
    ...actual,
    addNotification: vi.fn(),
  };
});

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>App content</div>
      </ToastProvider>,
    );
    expect(screen.getByText('App content')).toBeInTheDocument();
  });
});

describe('useToast', () => {
  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');
  });

  it('returns toast context when inside provider', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    expect(result.current.toasts).toEqual([]);
    expect(typeof result.current.addToast).toBe('function');
    expect(typeof result.current.removeToast).toBe('function');
    expect(typeof result.current.clearToasts).toBe('function');
  });

  it('addToast returns an id', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    const id = result.current.addToast({ type: 'success', message: 'Done!' });
    expect(id).toMatch(/^toast-/);
  });
});

describe('useToastActions', () => {
  it('provides convenience methods', () => {
    const { result } = renderHook(() => useToastActions(), { wrapper: Wrapper });
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.warning).toBe('function');
    expect(typeof result.current.info).toBe('function');
    expect(typeof result.current.remove).toBe('function');
    expect(typeof result.current.clear).toBe('function');
  });

  it('success returns a toast id', () => {
    const { result } = renderHook(() => useToastActions(), { wrapper: Wrapper });
    const id = result.current.success('It worked!');
    expect(id).toMatch(/^toast-/);
  });
});
