import {
  validateMacAddress,
  validateIpv4,
  validateIpv6,
  validateIpAddress,
  validatePrefix,
  validateHostname,
  validateDeviceForm,
  validators,
} from './validation';

describe('validateMacAddress', () => {
  it('accepts valid colon-separated MAC', () => {
    expect(validateMacAddress('aa:bb:cc:dd:ee:ff')).toBe(true);
    expect(validateMacAddress('00:11:22:33:44:55')).toBe(true);
    expect(validateMacAddress('AA:BB:CC:DD:EE:FF')).toBe(true);
  });

  it('accepts valid hyphen-separated MAC', () => {
    expect(validateMacAddress('aa-bb-cc-dd-ee-ff')).toBe(true);
  });

  it('rejects invalid MACs', () => {
    expect(validateMacAddress('')).toBe(false);
    expect(validateMacAddress('aa:bb:cc:dd:ee')).toBe(false);
    expect(validateMacAddress('aa:bb:cc:dd:ee:ff:00')).toBe(false);
    expect(validateMacAddress('zz:bb:cc:dd:ee:ff')).toBe(false);
    expect(validateMacAddress('aabbccddeeff')).toBe(false);
  });
});

describe('validateIpv4', () => {
  it('accepts valid IPv4 addresses', () => {
    expect(validateIpv4('192.168.1.1')).toBe(true);
    expect(validateIpv4('0.0.0.0')).toBe(true);
    expect(validateIpv4('255.255.255.255')).toBe(true);
    expect(validateIpv4('10.0.0.1')).toBe(true);
  });

  it('rejects invalid IPv4 addresses', () => {
    expect(validateIpv4('')).toBe(false);
    expect(validateIpv4('256.0.0.1')).toBe(false);
    expect(validateIpv4('192.168.1')).toBe(false);
    expect(validateIpv4('192.168.1.1.1')).toBe(false);
    expect(validateIpv4('abc.def.ghi.jkl')).toBe(false);
  });
});

describe('validateIpv6', () => {
  it('accepts valid full IPv6 addresses', () => {
    expect(validateIpv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
  });

  it('accepts compressed IPv6', () => {
    expect(validateIpv6('::1')).toBe(true);
    expect(validateIpv6('fe80::')).toBe(true);
    expect(validateIpv6('2001:db8::1')).toBe(true);
  });

  it('accepts mixed IPv4-mapped IPv6', () => {
    expect(validateIpv6('::ffff:192.168.1.1')).toBe(true);
  });

  it('rejects invalid IPv6', () => {
    expect(validateIpv6('')).toBe(false);
    expect(validateIpv6('2001:db8::1::2')).toBe(false); // double ::
  });
});

describe('validateIpAddress', () => {
  it('accepts both IPv4 and IPv6', () => {
    expect(validateIpAddress('192.168.1.1')).toBe(true);
    expect(validateIpAddress('::1')).toBe(true);
  });

  it('rejects invalid addresses', () => {
    expect(validateIpAddress('not-an-ip')).toBe(false);
  });
});

describe('validatePrefix', () => {
  it('accepts valid IPv4 CIDR prefixes', () => {
    expect(validatePrefix('10.0.0.0/8')).toBe(true);
    expect(validatePrefix('192.168.1.0/24')).toBe(true);
    expect(validatePrefix('0.0.0.0/0')).toBe(true);
    expect(validatePrefix('255.255.255.255/32')).toBe(true);
  });

  it('accepts valid IPv6 CIDR prefixes', () => {
    expect(validatePrefix('2001:db8::/32')).toBe(true);
    expect(validatePrefix('::1/128')).toBe(true);
  });

  it('rejects invalid prefixes', () => {
    expect(validatePrefix('10.0.0.0')).toBe(false); // no slash
    expect(validatePrefix('10.0.0.0/33')).toBe(false); // too large for v4
    expect(validatePrefix('not-an-ip/24')).toBe(false);
  });
});

describe('validateHostname', () => {
  it('accepts valid hostnames', () => {
    expect(validateHostname('my-host')).toBe(true);
    expect(validateHostname('server01')).toBe(true);
    expect(validateHostname('a')).toBe(true);
  });

  it('rejects invalid hostnames', () => {
    expect(validateHostname('')).toBe(false);
    expect(validateHostname('-starts-with-dash')).toBe(false);
    expect(validateHostname('has space')).toBe(false);
    expect(validateHostname('a'.repeat(64))).toBe(false); // > 63 chars
  });
});

describe('validateDeviceForm', () => {
  it('returns valid when all fields are correct', () => {
    const result = validateDeviceForm({
      mac: 'aa:bb:cc:dd:ee:ff',
      ip: '192.168.1.1',
      hostname: 'server01',
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('returns errors for missing fields', () => {
    const result = validateDeviceForm({ mac: '', ip: '', hostname: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.mac).toBeDefined();
    expect(result.errors.ip).toBeDefined();
    expect(result.errors.hostname).toBeDefined();
  });

  it('returns errors for invalid formats', () => {
    const result = validateDeviceForm({
      mac: 'bad-mac',
      ip: 'bad-ip',
      hostname: '-bad',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.mac).toContain('Invalid');
    expect(result.errors.ip).toContain('Invalid');
    expect(result.errors.hostname).toContain('Invalid');
  });
});

describe('validators', () => {
  it('returns null for valid values', () => {
    expect(validators.mac('aa:bb:cc:dd:ee:ff')).toBeNull();
    expect(validators.ip('10.0.0.1')).toBeNull();
    expect(validators.hostname('server01')).toBeNull();
  });

  it('returns null for empty values (optional fields)', () => {
    expect(validators.mac('')).toBeNull();
    expect(validators.ip('')).toBeNull();
    expect(validators.hostname('')).toBeNull();
  });

  it('returns error string for invalid values', () => {
    expect(validators.mac('bad')).toContain('Invalid');
    expect(validators.ip('bad')).toContain('Invalid');
    expect(validators.hostname('-bad')).toContain('Invalid');
  });
});
