import { render, screen, fireEvent } from '@testing-library/react';
import { HelpDialog } from './HelpDialog';

describe('HelpDialog', () => {
  it('renders nothing when closed', () => {
    render(<HelpDialog isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Welcome to Nautica')).not.toBeInTheDocument();
  });

  it('renders first slide when open', () => {
    render(<HelpDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Welcome to Nautica')).toBeInTheDocument();
  });

  it('shows navigation dots', () => {
    const { container } = render(<HelpDialog isOpen={true} onClose={() => {}} />);
    const dots = container.querySelectorAll('.help-tour-dot');
    expect(dots.length).toBeGreaterThan(1);
  });

  it('navigates to next slide', () => {
    render(<HelpDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Welcome to Nautica')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('TideWatch — Dashboard')).toBeInTheDocument();
  });

  it('navigates to previous slide', () => {
    render(<HelpDialog isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('TideWatch — Dashboard')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('Welcome to Nautica')).toBeInTheDocument();
  });

  it('disables Previous on first slide', () => {
    render(<HelpDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Previous').closest('button')).toBeDisabled();
  });

  it('shows Done on last slide', () => {
    render(<HelpDialog isOpen={true} onClose={() => {}} />);
    const { container } = render(<HelpDialog isOpen={true} onClose={() => {}} />);
    // Navigate to last slide by clicking dots
    const dots = container.querySelectorAll('.help-tour-dot');
    fireEvent.click(dots[dots.length - 1]);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('calls onClose when Done clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<HelpDialog isOpen={true} onClose={onClose} />);
    const dots = container.querySelectorAll('.help-tour-dot');
    fireEvent.click(dots[dots.length - 1]);
    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onNavigate when navigating to slides with pages', () => {
    const onNavigate = vi.fn();
    render(<HelpDialog isOpen={true} onClose={() => {}} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Next')); // Goes to TideWatch slide which has page='tidewatch'
    expect(onNavigate).toHaveBeenCalledWith('tidewatch');
  });

  it('navigates to slide when dot clicked', () => {
    const { container } = render(<HelpDialog isOpen={true} onClose={() => {}} />);
    const dots = container.querySelectorAll('.help-tour-dot');
    fireEvent.click(dots[2]); // Third slide
    expect(screen.getByText('Anchor & Keel — Infrastructure')).toBeInTheDocument();
  });
});
