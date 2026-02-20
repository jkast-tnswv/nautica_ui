import { render, screen } from '@testing-library/react';
import { ActionBar } from './ActionBar';

describe('ActionBar', () => {
  it('renders children', () => {
    render(<ActionBar><button>Add</button></ActionBar>);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('applies actions-bar class', () => {
    const { container } = render(<ActionBar>Content</ActionBar>);
    expect(container.firstChild).toHaveClass('actions-bar');
  });

  it('merges custom className', () => {
    const { container } = render(<ActionBar className="extra">Content</ActionBar>);
    expect(container.firstChild).toHaveClass('actions-bar', 'extra');
  });
});
