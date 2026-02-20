import { render, screen, fireEvent } from '@testing-library/react';
import { JsonViewer, JsonRow, JsonList } from './JsonViewer';

// Mock clipboard
Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

describe('JsonViewer', () => {
  it('renders JSON data as formatted string', () => {
    render(<JsonViewer data={{ name: 'test', value: 42 }} />);
    expect(screen.getByText(/\"name\": \"test\"/)).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<JsonViewer data={{}} label="Response" />);
    expect(screen.getByText('Response')).toBeInTheDocument();
  });

  it('shows Copy button', () => {
    render(<JsonViewer data={{}} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('copies JSON to clipboard', () => {
    render(<JsonViewer data={{ a: 1 }} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify({ a: 1 }, null, 2));
  });

  it('renders textarea in editable mode', () => {
    render(<JsonViewer data={{ a: 1 }} editable />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onChange with parsed JSON when edited', () => {
    const onChange = vi.fn();
    render(<JsonViewer data={{ a: 1 }} editable onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{"a": 2}' } });
    expect(onChange).toHaveBeenCalledWith({ a: 2 });
  });

  it('shows parse error for invalid JSON', () => {
    render(<JsonViewer data={{}} editable />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'not json' } });
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
  });

  it('formats JSON when Format button clicked', () => {
    const onChange = vi.fn();
    render(<JsonViewer data={{}} editable onChange={onChange} />);
    // Type unformatted JSON
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{"a":1,"b":2}' } });
    fireEvent.click(screen.getByText('Format'));
    expect(onChange).toHaveBeenCalledWith({ a: 1, b: 2 });
  });
});

describe('JsonRow', () => {
  it('renders summary fields', () => {
    render(<JsonRow item={{ name: 'test', id: 'abc' }} summaryFields={['name', 'id']} />);
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('abc')).toBeInTheDocument();
  });

  it('expands to show full JSON on click', () => {
    render(<JsonRow item={{ name: 'test' }} summaryFields={['name']} />);
    fireEvent.click(screen.getByText('test'));
    expect(screen.getByText(/\"name\": \"test\"/)).toBeInTheDocument();
  });

  it('collapses when clicked again', () => {
    render(<JsonRow item={{ name: 'test' }} summaryFields={['name']} />);
    fireEvent.click(screen.getByText('test'));
    expect(screen.getByText(/\"name\": \"test\"/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('test'));
    expect(screen.queryByText(/\"name\": \"test\"/)).not.toBeInTheDocument();
  });
});

describe('JsonList', () => {
  it('renders multiple rows', () => {
    const items = [
      { id: '1', name: 'First' },
      { id: '2', name: 'Second' },
    ];
    render(<JsonList items={items} summaryFields={['name']} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
