vi.mock('../slices/captainGroupsSlice', async () => {
  const actual = await vi.importActual('../slices/captainGroupsSlice');
  return { ...actual, createCaptainGroup: vi.fn(() => ({ type: 'test/noop' })) };
});

import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithStore } from '../../../frontend/src/test/helpers';
import { CaptainGroups } from './CaptainGroups';

const mockGroups = [
  { groupId: 'g-1', groupName: 'network-admins', captainUsers: ['u-1', 'u-2'], captainGroups: [] },
  { groupId: 'g-2', groupName: 'ops', captainUsers: [], captainGroups: ['g-1'] },
];

describe('CaptainGroups', () => {
  it('renders table with group data', () => {
    renderWithStore(<CaptainGroups />, {
      captainGroups: { items: mockGroups, loading: false, error: null },
    });
    expect(screen.getByText('network-admins')).toBeInTheDocument();
    expect(screen.getByText('ops')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderWithStore(<CaptainGroups />, {
      captainGroups: { items: mockGroups, loading: false, error: null },
    });
    expect(screen.getByText('Group ID')).toBeInTheDocument();
    expect(screen.getByText('Group Name')).toBeInTheDocument();
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Sub-groups')).toBeInTheDocument();
  });

  it('shows error when error state', () => {
    renderWithStore(<CaptainGroups />, {
      captainGroups: { items: [], loading: false, error: 'Permission denied' },
    });
    expect(screen.getByText(/Permission denied/)).toBeInTheDocument();
  });

  it('opens create dialog on New Group click', () => {
    renderWithStore(<CaptainGroups />, {
      captainGroups: { items: [], loading: false, error: null },
    });
    fireEvent.click(screen.getByText('New Group'));
    expect(screen.getByRole('heading', { name: 'Create Group' })).toBeInTheDocument();
  });
});
