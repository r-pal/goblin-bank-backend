import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_INTEREST_RATE_PERCENT } from "./interest.js";

export type Db = Database.Database;

const DEFAULT_HOVELS: Array<{ slug: string; name: string }> = [
  { slug: "house-of-pith-and-plum", name: "House of Pith and Plum" },
  { slug: "grott-hovel", name: "Grott-Hovel" },
  { slug: "nightroot-hollow", name: "Nightroot Hollow" },
  { slug: "pudding-bag", name: "Pudding Bag" },
  { slug: "snaggle-den", name: "Snaggle Den" },
  { slug: "muckroot-ha", name: "Muckroot Ha" },
  { slug: "bric-a-barracks", name: "Bric-a-Barracks" },
];

const DEMO_STARTING_BALANCE = 1_000;

const DEMO_WARES: { name: string; priceCoins: number }[] = [
  { name: "Frogs", priceCoins: 120 },
  { name: "Rings", priceCoins: 500 },
  { name: "Cards", priceCoins: 25 },
  { name: "Dice", priceCoins: 15 },
];

const DEMO_MESSAGES = ["Welcome to Ragnarök!", "Stock market now open"] as const;

export function openDb(): Db {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "goblin-bank.sqlite");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export function initDb(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      hovelSlug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      balanceCoins INTEGER NOT NULL,
      interestRatePercent INTEGER NOT NULL DEFAULT ${DEFAULT_INTEREST_RATE_PERCENT}
    );

    CREATE TABLE IF NOT EXISTS wares (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      priceCoins INTEGER NOT NULL CHECK (priceCoins >= 0),
      trendReferencePriceCoins INTEGER NOT NULL CHECK (trendReferencePriceCoins >= 0),
      trendDirection TEXT,
      trendUntil TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      takenAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshot_accounts (
      snapshotId TEXT NOT NULL,
      hovelSlug TEXT NOT NULL,
      balanceCoins INTEGER NOT NULL,
      interestRatePercent INTEGER,
      PRIMARY KEY (snapshotId, hovelSlug),
      FOREIGN KEY (snapshotId) REFERENCES snapshots(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS snapshot_wares (
      snapshotId TEXT NOT NULL,
      wareId TEXT NOT NULL,
      priceCoins INTEGER NOT NULL CHECK (priceCoins >= 0),
      PRIMARY KEY (snapshotId, wareId),
      FOREIGN KEY (snapshotId) REFERENCES snapshots(id) ON DELETE CASCADE
    );
  `);

  ensureInterestRateColumn(db);
  ensureSnapshotAccountInterestColumn(db);
  ensureTrendReferenceColumn(db);
  ensureTrendLockColumns(db);
  seedInitialDemo(db);
}

function ensureTrendLockColumns(db: Db): void {
  const cols = db.prepare("PRAGMA table_info(wares)").all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === "trendDirection")) {
    db.exec("ALTER TABLE wares ADD COLUMN trendDirection TEXT");
  }
  if (!cols.some((c) => c.name === "trendUntil")) {
    db.exec("ALTER TABLE wares ADD COLUMN trendUntil TEXT");
  }
}

/** Deletes all data and re-seeds default hovel accounts at zero balance (no demo wares/messages). */
export function resetDatabase(db: Db): void {
  const tx = db.transaction(() => {
    db.exec(`
      DELETE FROM snapshot_wares;
      DELETE FROM snapshot_accounts;
      DELETE FROM snapshots;
      DELETE FROM messages;
      DELETE FROM wares;
      DELETE FROM accounts;
    `);
    seedAccounts(db, 0);
  });
  tx();
}

function ensureTrendReferenceColumn(db: Db): void {
  const cols = db.prepare("PRAGMA table_info(wares)").all() as Array<{ name: string }>;
  if (cols.some((c) => c.name === "trendReferencePriceCoins")) return;

  db.exec("ALTER TABLE wares ADD COLUMN trendReferencePriceCoins INTEGER");
  db.exec("UPDATE wares SET trendReferencePriceCoins = priceCoins");
}

function ensureInterestRateColumn(db: Db): void {
  const cols = db.prepare("PRAGMA table_info(accounts)").all() as Array<{ name: string }>;
  if (cols.some((c) => c.name === "interestRatePercent")) return;

  db.exec(
    `ALTER TABLE accounts ADD COLUMN interestRatePercent INTEGER NOT NULL DEFAULT ${DEFAULT_INTEREST_RATE_PERCENT}`
  );
}

function ensureSnapshotAccountInterestColumn(db: Db): void {
  const cols = db.prepare("PRAGMA table_info(snapshot_accounts)").all() as Array<{ name: string }>;
  if (cols.some((c) => c.name === "interestRatePercent")) return;

  db.exec("ALTER TABLE snapshot_accounts ADD COLUMN interestRatePercent INTEGER");
}

function seedInitialDemo(db: Db): void {
  const { c: accountCount } = db.prepare("SELECT COUNT(*) as c FROM accounts").get() as { c: number };
  if (accountCount > 0) return;

  const insertAccount = db.prepare(
    "INSERT INTO accounts (hovelSlug, name, balanceCoins, interestRatePercent) VALUES (?, ?, ?, ?)"
  );
  const insertWare = db.prepare(
    "INSERT INTO wares (id, name, priceCoins, trendReferencePriceCoins, trendDirection, trendUntil) VALUES (?, ?, ?, ?, NULL, NULL)"
  );
  const insertMessage = db.prepare("INSERT INTO messages (id, text) VALUES (?, ?)");

  const tx = db.transaction(() => {
    for (const h of DEFAULT_HOVELS) {
      insertAccount.run(h.slug, h.name, DEMO_STARTING_BALANCE, DEFAULT_INTEREST_RATE_PERCENT);
    }
    for (const w of DEMO_WARES) {
      insertWare.run(randomUUID(), w.name, w.priceCoins, w.priceCoins);
    }
    for (const text of DEMO_MESSAGES) {
      insertMessage.run(randomUUID(), text);
    }
  });
  tx();
}

function seedAccounts(db: Db, startingBalance: number): void {
  const count = db.prepare("SELECT COUNT(*) as c FROM accounts").get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(
    "INSERT INTO accounts (hovelSlug, name, balanceCoins, interestRatePercent) VALUES (?, ?, ?, ?)"
  );
  const tx = db.transaction(() => {
    for (const h of DEFAULT_HOVELS) {
      insert.run(h.slug, h.name, startingBalance, DEFAULT_INTEREST_RATE_PERCENT);
    }
  });
  tx();
}
