import { render, screen, fireEvent } from '@testing-library/react';
import { InfoSection } from './InfoSection';

describe('InfoSection', () => {
  it('shows children when open', () => {
    render(<InfoSection open={true}>Info content here</InfoSection>);
    expect(screen.getByText('Info content here')).toBeInTheDocument();
  });

  it('hides children when closed', () => {
    render(<InfoSection open={false}>Hidden content</InfoSection>);
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('has info-section class when open', () => {
    const { container } = render(<InfoSection open={true}>Content</InfoSection>);
    expect(container.querySelector('.info-section')).toBeInTheDocument();
  });
});

describe('InfoSection.Toggle', () => {
  it('calls onToggle with opposite value when clicked', () => {
    const onToggle = vi.fn();
    render(<InfoSection.Toggle open={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('toggles from open to closed', () => {
    const onToggle = vi.fn();
    render(<InfoSection.Toggle open={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('has correct title when closed', () => {
    render(<InfoSection.Toggle open={false} onToggle={() => {}} />);
    expect(screen.getByTitle('Show info')).toBeInTheDocument();
  });

  it('has correct title when open', () => {
    render(<InfoSection.Toggle open={true} onToggle={() => {}} />);
    expect(screen.getByTitle('Hide info')).toBeInTheDocument();
  });
});
