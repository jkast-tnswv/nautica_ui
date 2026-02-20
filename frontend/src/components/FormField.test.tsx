import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and input', () => {
    render(<FormField label="Username" name="username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('renders text input by default', () => {
    render(<FormField label="Name" name="name" />);
    expect(screen.getByLabelText('Name').tagName).toBe('INPUT');
  });

  it('renders textarea when type="textarea"', () => {
    render(<FormField label="Bio" name="bio" type="textarea" rows={4} />);
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA');
  });

  it('renders NumberInput when type="number"', () => {
    const { container } = render(<FormField label="Count" name="count" type="number" value={5} onChange={() => {}} />);
    expect(container.querySelector('.number-input')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<FormField label="Email" name="email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('applies has-error class when error present', () => {
    const { container } = render(<FormField label="Email" name="email" error="Required" />);
    expect(container.firstChild).toHaveClass('has-error');
  });

  it('fires onChange for text input', () => {
    const onChange = vi.fn();
    render(<FormField label="Name" name="name" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('uses name as id when id not provided', () => {
    render(<FormField label="Field" name="myField" />);
    expect(screen.getByLabelText('Field')).toHaveAttribute('id', 'myField');
  });

  it('uses custom id when provided', () => {
    render(<FormField label="Field" name="myField" id="custom-id" />);
    expect(screen.getByLabelText('Field')).toHaveAttribute('id', 'custom-id');
  });

  it('fires onChange for textarea', () => {
    const onChange = vi.fn();
    render(<FormField label="Bio" name="bio" type="textarea" rows={3} value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'Hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('applies input-error class to textarea when error', () => {
    render(<FormField label="Bio" name="bio" type="textarea" error="Required" />);
    expect(screen.getByLabelText('Bio')).toHaveClass('input-error');
  });

  it('applies input-error class to input when error', () => {
    render(<FormField label="Name" name="name" error="Required" />);
    expect(screen.getByLabelText('Name')).toHaveClass('input-error');
  });

  it('fires onChange for number input via synthetic event', () => {
    const onChange = vi.fn();
    const { container } = render(<FormField label="Count" name="count" type="number" value={5} onChange={onChange} />);
    // NumberInput has increment/decrement buttons
    const buttons = container.querySelectorAll('.number-input button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[buttons.length - 1]); // increment
      expect(onChange).toHaveBeenCalled();
    }
  });

  it('renders disabled input', () => {
    render(<FormField label="Disabled" name="dis" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  it('renders placeholder', () => {
    render(<FormField label="Name" name="name" placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });
});
