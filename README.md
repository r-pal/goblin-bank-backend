# Goblin Bank (backend)

TypeScript + Express + SQLite backend for Goblin Bank.

## Run

```bash
npm install
npm run dev
```

Server defaults to `http://localhost:4000`.

## API docs (Swagger)

- Swagger UI: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/api-docs/openapi.json`

## Main endpoint

- `GET /api/market`
  - Returns `{ accounts: string[]; wares: WareMarketItem[]; messages: string[] }`
  - Account amounts are prefixed with **Ǥ** (whole coins, no decimals)
  - Each ware has `name`, `price` (optional **▲**/**▼** plus **Ǥ** amount), and `trend` (`"up"`, `"down"`, or `null`)

## Examples

```bash
curl http://localhost:4000/api/market
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
