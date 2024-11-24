import { dal } from "@/db/dal";
import type { AccountClient, AccountPk } from "@/db/models/account";
import type { IAMPermissionClient, IAMPermissionId } from "@/db/models/iam-permission";
import { IAM_PERMISSION_ACCESS_TYPE } from "@/db/models/iam-permission-user";
import { type UserClient, UserPk } from "@/db/models/user";
import { log } from "@/lib/logger";

import { InternalServerError } from "./http";
import { ForbiddenError } from "./http";
import { type HonoContext } from "./types";

type IAMPermissionOpts = {
    read?: boolean;
    write?: boolean;
};

export class RBACValidator {
    public isAdmin: boolean;
    public accountPk: number;
    public account: AccountClient;
    public userPk: number | null;
    public user: UserClient | null;

    constructor(c: HonoContext) {
        this.isAdmin = c.get("isAdmin") ?? false;

        const accountPk = c.get("accountPk");
        if (typeof accountPk !== "number") {
            // Account should always be set. Meaning use this after an the `authenticate` middleware has ran
            log.error(`Account PK is not set: ${accountPk}`);
            throw new InternalServerError({});
        }

        this.accountPk = accountPk;
        this.account = c.get("account")!;

        this.userPk = c.get("userPk") ?? null;
        this.user = c.get("user") ?? null;
    }

    // =========================================
    // RBAC Validators
    // =========================================

    validateAdminOnly(): void {
        if (!this.isAdmin) {
            throw new ForbiddenError({ reason: "Admin only" });
        }
    }

    async validateIAMServiceWide({ read, write }: IAMPermissionOpts): Promise<void> {
        if (read && write) {
            log.error("Only one value is allowed to be added: 'read' or 'write'");
            throw new InternalServerError({});
        }
        if (!read && !write) {
            log.error("At least one value is required: 'read' or 'write'");
            throw new InternalServerError({});
        }

        if (this.isAdmin) return;

        const [userPk] = this.checkUserBlocked();

        const [permPk, perm] = await dal.iamPermission.findIAMWidePermission(
            this.accountPk,
        );

        if (read && perm.readAll) {
            return;
        }
        if (write && perm.writeAll) {
            return;
        }

        const permMapping = await dal.iamPermissionUser.findByPermissionIdAndUserId(
            permPk,
            userPk,
        );
        const hasReadAccess = permMapping.some(
            (p) => p.accessType === IAM_PERMISSION_ACCESS_TYPE.READ,
        );
        const hasWriteAccess = permMapping.some(
            (p) => p.accessType === IAM_PERMISSION_ACCESS_TYPE.WRITE,
        );

        if (read && (hasReadAccess || hasWriteAccess)) return;
        if (write && hasWriteAccess) return;

        throw new ForbiddenError({
            message: "You don't have access IAM Service",
        });
    }

    // =========================================
    // RBAC Helpers
    // =========================================

    static async validateIAMPermissionAccess(
        accountPk: AccountPk,
        permissionId: IAMPermissionId,
    ): Promise<[number, IAMPermissionClient & { users: UserClient[] }]> {
        const perm = await dal.iamPermission.findById(permissionId, accountPk);

        if (perm === null) {
            throw new ForbiddenError({
                message: "You don't have access to this IAM permission",
            });
        }

        return perm;
    }

    // =========================================
    // Private methods
    // =========================================

    private checkUserBlocked(): [UserPk, UserClient] {
        if (this.user === null || this.userPk === null) {
            log.error("User is not set");
            throw new InternalServerError({});
        }

        if (this.user.isBlocked) {
            throw new ForbiddenError({ reason: "User is blocked" });
        }

        return [this.userPk, this.user];
    }
}
