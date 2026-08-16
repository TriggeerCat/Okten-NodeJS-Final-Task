import { NextFunction, Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { ApiError } from "./api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { ZodError, ZodObject } from "zod";
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

    public validate(zodObject: ZodObject, type: "body" | "query") {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                switch (type) {
                    case "body":
                        req.body = await zodObject.parseAsync(req.body);
                        break;
                    case "query":
                        (req as any).validQuery = await zodObject.parseAsync(req.query);
                        break;
                }
                next();
            } catch (e) {
                if (e instanceof ZodError) next(new ApiError(fromZodError(e).message, STATUS_CODES.bad_request));
                else next();
            }
        };
    }
}

export const commonMiddleware = new CommonMiddleware();
