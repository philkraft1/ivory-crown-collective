/**
 * Google Ads enhanced conversions `user_data` fields.
 * https://support.google.com/google-ads/answer/13258081
 *
 * Send plaintext values — Google normalizes and SHA-256 hashes them.
 * Omit empty fields instead of sending blanks.
 */

export type UserDataInput = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  street?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type EnhancedAddress = {
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
};

export type EnhancedUserData = {
  email?: string;
  phone_number?: string;
  address?: EnhancedAddress;
};

export function normalizeEmail(value?: string | null): string | undefined {
  const email = value?.trim().toLowerCase();
  if (!email || !email.includes("@")) return undefined;
  return email;
}

/** E.164: + and 11–15 digits. Bare 10-digit US numbers get +1. */
export function normalizePhone(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return undefined;
}

export function normalizeNamePart(value?: string | null): string | undefined {
  const name = value?.trim().toLowerCase();
  return name || undefined;
}

export function splitName(fullName?: string | null): {
  firstName?: string;
  lastName?: string;
} {
  const cleaned = fullName?.trim().replace(/\s+/g, " ");
  if (!cleaned) return {};
  const [first, ...rest] = cleaned.split(" ");
  return {
    firstName: first,
    lastName: rest.length ? rest.join(" ") : undefined,
  };
}

export function buildUserData(input: UserDataInput): EnhancedUserData | null {
  const data: EnhancedUserData = {};

  const email = normalizeEmail(input.email);
  if (email) data.email = email;

  const phone = normalizePhone(input.phone);
  if (phone) data.phone_number = phone;

  const split = splitName(input.name);
  const firstName = normalizeNamePart(input.firstName ?? split.firstName);
  const lastName = normalizeNamePart(input.lastName ?? split.lastName);
  const street = normalizeNamePart(input.street);
  const city = normalizeNamePart(input.city);
  const region = normalizeNamePart(input.region);
  const postalCode = input.postalCode?.trim() || undefined;
  const country = input.country?.trim().toUpperCase() || undefined;

  const address: EnhancedAddress = {};
  if (firstName) address.first_name = firstName;
  if (lastName) address.last_name = lastName;
  if (street) address.street = street;
  if (city) address.city = city;
  if (region) address.region = region;
  if (postalCode) address.postal_code = postalCode;
  if (country) address.country = country;

  if (Object.keys(address).length > 0) {
    data.address = address;
  }

  if (!data.email && !data.phone_number && !data.address) {
    return null;
  }

  return data;
}
