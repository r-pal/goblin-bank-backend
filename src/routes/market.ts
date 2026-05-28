import type { Request, Response } from "express";
import type { Db } from "../db.js";
import { formatAccount, formatWare } from "../format.js";

export function getMarket(db: Db) {
  return (_req: Request, res: Response) => {
    const accountsRows = db
      .prepare("SELECT name, balanceCoins FROM accounts ORDER BY name ASC")
      .all() as Array<{ name: string; balanceCoins: number }>;

    const wareRows = db
      .prepare("SELECT name, priceCents FROM wares ORDER BY name ASC")
      .all() as Array<{ name: string; priceCents: number }>;

    const messageRows = db
      .prepare("SELECT text FROM messages ORDER BY rowid ASC")
      .all() as Array<{ text: string }>;

    res.json({
      accounts: accountsRows.map((a) => formatAccount(a.name, a.balanceCoins)),
      wares: wareRows.map((w) => formatWare(w.name, w.priceCents)),
      messages: messageRows.map((m) => m.text),
    });
  };
}

