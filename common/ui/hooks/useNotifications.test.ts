import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../services/notifications', () => ({
  getNotifications: vi.fn(() => []),
  getUnreadCount: vi.fn(() => 0),
  onNotificationsChange: vi.fn(() => vi.fn()),
}));

import { getNotifications, getUnreadCount, onNotificationsChange } from '../services/notifications';
import { useNotificationHistory } from './useNotifications';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNotificationHistory', () => {
  it('returns empty notifications and 0 unread initially', () => {
    const { result } = renderHook(() => useNotificationHistory());
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('subscribes to changes on mount', () => {
    renderHook(() => useNotificationHistory());
    expect(onNotificationsChange).toHaveBeenCalledTimes(1);
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates notifications and recomputes unreadCount when listener fires', () => {
    let capturedListener: ((notifications: any[]) => void) | null = null;
    vi.mocked(onNotificationsChange).mockImplementation((listener) => {
      capturedListener = listener;
      return vi.fn();
    });

    const { result } = renderHook(() => useNotificationHistory());

    const mockNotifications = [
      { id: 1, level: 'info', message: 'Hello', timestamp: Date.now(), read: false },
      { id: 2, level: 'success', message: 'Done', timestamp: Date.now(), read: true },
      { id: 3, level: 'error', message: 'Fail', timestamp: Date.now(), read: false },
    ];

    act(() => {
      capturedListener!(mockNotifications);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(2);
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onNotificationsChange).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNotificationHistory());
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
