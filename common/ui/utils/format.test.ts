import { formatDate, formatRelativeTime, formatMacAddress, formatFileSize, formatEventType, getEventTypeIcon } from './format';

describe('formatDate', () => {
  it('returns dash for null/undefined', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });

  it('formats a valid date', () => {
    const result = formatDate(new Date('2024-01-15T10:30:00Z'));
    expect(result).toBeTruthy();
    expect(result).not.toBe('-');
  });

  it('accepts string dates', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).not.toBe('-');
  });
});

describe('formatRelativeTime', () => {
  it('returns dash for null/undefined', () => {
    expect(formatRelativeTime(null)).toBe('-');
    expect(formatRelativeTime(undefined)).toBe('-');
  });

  it('formats date as compact timestamp', () => {
    const result = formatRelativeTime(new Date('2024-03-15T14:30:45Z'));
    // Format: YYMMDD HH:MM:SS
    expect(result).toMatch(/^\d{6} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('formatMacAddress', () => {
  it('lowercases MAC address', () => {
    expect(formatMacAddress('AA:BB:CC:DD:EE:FF')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('preserves already-lowercase MAC', () => {
    expect(formatMacAddress('aa:bb:cc:dd:ee:ff')).toBe('aa:bb:cc:dd:ee:ff');
  });
});

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('formatEventType', () => {
  it('maps known event types', () => {
    expect(formatEventType('discovered')).toBe('New Device');
    expect(formatEventType('added')).toBe('Device Added');
    expect(formatEventType('lease_renewed')).toBe('Lease Renewed');
  });

  it('returns unknown types as-is', () => {
    expect(formatEventType('custom_event')).toBe('custom_event');
  });
});

describe('getEventTypeIcon', () => {
  it('returns correct icons for known events', () => {
    expect(getEventTypeIcon('discovered')).toBe('fiber_new');
    expect(getEventTypeIcon('added')).toBe('add_circle');
    expect(getEventTypeIcon('lease_renewed')).toBe('refresh');
  });

  it('returns schedule icon for unknown events', () => {
    expect(getEventTypeIcon('unknown')).toBe('schedule');
  });
});
