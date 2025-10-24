import { validatePhone } from '../utils/phone-utils';

describe('validatePhone', () => {
  test('adds 55 prefix when 11 digits only', () => {
    expect(validatePhone('11987654321')).toBe('+5511987654321');
  });

  test('keeps valid 13-digit numbers', () => {
    expect(validatePhone('5511987654321')).toBe('+5511987654321');
  });

  test('returns null for invalid numbers', () => {
    expect(validatePhone('12345')).toBeNull();
  });
});
