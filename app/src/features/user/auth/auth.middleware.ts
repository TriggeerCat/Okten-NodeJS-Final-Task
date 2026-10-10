import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../api/api.error";
import { STATUS_CODES } from "../../../enums/status-codes.enum";
import { IRefreshToken } from "../../token/token.interface";
import { tokenService } from "../../token/token.service";

class AuthMiddleware {
    public async checkAccessToken(req: Request, res: Response, next: NextFunction) {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            next(new ApiError("No auth header provided", STATUS_CODES.unauthorized));
            return;
        }
        const accessToken = authorizationHeader?.split(" ")[1];
        if (!accessToken) {
            next(new ApiError("No token provided", STATUS_CODES.unauthorized));
            return;
        }
        const tokenPayload = tokenService.verifyToken(accessToken ?? " ", "access");
        if (!(await tokenService.doesTokenExist(accessToken, "access"))) {
            next(new ApiError("Invalid token provided", STATUS_CODES.unauthorized));
            return;
        }
        if (res.locals) res.locals.tokenPayload = tokenPayload;
        next();
    }

    public async checkRefreshToken(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.body as IRefreshToken;
        if (!refreshToken) {
            next(new ApiError("No token provided", STATUS_CODES.forbidden));
            return;
        }
        const tokenPayload = tokenService.verifyToken(refreshToken, "refresh");
        if (!(await tokenService.doesTokenExist(refreshToken, "refresh"))) {
            next(new ApiError("Invalid token provided", STATUS_CODES.forbidden));
            return;
        }
        if (req.res?.locals) req.res.locals.tokenPayload = tokenPayload;
        next();
    }
}

export const authMiddleware = new AuthMiddleware();
