import { Router } from "express";
import type { Db } from "../db.js";
import { resetDatabase } from "../db.js";
import { HttpError, asNonEmptyString } from "../validate.js";

function adminResetSecret(): string {
  return process.env.OFFICE_ADMIN_SECRET ?? "sssh";
}

export function adminRouter(db: Db): Router {
  const router = Router();

  router.post("/reset", (req, res) => {
    const secret = asNonEmptyString((req.body ?? {}).secret, "secret");
    if (secret !== adminResetSecret()) {
      throw new HttpError(403, "invalid secret");
    }
    resetDatabase(db);
    res.json({ ok: true as const });
  });

  return router;
}
