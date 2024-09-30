import * as routes from "./iam.routes";

export const accountSignup: routes.AccountSignupHandler = async (c) => {
    return c.json({ message: "Successfully created account" });
};
