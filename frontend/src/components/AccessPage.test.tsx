vi.mock('@twcode/captain-ui', () => ({
  CaptainUsers: () => <div>CaptainUsers</div>,
  CaptainGroups: () => <div>CaptainGroups</div>,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { AccessPage } from './AccessPage';

describe('AccessPage', () => {
  it('renders tab labels', () => {
    render(<AccessPage />);
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('renders CaptainUsers tab by default', () => {
    render(<AccessPage />);
    expect(screen.getByText('CaptainUsers')).toBeInTheDocument();
  });

  it('switches to Groups tab', () => {
    render(<AccessPage />);
    fireEvent.click(screen.getByText('Groups'));
    expect(screen.getByText('CaptainGroups')).toBeInTheDocument();
  });
});
