export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function asNonEmptyString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new HttpError(400, `${field} must be a non-empty string`);
  }
  return v.trim();
}

export function asInt(v: unknown, field: string): number {
  if (typeof v !== "number" || !Number.isInteger(v)) {
    throw new HttpError(400, `${field} must be an integer`);
  }
  return v;
}

export function asOptionalInt(v: unknown, field: string): number | undefined {
  if (v === undefined) return undefined;
  return asInt(v, field);
}

export function asInterestRatePercent(v: unknown, field: string): number {
  const rate = asInt(v, field);
  if (rate < 0) throw new HttpError(400, `${field} must be >= 0`);
  return rate;
}

export function parsePriceCoins(v: unknown, field: string): number {
  if (typeof v === "number") {
    if (!Number.isInteger(v) || v < 0) {
      throw new HttpError(400, `${field} must be a non-negative integer`);
    }
    return v;
  }
  if (typeof v === "string" && /^\d+$/.test(v.trim())) {
    const coins = Number(v.trim());
    if (!Number.isSafeInteger(coins) || coins < 0) {
      throw new HttpError(400, `${field} must be a non-negative integer`);
    }
    return coins;
  }
  throw new HttpError(400, `${field} must be a non-negative integer`);
}
