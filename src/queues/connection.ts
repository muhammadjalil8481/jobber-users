import client, { Channel, ChannelModel } from "amqplib";
import { log } from "@users/logger";
import { config } from "@users/config";
import {
  consumeBuyerDirectMessage,
  consumeReviewFanoutMessage,
  consumeSeedGigDirectMessage,
  consumeSellerDirectMessage,
} from "./user.consumer";

async function createConnection(): Promise<Channel | undefined> {
  let retries = 0;
  log.info(
    `Users service createConnection() method: Connecting to RabbitMQ ${config.RABBITMQ_ENDPOINT}...`
  );
  try {
    const connection: ChannelModel = await client.connect(
      `${config.RABBITMQ_ENDPOINT}`
    );
    const channel: Channel = await connection.createChannel();
    log.info("Users service connected to RabbitMQ successfully");

    await consumeBuyerDirectMessage(channel);
    await consumeSellerDirectMessage(channel);
    await consumeReviewFanoutMessage(channel);
    await consumeSeedGigDirectMessage(channel);

    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    retries++;
    if (retries >= 3) {
      log.error("Users service createConnection() method", error);
      process.exit(1);
    }
  }
}

function closeConnection(channel: Channel, connection: ChannelModel): void {
  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });
}
export { createConnection };
