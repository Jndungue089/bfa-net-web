/**
 * Input formats. Mirrors BfaNet.Application.Common.Patterns on the server — the API re-validates
 * everything, these run client-side only to give instant feedback and to stop bad input early.
 * All are anchored and free of nested quantifiers (no catastrophic backtracking).
 */
export const RX = {
  customerNumber: /^\d{8}$/,
  phone: /^9\d{8}$/,
  nationalId: /^\d{9}[A-Z]{2}\d{3}$/,
  taxId: /^\d{10}$/,
  iban: /^AO\d{23}$/,
  pin: /^\d{6}$/,
  serviceEntity: /^\d{5}$/,
  serviceReference: /^\d{9}$/,
  personName: /^\p{L}[\p{L}\p{M}'’.\- ]{1,118}[\p{L}.]$/u,
  email: /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9\-]{1,63}(\.[A-Za-z0-9\-]{1,63}){1,4}$/,
  /** Free text: letters, digits and a conservative punctuation set. No markup, no backslashes, no double quotes. */
  description: /^[\p{L}\p{N} .,;:'’()/\-_+&#@%!?]{0,140}$/u,
} as const;
