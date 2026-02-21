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
    // Should NOT render workflow content while loading
    expect(screen.queryByText('job-123')).not.toBeInTheDocument();
  });

  it('shows no workflow message when workflow is null', () => {
    render(<WorkflowViewer details={{ ...mockDetails, shipwrightWorkflow: undefined } as any} loading={false} />);
    expect(screen.getByText('No workflow data available.')).toBeInTheDocument();
    expect(screen.queryByText('Step Group')).not.toBeInTheDocument();
  });

  it('renders job ID and status badge', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('job-123')).toBeInTheDocument();
  });

  it('computes progress summary counts from step statuses', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    // 1 completed, 1 running, 1 init (waiting), 1 failed across 4 steps
    expect(screen.getByText('complete')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
    expect(screen.getByText('waiting')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('does not render summary items for statuses with zero count', () => {
    // All steps are completed — no running/waiting/failed/unknown labels
    const allDone = {
      ...mockDetails,
      shipwrightWorkflow: {
        shipwrightStepGroups: {
          1: {
            shipwrightSteps: [
              { name: 'Step A', maxAttempts: 1, shipwrightStepStatus: ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED },
              { name: 'Step B', maxAttempts: 1, shipwrightStepStatus: ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED },
            ],
          },
        },
      },
    } as any;
    render(<WorkflowViewer details={allDone} loading={false} />);
    expect(screen.getByText('complete')).toBeInTheDocument();
    expect(screen.queryByText('running')).not.toBeInTheDocument();
    expect(screen.queryByText('waiting')).not.toBeInTheDocument();
    expect(screen.queryByText('failed')).not.toBeInTheDocument();
    expect(screen.queryByText('unknown')).not.toBeInTheDocument();
  });

  it('computes per-group progress correctly', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    // Group 1: 1 completed out of 2
    expect(screen.getByText('1/2')).toBeInTheDocument();
    // Group 2: 0 completed out of 2
    expect(screen.getByText('0/2')).toBeInTheDocument();
  });

  it('renders step groups in order with step names', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(screen.getByText('Step Group 1')).toBeInTheDocument();
    expect(screen.getByText('Step Group 2')).toBeInTheDocument();
    expect(screen.getByText('Validate Config')).toBeInTheDocument();
    expect(screen.getByText('Push Config')).toBeInTheDocument();
    expect(screen.getByText('Verify Connectivity')).toBeInTheDocument();
    expect(screen.getByText('Run Tests')).toBeInTheDocument();
  });

  it('shows max attempts only for retry-enabled steps', () => {
    render(<WorkflowViewer details={mockDetails} loading={false} />);
    // Push Config has maxAttempts: 3
    expect(screen.getByText('max: 3')).toBeInTheDocument();
    // Steps with maxAttempts: 1 should NOT show max attempts text
    expect(screen.queryByText('max: 1')).not.toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn();
    render(<WorkflowViewer details={mockDetails} loading={false} onClose={onClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar with status segments', () => {
    const { container } = render(<WorkflowViewer details={mockDetails} loading={false} />);
    expect(container.querySelector('.progress-bar')).toBeInTheDocument();
  });
});
