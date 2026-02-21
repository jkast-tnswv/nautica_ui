import { createChangeHandler, parseListValue, formatListValue } from './forms';
import type { ChangeEvent } from 'react';

describe('createChangeHandler', () => {
  interface TestForm {
    name: string;
    active: boolean;
    count: number;
  }

  function makeEvent(overrides: {
    name: string;
    value: string;
    type: string;
    checked?: boolean;
  }): ChangeEvent<HTMLInputElement> {
    return {
      target: {
        name: overrides.name,
        value: overrides.value,
        type: overrides.type,
        checked: overrides.checked ?? false,
      },
    } as ChangeEvent<HTMLInputElement>;
  }

  it('handles text input', () => {
    const handleChange = vi.fn();
    const onChange = createChangeHandler<TestForm>(handleChange);

    onChange(makeEvent({ name: 'name', value: 'hello', type: 'text' }));

    expect(handleChange).toHaveBeenCalledWith('name', 'hello');
  });

  it('handles checkbox input', () => {
    const handleChange = vi.fn();
    const onChange = createChangeHandler<TestForm>(handleChange);

    onChange(makeEvent({ name: 'active', value: '', type: 'checkbox', checked: true }));

    expect(handleChange).toHaveBeenCalledWith('active', true);
  });

  it('handles number input', () => {
    const handleChange = vi.fn();
    const onChange = createChangeHandler<TestForm>(handleChange);

    onChange(makeEvent({ name: 'count', value: '42', type: 'number' }));

    expect(handleChange).toHaveBeenCalledWith('count', 42);
  });

  it('handles number input with NaN (defaults to 0)', () => {
    const handleChange = vi.fn();
    const onChange = createChangeHandler<TestForm>(handleChange);

    onChange(makeEvent({ name: 'count', value: 'abc', type: 'number' }));

    expect(handleChange).toHaveBeenCalledWith('count', 0);
  });
});

describe('parseListValue', () => {
  it('parses comma-separated values', () => {
    expect(parseListValue('a, b, c')).toEqual(['a', 'b', 'c']);
  });

  it('parses newline-separated values', () => {
    expect(parseListValue('a\nb\nc')).toEqual(['a', 'b', 'c']);
  });

  it('parses mixed comma and newline separators', () => {
    expect(parseListValue('a, b\nc, d')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('trims whitespace and removes empty strings', () => {
    expect(parseListValue('  a ,  , b , ')).toEqual(['a', 'b']);
  });

  it('returns empty array for empty input', () => {
    expect(parseListValue('')).toEqual([]);
  });

  it('returns empty array for only commas', () => {
    expect(parseListValue(',,,,')).toEqual([]);
  });

  it('handles Unicode values', () => {
    expect(parseListValue('café, naïve')).toEqual(['café', 'naïve']);
  });
});

describe('formatListValue', () => {
  it('joins array with comma and space', () => {
    expect(formatListValue(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('returns empty string for empty array', () => {
    expect(formatListValue([])).toBe('');
  });
});
