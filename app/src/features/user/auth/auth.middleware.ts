import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../api/api.error";
import { STATUS_CODES } from "../../../enums/status-codes.enum";
import { IRefreshToken, ITokenPayload } from "../../token/token.interface";
import { UserModel } from "../user.model";
import { tokenService } from "../../token/token.service";
import { PermissionsEnum } from "../../../enums/permissions.enum";
import { ILocalsToken } from "../../api/req-res-types.interface";
import { assertRolePermission } from "../../../utils/hasRolePermission";

class AuthMiddleware {
    public async checkAccessToken(req: Request, res: Response, next: NextFunction) {
        const [scheme, accessToken] = req.headers.authorization?.split(" ") ?? [];
        if (scheme !== "Bearer" || !accessToken) {
            next(new ApiError("No bearer token provided", STATUS_CODES.unauthorized));
            return;
        }
        const { userId } = tokenService.verifyToken(accessToken, "access");
        if (!(await tokenService.doesTokenExist(accessToken, "access"))) {
            next(new ApiError("Invalid token provided", STATUS_CODES.unauthorized));
            return;
        }
        // role and tenant are read from the DB, so promotions/demotions apply without re-login
        const user = await UserModel.findById(userId, { role: 1, tenant: 1, isBanned: 1 }).lean();
        if (!user) {
            next(new ApiError("User no longer exists", STATUS_CODES.unauthorized));
            return;
        }
        if (user.isBanned) {
            next(new ApiError("User is banned", STATUS_CODES.forbidden));
            return;
        }
        const tokenPayload: ITokenPayload = { userId, role: user.role, tenant: user.tenant };
        res.locals.tokenPayload = tokenPayload;
        res.locals.accessToken = accessToken;
        next();
    }

    public async checkRefreshToken(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = (req.body ?? {}) as IRefreshToken;
        if (!refreshToken || typeof refreshToken !== "string") {
            next(new ApiError("No token provided", STATUS_CODES.unauthorized));
            return;
        }
        const tokenPayload = tokenService.verifyToken(refreshToken, "refresh");
        if (!(await tokenService.doesTokenExist(refreshToken, "refresh"))) {
            next(new ApiError("Invalid token provided", STATUS_CODES.unauthorized));
            return;
        }
        res.locals.tokenPayload = tokenPayload;
        next();
    }

    // Must be placed after checkAccessToken
    public requirePermission(permission: PermissionsEnum) {
        return (req: Request, res: Response<any, ILocalsToken>, next: NextFunction) => {
            assertRolePermission(res.locals.tokenPayload.role, permission);
            next();
        };
    }
}

export const authMiddleware = new AuthMiddleware();
