import { Logger } from "winston";
import {
  LogLevel,
  winstonLogger,
} from "@muhammadjalil8481/jobber-shared";

const serviceName = "users-service";

const log: Logger = winstonLogger({
  name: serviceName,
  level: LogLevel.DEBUG,
});

export { log };
