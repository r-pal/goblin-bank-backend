import { Router } from "express";
import type { Db } from "../db.js";
import { takeSnapshot } from "../snapshots.js";

export function snapshotsRouter(db: Db): Router {
  const router = Router();

  router.post("/take", (_req, res) => {
    const snapshot = takeSnapshot(db);
    res.status(201).json(snapshot);
  });

  return router;
}

