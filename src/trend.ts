import type { PriceTrend } from "./format.js";
import { resolvePriceTrend } from "./format.js";

export const TREND_MIN_DURATION_MS = 30 * 60 * 1000;

export type WareTrendRow = {
  priceCoins: number;
  trendReferencePriceCoins: number;
  trendDirection: string | null;
  trendUntil: string | null;
};

export function trendLockUntilIso(from = Date.now()): string {
  return new Date(from + TREND_MIN_DURATION_MS).toISOString();
}

export function trendLockForPrice(
  priceCoins: number,
  trendReferencePriceCoins: number
): { trendDirection: PriceTrend | null; trendUntil: string | null } {
  const direction = resolvePriceTrend(priceCoins, trendReferencePriceCoins);
  if (!direction) return { trendDirection: null, trendUntil: null };
  return { trendDirection: direction, trendUntil: trendLockUntilIso() };
}

export function resolveWareTrend(row: WareTrendRow, now = new Date()): PriceTrend | undefined {
  if (row.trendDirection === "up" || row.trendDirection === "down") {
    if (row.trendUntil && new Date(row.trendUntil) > now) {
      return row.trendDirection;
    }
  }
  return resolvePriceTrend(row.priceCoins, row.trendReferencePriceCoins);
}

export const WARE_TREND_COLUMNS =
  "priceCoins, trendReferencePriceCoins, trendDirection, trendUntil";
