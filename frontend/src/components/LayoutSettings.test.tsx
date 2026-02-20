import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutSettings } from './LayoutSettings';

const mockSetPageWidth = vi.fn();
const mockSetDialogWidth = vi.fn();
const mockResetToDefaults = vi.fn();

vi.mock('../context', async () => {
  const actual = await vi.importActual('../context');
  return {
    ...actual,
    useLayout: () => ({
      pageWidth: 'default',
      dialogWidth: 'default',
      setPageWidth: mockSetPageWidth,
      setDialogWidth: mockSetDialogWidth,
      resetToDefaults: mockResetToDefaults,
      pushPageWidthOverride: vi.fn(),
    }),
  };
});

describe('LayoutSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page width options', () => {
    render(<LayoutSettings />);
    expect(screen.getByText('Narrow')).toBeInTheDocument();
    expect(screen.getAllByText('Default').length).toBeGreaterThanOrEqual(2); // page + dialog
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it('renders dialog width options', () => {
    render(<LayoutSettings />);
    expect(screen.getByText('Compact')).toBeInTheDocument();
    expect(screen.getByText('Extra Wide')).toBeInTheDocument();
  });

  it('renders labels', () => {
    render(<LayoutSettings />);
    expect(screen.getByText('Page Width')).toBeInTheDocument();
    expect(screen.getByText('Dialog Width')).toBeInTheDocument();
  });

  it('calls setPageWidth when page width option clicked', () => {
    render(<LayoutSettings />);
    fireEvent.click(screen.getByText('Full'));
    expect(mockSetPageWidth).toHaveBeenCalledWith('full');
  });

  it('calls setDialogWidth when dialog width option clicked', () => {
    render(<LayoutSettings />);
    fireEvent.click(screen.getByText('Compact'));
    expect(mockSetDialogWidth).toHaveBeenCalledWith('compact');
  });

  it('calls resetToDefaults when reset button clicked', () => {
    render(<LayoutSettings />);
    fireEvent.click(screen.getByText('Reset to Defaults'));
    expect(mockResetToDefaults).toHaveBeenCalledOnce();
  });

  it('marks current page width as selected', () => {
    const { container } = render(<LayoutSettings />);
    const selected = container.querySelectorAll('.layout-option.selected');
    expect(selected.length).toBe(2); // one page width + one dialog width
  });
});
