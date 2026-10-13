import { Router } from "express";
import { catalogController } from "./catalog.controller";
import { authMiddleware } from "../../../user/auth/auth.middleware";
import { commonMiddleware } from "../../../api/common.middleware";
import { CatalogValidator } from "./catalog.validator";

const router = Router();

// GET
router.get("/brands", catalogController.getBrands);
router.get("/brands/:brand/models", catalogController.getModels);

// CREATE
router.post(
    "/brands",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(CatalogValidator.createBrand, "body"),
    catalogController.createBrand
);
router.post(
    "/brands/:brand/models",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(CatalogValidator.createModel, "body"),
    catalogController.createModel
);

// REPORT
router.post(
    "/report-missing",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(CatalogValidator.reportMissing, "body"),
    catalogController.reportMissing
);

export const catalogRouter = router;
