# Goblin Bank (backend)

TypeScript + Express + SQLite backend for Goblin Bank.

## Run

```bash
npm install
npm run dev
```

Server defaults to `http://localhost:4000`.

## First-run demo data

On a **fresh database** (no accounts yet), the server seeds:

- All seven hovel accounts at **₲1,000** each
- Wares: Frogs (₲120), Rings (₲500), Cards (₲25), Dice (₲15)
- Messages: “Welcome to Ragnarök!”, “Stock market now open”

**Office → Bank → Reset all** wipes wares, messages, and history and restores hovels at **₲0** with no demo market data. To get the demo again, delete `data/goblin-bank.sqlite` and restart.

## API docs (Swagger)

- Swagger UI: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/api-docs/openapi.json`

## Main endpoints

- `GET /api/tickertape` — LED tickertape: `{ accounts: string[], wares: { name, price, trend }[], messages: string[] }`
- `GET /api/market`
  - Returns `{ accounts: string[]; wares: WareMarketItem[]; messages: string[] }`
  - Account amounts are prefixed with **₲** (whole coins, no decimals)
  - Each ware has `name`, `price` (**₲** amount), and `trend` (`"up"`, `"down"`, or `null`). Trend appears immediately on price change and stays for **at least 30 minutes** (even if a half-hour snapshot runs in between).

## Examples

```bash
curl http://localhost:4000/api/tickertape
curl http://localhost:4000/api/market
```

Interest accrues **every hour on the hour** at each hovel’s configured rate (default **12%**). Negative balances compound the same way (e.g. −100 becomes −112 at 12%).

```bash
curl http://localhost:4000/api/accounts/muckroot-ha/interest-rate

curl -X PATCH http://localhost:4000/api/accounts/muckroot-ha/interest-rate \
  -H 'content-type: application/json' \
  -d '{"interestRatePercent":15}'
```

Change coins (positive adds, negative removes; balances may go negative):

```bash
curl -X POST http://localhost:4000/api/accounts/muckroot-ha/coin-change \
  -H 'content-type: application/json' \
  -d '{"amount":20000}'
```

Create a ware:

```bash
curl -X POST http://localhost:4000/api/wares \
  -H 'content-type: application/json' \
  -d '{"name":"Frogs","price":120}'
```

Messages (create, edit, delete):

```bash
curl -X POST http://localhost:4000/api/messages \
  -H 'content-type: application/json' \
  -d '{"text":"Welcome to the Goblin Market"}'

curl -X PATCH http://localhost:4000/api/messages/{id} \
  -H 'content-type: application/json' \
  -d '{"text":"Updated message"}'

curl -X DELETE http://localhost:4000/api/messages/{id}
```

Force a snapshot (for chart demos):

```bash
curl -X POST http://localhost:4000/api/snapshots/take
```

History:

```bash
curl http://localhost:4000/api/history/accounts
curl http://localhost:4000/api/history/wares
```

# goblin-bank-backend
