import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CopyButton } from './CopyButton';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders copy icon initially', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByText('content_copy')).toBeInTheDocument();
  });

  it('has "Copy to clipboard" title', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument();
  });

  it('copies text to clipboard on click', async () => {
    vi.useRealTimers();
    render(<CopyButton text="my-text" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('my-text');
  });

  it('shows check icon and "Copied!" after copy', async () => {
    vi.useRealTimers();
    render(<CopyButton text="test" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByText('check')).toBeInTheDocument();
    expect(screen.getByTitle('Copied!')).toBeInTheDocument();
  });

  it('uses custom size', () => {
    render(<CopyButton text="test" size={20} />);
    expect(screen.getByText('content_copy')).toBeInTheDocument();
  });

  it('falls back to execCommand when clipboard API fails', async () => {
    vi.useRealTimers();
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('denied'));
    document.execCommand = vi.fn();
    const execCommand = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    render(<CopyButton text="fallback-text" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(execCommand).toHaveBeenCalledWith('copy');
    execCommand.mockRestore();
  });
});
