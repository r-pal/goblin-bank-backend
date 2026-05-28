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
  - Returns `{ accounts: string[]; wares: string[]; messages: string[] }`

## Examples

```bash
curl http://localhost:4000/api/market
```

Add coins:

```bash
curl -X POST http://localhost:4000/api/accounts/muckroot-ha/coin/add \
  -H 'content-type: application/json' \
  -d '{"amount":20000}'
```

Create a ware:

```bash
curl -X POST http://localhost:4000/api/wares \
  -H 'content-type: application/json' \
  -d '{"name":"Frogs","price":"1.20"}'
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
