import { status } from "@/utils/http";
import { WorkspaceManager } from "@/utils/workspace";

import { type WorkspaceHandler } from "./workspace.routes";

export const initialize: WorkspaceHandler["InitializeWorkspace"] = async (c) => {
    const account = c.get("account")!;

    const manager = new WorkspaceManager(account.accountId);
    await manager.initialize();

    return c.json({ message: "Workspace initialized successfully" }, status.OK);
};

export const deinitialize: WorkspaceHandler["DeinitializeWorkspace"] = async (c) => {
    const account = c.get("account")!;

    const manager = new WorkspaceManager(account.accountId);
    await manager.deinitialize();

    return c.body(null, status.NO_CONTENT);
};

export const createWorkspace: WorkspaceHandler["CreateWorkspace"] = async (c) => {
    const account = c.get("account")!;
    const body = c.req.valid("json");

    const manager = new WorkspaceManager(account.accountId);
    const workspaceURL = await manager.create(
        body.containerImage,
        body.containerImageTag,
    );

    return c.json({ workspaceURL }, status.CREATED);
};

export const deleteWorkspace: WorkspaceHandler["DeleteWorkspace"] = async (c) => {
    const account = c.get("account")!;
    const { workspaceId } = c.req.valid("param");

    const manager = new WorkspaceManager(account.accountId);
    await manager.delete(workspaceId);

    return c.body(null, status.NO_CONTENT);
};
