import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from './SelectField';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Charlie' },
];

describe('SelectField', () => {
  it('renders with placeholder when no value', () => {
    render(<SelectField name="test" options={options} placeholder="Pick one" />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders selected option label', () => {
    render(<SelectField name="test" options={options} value="b" />);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<SelectField name="test" options={options} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all options when open', () => {
    render(<SelectField name="test" options={options} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('calls onChange when option selected', () => {
    const onChange = vi.fn();
    render(<SelectField name="color" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Charlie'));
    expect(onChange).toHaveBeenCalledWith({ target: { name: 'color', value: 'c' } });
  });

  it('closes dropdown after selection', () => {
    render(<SelectField name="test" options={options} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Alpha'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<SelectField name="test" options={options} label="Choose" />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('renders error message when label present', () => {
    render(<SelectField name="test" options={options} label="Pick" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('disables trigger when disabled', () => {
    render(<SelectField name="test" options={options} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not open when disabled', () => {
    render(<SelectField name="test" options={options} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('applies sm size class', () => {
    const { container } = render(<SelectField name="test" options={options} size="sm" />);
    expect(container.querySelector('.select-field-sm')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<SelectField name="test" options={options} icon="filter_list" />);
    expect(screen.getByText('filter_list')).toBeInTheDocument();
  });

  it('closes on escape key', () => {
    render(<SelectField name="test" options={options} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
