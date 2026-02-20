import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowViewer } from './WorkflowViewer';
import { ShipwrightStepStatuses, ShipwrightJobStatuses } from '@core/gen/shipwright/api/shipwright_pb';

const mockDetails = {
  jobId: 'job-123',
  hostname: 'switch-01',
  jobStatus: ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING,
  shipwrightWorkflow: {
    shipwrightStepGroups: {
      1: {
        shipwrightSteps: [
          { name: 'Validate Config', maxAttempts: 1, shipwrightStepStatus: ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED },
          { name: 'Push Config', maxAttempts: 3, shipwrightStepStatus: ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RUNNING },
        ],
      },
      2: {
        shipwrightSteps: [
          { name: 'Verify Connectivity', maxAttempts: 1, shipwrightStepStatus: ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_INIT },
          { name: 'Run Tests', maxAttempts: 1, shipwrightStepStatus: ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_FAILED },
        ],
      },
    },
  },
} as any;

describe('WorkflowViewer', () => {
  it('shows loading message when loading', () => {
    render(<WorkflowViewer details={mockDetails} loading={true} />);
    expect(screen.getByText('Loading workflow details...')).toBeInTheDocument();
  });

  it('shows no workflow message when workflow is null', () => {
    render(<WorkflowViewer details={{ ...mockDetails, shipwrightWorkflow: undefined } as any} loading={false} />);
    expect(screen.getByText('No workflow data available.')).toBeInTheDocument();
  });

  it('renders job ID', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('job-123')).toBeInTheDocument();
  });

  it('renders progress summary labels', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('complete')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
    expect(screen.getByText('waiting')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('renders step group headers', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('Step Group 1')).toBeInTheDocument();
    expect(screen.getByText('Step Group 2')).toBeInTheDocument();
  });

  it('renders step names', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('Validate Config')).toBeInTheDocument();
    expect(screen.getByText('Push Config')).toBeInTheDocument();
    expect(screen.getByText('Verify Connectivity')).toBeInTheDocument();
    expect(screen.getByText('Run Tests')).toBeInTheDocument();
  });

  it('shows group progress counts', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('0/2')).toBeInTheDocument();
  });

  it('shows max attempts for retry steps', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('max: 3')).toBeInTheDocument();
  });

  it('calls onClose when Close clicked', () => {
    const onClose = vi.fn();
    render(<WorkflowViewer details={mockDetails} loading={false} onClose={onClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders progress bar', () => {
    const { container } = render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(container.querySelector('.progress-bar')).toBeInTheDocument();
  });
});
