import { dal } from "@/db/dal";
import { log } from "@/lib/logger";
import { InternalServerError, status } from "@/utils/http";
import { RBACValidator } from "@/utils/rbac";

import { type IAMPermissionHandler as PermHandler } from "./iam-permission.routes";

export const getIAMPermissions: PermHandler["GetIAMPermissions"] = async (c) => {
    const { limit, offset, search } = c.req.valid("query");
    const accountPk = c.get("accountPk")!;

    const [totalCount, permissions] = await dal.iamPermission.findManyByAccountId(
        accountPk,
        search,
        limit,
        offset,
    );

    return c.json({ total: totalCount, permissions }, status.OK);
};

export const getIAMPermission: PermHandler["GetIAMPermission"] = async (c) => {
    const { permissionId } = c.req.valid("param");
    const accountPk = c.get("accountPk")!;

    const [_, permission] = await RBACValidator.validateIAMAccess(
        accountPk,
        permissionId,
    );

    return c.json({ permission }, status.OK);
};

export const updateIAMPermission: PermHandler["UpdateIAMPermission"] = async (c) => {
    const { permissionId } = c.req.valid("param");
    const body = c.req.valid("json");
    const accountPk = c.get("accountPk")!;

    const [permissionPk] = await RBACValidator.validateIAMAccess(
        accountPk,
        permissionId,
    );

    if (body.changeUsers) {
        if (body.changeUsers.changeType === "remove") {
            await dal.iamPermissionUser.deleteInBatch(
                permissionPk,
                body.changeUsers.userIds,
            );
        } else if (body.changeUsers.changeType === "add") {
            await dal.iamPermissionUser.createInBatch(
                permissionPk,
                body.changeUsers.userIds,
                body.changeUsers.permissionType,
                accountPk,
            );
        } else {
            log.error(`Invalid change type: ${body.changeUsers.changeType}`);
            throw new InternalServerError({});
        }

        delete body.changeUsers;
    }

    if (Object.keys(body).length > 0) {
        await dal.iamPermission.update(accountPk, permissionId, body);
    }

    const updatedPerm = (await dal.iamPermission.findById(permissionId, accountPk))!;

    return c.json({ permission: updatedPerm[1] }, status.OK);
};
