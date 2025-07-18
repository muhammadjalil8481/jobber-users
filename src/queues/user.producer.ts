import { log } from "@users/logger";
import { Channel } from "amqplib";

interface DirectProducerParmas {
  channel: Channel;
  exchangeName: string;
  routingKey: string;
  message: string;
  logMessage?: string;
}
export async function publishDirectMessage({
  channel,
  exchangeName,
  routingKey,
  message,
  logMessage,
}: DirectProducerParmas) {
  try {
    if (!channel) {
      throw new Error("Channel is not defined");
    }
    await channel.assertExchange(exchangeName, "direct");
    channel.publish(exchangeName, routingKey, Buffer.from(message), {
      persistent: true,
    });
    log.info(logMessage);
  } catch (error) {
    log.error("UsersService publishDirectMessage() method error", error);
  }
}
