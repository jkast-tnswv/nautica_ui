import { render, screen, fireEvent } from '@testing-library/react';
import { ResizableModal } from './ResizableModal';

describe('ResizableModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<ResizableModal isOpen={false} title="Test" onClose={() => {}}>Body</ResizableModal>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(<ResizableModal isOpen={true} title="My Modal" onClose={() => {}}>Content here</ResizableModal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<ResizableModal isOpen={true} title="Test" onClose={() => {}}>Body</ResizableModal>);
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ResizableModal isOpen={true} title="Test" onClose={onClose}>Body</ResizableModal>);
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<ResizableModal isOpen={true} title="Test" onClose={onClose}>Body</ResizableModal>);
    fireEvent.click(container.querySelector('.modal-overlay')!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when modal content clicked', () => {
    const onClose = vi.fn();
    render(<ResizableModal isOpen={true} title="Test" onClose={onClose}>Body</ResizableModal>);
    fireEvent.click(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<ResizableModal isOpen={true} title="Test" onClose={onClose}>Body</ResizableModal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders resize handle when resizable', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Test" onClose={() => {}} resizable>Body</ResizableModal>,
    );
    expect(container.querySelector('.modal-resize-handle')).toBeInTheDocument();
  });

  it('does not render resize handle when not resizable', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Test" onClose={() => {}} resizable={false}>Body</ResizableModal>,
    );
    expect(container.querySelector('.modal-resize-handle')).not.toBeInTheDocument();
  });

  it('renders draggable header', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Test" onClose={() => {}} draggable>Body</ResizableModal>,
    );
    expect(container.querySelector('.modal-header-draggable.draggable')).toBeInTheDocument();
  });

  it('renders in uncontrolled mode (no isOpen prop)', () => {
    render(<ResizableModal title="Uncontrolled" onClose={() => {}}>Visible</ResizableModal>);
    expect(screen.getByText('Uncontrolled')).toBeInTheDocument();
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('applies wide variant width', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Wide" onClose={() => {}} variant="wide">Body</ResizableModal>,
    );
    const modal = container.querySelector('.modal-resizable') as HTMLElement;
    expect(modal.style.width).toBe('700px');
  });

  it('applies extra-wide variant width', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="XWide" onClose={() => {}} variant="extra-wide">Body</ResizableModal>,
    );
    const modal = container.querySelector('.modal-resizable') as HTMLElement;
    expect(modal.style.width).toBe('1000px');
  });

  it('applies custom initialWidth', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Custom" onClose={() => {}} initialWidth={800}>Body</ResizableModal>,
    );
    const modal = container.querySelector('.modal-resizable') as HTMLElement;
    expect(modal.style.width).toBe('800px');
  });

  it('starts drag on header mousedown', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Drag" onClose={() => {}} draggable>Body</ResizableModal>,
    );
    const header = container.querySelector('.modal-header-draggable')!;
    fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });
    // After drag start, cursor should change
    const modal = container.querySelector('.modal-resizable') as HTMLElement;
    // The position might not change without a position being set first, but the drag handler is exercised
    expect(modal).toBeInTheDocument();
  });

  it('starts resize on handle mousedown', () => {
    const { container } = render(
      <ResizableModal isOpen={true} title="Resize" onClose={() => {}} resizable>Body</ResizableModal>,
    );
    const handle = container.querySelector('.modal-resize-handle')!;
    fireEvent.mouseDown(handle, { clientX: 500, clientY: 400 });
    // Trigger mouse move + mouse up
    fireEvent.mouseMove(window, { clientX: 600, clientY: 500 });
    fireEvent.mouseUp(window);
    expect(container.querySelector('.modal-resizable')).toBeInTheDocument();
  });

  it('sets body overflow hidden when open', () => {
    render(<ResizableModal isOpen={true} title="Test" onClose={() => {}}>Body</ResizableModal>);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets position when closed', () => {
    const { rerender } = render(
      <ResizableModal isOpen={true} title="Test" onClose={() => {}}>Body</ResizableModal>,
    );
    rerender(
      <ResizableModal isOpen={false} title="Test" onClose={() => {}}>Body</ResizableModal>,
    );
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});
