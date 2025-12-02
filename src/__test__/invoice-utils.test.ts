import { obtainSankhyaNotificatioLinkComplement, removeTextFromValue } from '../utils/invoice-utils';

describe('invoice-utils', () => {
  describe('obtainSankhyaNotificatioLinkComplement', () => {
    it('should extract file path from standard Google Drive URL', () => {
      const input = 'https://drive.google.com/file/d/1234567890abcdef/view';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('file/d/1234567890abcdef/view');
    });

    it('should extract file path from Google Drive URL without trailing slash', () => {
      const input = 'https://drive.google.com/file/d/1234567890abcdef';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('file/d/1234567890abcdef');
    });

    it('should extract file path from http (non-secure) Google Drive URL', () => {
      const input = 'http://drive.google.com/file/d/xyz789/view?usp=sharing';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('file/d/xyz789/view?usp=sharing');
    });

    it('should be case-insensitive for protocol and domain', () => {
      const input = 'HTTPS://DRIVE.GOOGLE.COM/file/d/abcdef123456';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('file/d/abcdef123456');
    });

    it('should handle Google Drive folder URLs', () => {
      const input = 'https://drive.google.com/drive/folders/1BxiMVs0XRA53dssdfsdfsdfsdf';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('drive/folders/1BxiMVs0XRA53dssdfsdfsdfsdf');
    });

    it('should handle URLs with query parameters', () => {
      const input = 'https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing&export=download';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('file/d/1A2B3C4D5E/view?usp=sharing&export=download');
    });

    it('should return null for non-Google Drive URLs', () => {
      const input = 'https://example.com/file/d/1234567890abcdef';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = obtainSankhyaNotificatioLinkComplement('');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = obtainSankhyaNotificatioLinkComplement(null as never);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = obtainSankhyaNotificatioLinkComplement(undefined as never);
      expect(result).toBeNull();
    });

    it('should return null for malformed Google Drive URL without path', () => {
      const input = 'https://drive.google.com/';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe(null);
    });

    it('should handle URLs with special characters in file ID', () => {
      const input = 'https://drive.google.com/file/d/1-_abc123XYZ789-_/view';
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe('file/d/1-_abc123XYZ789-_/view');
    });

    it('should handle very long file paths', () => {
      const longPath = 'a'.repeat(500);
      const input = `https://drive.google.com/${longPath}`;
      const result = obtainSankhyaNotificatioLinkComplement(input);
      expect(result).toBe(longPath);
    });
  });

  describe('removeTextFromValue', () => {
    it('should remove "R$ " with single space', () => {
      const input = 'R$ 1.500,00';
      const result = removeTextFromValue(input);
      expect(result).toBe('1.500,00');
    });

    it('should remove "R$ " without space', () => {
      const input = 'R$1.500,00';
      const result = removeTextFromValue(input);
      expect(result).toBe('1.500,00');
    });

    it('should remove "R$ " with multiple spaces', () => {
      const input = 'R$   1.500,00';
      const result = removeTextFromValue(input);
      expect(result).toBe('1.500,00');
    });

    it('should remove "R$ " with spaces before and after', () => {
      const input = '  R$ 1.500,00  ';
      const result = removeTextFromValue(input);
      expect(result).toBe('1.500,00');
    });

    it('should handle values with only "R$" and spaces', () => {
      const input = '  R$  ';
      const result = removeTextFromValue(input);
      expect(result).toBeNull();
    });

    it('should return empty string when input is only whitespace after removal', () => {
      const input = '   ';
      const result = removeTextFromValue(input);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = removeTextFromValue('');
      expect(result).toBeNull();
    });

    it('should return non-string values as-is', () => {
      const result = removeTextFromValue(123 as never);
      expect(result).toBe(123);
    });

    it('should handle large currency values', () => {
      const input = 'R$ 999.999.999,99';
      const result = removeTextFromValue(input);
      expect(result).toBe('999.999.999,99');
    });

    it('should handle currency values with cents', () => {
      const input = 'R$ 0,01';
      const result = removeTextFromValue(input);
      expect(result).toBe('0,01');
    });

    it('should handle currency values without cents', () => {
      const input = 'R$ 1.000';
      const result = removeTextFromValue(input);
      expect(result).toBe('1.000');
    });

    it('should trim trailing and leading whitespace', () => {
      const input = '  R$ 2.500,50  ';
      const result = removeTextFromValue(input);
      expect(result).toBe('2.500,50');
    });

    it('should handle zero values', () => {
      const input = 'R$ 0,00';
      const result = removeTextFromValue(input);
      expect(result).toBe('0,00');
    });

    it('should preserve internal whitespace', () => {
      const input = 'R$ 1 000,00';
      const result = removeTextFromValue(input);
      expect(result).toBe('1 000,00');
    });

    it('should return null for null input', () => {
      const result = removeTextFromValue(null as never);
      expect(result).toBeNull();
    });

    it('should return undefined for undefined input', () => {
      const result = removeTextFromValue(undefined as never);
      expect(result).toBeNull();
    });
  });

  describe('Integration tests', () => {
    it('should process Google Drive link and currency value together', () => {
      const link = 'https://drive.google.com/file/d/1abc2def3ghi/view';
      const value = 'R$ 3.500,00';

      const linkResult = obtainSankhyaNotificatioLinkComplement(link);
      const valueResult = removeTextFromValue(value);

      expect(linkResult).toBe('file/d/1abc2def3ghi/view');
      expect(valueResult).toBe('3.500,00');
    });

    it('should handle real-world invoice notification scenario', () => {
      const invoiceLink = 'https://drive.google.com/file/d/1XyZ9aB8cD7eF6gH5iJ4kL3mN2oP1qR0s/view?usp=sharing';
      const invoiceValue = 'R$ 15.750,99';

      const complementLink = obtainSankhyaNotificatioLinkComplement(invoiceLink);
      const cleanValue = removeTextFromValue(invoiceValue);

      expect(complementLink).toBe('file/d/1XyZ9aB8cD7eF6gH5iJ4kL3mN2oP1qR0s/view?usp=sharing');
      expect(cleanValue).toBe('15.750,99');

      // Simulate building Blip campaign message params
      const messageParams = {
        linkFatura: complementLink,
        valor: cleanValue,
      };

      expect(messageParams).toEqual({
        linkFatura: 'file/d/1XyZ9aB8cD7eF6gH5iJ4kL3mN2oP1qR0s/view?usp=sharing',
        valor: '15.750,99',
      });
    });
  });
});
