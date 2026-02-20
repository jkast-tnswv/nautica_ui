vi.mock('../slices/skipperSlice', async () => {
  const actual = await vi.importActual('../slices/skipperSlice');
  return { ...actual, buildSkipperPackage: vi.fn(() => ({ type: 'test/noop' })) };
});

import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithStore } from '../../../frontend/src/test/helpers';
import { SkipperBuilds } from './SkipperBuilds';

const mockBuilds = [
  { packageName: 'ocean-server', packageVersion: '1.2.3', owner: 'jsmith', status: 'done', timestamp: 1700000000000 },
  { packageName: 'harbor-agent', packageVersion: '0.9.0', owner: 'jdoe', status: 'building', timestamp: 1700001000000 },
];

describe('SkipperBuilds', () => {
  it('renders table with build data', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: mockBuilds, loading: false, error: null },
    });
    expect(screen.getByText('ocean-server')).toBeInTheDocument();
    expect(screen.getByText('harbor-agent')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: mockBuilds, loading: false, error: null },
    });
    expect(screen.getByText('Package')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('shows error when error state', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: 'Build server unavailable' },
    });
    expect(screen.getByText(/Build server unavailable/)).toBeInTheDocument();
  });

  it('opens New Build dialog', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });
    fireEvent.click(screen.getByText('New Build'));
    expect(screen.getByText('Build Package')).toBeInTheDocument();
  });

  it('renders dialog form fields', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });
    fireEvent.click(screen.getByText('New Build'));
    expect(screen.getByLabelText(/Package Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Version/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner/)).toBeInTheDocument();
  });
});
