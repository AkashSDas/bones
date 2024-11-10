import { k8sApi, k8sNames } from "@/lib/k8s";
import { log } from "@/lib/logger";
import { BadRequestError, InternalServerError, status } from "@/utils/http";

import { type WorkspaceHandler } from "./workspace.routes";

export const initialize: WorkspaceHandler["InitializeWorkspace"] = async (c) => {
    const account = c.get("account")!;

    if (!account.isVerified) {
        throw new BadRequestError({ message: "Account not verified" });
    }

    // TODO: save initialization info in the DB once table is created

    const namespace = k8sNames.getWorkspaceNamespace(account.accountId);

    try {
        // `.readNamespace` throws error if the namespace isn't found
        await k8sApi.readNamespace(namespace);
        log.info(`Namespace ${namespace} for workspace already exists`);

        throw new BadRequestError({ message: "Workspace already initialized" });
    } catch (e) {
        if (e instanceof BadRequestError) {
            throw e;
        }

        log.info(`Creating namespace ${namespace} for workspace`);

        try {
            await k8sApi.createNamespace({
                apiVersion: "v1",
                kind: "Namespace",
                metadata: {
                    name: namespace,
                    labels: {
                        name: namespace,
                        accountId: account.accountId,
                    },
                },
            });

            return c.json({ message: "Workspace initialized successfully" }, status.OK);
        } catch (e) {
            throw new InternalServerError({
                message: "Failed to initialize workspace",
            });
        }
    }
};

export const deinitialize: WorkspaceHandler["DeinitializeWorkspace"] = async (c) => {
    const account = c.get("account")!;

    const namespace = k8sNames.getWorkspaceNamespace(account.accountId);

    await k8sApi.deleteNamespace(namespace).catch();

    return c.body(null, status.NO_CONTENT);
};
