import { Router } from "express";
import type { Db } from "../db.js";
import { HttpError, asInt } from "../validate.js";

export function accountsRouter(db: Db): Router {
  const router = Router();

  router.post("/:hovelSlug/coin/add", (req, res) => {
    const hovelSlug = req.params.hovelSlug;
    const amount = asInt((req.body ?? {}).amount, "amount");
    if (amount <= 0) throw new HttpError(400, "amount must be > 0");

    const row = db
      .prepare("SELECT balanceCoins FROM accounts WHERE hovelSlug = ?")
      .get(hovelSlug) as { balanceCoins: number } | undefined;
    if (!row) throw new HttpError(404, "unknown hovelSlug");

    db.prepare("UPDATE accounts SET balanceCoins = balanceCoins + ? WHERE hovelSlug = ?").run(
      amount,
      hovelSlug
    );

    res.json({ ok: true });
  });

  router.post("/:hovelSlug/coin/remove", (req, res) => {
    const hovelSlug = req.params.hovelSlug;
    const amount = asInt((req.body ?? {}).amount, "amount");
    if (amount <= 0) throw new HttpError(400, "amount must be > 0");

    const row = db
      .prepare("SELECT balanceCoins FROM accounts WHERE hovelSlug = ?")
      .get(hovelSlug) as { balanceCoins: number } | undefined;
    if (!row) throw new HttpError(404, "unknown hovelSlug");
    if (row.balanceCoins - amount < 0) throw new HttpError(400, "insufficient funds");

    db.prepare("UPDATE accounts SET balanceCoins = balanceCoins - ? WHERE hovelSlug = ?").run(
      amount,
      hovelSlug
    );

    res.json({ ok: true });
  });

  return router;
}

