vi.mock('@twcode/skipper-ui', () => ({
  SkipperBuilds: () => <div>SkipperBuilds</div>,
}));

import { render, screen } from '@testing-library/react';
import { DeployPage } from './DeployPage';

describe('DeployPage', () => {
  it('renders SkipperBuilds', () => {
    render(<DeployPage />);
    expect(screen.getByText('SkipperBuilds')).toBeInTheDocument();
  });
});
