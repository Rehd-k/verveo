/** Compare expected vs gateway-reported amounts in NGN (allow ₦1 rounding slack). */
export function amountsMatch(
  expectedNgn: number,
  paidNgn: number,
  toleranceNgn = 1
): boolean {
  if (!Number.isFinite(expectedNgn) || !Number.isFinite(paidNgn)) return false;
  if (expectedNgn <= 0 || paidNgn <= 0) return false;
  return Math.abs(expectedNgn - paidNgn) <= toleranceNgn;
}

export function amountMismatchError(expectedNgn: number, paidNgn: number) {
  return {
    error: 'Paid amount does not match expected amount',
    expected: expectedNgn,
    paid: paidNgn,
  };
}
