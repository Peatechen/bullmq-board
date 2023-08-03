import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter, ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import express from "express";
import "dotenv/config";

const redisOptions = {
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB),
};

const prefix = process.env.PREFIX;
const queueNames = (process.env.QUEUE_NAMES || "").split(",");

console.log(redisOptions, process.env.PORT);

const run = async () => {
  const queues = queueNames.map(
    (name) =>
      new BullMQAdapter(
        new Queue(name, {
          ...(prefix ? { prefix: prefix } : {}),
          connection: redisOptions,
        })
      )
  );

  const app = express();

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/");

  createBullBoard({ queues, serverAdapter });

  app.use("/", serverAdapter.getRouter());

  app.listen(process.env.PORT, () => {
    console.log(`For the UI, open http://localhost:${process.env.PORT}/`);
  });
};

run();
