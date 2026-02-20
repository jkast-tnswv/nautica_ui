import { render, screen, fireEvent } from '@testing-library/react';
import { Button, RefreshButton } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn', 'btn-primary');
    expect(btn).not.toHaveClass('btn-md'); // md is default, no extra class
  });

  it('applies variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('applies size class for non-default sizes', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-sm');
  });

  it('renders icon when icon prop provided', () => {
    render(<Button icon="add">New</Button>);
    expect(screen.getByText('add')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('shows spinner when isLoading', () => {
    const { container } = render(<Button isLoading>Save</Button>);
    expect(container.querySelector('.btn-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('is disabled when isLoading', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop set', () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('merges custom className', () => {
    render(<Button className="extra">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'extra');
  });
});

describe('RefreshButton', () => {
  it('renders as secondary button', () => {
    render(<RefreshButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<RefreshButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    render(<RefreshButton onClick={() => {}} loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
