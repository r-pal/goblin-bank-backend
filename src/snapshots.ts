import { randomUUID } from "node:crypto";
import type { Db } from "./db.js";

export function takeSnapshot(db: Db, takenAtIso = new Date().toISOString()): { id: string; takenAt: string } {
  const id = randomUUID();

  const tx = db.transaction(() => {
    db.prepare("INSERT INTO snapshots (id, takenAt) VALUES (?, ?)").run(id, takenAtIso);

    db.exec(`
      INSERT INTO snapshot_accounts (snapshotId, hovelSlug, balanceCoins)
      SELECT '${id}', hovelSlug, balanceCoins
      FROM accounts;
    `);

    db.exec(`
      INSERT INTO snapshot_wares (snapshotId, wareId, priceCents)
      SELECT '${id}', id, priceCents
      FROM wares;
    `);
  });

  tx();
  return { id, takenAt: takenAtIso };
}

function msUntilNextHalfHour(now = new Date()): number {
  const next = new Date(now);
  next.setSeconds(0, 0);
  const m = next.getMinutes();
  if (m < 30) next.setMinutes(30);
  else {
    next.setMinutes(0);
    next.setHours(next.getHours() + 1);
  }
  return next.getTime() - now.getTime();
}

export function startHalfHourSnapshots(db: Db): { stop: () => void } {
  let interval: NodeJS.Timeout | undefined;
  let timeout: NodeJS.Timeout | undefined;

  timeout = setTimeout(() => {
    takeSnapshot(db);
    interval = setInterval(() => takeSnapshot(db), 30 * 60 * 1000);
  }, msUntilNextHalfHour());

  return {
    stop: () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    },
  };
}

