import express, { type Express } from "express";
  import cors from "cors";
  import pinoHttp from "pino-http";
  import path from "path";
  import { fileURLToPath } from "url";
  import { existsSync } from "fs";
  import router from "./routes";
  import { logger } from "./lib/logger";

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const app: Express = express();

  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },
    }),
  );
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", router);

  // Serve Mini App static files in production (Railway)
  const staticDir = path.resolve(__dirname, "../../tg-miniapp/dist/public");
  logger.info({ staticDir, exists: existsSync(staticDir) }, "Checking static dir");

  if (existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
    logger.info({ staticDir }, "Serving Mini App static files");
  } else {
    logger.warn({ staticDir }, "Static dir not found, only API routes available");
    // Serve a basic page if no static files
    app.get("/", (_req, res) => {
      res.json({ status: "ok", message: "UzumRef Bot API running" });
    });
  }

  export default app;
  