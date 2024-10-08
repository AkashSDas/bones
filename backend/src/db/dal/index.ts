import { accountDAL } from "./account";
import { userDAL } from "./user";

export const dal = {
    account: accountDAL,
    user: userDAL,
};
