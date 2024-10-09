import { accountDAL } from "./account";
import { userDAL } from "./user";

/** Data access layer */
export const dal = {
    account: accountDAL,
    user: userDAL,
};
