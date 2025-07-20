import {
  IBuyerDocument,
  ISellerDocument,
} from "@muhammadjalil8481/jobber-shared";
import { log } from "@users/logger";
import {
  createBuyer,
  updateBuyerPurchasedGigsProp,
} from "@users/services/buyer.service";
import {
  getRandomSellers,
  updateSellerCancelledJobsProp,
  updateSellerCompletedJobsProp,
  updateSellerOngoingJobsProp,
  updateSellerReview,
  updateTotalGigsCount,
} from "@users/services/seller.service";
import { Channel, ConsumeMessage } from "amqplib";
import { publishDirectMessage } from "./user.producer";

interface ConsumerParams {
  channel: Channel;
  exchangeName: string;
  queueName: string;
  bindingKey: string;
  name: string;
  handler: (message: ConsumeMessage) => Promise<void>;
}

async function consumeMessage(
  data: ConsumerParams,
  exchangeType?: string
): Promise<void> {
  try {
    const { channel, exchangeName, queueName, bindingKey, handler, name } =
      data;
    if (!channel) {
      throw new Error("Channel is not defined");
    }
    await channel.assertExchange(exchangeName, exchangeType || "direct");
    const jobberQueue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });
    await channel.bindQueue(jobberQueue.queue, exchangeName, bindingKey);
    channel.consume(
      jobberQueue.queue,
      async (message: ConsumeMessage | null) => {
        try {
          await handler(message!);
          channel.ack(message!);
          log.info(
            `User service consumeMessage() consumer method: ${name} - Message processed and acknowledged`
          );
        } catch (error) {
          log.error(
            `Users service consumeMessage() consumer method: ${name}`,
            error
          );
          channel.nack(message!, false, true);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    log.error("Users service consumeMessage() method", error);
  }
}

const consumeBuyerDirectMessage = async (channel: Channel): Promise<void> => {
  await consumeMessage({
    exchangeName: "user_ex_buyer_record",
    bindingKey: "user_key_buyer_record",
    queueName: "user_queue_buyer_record",
    channel,
    name: "consumeBuyerDirectMessage()",
    handler: async (msg: ConsumeMessage) => {
      const data = JSON.parse(msg!.content.toString());
      log.info("Users service Received auth user create message:", data);

      if (data.type === "auth") {
        const { username, email, profilePicture, country, createdAt } = data;
        const buyer: IBuyerDocument = {
          username,
          email,
          profilePicture,
          country,
          purchasedGigs: [],
          createdAt,
        };
        await createBuyer(buyer);
      } else {
        const { buyerId, purchasedGigs } = JSON.parse(msg!.content.toString());
        await updateBuyerPurchasedGigsProp(buyerId, purchasedGigs, data.type);
      }
    },
  });
};

const consumeSellerDirectMessage = async (channel: Channel): Promise<void> => {
  await consumeMessage({
    exchangeName: "jobber-seller-update",
    bindingKey: "user-seller",
    queueName: "user-seller-queue",
    channel,
    name: "consumeSellerDirectMessage()",
    handler: async (msg: ConsumeMessage) => {
      const data = JSON.parse(msg!.content.toString());
      log.info("Users service Received seller user create message:", data);
      const {
        type,
        sellerId,
        ongoingJobs,
        completedJobs,
        totalEarnings,
        recentDelivery,
        gigSellerId,
        count,
      } = data;

      if (type === "create-order") {
        await updateSellerOngoingJobsProp(sellerId, ongoingJobs);
      } else if (type === "approve-order") {
        await updateSellerCompletedJobsProp({
          sellerId,
          ongoingJobs,
          completedJobs,
          totalEarnings,
          recentDelivery,
        });
      } else if (type === "update-gig-count") {
        await updateTotalGigsCount(`${gigSellerId}`, count);
      } else if (type === "cancel-order") {
        await updateSellerCancelledJobsProp(sellerId);
      }
    },
  });
};

const consumeReviewFanoutMessage = async (channel: Channel): Promise<void> => {
  await consumeMessage(
    {
      exchangeName: "jobber-review",
      bindingKey: "",
      queueName: "seller-review-queue",
      channel,
      name: "consumeSellerDirectMessage()",
      handler: async (msg: ConsumeMessage) => {
        const data = JSON.parse(msg!.content.toString());
        log.info("Users service Received review fanout message:", data);

        if (data.type === "buyer-review") {
          await updateSellerReview(data);
          await publishDirectMessage({
            channel,
            exchangeName: "jobber-update-gig",
            routingKey: "update-gig",
            message: JSON.stringify({
              type: "updateGig",
              gigReview: msg!.content.toString(),
            }),
            logMessage: "Message sent to gig service.",
          });
        }
      },
    },
    "fanout"
  );
};

const consumeSeedGigDirectMessage = async (channel: Channel): Promise<void> => {
  await consumeMessage({
    exchangeName: "jobber-gig",
    bindingKey: "get-sellers",
    queueName: "user-gig-queue",
    channel,
    name: "consumeSeedGigDirectMessage()",
    handler: async (msg: ConsumeMessage) => {
      const data = JSON.parse(msg!.content.toString());
      log.info("Users service Received seed gig message:", data);
      if (data.type === "getSellers") {
        const { count } = data;
        const sellers: ISellerDocument[] = await getRandomSellers(
          parseInt(count, 10)
        );
        await publishDirectMessage({
          channel,
          exchangeName: "jobber-seed-gig",
          routingKey: "receive-sellers",
          message: JSON.stringify({ type: "receiveSellers", sellers, count }),
          logMessage: "Message sent to gig service",
        });
      }
    },
  });
};

export {
  consumeBuyerDirectMessage,
  consumeSellerDirectMessage,
  consumeReviewFanoutMessage,
  consumeSeedGigDirectMessage,
};
