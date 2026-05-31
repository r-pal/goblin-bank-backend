import { Router } from "express";
import type { Db } from "../db.js";

type Point = { t: string; v: number };
type Series = { key: string; label: string; points: Point[] };

export function historyRouter(db: Db): Router {
  const router = Router();

  router.get("/accounts", (_req, res) => {
    const rows = db
      .prepare(
        `
        SELECT s.takenAt as takenAt, a.hovelSlug as key, ac.name as label, a.balanceCoins as v
        FROM snapshots s
        JOIN snapshot_accounts a ON a.snapshotId = s.id
        JOIN accounts ac ON ac.hovelSlug = a.hovelSlug
        ORDER BY ac.name ASC, s.takenAt ASC
      `
      )
      .all() as Array<{ takenAt: string; key: string; label: string; v: number }>;

    res.json({ series: rowsToSeries(rows) });
  });

  router.get("/interest-rates", (_req, res) => {
    const rows = db
      .prepare(
        `
        SELECT s.takenAt as takenAt, a.hovelSlug as key, ac.name as label, a.interestRatePercent as v
        FROM snapshots s
        JOIN snapshot_accounts a ON a.snapshotId = s.id
        JOIN accounts ac ON ac.hovelSlug = a.hovelSlug
        WHERE a.interestRatePercent IS NOT NULL
        ORDER BY ac.name ASC, s.takenAt ASC
      `
      )
      .all() as Array<{ takenAt: string; key: string; label: string; v: number }>;

    res.json({ series: rowsToSeries(rows) });
  });

  router.get("/wares", (_req, res) => {
    const rows = db
      .prepare(
        `
        SELECT s.takenAt as takenAt, w.wareId as key, wr.name as label, w.priceCoins as v
        FROM snapshots s
        JOIN snapshot_wares w ON w.snapshotId = s.id
        JOIN wares wr ON wr.id = w.wareId
        ORDER BY wr.name ASC, s.takenAt ASC
      `
      )
      .all() as Array<{ takenAt: string; key: string; label: string; v: number }>;

    res.json({ series: rowsToSeries(rows) });
  });

  return router;
}

function rowsToSeries(
  rows: Array<{ takenAt: string; key: string; label: string; v: number }>
): Series[] {
  const map = new Map<string, Series>();
  for (const r of rows) {
    const existing = map.get(r.key) ?? { key: r.key, label: r.label, points: [] };
    existing.points.push({ t: r.takenAt, v: r.v });
    map.set(r.key, existing);
  }
  return [...map.values()];
}
