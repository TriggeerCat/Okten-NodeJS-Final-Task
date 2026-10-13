import { Router } from "express";
import { commonMiddleware } from "../api/common.middleware";
import { noticeController } from "./notice.controller";
import { NoticeValidator } from "./notice.validator";
import { authMiddleware } from "../user/auth/auth.middleware";
import { paginationQuery } from "../api/pagination";
import { catalogRouter } from "./features/catalog/catalog.router";

const router = Router();

// CATALOG
router.use("/catalog", catalogRouter);

// GET
router.get("/", commonMiddleware.validate(NoticeValidator.getNotices, "query"), noticeController.getAll);
router.get(
    "/my",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(paginationQuery, "query"),
    noticeController.getMy
);
router.get(
    "/moderation",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(NoticeValidator.getModeration, "query"),
    noticeController.getModeration
);
router.get("/id/:id", commonMiddleware.validateId, noticeController.getOneById);
router.get("/manage/:id", authMiddleware.checkAccessToken, commonMiddleware.validateId, noticeController.getManaged);
router.get(
    "/region/:region",
    commonMiddleware.validate(NoticeValidator.regionParams, "params"),
    commonMiddleware.validate(paginationQuery, "query"),
    noticeController.getManyByRegion
);
router.get(
    "/premium/stats/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    noticeController.getPremiumStats
);
router.get(
    "/premium/views/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    noticeController.getPremiumViews
);
router.get(
    "/premium/prices",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(NoticeValidator.getPremiumPrices, "query"),
    noticeController.getPremiumAvgPrices
);

// CREATE
router.post(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(NoticeValidator.createNotice, "body"),
    noticeController.createNotice
);

// UPDATE
router.put(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    commonMiddleware.validate(NoticeValidator.updateNotice, "body"),
    noticeController.updateNotice
);
router.patch(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    commonMiddleware.validate(NoticeValidator.checkDescription, "body"),
    noticeController.updateDescription
);
router.patch("/:id/activate", authMiddleware.checkAccessToken, commonMiddleware.validateId, noticeController.activate);

// DELETE
router.delete("/:id", authMiddleware.checkAccessToken, commonMiddleware.validateId, noticeController.delete);

export const noticeRouter = router;
