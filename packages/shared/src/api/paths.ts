const V1 = "/api/v1";

/** PDF receipt issued by the backend for a transaction the caller took part in. */
export const receiptPdfPath = (transactionId: string) => `${V1}/transactions/${encodeURIComponent(transactionId)}/receipt.pdf`;

/** PDF statement issued by the backend. `from`/`to` are YYYY-MM-DD; omitted = current month. */
export function statementPdfPath(accountId: string, range: { from?: string; to?: string } = {}): string {
  const q = new URLSearchParams();
  if (range.from) q.set("from", range.from);
  if (range.to) q.set("to", range.to);
  const qs = q.toString();
  return `${V1}/accounts/${encodeURIComponent(accountId)}/statement.pdf${qs ? `?${qs}` : ""}`;
}
