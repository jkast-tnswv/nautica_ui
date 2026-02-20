import { getErrorMessage, parseApiError } from './errors';

describe('getErrorMessage', () => {
  it('extracts message from Error object', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns string errors directly', () => {
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('extracts message from plain object', () => {
    expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
  });

  it('returns default fallback for unknown types', () => {
    expect(getErrorMessage(42)).toBe('An unexpected error occurred');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });

  it('returns custom fallback when provided', () => {
    expect(getErrorMessage(42, 'custom fallback')).toBe('custom fallback');
  });
});

describe('parseApiError', () => {
  it('parses Error object', () => {
    const result = parseApiError(new Error('api failed'));
    expect(result.message).toBe('api failed');
  });

  it('parses string error', () => {
    const result = parseApiError('string error');
    expect(result.message).toBe('string error');
  });

  it('parses object with message, code, and statusCode', () => {
    const result = parseApiError({ message: 'not found', code: 'NOT_FOUND', statusCode: 404 });
    expect(result.message).toBe('not found');
    expect(result.code).toBe('NOT_FOUND');
    expect(result.statusCode).toBe(404);
  });

  it('returns default message for unknown types', () => {
    const result = parseApiError(42);
    expect(result.message).toBe('An unexpected error occurred');
    expect(result.code).toBeUndefined();
    expect(result.statusCode).toBeUndefined();
  });
});
