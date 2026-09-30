import { describe, it, expect } from 'vitest';

// Pure validation and security guard logic matching post-property & realEstateService rules

function validateOwnerAccess(propertyUserId: string | undefined, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false;
  if (!propertyUserId) return false;
  return propertyUserId === currentUserId;
}

function validateKarnatakaRera(reraId: string): boolean {
  const clean = reraId.trim().toUpperCase();
  if (clean.length < 10) return false;
  if (!clean.includes('RERA')) return false;
  return (
    clean.startsWith('PRM') ||
    clean.startsWith('AG') ||
    clean.startsWith('ACK') ||
    clean.startsWith('KA') ||
    clean.includes('/KA/') ||
    clean.includes('KA/RERA')
  );
}

function validateIndianMobilePhone(phone: string): boolean {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.slice(2);
  }
  if (clean.length !== 10) return false;
  if (!/^[6-9]\d{9}$/.test(clean)) return false;
  if (/^(\d)\1{9}$/.test(clean)) return false; // Reject repeated digits like 9999999999
  if (clean === '1234567890') return false;
  return true;
}

function resolveLocalityName(localityId: string, customName: string, selectedLocalityName: string): string {
  if (localityId === 'other') {
    return customName.trim();
  }
  return selectedLocalityName;
}

describe('Real Estate Security & Validation Guards', () => {
  describe('Owner Authorization & Deletion Safeguards', () => {
    it('blocks public/unauthenticated users from performing owner actions', () => {
      expect(validateOwnerAccess('user-123', undefined)).toBe(false);
      expect(validateOwnerAccess('user-123', '')).toBe(false);
      expect(validateOwnerAccess(undefined, 'user-123')).toBe(false);
    });

    it('blocks unauthorized users from deleting or editing other users properties', () => {
      expect(validateOwnerAccess('owner-user-abc', 'attacker-user-xyz')).toBe(false);
      expect(validateOwnerAccess('owner-user-abc', 'owner-user-abc-fake')).toBe(false);
    });

    it('allows genuine authenticated property owners to perform CRUD operations', () => {
      expect(validateOwnerAccess('verified-user-123', 'verified-user-123')).toBe(true);
    });
  });

  describe('Karnataka RERA Verification Rule', () => {
    it('accepts legitimate Karnataka RERA registration formats', () => {
      expect(validateKarnatakaRera('PRM/KA/RERA/1251/310/PR/171015/000456')).toBe(true);
      expect(validateKarnatakaRera('AG/KA/RERA/1251/310/AG/180220/001234')).toBe(true);
      expect(validateKarnatakaRera('KA/RERA/1251/310/PR/2026/009988')).toBe(true);
    });

    it('rejects fake or malformed RERA inputs', () => {
      expect(validateKarnatakaRera('12345')).toBe(false);
      expect(validateKarnatakaRera('RERA-FAKE')).toBe(false);
      expect(validateKarnatakaRera('MH/RERA/1234567890')).toBe(false); // Maharashtra format without KA
    });
  });

  describe('Contact Phone Number Sanitization', () => {
    it('validates 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
      expect(validateIndianMobilePhone('9876543210')).toBe(true);
      expect(validateIndianMobilePhone('+91 87654 32109')).toBe(true);
      expect(validateIndianMobilePhone('7654321098')).toBe(true);
      expect(validateIndianMobilePhone('6543210987')).toBe(true);
    });

    it('rejects invalid, repeated, or dummy phone numbers', () => {
      expect(validateIndianMobilePhone('1234567890')).toBe(false);
      expect(validateIndianMobilePhone('9999999999')).toBe(false);
      expect(validateIndianMobilePhone('8888888888')).toBe(false);
      expect(validateIndianMobilePhone('5555555555')).toBe(false); // starts with 5
      expect(validateIndianMobilePhone('98765')).toBe(false); // too short
    });
  });

  describe('Locality Name Resolution & "Others" Fallback', () => {
    it('resolves custom locality name when "other" is selected', () => {
      const resolved = resolveLocalityName('other', 'Rajankunte Phase 2', 'Yelahanka');
      expect(resolved).toBe('Rajankunte Phase 2');
    });

    it('resolves predefined locality name when standard locality is selected', () => {
      const resolved = resolveLocalityName('loc-yelahanka', '', 'Yelahanka');
      expect(resolved).toBe('Yelahanka');
    });
  });
});
