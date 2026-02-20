import { render, screen, fireEvent } from '@testing-library/react';
import { Telemetry } from './Telemetry';

const mockEvents = [
  { id: '1', type: 'page_nav' as const, detail: 'Devices → Templates', timestamp: Date.now(), metadata: { from: 'devices', to: 'templates' } },
  { id: '2', type: 'theme_change' as const, detail: 'dark → light', timestamp: Date.now() - 5000, metadata: {} },
];

vi.mock('@core', async () => {
  const actual = await vi.importActual('@core');
  return {
    ...actual,
    useTelemetry: () => mockEvents,
    clearTelemetryEvents: vi.fn(),
  };
});

describe('Telemetry', () => {
  it('renders nothing when closed', () => {
    render(<Telemetry isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Telemetry')).not.toBeInTheDocument();
  });

  it('renders telemetry list when open', () => {
    render(<Telemetry isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Telemetry')).toBeInTheDocument();
    expect(screen.getByText('Devices → Templates')).toBeInTheDocument();
    expect(screen.getByText('dark → light')).toBeInTheDocument();
  });

  it('shows event count', () => {
    render(<Telemetry isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  it('expands event detail on click', () => {
    render(<Telemetry isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Devices → Templates'));
    expect(screen.getByText('Detail')).toBeInTheDocument();
  });

  it('shows event type badges', () => {
    render(<Telemetry isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Page Nav')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('renders clear button', () => {
    render(<Telemetry isOpen={true} onClose={() => {}} />);
    expect(screen.getByTitle('Clear telemetry')).toBeInTheDocument();
  });
});
