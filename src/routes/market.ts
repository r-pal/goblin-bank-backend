import type { Request, Response } from "express";
import type { Db } from "../db.js";
import { buildWareMarketItem, formatAccount, type PriceTrend } from "../format.js";

export function getMarket(db: Db) {
  return (_req: Request, res: Response) => {
    const accountsRows = db
      .prepare("SELECT name, balanceCoins FROM accounts ORDER BY name ASC")
      .all() as Array<{ name: string; balanceCoins: number }>;

    const wareRows = db
      .prepare(
        "SELECT name, priceCoins, trendReferencePriceCoins FROM wares ORDER BY name ASC"
      )
      .all() as Array<{ name: string; priceCoins: number; trendReferencePriceCoins: number }>;

    const messageRows = db
      .prepare("SELECT text FROM messages ORDER BY rowid ASC")
      .all() as Array<{ text: string }>;

    res.json({
      accounts: accountsRows.map((a) => formatAccount(a.name, a.balanceCoins)),
      wares: wareRows.map((w) => {
        let trend: PriceTrend | undefined;
        if (w.priceCoins > w.trendReferencePriceCoins) trend = "up";
        else if (w.priceCoins < w.trendReferencePriceCoins) trend = "down";
        return buildWareMarketItem(w.name, w.priceCoins, trend);
      }),
      messages: messageRows.map((m) => m.text),
    });
  };
}
