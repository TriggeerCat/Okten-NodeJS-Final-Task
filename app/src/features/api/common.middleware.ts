import { NextFunction, Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { ApiError } from "./api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { ZodError, ZodType } from "zod";
import { fromZodError } from "zod-validation-error";

class CommonMiddleware {
    public validateId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        if (!isObjectIdOrHexString(id)) {
            next(new ApiError("Invalid id", STATUS_CODES.bad_request));
            return;
        }
        next();
    }

    // Express 5 makes req.query read-only, so the parsed query is stored in res.locals.validQuery
    public validate(zodSchema: ZodType, type: "body" | "query" | "params") {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                switch (type) {
                    case "body":
                        req.body = await zodSchema.parseAsync(req.body ?? {});
                        break;
                    case "query":
                        res.locals.validQuery = await zodSchema.parseAsync(req.query);
                        break;
                    case "params":
                        await zodSchema.parseAsync(req.params);
                        break;
                }
                next();
            } catch (e) {
                if (e instanceof ZodError) next(new ApiError(fromZodError(e).message, STATUS_CODES.bad_request));
                else next(e);
            }
        };
    }
}

export const commonMiddleware = new CommonMiddleware();
