import express from "express";
import type { Request, Response, NextFunction } from "express";

import { initDb, openDb } from "./db.js";
import { startHourlyInterest } from "./interest.js";
import { startHalfHourSnapshots } from "./snapshots.js";
import { HttpError } from "./validate.js";

import { getMarket } from "./routes/market.js";
import { accountsRouter } from "./routes/accounts.js";
import { waresRouter } from "./routes/wares.js";
import { messagesRouter } from "./routes/messages.js";
import { historyRouter } from "./routes/history.js";
import { snapshotsRouter } from "./routes/snapshots.js";
import { adminRouter } from "./routes/admin.js";
import { swaggerRouter } from "./swagger.js";

const app = express();
app.use(express.json());

// Minimal CORS for browser dev/prod. (Dev can also rely on a Vite proxy.)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.VITE_ORIGIN ?? "http://localhost:5173";
  if (origin && origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "content-type, authorization, x-requested-with",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

const db = openDb();
initDb(db);
startHalfHourSnapshots(db);
startHourlyInterest(db);

app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/api-docs", swaggerRouter());

app.get("/api/market", getMarket(db));
app.use("/api/accounts", accountsRouter(db));
app.use("/api/wares", waresRouter(db));
app.use("/api/messages", messagesRouter(db));
app.use("/api/history", historyRouter(db));
app.use("/api/snapshots", snapshotsRouter(db));
app.use("/api/admin", adminRouter(db));

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

