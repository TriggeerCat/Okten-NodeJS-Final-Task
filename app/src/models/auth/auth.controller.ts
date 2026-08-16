import { Request, Response } from "express";
import { IUserAuthDTO, IUserCreateDTO, IUserDealerCreateDTO } from "../user/user.interface";
import { authService } from "./auth.service";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { tokenService } from "../token/token.service";
import { userService } from "../user/user.service";
import { ILocalsToken } from "../api/req-res-types.interface";

class AuthController {
    public async signUpUser(req: Request, res: Response) {
        const body: IUserCreateDTO = req.body;
        const data = await authService.signUpUser(body);
        res.status(STATUS_CODES.created).json(data);
    }

    public async signUpDealer(req: Request, res: Response) {
        const body: IUserDealerCreateDTO = req.body;
        const data = await authService.signUpDealership(body);
        res.status(STATUS_CODES.created).json(data);
    }

    public async signIn(req: Request, res: Response) {
        const dto: IUserAuthDTO = req.body;
        const data = await authService.signIn(dto);
        res.status(STATUS_CODES.ok).json(data);
    }

    public async refresh(req: Request, res: Response<any, ILocalsToken>) {
        const { userId, role, tenant } = res.locals.tokenPayload;
        const tokens = tokenService.generateAuthTokens({ userId, role, tenant });
        await tokenService.create({ ...tokens, userId: userId });
        res.status(STATUS_CODES.ok).json(tokens);
    }

    public async me(req: Request, res: Response<any, ILocalsToken>) {
        const { userId } = res.locals.tokenPayload;
        const user = await userService.getById(userId);
        res.status(STATUS_CODES.ok).json(user);
    }
}

export const authController = new AuthController();
