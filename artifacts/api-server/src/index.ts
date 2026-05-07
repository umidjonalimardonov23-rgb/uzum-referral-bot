// STARTUP DEBUG - print before any imports
  process.stdout.write("=== STARTING UZUM BOT SERVER ===\n");
  process.stdout.write("PORT: " + process.env.PORT + "\n");
  process.stdout.write("NODE_ENV: " + process.env.NODE_ENV + "\n");

  import app from "./app.js";
  import { logger } from "./lib/logger.js";
  import { startBot } from "./bot.js";

  const rawPort = process.env["PORT"] || "8080";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    process.stdout.write("ERROR: Invalid PORT: " + rawPort + "\n");
    process.exit(1);
  }

  app.listen(port, "0.0.0.0", () => {
    process.stdout.write("Server listening on port " + port + "\n");
    logger.info({ port }, "Server listening");
  });

  startBot();
  