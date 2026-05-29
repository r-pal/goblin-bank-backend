import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { Db } from "../db.js";
import { HttpError, asNonEmptyString, parsePriceCoins } from "../validate.js";

export function waresRouter(db: Db): Router {
  const router = Router();

  router.post("/", (req, res) => {
    const body = req.body ?? {};
    const name = asNonEmptyString(body.name, "name");
    const priceCoins = parsePriceCoins(body.price, "price");
    const id = randomUUID();

    db.prepare("INSERT INTO wares (id, name, priceCoins) VALUES (?, ?, ?)").run(
      id,
      name,
      priceCoins
    );

    res.status(201).json({ id });
  });

  router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body ?? {};
    const updates: Array<{ sql: string; value: unknown }> = [];

    if (body.name !== undefined) updates.push({ sql: "name = ?", value: asNonEmptyString(body.name, "name") });
    if (body.price !== undefined) updates.push({ sql: "priceCoins = ?", value: parsePriceCoins(body.price, "price") });
    if (updates.length === 0) throw new HttpError(400, "no fields to update");

    const existing = db.prepare("SELECT id FROM wares WHERE id = ?").get(id) as { id: string } | undefined;
    if (!existing) throw new HttpError(404, "unknown ware id");

    const setSql = updates.map((u) => u.sql).join(", ");
    const params = updates.map((u) => u.value);
    db.prepare(`UPDATE wares SET ${setSql} WHERE id = ?`).run(...params, id);

    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    const id = req.params.id;
    const info = db.prepare("DELETE FROM wares WHERE id = ?").run(id);
    if (info.changes === 0) throw new HttpError(404, "unknown ware id");
    res.json({ ok: true });
  });

  return router;
}
