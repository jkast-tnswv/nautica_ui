import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeGeneratorDialog } from './CodeGeneratorDialog';
import JsBarcode from 'jsbarcode';

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqr'),
  },
}));

vi.mock('jsbarcode', () => ({
  default: vi.fn(),
}));

describe('CodeGeneratorDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock canvas.toDataURL for barcode tests
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mockbarcode');
  });

  it('renders nothing when closed', () => {
    render(<CodeGeneratorDialog isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Code Generator')).not.toBeInTheDocument();
  });

  it('renders title and controls when open', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Code Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('renders QR and Barcode type buttons', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/QR Code/)).toBeInTheDocument();
    expect(screen.getByText(/Barcode/)).toBeInTheDocument();
  });

  it('renders input placeholder for QR mode', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByPlaceholderText('URL, serial number, text...')).toBeInTheDocument();
  });

  it('shows barcode format selector when barcode mode selected', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Barcode/));
    expect(screen.getByPlaceholderText('Value to encode...')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
  });

  it('disables generate button when input is empty', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Generate')).toBeDisabled();
  });

  it('enables generate button when input has text', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'hello' },
    });
    expect(screen.getByText('Generate')).not.toBeDisabled();
  });

  it('generates QR code and shows result', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByAltText('qr: https://example.com')).toBeInTheDocument();
    });
  });

  it('shows Download PNG button after generation', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'test' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
    });
  });

  it('shows history panel', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('No history yet')).toBeInTheDocument();
  });

  it('adds entry to history after generation', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'test-entry' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      // Text appears in both <code> (result) and history
      expect(screen.getAllByText('test-entry').length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.queryByText('No history yet')).not.toBeInTheDocument();
  });

  it('generates on Enter key', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('URL, serial number, text...');
    fireEvent.change(input, { target: { value: 'enter-test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByAltText('qr: enter-test')).toBeInTheDocument();
    });
  });

  it('clears history when clear button clicked', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'to-clear' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getAllByText('to-clear').length).toBeGreaterThanOrEqual(2);
    });

    fireEvent.click(screen.getByTitle('Clear history'));
    expect(screen.getByText('No history yet')).toBeInTheDocument();
  });

  it('deletes individual history entry', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'entry-to-delete' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getAllByText('entry-to-delete').length).toBeGreaterThanOrEqual(2);
    });

    fireEvent.click(screen.getByTitle('Remove'));
    expect(screen.getAllByText('entry-to-delete')).toHaveLength(1);
  });

  it('generates barcode and shows result', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Barcode/));
    fireEvent.change(screen.getByPlaceholderText('Value to encode...'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(JsBarcode).toHaveBeenCalled();
      expect(screen.getByAltText('barcode: 12345')).toBeInTheDocument();
    });
  });

  it('shows error when barcode generation fails', async () => {
    (JsBarcode as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('Invalid barcode');
    });

    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Barcode/));
    fireEvent.change(screen.getByPlaceholderText('Value to encode...'), {
      target: { value: 'bad-input' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid input for CODE128 format/)).toBeInTheDocument();
    });
  });

  it('changes barcode format via selector', () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Barcode/));
    const formatSelect = screen.getByLabelText('Format');
    fireEvent.change(formatSelect, { target: { value: 'EAN13' } });
    expect(formatSelect).toHaveValue('EAN13');
  });

  it('downloads PNG when download button clicked', async () => {
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = document.createElement.wrappedMethod
        ? document.createElement.wrappedMethod.call(document, tag)
        : Object.getPrototypeOf(document).createElement.call(document, tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: clickSpy });
      }
      return el;
    });

    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'download-test' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Download PNG/));
    expect(clickSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('re-generates when history entry clicked', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    // Generate first entry
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'history-item' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getAllByText('history-item').length).toBeGreaterThanOrEqual(2);
    });

    // Clear the input and image
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: '' },
    });

    // Click the history entry to re-generate
    const historyEntries = screen.getAllByText('history-item');
    // The history entry is the one NOT in the <code> tag
    fireEvent.click(historyEntries[historyEntries.length - 1]);

    await waitFor(() => {
      expect(screen.getByAltText('qr: history-item')).toBeInTheDocument();
    });
  });

  it('clears image and error when switching code type', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'switch-test' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByAltText('qr: switch-test')).toBeInTheDocument();
    });

    // Switch to barcode - should clear the image
    fireEvent.click(screen.getByText(/Barcode/));
    expect(screen.queryByAltText('qr: switch-test')).not.toBeInTheDocument();
  });

  it('persists history to localStorage', async () => {
    render(<CodeGeneratorDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('URL, serial number, text...'), {
      target: { value: 'persist-test' },
    });
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getAllByText('persist-test').length).toBeGreaterThanOrEqual(2);
    });

    const stored = localStorage.getItem('nautica_code_generator_history');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].text).toBe('persist-test');
  });
});
