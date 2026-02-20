import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownSelect } from './DropdownSelect';

const options = [
  { id: 'home', label: 'Home', icon: 'home', description: 'Main page' },
  { id: 'settings', label: 'Settings', icon: 'settings', description: 'App settings' },
  { id: 'profile', label: 'Profile' },
];

describe('DropdownSelect', () => {
  it('renders trigger with selected option label', () => {
    render(<DropdownSelect options={options} value="home" onChange={() => {}} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders placeholder when no value matches', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} placeholder="Choose..." />);
    expect(screen.getByText('Choose...')).toBeInTheDocument();
  });

  it('opens dropdown on trigger click', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all options when open', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('shows option descriptions', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Main page')).toBeInTheDocument();
    expect(screen.getByText('App settings')).toBeInTheDocument();
  });

  it('calls onChange and closes when option clicked', () => {
    const onChange = vi.fn();
    render(<DropdownSelect options={options} value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Settings'));
    expect(onChange).toHaveBeenCalledWith('settings');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows checkmark on selected option', () => {
    render(<DropdownSelect options={options} value="home" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    const homeOption = screen.getByRole('option', { selected: true });
    expect(homeOption).toHaveClass('active');
  });

  it('closes on escape key', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on click outside', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders search input when searchable', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} searchable />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByPlaceholderText('Search pages...')).toBeInTheDocument();
  });

  it('filters options by search term', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} searchable />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText('Search pages...'), { target: { value: 'sett' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows no matches when search finds nothing', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} searchable />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText('Search pages...'), { target: { value: 'zzz' } });
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('selects first match on Enter in search', () => {
    const onChange = vi.fn();
    render(<DropdownSelect options={options} value="" onChange={onChange} searchable />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText('Search pages...'), { target: { value: 'prof' } });
    fireEvent.keyDown(screen.getByPlaceholderText('Search pages...'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('profile');
  });

  it('renders column layout when columnRows set', () => {
    render(<DropdownSelect options={options} value="" onChange={() => {}} columnRows={2} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('applies custom className', () => {
    const { container } = render(<DropdownSelect options={options} value="" onChange={() => {}} className="custom" />);
    expect(container.querySelector('.dropdown-select.custom')).toBeInTheDocument();
  });
});
