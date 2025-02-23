import { dal } from "@/db/dal";
import { ForbiddenError, NotFoundError, status } from "@/utils/http";
import { RBACValidator } from "@/utils/rbac";
import { WorkspaceManager } from "@/utils/workspace";

import { type WorkspaceHandler } from "./workspace.routes";

export const checkInitialization: WorkspaceHandler["CheckWorkspaceInitialization"] =
    async (c) => {
        const account = c.get("account")!;

        const manager = new WorkspaceManager(account.accountId);

        return c.json(
            { isInitialized: await manager.checkInitialization() },
            status.OK,
        );
    };

export const initialize: WorkspaceHandler["InitializeWorkspace"] = async (c) => {
    const account = c.get("account")!;
    const accountPk = c.get("accountPk")!;

    const manager = new WorkspaceManager(account.accountId);
    await manager.initialize(accountPk);

    return c.json({ message: "Workspace initialized successfully" }, status.OK);
};

export const deinitialize: WorkspaceHandler["DeinitializeWorkspace"] = async (c) => {
    const account = c.get("account")!;
    const accountPk = c.get("accountPk")!;

    const manager = new WorkspaceManager(account.accountId);
    await manager.deinitialize(accountPk);

    return c.body(null, status.NO_CONTENT);
};

export const createWorkspace: WorkspaceHandler["CreateWorkspace"] = async (c) => {
    const account = c.get("account")!;
    const accountPk = c.get("accountPk")!;
    const userPk = c.get("userPk");
    const body = c.req.valid("json");

    const manager = new WorkspaceManager(account.accountId);
    const { workspaceURL, workspace } = await manager.create(
        accountPk,
        userPk ?? null,
        body.name,
        body.containerImage,
        body.containerImageTag,
    );

    return c.json({ workspaceURL, workspace }, status.CREATED);
};

export const deleteWorkspace: WorkspaceHandler["DeleteWorkspace"] = async (c) => {
    const account = c.get("account")!;
    const accountPk = c.get("accountPk")!;
    const { workspaceId } = c.req.valid("param");

    const workspace = await dal.workspace.findByWorkspaceId(workspaceId);
    if (!workspace) {
        throw new NotFoundError({ message: "Workspace not found" });
    }
    if (workspace[0] !== accountPk) {
        throw new ForbiddenError({
            message: "You are not allowed to delete this workspace",
        });
    }

    const rbac = new RBACValidator(c);
    await rbac.validateWorkspaceAccess({ workspacePk: workspace[1], write: true });

    const manager = new WorkspaceManager(account.accountId);
    await manager.delete(workspace[1], workspace[2].workspaceId);

    return c.body(null, status.NO_CONTENT);
};

export const updateWorkspace: WorkspaceHandler["UpdateWorkspace"] = async (c) => {
    const accountPk = c.get("accountPk")!;
    const { workspaceId } = c.req.valid("param");
    const body = c.req.valid("json");

    const workspace = await dal.workspace.findByWorkspaceId(workspaceId);
    if (!workspace) {
        throw new NotFoundError({ message: "Workspace not found" });
    }
    if (workspace[0] !== accountPk) {
        throw new ForbiddenError({
            message: "You are not allowed to delete this workspace",
        });
    }

    const rbac = new RBACValidator(c);
    await rbac.validateWorkspaceAccess({ workspacePk: workspace[1], write: true });

    const updatedWorkspace = await dal.workspace.update(accountPk, workspace[1], body);

    return c.json({ workspace: updatedWorkspace }, status.OK);
};

export const getWorkspace: WorkspaceHandler["GetWorkspace"] = async (c) => {
    const accountPk = c.get("accountPk")!;
    const { workspaceId } = c.req.valid("param");

    const workspace = await dal.workspace.findByWorkspaceId(workspaceId);
    if (!workspace) {
        throw new NotFoundError({ message: "Workspace not found" });
    }
    if (workspace[0] !== accountPk) {
        throw new ForbiddenError({
            message: "You are not allowed to access this workspace",
        });
    }

    const rbac = new RBACValidator(c);
    await rbac.validateWorkspaceAccess({ workspacePk: workspace[1], read: true });

    return c.json({ workspace: workspace[2] }, status.OK);
};

export const getWorkspaces: WorkspaceHandler["GetWorkspaces"] = async (c) => {
    const accountPk = c.get("accountPk")!;
    const { offset, limit, search } = c.req.valid("query");

    const { totalCount, workspaces } = await dal.workspace.find(
        accountPk,
        search,
        limit,
        offset,
    );

    return c.json({ total: totalCount, workspaces }, status.OK);
};
