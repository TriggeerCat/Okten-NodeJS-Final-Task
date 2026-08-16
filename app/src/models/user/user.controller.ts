import { Request, Response } from "express";
import { userService } from "./user.service";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { IUser } from "./user.interface";
import { IParamsId } from "../api/req-res-types.interface";
import { tokenService } from "../token/token.service";

class UserController {
    // GET
    public async getAll(req: Request, res: Response) {
        const users = await userService.getAll();
        res.status(STATUS_CODES.ok).json(users);
    }

    public async getOne(req: Request<IParamsId>, res: Response) {
        const user = await userService.getById(req.params.id);
        res.status(STATUS_CODES.ok).json(user);
    }

    // UPDATE
    public async updateUser(req: Request<IParamsId>, res: Response) {
        const user: Partial<IUser> = req.body;
        const updatedUser = await userService.updateById(req.params.id, user);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // PREMIUM
    public async upgradeToPremium(req: Request<IParamsId>, res: Response) {
        const updatedUser = await userService.upgradeToPremium(req.params.id);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // TENANT
    public async makeUserTenant(req: Request<IParamsId>, res: Response) {
        const { tenant, role } = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const updatedUser = await userService.makeTenant(req.params.id, tenant, role);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async removeUserTenant(req: Request<IParamsId>, res: Response) {
        const { tenant, role } = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const updatedUser = await userService.removeTenant(req.params.id, tenant, role);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // PROMOTE
    public async promoteUserToSeller(req: Request<IParamsId>, res: Response) {
        const updatedUser = await userService.promoteBuyerToSeller(req.params.id);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async promoteUserToManager(req: Request<IParamsId>, res: Response) {
        const { tenant, role } = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const updatedUser = await userService.promoteToManager(req.params.id, tenant, role);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    public async demoteUserToBuyer(req: Request<IParamsId>, res: Response) {
        const { tenant, role } = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const updatedUser = await userService.demoteToBuyer(req.params.id, tenant, role);
        res.status(STATUS_CODES.ok).json(updatedUser);
    }

    // BAN
    public setUserBanStatus(banStatus: boolean) {
        return async (req: Request<IParamsId>, res: Response) => {
            const { tenant, role } = tokenService.verifyToken(
                req.headers.authorization?.split(" ")[1] ?? " ",
                "access"
            );
            const updatedUser = await userService.setBanStatus(req.params.id, banStatus, tenant, role);
            res.status(STATUS_CODES.ok).json(updatedUser);
        };
    }

    // DELETE
    public async delete(req: Request<IParamsId>, res: Response) {
        const deletedUser = await userService.delete(req.params.id);
        res.status(STATUS_CODES.ok).json(deletedUser);
    }
}

export const userController = new UserController();
