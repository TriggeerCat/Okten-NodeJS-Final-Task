import { createServer } from "node:http";

import express, { NextFunction, Request, Response } from "express";

import { connectToDB } from "./db/mongoose";
import envData from "./env/env";
import { ApiError } from "./models/api/api.error";
import { apiRouter } from "./models/api/api.router";

const app = express();

const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", apiRouter);

app.use("/", (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).json({ status, message });
});

process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception", error);
    process.exit(1);
});

const start = async () => {
    try {
        await connectToDB();
        httpServer.listen(envData.SERVER_PORT, () => {
            console.log("Merry Christmas!");
        });
    } catch (e) {
        console.log(e);
    }
};

start().then();
