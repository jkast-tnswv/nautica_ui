import { render, screen } from '@testing-library/react';
import { DialogActions } from './DialogActions';

describe('DialogActions', () => {
  it('renders children', () => {
    render(<DialogActions><button>OK</button></DialogActions>);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('applies dialog-actions class', () => {
    const { container } = render(<DialogActions>Content</DialogActions>);
    expect(container.firstChild).toHaveClass('dialog-actions');
  });

  it('does not add alignment class for default "right"', () => {
    const { container } = render(<DialogActions>Content</DialogActions>);
    expect(container.firstChild?.className).not.toContain('dialog-actions-right');
  });

  it('applies alignment class for center', () => {
    const { container } = render(<DialogActions align="center">Content</DialogActions>);
    expect(container.firstChild).toHaveClass('dialog-actions-center');
  });

  it('applies alignment class for space-between', () => {
    const { container } = render(<DialogActions align="space-between">Content</DialogActions>);
    expect(container.firstChild).toHaveClass('dialog-actions-space-between');
  });

  it('merges custom className', () => {
    const { container } = render(<DialogActions className="extra">Content</DialogActions>);
    expect(container.firstChild).toHaveClass('dialog-actions', 'extra');
  });
});
