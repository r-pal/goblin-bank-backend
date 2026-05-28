import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.js";

export function swaggerRouter(): Router {
  const router = Router();

  router.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  router.use("/", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  return router;
}
