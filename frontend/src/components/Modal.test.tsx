import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders title and children in uncontrolled mode', () => {
    render(<Modal title="Test Modal" onClose={() => {}}>Body content</Modal>);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<Modal title="Test" onClose={() => {}}>Body</Modal>);
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Modal title="Test" onClose={onClose}>Body</Modal>);
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<Modal title="Test" onClose={onClose}>Body</Modal>);
    fireEvent.click(container.querySelector('.modal-overlay')!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when modal content clicked', () => {
    const onClose = vi.fn();
    render(<Modal title="Test" onClose={onClose}>Body</Modal>);
    fireEvent.click(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Modal title="Test" onClose={onClose}>Body</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders nothing when isOpen=false (controlled)', () => {
    render(<Modal title="Hidden" onClose={() => {}} isOpen={false}>Hidden body</Modal>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
  });

  it('renders when isOpen=true (controlled)', () => {
    render(<Modal title="Shown" onClose={() => {}} isOpen={true}>Visible body</Modal>);
    expect(screen.getByText('Shown')).toBeInTheDocument();
    expect(screen.getByText('Visible body')).toBeInTheDocument();
  });

  it('applies wide variant class', () => {
    const { container } = render(<Modal title="Wide" onClose={() => {}} variant="wide">Body</Modal>);
    expect(container.querySelector('.modal-wide')).toBeInTheDocument();
  });

  it('applies extra-wide variant class', () => {
    const { container } = render(<Modal title="XW" onClose={() => {}} variant="extra-wide">Body</Modal>);
    expect(container.querySelector('.modal-extra-wide')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Modal title="Test" onClose={() => {}} footer={<button>Save</button>}>Body</Modal>);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('wraps in form when onSubmit provided', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const { container } = render(
      <Modal title="Form" onClose={() => {}} onSubmit={onSubmit} footer={<button type="submit">Submit</button>}>
        Fields
      </Modal>,
    );
    expect(container.querySelector('form.modal-form')).toBeInTheDocument();
  });
});
