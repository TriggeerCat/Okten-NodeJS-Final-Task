import { Router } from "express";
import { commonMiddleware } from "../api/common.middleware";
import { noticeController } from "./notice.controller";
import { NoticeValidator } from "./notice.validator";
import { PERMS_NOTICE } from "../../enums/permissions.enum";

const router = Router();

router.get("/", noticeController.getAll);
router.get("/:id", commonMiddleware.validateId, noticeController.getOne);
router.post(
    "/",
    commonMiddleware.validateRolePermissions(PERMS_NOTICE.create),
    commonMiddleware.validate(NoticeValidator.createNotice, "body"),
    noticeController.createNotice
);
router.put("/:id", commonMiddleware.validateId, noticeController.updateNotice);
router.delete("/:id", commonMiddleware.validateId, noticeController.delete);

export const noticeRouter = router;
