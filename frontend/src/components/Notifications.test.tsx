import { render, screen, fireEvent, act } from '@testing-library/react';
import { Notifications, NotificationPopup } from './Notifications';

const mockNotifications = [
  { id: '1', level: 'success' as const, message: 'Deployed successfully', timestamp: Date.now() - 30000, read: false },
  { id: '2', level: 'error' as const, message: 'Connection failed', timestamp: Date.now() - 120000, read: true },
  { id: '3', level: 'warning' as const, message: 'Disk almost full', timestamp: Date.now() - 7200000, read: false },
  { id: '4', level: 'info' as const, message: 'Old notice', timestamp: Date.now() - 100000000, read: true },
];

const mockMarkAllRead = vi.fn();
const mockClearNotifications = vi.fn();
let notificationChangeCallback: ((notifications: typeof mockNotifications) => void) | null = null;

vi.mock('@core', async () => {
  const actual = await vi.importActual('@core');
  return {
    ...actual,
    useNotificationHistory: () => ({
      notifications: mockNotifications,
      unreadCount: 2,
    }),
    markAllRead: (...args: unknown[]) => mockMarkAllRead(...args),
    clearNotifications: (...args: unknown[]) => mockClearNotifications(...args),
    onNotificationsChange: (cb: (notifications: typeof mockNotifications) => void) => {
      notificationChangeCallback = cb;
      return () => { notificationChangeCallback = null; };
    },
  };
});

describe('Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<Notifications isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('renders notification list when open', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Deployed successfully')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    expect(screen.getByText('Disk almost full')).toBeInTheDocument();
  });

  it('shows notification count', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('4 notifications')).toBeInTheDocument();
  });

  it('shows time labels', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('just now')).toBeInTheDocument();
    expect(screen.getByText('2m ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('marks all as read when opened', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('renders clear all button', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(screen.getByTitle('Clear all')).toBeInTheDocument();
  });

  it('calls clearNotifications when clear clicked', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(mockClearNotifications).toHaveBeenCalled();
  });

  it('applies unread class to unread notifications', () => {
    const { container } = render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(container.querySelectorAll('.notification-unread')).toHaveLength(2);
  });

  it('renders level icons', () => {
    render(<Notifications isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('check_circle')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('makes error notifications clickable with onViewApiError', () => {
    const onViewApiError = vi.fn();
    const { container } = render(
      <Notifications isOpen={true} onClose={() => {}} onViewApiError={onViewApiError} />,
    );
    const clickableItems = container.querySelectorAll('.notification-item.clickable');
    expect(clickableItems.length).toBeGreaterThan(0);
  });

  it('calls onViewApiError when error notification clicked', () => {
    const onViewApiError = vi.fn();
    render(
      <Notifications isOpen={true} onClose={() => {}} onViewApiError={onViewApiError} />,
    );
    fireEvent.click(screen.getByText('Connection failed'));
    expect(onViewApiError).toHaveBeenCalledWith(mockNotifications[1].timestamp);
  });
});

describe('NotificationPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationChangeCallback = null;
  });

  it('renders nothing initially', () => {
    const { container } = render(<NotificationPopup />);
    expect(container.querySelector('.notification-popup')).not.toBeInTheDocument();
  });

  it('shows popup when new notification arrives', () => {
    render(<NotificationPopup />);
    act(() => {
      notificationChangeCallback?.([
        { id: '99', level: 'success' as const, message: 'New popup message', timestamp: Date.now(), read: false },
      ]);
    });
    expect(screen.getByText('New popup message')).toBeInTheDocument();
  });

  it('shows error popup with icon when onViewApiError provided', () => {
    render(<NotificationPopup onViewApiError={() => {}} />);
    act(() => {
      notificationChangeCallback?.([
        { id: '99', level: 'error' as const, message: 'Error occurred', timestamp: Date.now(), read: false },
      ]);
    });
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('open_in_new')).toBeInTheDocument();
  });

  it('calls onViewApiError when error popup clicked', () => {
    const onViewApiError = vi.fn();
    render(<NotificationPopup onViewApiError={onViewApiError} />);
    act(() => {
      notificationChangeCallback?.([
        { id: '99', level: 'error' as const, message: 'Click me', timestamp: Date.now(), read: false },
      ]);
    });
    fireEvent.click(screen.getByText('Click me'));
    expect(onViewApiError).toHaveBeenCalled();
  });
});
