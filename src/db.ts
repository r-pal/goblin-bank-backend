import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

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
      balanceCoins INTEGER NOT NULL CHECK (balanceCoins >= 0)
    );

    CREATE TABLE IF NOT EXISTS wares (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      priceCents INTEGER NOT NULL CHECK (priceCents >= 0)
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
      balanceCoins INTEGER NOT NULL CHECK (balanceCoins >= 0),
      PRIMARY KEY (snapshotId, hovelSlug),
      FOREIGN KEY (snapshotId) REFERENCES snapshots(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS snapshot_wares (
      snapshotId TEXT NOT NULL,
      wareId TEXT NOT NULL,
      priceCents INTEGER NOT NULL CHECK (priceCents >= 0),
      PRIMARY KEY (snapshotId, wareId),
      FOREIGN KEY (snapshotId) REFERENCES snapshots(id) ON DELETE CASCADE
    );
  `);

  seedAccounts(db);
}

function seedAccounts(db: Db): void {
  const count = db.prepare("SELECT COUNT(*) as c FROM accounts").get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(
    "INSERT INTO accounts (hovelSlug, name, balanceCoins) VALUES (?, ?, ?)"
  );
  const tx = db.transaction(() => {
    for (const h of DEFAULT_HOVELS) insert.run(h.slug, h.name, 0);
  });
  tx();
}

