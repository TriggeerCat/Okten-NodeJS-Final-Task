import { brandService } from "../brand/brand.service";
import { modelService } from "../model/model.service";
import { ICarBrandCreateDTO } from "../brand/brand.interface";
import { ITokenPayload } from "../../../token/token.interface";
import { assertRolePermission } from "../../../../utils/hasRolePermission";
import { PERMS_CATALOG } from "../../../../enums/permissions.enum";
import { ApiError } from "../../../api/api.error";
import { STATUS_CODES } from "../../../../enums/status-codes.enum";
import { userService } from "../../../user/user.service";
import { emailService } from "../../../email/email.service";
import { EMAIL_TEMPLATE } from "../../../email/enums/email.enum";

class CatalogService {
    // GET
    public getBrands() {
        return brandService.getAll();
    }

    public async getModels(brand: string) {
        const carBrand = await brandService.getWithError(brand);
        return await modelService.getAllByBrand(carBrand._id);
    }

    // CREATE
    public createBrand(dto: ICarBrandCreateDTO, actor: ITokenPayload) {
        this.assertCanEdit(actor);
        return brandService.create(dto);
    }

    public async createModel(brand: string, model: string, actor: ITokenPayload) {
        this.assertCanEdit(actor);
        const carBrand = await brandService.getWithError(brand);
        return await modelService.create(carBrand._id, model);
    }

    // REPORT
    public async reportMissing(brand: string, model: string | undefined, actor: ITokenPayload) {
        const user = await userService.getById(actor.userId);
        const adminEmails = await userService.getPlatformAdminEmails();
        emailService.sendEmailInBackground(adminEmails, EMAIL_TEMPLATE.missingCatalog, {
            userName: user.name,
            userEmail: user.email,
            brand,
            model
        });
    }

    // VALIDATION
    public async assertValidPair(brand: string, model: string) {
        const carBrand = await brandService.getOne(brand);
        if (!carBrand) throw new ApiError("Not a valid brand", STATUS_CODES.bad_request);
        if (!(await modelService.getOne(carBrand._id, model)))
            throw new ApiError("Not a valid model for this brand", STATUS_CODES.bad_request);
    }

    private assertCanEdit(actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_CATALOG.create);
        if (actor.tenant) throw new ApiError("Only platform staff can edit the catalog", STATUS_CODES.forbidden);
    }
}

export const catalogService = new CatalogService();
