vi.mock('@twcode/tidewatch-ui', () => ({
  TideWatch: () => <div>TideWatch</div>,
}));

import { render, screen } from '@testing-library/react';
import { TideWatchPage } from './TideWatchPage';

describe('TideWatchPage', () => {
  it('renders TideWatch', () => {
    render(<TideWatchPage />);
    expect(screen.getByText('TideWatch')).toBeInTheDocument();
  });
});
