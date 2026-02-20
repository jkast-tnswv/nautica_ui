vi.mock('../slices/captainUsersSlice', async () => {
  const actual = await vi.importActual('../slices/captainUsersSlice');
  return { ...actual, createCaptainUser: vi.fn(() => ({ type: 'test/noop' })) };
});

import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithStore } from '../../../frontend/src/test/helpers';
import { CaptainUsers } from './CaptainUsers';

const mockUsers = [
  { userId: 'u-1', username: 'jsmith', firstName: 'John', lastName: 'Smith' },
  { userId: 'u-2', username: 'jdoe', firstName: 'Jane', lastName: 'Doe' },
];

describe('CaptainUsers', () => {
  it('renders table with user data', () => {
    renderWithStore(<CaptainUsers />, {
      captainUsers: { items: mockUsers, loading: false, error: null },
    });
    expect(screen.getByText('jsmith')).toBeInTheDocument();
    expect(screen.getByText('jdoe')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderWithStore(<CaptainUsers />, {
      captainUsers: { items: mockUsers, loading: false, error: null },
    });
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
  });

  it('shows error when error state', () => {
    renderWithStore(<CaptainUsers />, {
      captainUsers: { items: [], loading: false, error: 'Connection failed' },
    });
    expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
  });

  it('opens create dialog on New User click', () => {
    renderWithStore(<CaptainUsers />, {
      captainUsers: { items: [], loading: false, error: null },
    });
    fireEvent.click(screen.getByText('New User'));
    expect(screen.getByRole('heading', { name: 'Create User' })).toBeInTheDocument();
  });

  it('shows loading message when loading', () => {
    renderWithStore(<CaptainUsers />, {
      captainUsers: { items: [], loading: true, error: null },
    });
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });
});
