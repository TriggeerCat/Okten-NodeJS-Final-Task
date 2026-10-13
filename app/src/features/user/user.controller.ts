import { Request, Response } from "express";
import { userService } from "./user.service";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { IUserUpdateDTO } from "./user.interface";
import { ILocalsToken, ILocalsTokenQuery, IParamsId } from "../api/req-res-types.interface";
import { IPaginationQuery } from "../api/pagination";

class UserController {
    // GET
    public async getAll(req: Request, res: Response<any, ILocalsTokenQuery<IPaginationQuery>>) {
        const users = await userService.getAll(res.locals.validQuery, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(users);
    }

    public async getOne(req: Request<IParamsId>, res: Response) {
        const user = await userService.getById(req.params.id);
        res.status(STATUS_CODES.ok).json(user);
    }

    // UPDATE
    public async updateUser(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const user: IUserUpdateDTO = req.body;
        const updatedUser = await userService.updateById(req.params.id, user, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // PREMIUM
    public async upgradeToPremium(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.upgradeToPremium(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async purchasePremium(req: Request, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.purchasePremium(res.locals.tokenPayload, req.body.cardNumber);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // TENANT
    public async requestTenant(req: Request, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.requestTenant(res.locals.tokenPayload, req.body.tenant);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async makeUserTenant(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.makeTenant(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async removeUserTenant(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.removeTenant(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // PROMOTE
    public async promoteUserToSeller(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.promoteBuyerToSeller(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async promoteUserToManager(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.promoteToManager(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async demoteUserToBuyer(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedUser = await userService.demoteToBuyer(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // BAN
    public setUserBanStatus(banStatus: boolean) {
        return async (req: Request<IParamsId>, res: Response<any, ILocalsToken>) => {
            const updatedUser = await userService.setBanStatus(req.params.id, banStatus, res.locals.tokenPayload);
            res.status(STATUS_CODES.ok).json(updatedUser);
        };
    }

    // DELETE
    public async delete(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        await userService.delete(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.no_content).end();
    }
}

export const userController = new UserController();
