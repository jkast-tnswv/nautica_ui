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

  it('shows error message when error state is set', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: 'Build server unavailable' },
    });
    expect(screen.getByText(/Build server unavailable/)).toBeInTheDocument();
  });

  it('shows empty message when no builds and not loading', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });
    expect(screen.getByText(/No builds yet/)).toBeInTheDocument();
  });

  it('shows loading message when loading with no builds', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: true, error: null },
    });
    expect(screen.getByText('Building...')).toBeInTheDocument();
  });

  it('opens New Build dialog and renders form fields', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });
    fireEvent.click(screen.getByText('New Build'));
    expect(screen.getByText('Build Package')).toBeInTheDocument();
    expect(screen.getByLabelText(/Package Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Version/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner/)).toBeInTheDocument();
  });

  it('disables Build button until required fields are filled', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });
    fireEvent.click(screen.getByText('New Build'));

    // Build button should be disabled initially (packageName and owner are empty)
    const buildButton = screen.getByRole('button', { name: 'Build' });
    expect(buildButton).toBeDisabled();

    // Fill package name only — still disabled (owner is empty)
    fireEvent.change(screen.getByLabelText(/Package Name/), { target: { value: 'my-pkg', name: 'packageName' } });
    expect(buildButton).toBeDisabled();

    // Fill owner — now enabled
    fireEvent.change(screen.getByLabelText(/Owner/), { target: { value: 'jsmith', name: 'owner' } });
    expect(buildButton).not.toBeDisabled();
  });

  it('toggles info section when info button is clicked', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });

    expect(screen.queryByText(/package builds and deployments/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Show info'));
    expect(screen.getByText(/package builds and deployments/)).toBeInTheDocument();
  });

  it('resets form fields when reopening dialog', () => {
    renderWithStore(<SkipperBuilds />, {
      skipper: { builds: [], loading: false, error: null },
    });

    // Open dialog and fill fields
    fireEvent.click(screen.getByText('New Build'));
    fireEvent.change(screen.getByLabelText(/Package Name/), { target: { value: 'my-pkg', name: 'packageName' } });
    expect(screen.getByLabelText(/Package Name/)).toHaveValue('my-pkg');

    // Close and reopen
    fireEvent.click(screen.getByLabelText('Close modal'));
    fireEvent.click(screen.getByText('New Build'));

    // Fields should be reset
    expect(screen.getByLabelText(/Package Name/)).toHaveValue('');
  });
});
