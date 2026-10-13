import { createServer } from "node:http";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import { connectToDB } from "./db/mongoose";
import envData from "./env/env";
import { ApiError } from "./features/api/api.error";
import { apiRouter } from "./features/api/api.router";
import { cronStarter } from "./cron";
import { refreshExchangeAndPrices } from "./cron/exchangeRefresher";
import { brandService } from "./features/notice/features/brand/brand.service";
import { noticeService } from "./features/notice/notice.service";
import { STATUS_CODES } from "./enums/status-codes.enum";

const app = express();

const httpServer = createServer(app);

app.set("trust proxy", envData.TRUST_PROXY);

app.use(helmet());
app.use(cors({ origin: envData.FRONTEND_URL }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/", apiRouter);

app.use((req: Request, res: Response) => {
    res.status(STATUS_CODES.not_found).json({ status: STATUS_CODES.not_found, message: "Route not found" });
});

// express recognizes error handlers by their 4 arguments, so next has to stay
// eslint-disable-next-line no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    let status: number = STATUS_CODES.internal_server_error;
    let message = "Something went wrong";

    if (err instanceof ApiError) {
        status = err.status;
        message = err.message;
    } else if (err instanceof mongoose.Error.CastError || err instanceof mongoose.Error.ValidationError) {
        status = STATUS_CODES.bad_request;
        message = err.message;
    } else if ((err as { code?: number })?.code === 11000) {
        status = STATUS_CODES.conflict;
        message = "Resource already exists";
    } else if ((err as { type?: string })?.type === "entity.parse.failed") {
        status = STATUS_CODES.bad_request;
        message = "Malformed JSON body";
    }

    if (status >= STATUS_CODES.internal_server_error) console.error(`${req.method} ${req.originalUrl}`, err);
    res.status(status).json({ status, message });
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception", error);
    process.exit(1);
});

const start = async () => {
    await connectToDB();
    await brandService.seedDefaults();
    await noticeService.migrateLegacyNotices();
    await refreshExchangeAndPrices();
    cronStarter();

    httpServer.listen(envData.PORT, () => {
        console.log(`Server is listening on port ${envData.PORT}. Merry Christmas!`);
    });
};

start().catch((e) => {
    console.error("Failed to start the server", e);
    process.exit(1);
});
