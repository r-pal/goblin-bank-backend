export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Goblin Bank API",
    version: "0.1.0",
    description:
      "Goblin Bank backend for hovel accounts, wares, messages, and half-hour wealth/price snapshots.",
  },
  servers: [{ url: "http://localhost:4000", description: "Local dev" }],
  tags: [
    { name: "Market", description: "Formatted market display" },
    { name: "Accounts", description: "Hovel coin balances" },
    { name: "Wares", description: "Market wares" },
    { name: "Messages", description: "Market messages" },
    { name: "History", description: "Time-series for charts" },
    { name: "Snapshots", description: "Manual snapshot capture" },
    { name: "Health", description: "Health check" },
  ],
  paths: {
    "/healthz": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
        },
      },
    },
    "/api/market": {
      get: {
        tags: ["Market"],
        summary: "Get formatted market state",
        description:
          "Returns display strings for accounts, wares, and messages (currency symbol Ǥ).",
        responses: {
          "200": {
            description: "Market state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MarketResponse" },
                example: {
                  accounts: ["Muckroot Ha Ǥ20,000", "Snaggle Den Ǥ0"],
                  wares: ["Frogs Ǥ1.20"],
                  messages: ["Welcome to the Goblin Market"],
                },
              },
            },
          },
        },
      },
    },
    "/api/accounts/{hovelSlug}/coin/add": {
      post: {
        tags: ["Accounts"],
        summary: "Add coins to a hovel account",
        parameters: [{ $ref: "#/components/parameters/hovelSlug" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CoinAmountRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Coins added",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/accounts/{hovelSlug}/coin/remove": {
      post: {
        tags: ["Accounts"],
        summary: "Remove coins from a hovel account",
        parameters: [{ $ref: "#/components/parameters/hovelSlug" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CoinAmountRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Coins removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/wares": {
      post: {
        tags: ["Wares"],
        summary: "Create a ware",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WareCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Ware created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IdResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/wares/{id}": {
      patch: {
        tags: ["Wares"],
        summary: "Update a ware",
        parameters: [{ $ref: "#/components/parameters/id" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WareUpdateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Ware updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Wares"],
        summary: "Delete a ware",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: {
          "200": {
            description: "Ware deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/messages": {
      post: {
        tags: ["Messages"],
        summary: "Create a message",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Message created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IdResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/messages/{id}": {
      patch: {
        tags: ["Messages"],
        summary: "Update a message",
        parameters: [{ $ref: "#/components/parameters/id" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageUpdateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Message updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Messages"],
        summary: "Delete a message",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: {
          "200": {
            description: "Message deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/history/accounts": {
      get: {
        tags: ["History"],
        summary: "Account balance history (series-by-hovel)",
        description: "Each point `v` is balance in whole coins. Timestamps are ISO 8601.",
        responses: {
          "200": {
            description: "Account history",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HistoryResponse" },
              },
            },
          },
        },
      },
    },
    "/api/history/wares": {
      get: {
        tags: ["History"],
        summary: "Ware price history (series-by-ware)",
        description: "Each point `v` is price in cents. Timestamps are ISO 8601.",
        responses: {
          "200": {
            description: "Ware history",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HistoryResponse" },
              },
            },
          },
        },
      },
    },
    "/api/snapshots/take": {
      post: {
        tags: ["Snapshots"],
        summary: "Take a snapshot now",
        description:
          "Captures current account balances and ware prices. Snapshots also run automatically every 30 minutes.",
        responses: {
          "201": {
            description: "Snapshot created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SnapshotResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      hovelSlug: {
        name: "hovelSlug",
        in: "path",
        required: true,
        schema: {
          type: "string",
          enum: [
            "house-of-pith-and-plum",
            "grott-hovel",
            "nightroot-hollow",
            "pudding-bag",
            "snaggle-den",
            "muckroot-ha",
            "bric-a-barracks",
          ],
        },
        description: "Hovel identifier",
      },
      id: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    },
    schemas: {
      OkResponse: {
        type: "object",
        properties: { ok: { type: "boolean", example: true } },
        required: ["ok"],
      },
      IdResponse: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
        required: ["id"],
      },
      ErrorResponse: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      MarketResponse: {
        type: "object",
        properties: {
          accounts: { type: "array", items: { type: "string" } },
          wares: { type: "array", items: { type: "string" } },
          messages: { type: "array", items: { type: "string" } },
        },
        required: ["accounts", "wares", "messages"],
      },
      CoinAmountRequest: {
        type: "object",
        properties: {
          amount: { type: "integer", minimum: 1, example: 20000 },
        },
        required: ["amount"],
      },
      WareCreateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Frogs" },
          price: { type: "string", example: "1.20", description: "Decimal price string" },
        },
        required: ["name", "price"],
      },
      WareUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Frogs" },
          price: { type: "string", example: "1.20" },
        },
      },
      MessageCreateRequest: {
        type: "object",
        properties: {
          text: { type: "string", example: "Welcome to the Goblin Market" },
        },
        required: ["text"],
      },
      MessageUpdateRequest: {
        type: "object",
        properties: {
          text: { type: "string", example: "Welcome to the Goblin Market" },
        },
        required: ["text"],
      },
      HistoryPoint: {
        type: "object",
        properties: {
          t: { type: "string", format: "date-time" },
          v: { type: "number" },
        },
        required: ["t", "v"],
      },
      HistorySeries: {
        type: "object",
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          points: {
            type: "array",
            items: { $ref: "#/components/schemas/HistoryPoint" },
          },
        },
        required: ["key", "label", "points"],
      },
      HistoryResponse: {
        type: "object",
        properties: {
          series: {
            type: "array",
            items: { $ref: "#/components/schemas/HistorySeries" },
          },
        },
        required: ["series"],
      },
      SnapshotResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          takenAt: { type: "string", format: "date-time" },
        },
        required: ["id", "takenAt"],
      },
    },
    responses: {
      BadRequest: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
} as const;
