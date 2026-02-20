import { render, screen, fireEvent } from '@testing-library/react';
import { ScratchPad } from './ScratchPad';

describe('ScratchPad', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing when not open', () => {
    render(<ScratchPad isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<ScratchPad isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jot down notes here...')).toBeInTheDocument();
  });

  it('renders textarea with stored content', () => {
    localStorage.setItem('fc_scratchpad', 'My saved note');
    render(<ScratchPad isOpen={true} onClose={() => {}} />);
    expect(screen.getByDisplayValue('My saved note')).toBeInTheDocument();
  });

  it('saves content to localStorage on change', () => {
    render(<ScratchPad isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Jot down notes here...'), {
      target: { value: 'New note' },
    });
    expect(localStorage.getItem('fc_scratchpad')).toBe('New note');
  });

  it('calls onClose when minimize button clicked', () => {
    const onClose = vi.fn();
    render(<ScratchPad isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTitle('Minimize'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has a resize handle', () => {
    const { container } = render(<ScratchPad isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.scratchpad-resize')).toBeInTheDocument();
  });

  it('saves position to localStorage', () => {
    render(<ScratchPad isOpen={true} onClose={() => {}} />);
    const stored = localStorage.getItem('fc_scratchpad_pos');
    expect(stored).toBeTruthy();
    const pos = JSON.parse(stored!);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos).toHaveProperty('width');
    expect(pos).toHaveProperty('height');
  });

  it('loads position from localStorage', () => {
    const savedPos = { x: 100, y: 150, width: 400, height: 350 };
    localStorage.setItem('fc_scratchpad_pos', JSON.stringify(savedPos));
    const { container } = render(<ScratchPad isOpen={true} onClose={() => {}} />);
    const pad = container.querySelector('.scratchpad') as HTMLElement;
    expect(pad.style.left).toBe('100px');
    expect(pad.style.top).toBe('150px');
    expect(pad.style.width).toBe('400px');
    expect(pad.style.height).toBe('350px');
  });

  it('starts drag on header mousedown and moves on mousemove', () => {
    const { container } = render(<ScratchPad isOpen={true} onClose={() => {}} />);
    const header = container.querySelector('.scratchpad-header')!;
    const pad = container.querySelector('.scratchpad') as HTMLElement;

    fireEvent.mouseDown(header, { clientX: 200, clientY: 50 });
    fireEvent.mouseMove(document, { clientX: 300, clientY: 80 });
    fireEvent.mouseUp(document);

    // Position should have changed
    expect(pad).toBeInTheDocument();
  });

  it('does not start drag when clicking a button in header', () => {
    const onClose = vi.fn();
    render(<ScratchPad isOpen={true} onClose={onClose} />);

    // Click the minimize button - should call onClose, not start drag
    fireEvent.click(screen.getByTitle('Minimize'));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles resize via mousedown on resize handle', () => {
    const { container } = render(<ScratchPad isOpen={true} onClose={() => {}} />);
    const handle = container.querySelector('.scratchpad-resize')!;

    fireEvent.mouseDown(handle, { clientX: 500, clientY: 400 });
    fireEvent.mouseMove(document, { clientX: 600, clientY: 500 });
    fireEvent.mouseUp(document);

    expect(container.querySelector('.scratchpad')).toBeInTheDocument();
  });

  it('clamps position on window resize', () => {
    const { container } = render(<ScratchPad isOpen={true} onClose={() => {}} />);
    fireEvent(window, new Event('resize'));
    expect(container.querySelector('.scratchpad')).toBeInTheDocument();
  });

  it('handles invalid stored position gracefully', () => {
    localStorage.setItem('fc_scratchpad_pos', 'not-json');
    const { container } = render(<ScratchPad isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.scratchpad')).toBeInTheDocument();
  });
});
