import bcrypt from "bcrypt";
import { IUser, IUserAuthDTO, IUserCreateDTO, IUserDealerCreateDTO } from "../user.interface";
import { userService } from "../user.service";
import { tokenService } from "../../token/token.service";
import { ApiError } from "../../api/api.error";
import { STATUS_CODES } from "../../../enums/status-codes.enum";
import { emailService } from "../../email/email.service";
import { EMAIL_TEMPLATE } from "../../email/enums/email.enum";

class AuthService {
    // compared against when the email is unknown, so response time doesn't reveal registered emails
    private readonly dummyHash = bcrypt.hashSync("dummy-password", 10);

    public async signUpUser(user: IUserCreateDTO) {
        await userService.isEmailUnique(user.email);
        const passwordHash = await this.hashPassword(user.password);
        const newUser = await userService.createUser({ ...user, password: passwordHash });
        return await this.onSignUp(newUser);
    }

    public async signUpDealership(user: IUserDealerCreateDTO) {
        await userService.isEmailUnique(user.email);
        const passwordHash = await this.hashPassword(user.password);
        const newUser = await userService.createDealershipAdmin({ ...user, password: passwordHash });
        return await this.onSignUp(newUser);
    }

    public async signIn(dto: IUserAuthDTO) {
        const user = await userService.getByEmailWithPassword(dto.email);
        const isPasswordValid = await this.comparePassword(dto.password, user?.password ?? this.dummyHash);
        if (!isPasswordValid || !user) throw new ApiError("Invalid email or password", STATUS_CODES.unauthorized);
        if (user.isBanned) throw new ApiError("User is banned", STATUS_CODES.forbidden);
        const tokens = await tokenService.createForUser({ userId: user._id, role: user.role, tenant: user.tenant });
        return { user, tokens };
    }

    // refresh tokens are single use: the old pair is removed and a new one is issued
    public async refresh(userId: string, refreshToken: string) {
        await tokenService.deleteByRefreshToken(refreshToken);
        const user = await userService.getById(userId);
        if (user.isBanned) throw new ApiError("User is banned", STATUS_CODES.forbidden);
        return await tokenService.createForUser({ userId: user._id, role: user.role, tenant: user.tenant });
    }

    public async signOut(accessToken: string) {
        await tokenService.deleteByAccessToken(accessToken);
    }

    public async signOutEverywhere(userId: string) {
        await tokenService.deleteAllByUserId(userId);
    }

    public hashPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    public comparePassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword);
    }

    private async onSignUp(user: IUser) {
        const tokens = await tokenService.createForUser({ userId: user._id, role: user.role, tenant: user.tenant });
        emailService.sendEmailInBackground(user.email, EMAIL_TEMPLATE.welcome, { username: user.name });
        return { user, tokens };
    }
}

export const authService = new AuthService();
