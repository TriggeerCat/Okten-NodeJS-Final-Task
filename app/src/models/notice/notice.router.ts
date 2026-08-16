import { Router } from "express";
import { commonMiddleware } from "../api/common.middleware";
import { noticeController } from "./notice.controller";
import { NoticeValidator } from "./notice.validator";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();

// GET
router.get("/", noticeController.getAll);
router.get("/id/:id", commonMiddleware.validateId, noticeController.getOneById);
router.get("/region/:region", noticeController.getManyByRegion);
router.get(
    "/premium/views/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    noticeController.getPremiumViews
);
router.get(
    "/premium/prices",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(NoticeValidator.getPremiumPrices, "body"),
    noticeController.getPremiumAvgPrices
);

// CREATE
router.post(
    "/put",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(NoticeValidator.createNotice, "body"),
    noticeController.createNotice
);

// UPDATE
router.put("/:id", commonMiddleware.validateId, noticeController.updateNotice);

// DELETE
router.delete("/:id", commonMiddleware.validateId, noticeController.delete);

// DEBUG
router.post("/debug/views/:id", commonMiddleware.validateId, noticeController.debugFillViews);

export const noticeRouter = router;
