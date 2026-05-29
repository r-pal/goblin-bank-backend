import type { Db } from "./db.js";

export const DEFAULT_INTEREST_RATE_PERCENT = 12;

export function balanceAfterInterest(balanceCoins: number, interestRatePercent: number): number {
  if (balanceCoins === 0) return 0;
  return Math.round((balanceCoins * (100 + interestRatePercent)) / 100);
}

export function accrueInterest(db: Db): void {
  const accounts = db
    .prepare("SELECT hovelSlug, balanceCoins, interestRatePercent FROM accounts")
    .all() as Array<{ hovelSlug: string; balanceCoins: number; interestRatePercent: number }>;

  const update = db.prepare("UPDATE accounts SET balanceCoins = ? WHERE hovelSlug = ?");
  const tx = db.transaction(() => {
    for (const a of accounts) {
      const next = balanceAfterInterest(a.balanceCoins, a.interestRatePercent);
      if (next !== a.balanceCoins) update.run(next, a.hovelSlug);
    }
  });
  tx();
}

function msUntilNextHour(now = new Date()): number {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  if (next.getTime() < now.getTime()) {
    next.setHours(next.getHours() + 1);
  }
  return next.getTime() - now.getTime();
}

export function startHourlyInterest(db: Db): { stop: () => void } {
  let interval: NodeJS.Timeout | undefined;
  let timeout: NodeJS.Timeout | undefined;

  timeout = setTimeout(() => {
    accrueInterest(db);
    interval = setInterval(() => accrueInterest(db), 60 * 60 * 1000);
  }, msUntilNextHour());

  return {
    stop: () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    },
  };
}
