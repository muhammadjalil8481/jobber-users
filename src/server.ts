import { Application } from "express";
import { config } from "./config";
import { log } from "./logger";
import { databaseConnection } from "./database";
import { elasticsearch } from "./elasticsearch";
import { Channel } from "amqplib";
import { createConnection } from "./queues/connection";

const SERVER_PORT = config.PORT || 4003;
export let rabbitMQChannel: Channel;

function startServer(app: Application) {
  try {
    app.listen(config.PORT, async () => {
      log.info(`Users service running on port ${SERVER_PORT}`);
      elasticsearch.checkConnection();
      databaseConnection();
      rabbitMQChannel = (await createConnection()) as Channel;
    });
  } catch (error) {
    log.error(`Users service error startServer() Error : `, error);
  }
}

export { startServer };
