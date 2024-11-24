import { accountDAL } from "./account";
import { iamPermissionDAL } from "./iam-permission";
import { iamPermissionUserDAL } from "./iam-permission-user";
import { userDAL } from "./user";
import { workspaceDAL } from "./workspace";

/** Data access layer */
export const dal = {
    account: accountDAL,
    user: userDAL,
    workspace: workspaceDAL,
    iamPermission: iamPermissionDAL,
    iamPermissionUser: iamPermissionUserDAL,
};
