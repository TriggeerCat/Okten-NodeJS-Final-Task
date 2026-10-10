import bcrypt from "bcrypt";
import { IUserAuthDTO, IUserDealerCreateDTO, IUserCreateDTO } from "../user.interface";
import { userService } from "../user.service";
import { ITokenPayload } from "../../token/token.interface";
import { tokenService } from "../../token/token.service";
import { ApiError } from "../../api/api.error";
import { STATUS_CODES } from "../../../enums/status-codes.enum";

class AuthService {
    public async signUpUser(user: IUserCreateDTO) {
        await userService.isEmailUnique(user.email);
        const passwordHash = await this.hashPassword(user.password);
        const newUser = await userService.createUser({ ...user, password: passwordHash });
        const tokenPayload: ITokenPayload = {
            userId: newUser._id,
            role: newUser.role,
            tenant: newUser.tenant
        };
        const tokens = tokenService.generateAuthTokens(tokenPayload);
        await tokenService.create({ ...tokens, userId: newUser._id });
        return { user: newUser, tokens };
    }

    public async signUpDealership(user: IUserDealerCreateDTO) {
        await userService.isEmailUnique(user.email);
        const passwordHash = await this.hashPassword(user.password);
        const newUser = await userService.createDealershipAdmin({ ...user, password: passwordHash });
        const tokenPayload: ITokenPayload = {
            userId: newUser._id,
            role: newUser.role,
            tenant: newUser.tenant
        };
        const tokens = tokenService.generateAuthTokens(tokenPayload);
        await tokenService.create({ ...tokens, userId: newUser._id });
        return { user: newUser, tokens };
    }

    public async signIn(dto: IUserAuthDTO) {
        const user = await userService.getByEmail(dto.email);
        const isPasswordValid = await this.comparePassword(dto.password, user?.password ?? "");
        if (!isPasswordValid || !user) throw new ApiError("Invalid email or password", STATUS_CODES.unauthorized);
        if (user.isBanned) throw new ApiError("User is banned", STATUS_CODES.unauthorized);
        const tokens = tokenService.generateAuthTokens({
            userId: user._id,
            role: user.role,
            tenant: user.tenant
        });
        await tokenService.create({ ...tokens, userId: user._id });
        return { user, tokens };
    }

    public hashPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    public comparePassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword);
    }
}

export const authService = new AuthService();
