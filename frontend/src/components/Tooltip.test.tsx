import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(<Tooltip content="Help text"><button>Hover me</button></Tooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip by default', () => {
    render(<Tooltip content="Tip"><span>Target</span></Tooltip>);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter', () => {
    vi.useFakeTimers();
    render(<Tooltip content="Helpful tip"><span>Hover</span></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('Hover').parentElement!);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Helpful tip')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('hides tooltip on mouse leave', () => {
    vi.useFakeTimers();
    render(<Tooltip content="Tip"><span>Target</span></Tooltip>);
    const trigger = screen.getByText('Target').parentElement!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('applies position class', () => {
    vi.useFakeTimers();
    render(<Tooltip content="Tip" position="bottom"><span>Target</span></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('Target').parentElement!);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole('tooltip')).toHaveClass('tooltip-bottom');
    vi.useRealTimers();
  });

  it('shows tooltip on focus', () => {
    vi.useFakeTimers();
    render(<Tooltip content="Focus tip"><span>Target</span></Tooltip>);
    fireEvent.focus(screen.getByText('Target').parentElement!);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('hides tooltip on blur', () => {
    vi.useFakeTimers();
    render(<Tooltip content="Tip"><span>Target</span></Tooltip>);
    const trigger = screen.getByText('Target').parentElement!;
    fireEvent.focus(trigger);
    act(() => { vi.runAllTimers(); });
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
