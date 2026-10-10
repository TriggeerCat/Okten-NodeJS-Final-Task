import { Router } from "express";
import { userRouter } from "../user/user.router";
import { authRouter } from "../user/auth/auth.router";
import { noticeRouter } from "../notice/notice.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/notice", noticeRouter);

export const apiRouter = router;
