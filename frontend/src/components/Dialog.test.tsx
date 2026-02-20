import { render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    render(<Dialog isOpen={false} onClose={() => {}} title="Test">Body</Dialog>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('renders as a Modal when open', () => {
    render(<Dialog isOpen={true} onClose={() => {}} title="My Dialog">Content here</Dialog>);
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});
