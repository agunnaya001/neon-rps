import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env.PORT;
const port = Number(rawPort ?? "5000");

if (rawPort == null) {
  logger.info({ port }, "PORT not provided; using default port");
}

if (Number.isNaN(port) || port <= 0) {
  logger.error({ rawPort }, `Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
