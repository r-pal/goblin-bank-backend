import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { Db } from "../db.js";
import { HttpError, asNonEmptyString } from "../validate.js";

export function messagesRouter(db: Db): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const messages = db
      .prepare("SELECT id, text FROM messages ORDER BY rowid ASC")
      .all() as Array<{ id: string; text: string }>;

    res.json({ messages });
  });

  router.post("/", (req, res) => {
    const body = req.body ?? {};
    const text = asNonEmptyString(body.text, "text");
    const id = randomUUID();
    db.prepare("INSERT INTO messages (id, text) VALUES (?, ?)").run(id, text);
    res.status(201).json({ id });
  });

  router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body ?? {};
    const text = asNonEmptyString(body.text, "text");
    const info = db.prepare("UPDATE messages SET text = ? WHERE id = ?").run(text, id);
    if (info.changes === 0) throw new HttpError(404, "unknown message id");
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    const id = req.params.id;
    const info = db.prepare("DELETE FROM messages WHERE id = ?").run(id);
    if (info.changes === 0) throw new HttpError(404, "unknown message id");
    res.json({ ok: true });
  });

  return router;
}

