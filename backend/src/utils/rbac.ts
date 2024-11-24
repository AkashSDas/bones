import { dal } from "@/db/dal";
import { UserClient } from "@/db/models/user";
import { log } from "@/lib/logger";
import { IAMPolicySchemas } from "@/schemas/iam-permission";

import { InternalServerError } from "./http";
import { ForbiddenError } from "./http";
import { type HonoContext } from "./types";

export class RBACValidator {
    private isAdmin: boolean;
    private accountPk: number;
    private user: UserClient | null;

    constructor(private c: HonoContext) {
        this.isAdmin = c.get("isAdmin") ?? false;

        const accountPk = c.get("accountPk");
        if (typeof accountPk !== "number") {
            log.error(`Account PK is not set: ${accountPk}`);
            throw new InternalServerError({});
        }

        this.accountPk = accountPk;
        this.user = c.get("user") ?? null;
    }

    validateAdminOnly(): void {
        if (!this.isAdmin) {
            throw new ForbiddenError({ reason: "Admin only" });
        }
    }

    async validateIAMPermission(read: boolean, write: boolean): Promise<void> {
        if (read && write) {
            log.error("Only one value is allowed to be added: 'read' or 'write'");
            throw new InternalServerError({});
        }

        if (!read && !write) {
            log.error("At least one value is required: 'read' or 'write'");
            throw new InternalServerError({});
        }

        if (this.isAdmin) return;
        if (this.user === null) {
            log.error("User is not set");
            throw new InternalServerError({});
        }

        const iamPermission = await dal.iamPermission.findIAMWidePermission(
            this.accountPk,
        );

        if (iamPermission === null) {
            // It should always exist, it's created when account is created
            log.error(`IAM Permission not found for account: ${this.accountPk}`);
            throw new InternalServerError({ reason: "IAM Permission not found" });
        }

        const { success, data } = await IAMPolicySchemas.IAM.IAMService.safeParseAsync(
            iamPermission[2].policy,
        );

        if (!success) {
            log.error(`Invalid IAM Policy for account: ${this.accountPk}`);
            throw new InternalServerError({ reason: "Invalid IAM Policy" });
        } else {
            const { readAll, writeAll, readForUsers, writeForUsers } = data;

            if (readAll && read) {
                return;
            }

            if (writeAll && write) {
                return;
            }

            if (!readForUsers.includes(this.user.userId) && read) {
                throw new ForbiddenError({ reason: "Read forbidden" });
            }

            if (!writeForUsers.includes(this.user.userId) && write) {
                throw new ForbiddenError({ reason: "Write forbidden" });
            }
        }
    }
}
