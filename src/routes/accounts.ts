import { Router } from "express";
import type { Db } from "../db.js";
import { HttpError, asInt, asInterestRatePercent } from "../validate.js";

export function accountsRouter(db: Db): Router {
  const router = Router();

  router.post("/:hovelSlug/coin-change", (req, res) => {
    const hovelSlug = req.params.hovelSlug;
    const amount = asInt((req.body ?? {}).amount, "amount");
    if (amount === 0) throw new HttpError(400, "amount must not be 0");

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

  router.get("/:hovelSlug/interest-rate", (req, res) => {
    const hovelSlug = req.params.hovelSlug;
    const row = db
      .prepare("SELECT interestRatePercent FROM accounts WHERE hovelSlug = ?")
      .get(hovelSlug) as { interestRatePercent: number } | undefined;
    if (!row) throw new HttpError(404, "unknown hovelSlug");

    res.json({ hovelSlug, interestRatePercent: row.interestRatePercent });
  });

  router.patch("/:hovelSlug/interest-rate", (req, res) => {
    const hovelSlug = req.params.hovelSlug;
    const interestRatePercent = asInterestRatePercent(
      (req.body ?? {}).interestRatePercent,
      "interestRatePercent"
    );

    const info = db
      .prepare("UPDATE accounts SET interestRatePercent = ? WHERE hovelSlug = ?")
      .run(interestRatePercent, hovelSlug);
    if (info.changes === 0) throw new HttpError(404, "unknown hovelSlug");

    res.json({ hovelSlug, interestRatePercent });
  });

  return router;
}
