import { render, screen } from '@testing-library/react';
import { Icon, SpinnerIcon, loadingIcon } from './Icon';

describe('Icon', () => {
  it('renders icon name as text content', () => {
    render(<Icon name="settings" />);
    expect(screen.getByText('settings')).toBeInTheDocument();
  });

  it('applies material-icons-outlined class', () => {
    const { container } = render(<Icon name="home" />);
    expect(container.firstChild).toHaveClass('material-icons-outlined');
  });

  it('applies default size of 20px', () => {
    const { container } = render(<Icon name="home" />);
    expect(container.firstChild).toHaveStyle({ fontSize: 20 });
  });

  it('applies custom size', () => {
    const { container } = render(<Icon name="home" size={32} />);
    expect(container.firstChild).toHaveStyle({ fontSize: 32 });
  });

  it('merges custom className', () => {
    const { container } = render(<Icon name="home" className="extra" />);
    expect(container.firstChild).toHaveClass('material-icons-outlined', 'extra');
  });
});

describe('SpinnerIcon', () => {
  it('renders with icon-spin class', () => {
    const { container } = render(<SpinnerIcon />);
    expect(container.firstChild).toHaveClass('icon-spin');
  });
});

describe('loadingIcon', () => {
  it('returns spinner when loading', () => {
    const { container } = render(<>{loadingIcon(true, 'edit')}</>);
    expect(container.querySelector('.icon-spin')).toBeInTheDocument();
  });

  it('returns named icon when not loading', () => {
    render(<>{loadingIcon(false, 'edit')}</>);
    expect(screen.getByText('edit')).toBeInTheDocument();
  });
});
