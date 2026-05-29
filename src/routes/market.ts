import type { Request, Response } from "express";
import type { Db } from "../db.js";
import { buildWareMarketItem, formatAccount, type PriceTrend } from "../format.js";

export function getMarket(db: Db) {
  return (_req: Request, res: Response) => {
    const accountsRows = db
      .prepare("SELECT name, balanceCoins FROM accounts ORDER BY name ASC")
      .all() as Array<{ name: string; balanceCoins: number }>;

    const wareRows = db
      .prepare("SELECT id, name, priceCoins FROM wares ORDER BY name ASC")
      .all() as Array<{ id: string; name: string; priceCoins: number }>;

    const lastSnapshotPrices = loadLastSnapshotPrices(db);

    const messageRows = db
      .prepare("SELECT text FROM messages ORDER BY rowid ASC")
      .all() as Array<{ text: string }>;

    res.json({
      accounts: accountsRows.map((a) => formatAccount(a.name, a.balanceCoins)),
      wares: wareRows.map((w) => {
        const prev = lastSnapshotPrices.get(w.id);
        let trend: PriceTrend | undefined;
        if (prev !== undefined) {
          if (w.priceCoins > prev) trend = "up";
          else if (w.priceCoins < prev) trend = "down";
        }
        return buildWareMarketItem(w.name, w.priceCoins, trend);
      }),
      messages: messageRows.map((m) => m.text),
    });
  };
}

function loadLastSnapshotPrices(db: Db): Map<string, number> {
  const snapshot = db
    .prepare("SELECT id FROM snapshots ORDER BY takenAt DESC LIMIT 1")
    .get() as { id: string } | undefined;
  if (!snapshot) return new Map();

  const rows = db
    .prepare("SELECT wareId, priceCoins FROM snapshot_wares WHERE snapshotId = ?")
    .all(snapshot.id) as Array<{ wareId: string; priceCoins: number }>;

  return new Map(rows.map((r) => [r.wareId, r.priceCoins]));
}
