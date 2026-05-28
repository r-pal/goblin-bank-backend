import express from "express";
import type { Request, Response, NextFunction } from "express";

import { initDb, openDb } from "./db.js";
import { startHalfHourSnapshots } from "./snapshots.js";
import { HttpError } from "./validate.js";

import { getMarket } from "./routes/market.js";
import { accountsRouter } from "./routes/accounts.js";
import { waresRouter } from "./routes/wares.js";
import { messagesRouter } from "./routes/messages.js";
import { historyRouter } from "./routes/history.js";
import { snapshotsRouter } from "./routes/snapshots.js";
import { swaggerRouter } from "./swagger.js";

const app = express();
app.use(express.json());

const db = openDb();
initDb(db);
startHalfHourSnapshots(db);

app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/api-docs", swaggerRouter());

app.get("/api/market", getMarket(db));
app.use("/api/accounts", accountsRouter(db));
app.use("/api/wares", waresRouter(db));
app.use("/api/messages", messagesRouter(db));
app.use("/api/history", historyRouter(db));
app.use("/api/snapshots", snapshotsRouter(db));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "invalid JSON" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

const port = Number(process.env.PORT ?? "4000");
app.listen(port, () => {
  console.log(`Goblin Bank listening on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});

