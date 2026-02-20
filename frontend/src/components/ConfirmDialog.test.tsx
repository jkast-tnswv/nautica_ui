import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConfirmDialog, useConfirm } from './ConfirmDialog';

function UseConfirmHarness() {
  const { confirm, ConfirmDialogRenderer } = useConfirm();

  return (
    <div>
      <button onClick={() => confirm({ title: 'Delete?', message: 'Gone forever.' })}>
        Trigger
      </button>
      <button onClick={() => confirm({ title: 'Custom', message: 'Hmm', confirmText: 'Yes', cancelText: 'No', destructive: true })}>
        TriggerCustom
      </button>
      <ConfirmDialogRenderer />
    </div>
  );
}

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog isOpen={false} title="Confirm" message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog isOpen={true} title="Delete?" message="This cannot be undone." onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('renders default OK and Cancel buttons', () => {
    render(
      <ConfirmDialog isOpen={true} title="Confirm" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(
      <ConfirmDialog isOpen={true} title="Confirm" message="Sure?" confirmText="Delete" cancelText="Keep" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog isOpen={true} title="Confirm" message="Sure?" onConfirm={onConfirm} onCancel={() => {}} />,
    );
    fireEvent.click(screen.getByText('OK'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog isOpen={true} title="Confirm" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('uses danger variant for confirm button when destructive', () => {
    render(
      <ConfirmDialog isOpen={true} title="Delete" message="Sure?" destructive onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText('OK')).toHaveClass('btn-danger');
  });

  it('uses primary variant for confirm button by default', () => {
    render(
      <ConfirmDialog isOpen={true} title="Confirm" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText('OK')).toHaveClass('btn-primary');
  });
});

describe('useConfirm', () => {
  it('renders nothing initially', () => {
    render(<UseConfirmHarness />);
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });

  it('shows dialog when confirm is called', () => {
    render(<UseConfirmHarness />);
    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('Gone forever.')).toBeInTheDocument();
  });

  it('resolves true when confirmed', async () => {
    render(<UseConfirmHarness />);
    fireEvent.click(screen.getByText('Trigger'));
    fireEvent.click(screen.getByText('OK'));
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });

  it('resolves false when cancelled', () => {
    render(<UseConfirmHarness />);
    fireEvent.click(screen.getByText('Trigger'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });

  it('supports custom options', () => {
    render(<UseConfirmHarness />);
    fireEvent.click(screen.getByText('TriggerCustom'));
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toHaveClass('btn-danger');
  });
});
