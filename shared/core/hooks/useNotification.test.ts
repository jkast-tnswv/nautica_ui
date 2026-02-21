import { renderHook } from '@testing-library/react';
import {
  useNotification,
  createWebNotificationHandler,
  type UseNotificationOptions,
  type NotificationMessage,
} from './useNotification';

function createMockHandler(): UseNotificationOptions & {
  messages: NotificationMessage[];
  lastConfirm: { title: string; message: string } | null;
} {
  const state = {
    messages: [] as NotificationMessage[],
    lastConfirm: null as { title: string; message: string } | null,
    showMessage: (message: NotificationMessage) => {
      state.messages.push(message);
    },
    confirm: vi.fn().mockResolvedValue(true),
  };
  return state;
}

describe('useNotification', () => {
  it('success calls showMessage with type success', () => {
    const handler = createMockHandler();
    const { result } = renderHook(() => useNotification(handler));
    result.current.success('Saved');
    expect(handler.messages).toHaveLength(1);
    expect(handler.messages[0]).toEqual({ type: 'success', title: 'Success', text: 'Saved' });
  });

  it('error calls showMessage with type error', () => {
    const handler = createMockHandler();
    const { result } = renderHook(() => useNotification(handler));
    result.current.error('Something failed');
    expect(handler.messages).toHaveLength(1);
    expect(handler.messages[0]).toEqual({
      type: 'error',
      title: 'Error',
      text: 'Something failed',
    });
  });

  it('warning calls showMessage with type warning', () => {
    const handler = createMockHandler();
    const { result } = renderHook(() => useNotification(handler));
    result.current.warning('Careful');
    expect(handler.messages).toHaveLength(1);
    expect(handler.messages[0]).toEqual({ type: 'warning', title: 'Warning', text: 'Careful' });
  });

  it('info calls showMessage with type info', () => {
    const handler = createMockHandler();
    const { result } = renderHook(() => useNotification(handler));
    result.current.info('FYI');
    expect(handler.messages).toHaveLength(1);
    expect(handler.messages[0]).toEqual({ type: 'info', title: 'Info', text: 'FYI' });
  });

  it('confirmDelete calls confirm with delete text', async () => {
    const handler = createMockHandler();
    const { result } = renderHook(() => useNotification(handler));
    await result.current.confirmDelete('My Device', 'device');
    expect(handler.confirm).toHaveBeenCalledWith({
      title: 'Delete device',
      message: 'Are you sure you want to delete "My Device"?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });
  });

  it('confirmReset calls confirm with reset text', async () => {
    const handler = createMockHandler();
    const { result } = renderHook(() => useNotification(handler));
    await result.current.confirmReset('All data will be lost');
    expect(handler.confirm).toHaveBeenCalledWith({
      title: 'Confirm Reset',
      message: 'All data will be lost',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      destructive: true,
    });
  });
});

describe('createWebNotificationHandler', () => {
  it('returns working handler', () => {
    const handler = createWebNotificationHandler();
    expect(handler.showMessage).toBeInstanceOf(Function);
    expect(handler.confirm).toBeInstanceOf(Function);

    // showMessage falls back to window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    handler.showMessage({ type: 'info', title: 'Test', text: 'Hello' });
    expect(alertSpy).toHaveBeenCalledWith('Test: Hello');
    alertSpy.mockRestore();

    // confirm falls back to window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const promise = handler.confirm({
      title: 'Sure?',
      message: 'Do it?',
    });
    expect(confirmSpy).toHaveBeenCalledWith('Sure?\n\nDo it?');
    confirmSpy.mockRestore();
    return expect(promise).resolves.toBe(true);
  });
});
