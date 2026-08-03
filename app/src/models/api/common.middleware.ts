import { NextFunction, Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { ApiError } from "./api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { tokenService } from "../token/token.service";
import { ZodError, ZodObject } from "zod";
import { fromZodError } from "zod-validation-error";
import { ROLE_PERMISSIONS, RoleEnum } from "../../enums/role.enum";
import { PermissionsEnum } from "../../enums/permissions.enum";

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

    public validateRoleFromToken(role: RoleEnum) {
        return (req: Request, res: Response, next: NextFunction) => {
            const tokenPayload = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
            if (tokenPayload.role !== role) {
                next(new ApiError("Wrong role provided!", STATUS_CODES.bad_request));
                return;
            }
            next();
        };
    }

    public validateRolePermissions(permission: PermissionsEnum) {
        return (req: Request, res: Response, next: NextFunction) => {
            const tokenPayload = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
            if (!ROLE_PERMISSIONS[tokenPayload.role].includes(permission)) {
                next(new ApiError("Role does not have that permission!", STATUS_CODES.bad_request));
                return;
            }
            next();
        };
    }
}

export const commonMiddleware = new CommonMiddleware();
