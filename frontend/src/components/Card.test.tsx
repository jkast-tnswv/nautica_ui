import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title in header', () => {
    render(<Card title="My Card">Content</Card>);
    expect(screen.getByText('My Card')).toBeInTheDocument();
  });

  it('renders titleAction next to title', () => {
    render(<Card title="Title" titleAction={<span>action</span>}>Content</Card>);
    expect(screen.getByText('action')).toBeInTheDocument();
  });

  it('renders headerAction in header', () => {
    render(<Card title="Title" headerAction={<button>Settings</button>}>Content</Card>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render header when no title or actions', () => {
    const { container } = render(<Card>Just content</Card>);
    expect(container.querySelector('.card-header')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    expect(container.firstChild).toHaveClass('card', 'custom');
  });
});
