export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

const COMMON = new Set([
  "password123", "password1234", "senha12345", "qwerty12345", "1234567890", "angola2024",
  "angola2025", "angola2026", "bfa123456", "bfanet1234", "abcdefghij", "iloveyou12",
]);

const hasRun = (s: string, run: number) => {
  let count = 1;
  for (let i = 1; i < s.length; i++) {
    count = s[i] === s[i - 1] ? count + 1 : 1;
    if (count >= run) return true;
  }
  return false;
};

export interface PasswordContext { customerNumber?: string; fullName?: string }

/** First policy violation (Portuguese) or null. Same rules as CredentialPolicy.ValidatePassword on the server. */
export function passwordIssue(pwd: string, ctx: PasswordContext = {}): string | null {
  if (pwd.length < PASSWORD_MIN) return `A palavra-passe deve ter pelo menos ${PASSWORD_MIN} caracteres.`;
  if (pwd.length > PASSWORD_MAX) return `A palavra-passe não pode exceder ${PASSWORD_MAX} caracteres.`;
  if (!/\p{Lu}/u.test(pwd)) return "Inclua uma letra maiúscula.";
  if (!/\p{Ll}/u.test(pwd)) return "Inclua uma letra minúscula.";
  if (!/\d/.test(pwd)) return "Inclua um número.";
  if (!/[^\p{L}\p{N}]/u.test(pwd)) return "Inclua um símbolo.";
  if (hasRun(pwd, 3)) return "Não use mais de 2 caracteres iguais seguidos.";
  if (COMMON.has(pwd.toLowerCase())) return "Esta palavra-passe é demasiado comum.";
  if (ctx.customerNumber && pwd.includes(ctx.customerNumber)) return "Não inclua o número de adesão.";
  if (ctx.fullName) {
    for (const part of ctx.fullName.split(" ").filter((p) => p.length >= 4))
      if (pwd.toLowerCase().includes(part.toLowerCase())) return "Não inclua o seu nome.";
  }
  return null;
}

/** 0 (very weak) … 4 (strong): coarse meter for the UI only; the policy above is what is enforced. */
export function passwordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 10) score++;
  if (pwd.length >= 14) score++;
  if (/\p{Lu}/u.test(pwd) && /\p{Ll}/u.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^\p{L}\p{N}]/u.test(pwd)) score++;
  if (passwordIssue(pwd)) score = Math.min(score, 2);
  return score as 0 | 1 | 2 | 3 | 4;
}

/** 6 digits, not all equal, not an ascending/descending run. */
export function pinIssue(pin: string): string | null {
  if (!/^\d{6}$/.test(pin)) return "O PIN deve ter exactamente 6 dígitos.";
  if (new Set(pin).size === 1) return "O PIN não pode ter todos os dígitos iguais.";
  const d = [...pin].map(Number);
  const asc = d.every((x, i) => i === 0 || x - d[i - 1]! === 1);
  const desc = d.every((x, i) => i === 0 || d[i - 1]! - x === 1);
  return asc || desc ? "O PIN não pode ser uma sequência." : null;
}
