import { Router } from "express";
import { userController } from "./user.controller";
import { commonMiddleware } from "../api/common.middleware";
import { UserValidator } from "./user.validator";
import { authMiddleware } from "./auth/auth.middleware";
import { PERMS_USERS } from "../../enums/permissions.enum";
import { paginationQuery } from "../api/pagination";

const router = Router();

// GET
router.get(
    "/",
    authMiddleware.checkAccessToken,
    authMiddleware.requirePermission(PERMS_USERS.read),
    commonMiddleware.validate(paginationQuery, "query"),
    userController.getAll
);
router.get("/:id", commonMiddleware.validateId, userController.getOne);

// UPDATE
router.put(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    commonMiddleware.validate(UserValidator.updateUser, "body"),
    userController.updateUser
);

// PREMIUM
router.patch(
    "/:id/give-premium",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.upgradeToPremium
);

router.post(
    "/premium/purchase",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(UserValidator.purchasePremium, "body"),
    userController.purchasePremium
);

// TENANT
router.post(
    "/tenant/request",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(UserValidator.tenantRequest, "body"),
    userController.requestTenant
);

router.patch(
    "/:id/tenant/make",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.makeUserTenant
);

router.patch(
    "/:id/tenant/remove",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.removeUserTenant
);

// PROMOTE
router.patch(
    "/:id/promote/seller",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.promoteUserToSeller
);

router.patch(
    "/:id/promote/manager",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.promoteUserToManager
);

router.patch(
    "/:id/demote",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.demoteUserToBuyer
);

// BAN
router.patch(
    "/:id/ban",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.setUserBanStatus(true)
);

router.patch(
    "/:id/unban",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateId,
    userController.setUserBanStatus(false)
);

// DELETE
router.delete("/:id", authMiddleware.checkAccessToken, commonMiddleware.validateId, userController.delete);

export const userRouter = router;
