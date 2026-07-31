import { Router } from "express";
import { commonMiddleware } from "../api/common.middleware";
import { UserValidator } from "../user/user.validator";
import { authMiddleware } from "./auth.middleware";
import { authController } from "./auth.controller";

const router = Router();

router.post("/sign-up", commonMiddleware.validate(UserValidator.createUser, "body"), authController.signUpUser);
router.post(
    "/sign-up-dealer",
    commonMiddleware.validate(UserValidator.createUserDealer, "body"),
    authController.signUpDealer
);
router.post("/sign-in", authController.signIn);
router.post("/refresh", authMiddleware.checkRefreshToken, authController.refresh);
router.get("/me", authMiddleware.checkAccessToken, authController.me);

export const authRouter = router;
