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

export function parsePriceToCents(v: unknown, field: string): number {
  const s = asNonEmptyString(v, field);
  if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    throw new HttpError(400, `${field} must look like 1.20`);
  }
  const [whole, frac = ""] = s.split(".");
  const paddedFrac = (frac + "00").slice(0, 2);
  const cents = Number(whole) * 100 + Number(paddedFrac);
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new HttpError(400, `${field} must be a non-negative price`);
  }
  return cents;
}

