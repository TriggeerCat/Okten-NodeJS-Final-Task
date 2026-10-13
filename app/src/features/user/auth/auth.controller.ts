import { Request, Response } from "express";
import { IUserAuthDTO, IUserCreateDTO, IUserDealerCreateDTO } from "../user.interface";
import { authService } from "./auth.service";
import { STATUS_CODES } from "../../../enums/status-codes.enum";
import { userService } from "../user.service";
import { ILocalsToken } from "../../api/req-res-types.interface";
import { IRefreshToken } from "../../token/token.interface";

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
        const { refreshToken } = req.body as IRefreshToken;
        const tokens = await authService.refresh(res.locals.tokenPayload.userId, refreshToken);
        res.status(STATUS_CODES.ok).json(tokens);
    }

    public async signOut(req: Request, res: Response<any, ILocalsToken & { accessToken: string }>) {
        await authService.signOut(res.locals.accessToken);
        res.status(STATUS_CODES.no_content).end();
    }

    public async signOutEverywhere(req: Request, res: Response<any, ILocalsToken>) {
        await authService.signOutEverywhere(res.locals.tokenPayload.userId);
        res.status(STATUS_CODES.no_content).end();
    }

    public async me(req: Request, res: Response<any, ILocalsToken>) {
        const { userId } = res.locals.tokenPayload;
        const user = await userService.getById(userId);
        res.status(STATUS_CODES.ok).json(user);
    }
}

export const authController = new AuthController();
