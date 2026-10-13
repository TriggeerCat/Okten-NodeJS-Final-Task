import { Router } from "express";
import rateLimit from "express-rate-limit";
import { commonMiddleware } from "../../api/common.middleware";
import { UserValidator } from "../user.validator";
import { authMiddleware } from "./auth.middleware";
import { authController } from "./auth.controller";

const router = Router();

// slows down password brute forcing and mass sign-ups
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { status: 429, message: "Too many attempts, try again later" }
});

router.post(
    "/sign-up",
    authLimiter,
    commonMiddleware.validate(UserValidator.createUser, "body"),
    authController.signUpUser
);
router.post(
    "/sign-up-dealer",
    authLimiter,
    commonMiddleware.validate(UserValidator.createUserDealer, "body"),
    authController.signUpDealer
);
router.post("/sign-in", authLimiter, commonMiddleware.validate(UserValidator.signIn, "body"), authController.signIn);
router.post("/refresh", authMiddleware.checkRefreshToken, authController.refresh);
router.post("/sign-out", authMiddleware.checkAccessToken, authController.signOut);
router.post("/sign-out-all", authMiddleware.checkAccessToken, authController.signOutEverywhere);
router.get("/me", authMiddleware.checkAccessToken, authController.me);

export const authRouter = router;
