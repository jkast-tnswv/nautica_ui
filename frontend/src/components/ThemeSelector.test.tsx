import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector, ThemeSelectorToggle } from './ThemeSelector';

describe('ThemeSelector', () => {
  it('renders theme toggle button', () => {
    render(<ThemeSelector theme="dark" onThemeChange={() => {}} />);
    expect(screen.getByText('palette')).toBeInTheDocument();
  });

  it('opens drawer on toggle click', () => {
    render(<ThemeSelector theme="dark" onThemeChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('marks active theme', () => {
    render(<ThemeSelector theme="dark" onThemeChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    const darkOption = screen.getByText('Dark').closest('button');
    expect(darkOption).toHaveClass('active');
  });

  it('calls onThemeChange when theme clicked', () => {
    const onChange = vi.fn();
    render(<ThemeSelector theme="dark" onThemeChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Light'));
    expect(onChange).toHaveBeenCalledWith('light');
  });
});

describe('ThemeSelectorToggle', () => {
  it('renders icon button', () => {
    render(<ThemeSelectorToggle currentIcon="dark_mode" onClick={() => {}} />);
    expect(screen.getByText('dark_mode')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ThemeSelectorToggle currentIcon="dark_mode" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
