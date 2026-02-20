import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    render(<Drawer isOpen={false} onClose={() => {}} title="Test">Body</Drawer>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(<Drawer isOpen={true} onClose={() => {}} title="My Drawer">Drawer content</Drawer>);
    expect(screen.getByText('My Drawer')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<Drawer isOpen={true} onClose={() => {}} title="Test">Body</Drawer>);
    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Drawer isOpen={true} onClose={onClose} title="Test">Body</Drawer>);
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<Drawer isOpen={true} onClose={onClose} title="Test">Body</Drawer>);
    fireEvent.click(container.querySelector('.drawer-overlay')!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Drawer isOpen={true} onClose={onClose} title="Test">Body</Drawer>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('applies wide class when wide prop set', () => {
    const { container } = render(<Drawer isOpen={true} onClose={() => {}} title="Wide" wide>Body</Drawer>);
    expect(container.querySelector('.drawer-wide')).toBeInTheDocument();
  });

  it('applies left side class', () => {
    const { container } = render(<Drawer isOpen={true} onClose={() => {}} title="Left" side="left">Body</Drawer>);
    expect(container.querySelector('.drawer-left')).toBeInTheDocument();
    expect(container.querySelector('.drawer-overlay-left')).toBeInTheDocument();
  });
});
