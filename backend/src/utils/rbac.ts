import { dal } from "@/db/dal";
import type { AccountClient, AccountPk } from "@/db/models/account";
import type {
    IAMPermissionClient,
    IAMPermissionId,
    IAMPermissionPk,
} from "@/db/models/iam-permission";
import {
    IAMPermissionAccessType,
    IAM_PERMISSION_ACCESS_TYPE,
} from "@/db/models/iam-permission-user";
import { type UserClient, UserPk } from "@/db/models/user";
import { type WorkspacePk } from "@/db/models/workspace";
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

        if (read && (perm.readAll || perm.writeAll)) {
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

    async validateWorkspaceServiceWide({
        read,
        write,
    }: IAMPermissionOpts): Promise<void> {
        if (read && write) {
            log.error("Only one value is allowed to be added: 'read' or 'write'");
            throw new InternalServerError({});
        }
        if (!read && !write) {
            log.error("At least one value is required: 'read' or 'write'");
            throw new InternalServerError({});
        }

        if (this.isAdmin) return;

        this.checkUserBlocked();

        const [_, perm] = await dal.iamPermission.findWorkspaceServiceWidePermission(
            this.accountPk,
        );

        if (read && (perm.readAll || perm.writeAll)) {
            return;
        }
        if (write && perm.writeAll) {
            return;
        }

        throw new ForbiddenError({
            message: "You don't have access to Workspace Service",
        });
    }

    async validateWorkspace({
        read,
        write,
        workspacePk,
    }: IAMPermissionOpts & { workspacePk: WorkspacePk }): Promise<void> {
        if (read && write) {
            log.error("Only one value is allowed to be added: 'read' or 'write'");
            throw new InternalServerError({});
        }
        if (!read && !write) {
            log.error("At least one value is required: 'read' or 'write'");
            throw new InternalServerError({});
        }

        if (this.isAdmin) return;

        let hasAccess = false;
        try {
            await this.validateWorkspaceServiceWide({ read, write });
            hasAccess = true;
        } catch (e) {
            log.error(`Workspace service wide access failed: ${e}`);
        }

        if (hasAccess) return;

        const [userPk] = this.checkUserBlocked();

        const [result, workspacePerm] = await Promise.all([
            dal.iamPermission.findWorkspacePermissionMappedToUser(
                this.accountPk,
                userPk,
                workspacePk,
            ),
            dal.iamPermission.findWorkspacePermission(this.accountPk, workspacePk),
        ]);

        if (workspacePerm === null) {
            log.error(
                `Workspace is missing permission policy: ${workspacePk} ${this.accountPk}`,
            );
            throw new InternalServerError({});
        }

        if (
            result === null &&
            !workspacePerm[1].readAll &&
            !workspacePerm[1].writeAll
        ) {
            throw new ForbiddenError({
                message: "You don't have access to this workspace",
            });
        }

        if (read && (workspacePerm[1].readAll || workspacePerm[1].writeAll)) return;
        if (write && workspacePerm[1].writeAll) return;

        if (result === null) {
            throw new InternalServerError({});
        }

        const [permPk, perm] = result;

        if (read && (perm.readAll || perm.writeAll)) {
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
    ): Promise<
        [
            IAMPermissionPk,
            IAMPermissionClient & {
                users: (UserClient & { accessType: IAMPermissionAccessType })[];
            },
        ]
    > {
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
