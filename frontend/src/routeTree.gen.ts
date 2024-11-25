/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./routes/__root"
import { Route as IndexImport } from "./routes/index"
import { Route as WorkspaceIndexImport } from "./routes/workspace/index"
import { Route as IamIndexImport } from "./routes/iam/index"
import { Route as WorkspaceWorkspaceIdImport } from "./routes/workspace/$workspaceId"
import { Route as AuthSignupImport } from "./routes/auth/signup"
import { Route as AuthResetPasswordImport } from "./routes/auth/reset-password"
import { Route as AuthLoginImport } from "./routes/auth/login"
import { Route as AuthForgotPasswordImport } from "./routes/auth/forgot-password"
import { Route as AuthActivateImport } from "./routes/auth/activate"
import { Route as IamUsersIndexImport } from "./routes/iam/users/index"
import { Route as IamPoliciesIndexImport } from "./routes/iam/policies/index"
import { Route as IamUsersNewImport } from "./routes/iam/users/new"
import { Route as IamUsersUserIdImport } from "./routes/iam/users/$userId"
import { Route as IamPoliciesUsersImport } from "./routes/iam/policies/users"
import { Route as IamPoliciesPolicyIdImport } from "./routes/iam/policies/$policyId"

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

const WorkspaceIndexRoute = WorkspaceIndexImport.update({
  id: "/workspace/",
  path: "/workspace/",
  getParentRoute: () => rootRoute,
} as any)

const IamIndexRoute = IamIndexImport.update({
  id: "/iam/",
  path: "/iam/",
  getParentRoute: () => rootRoute,
} as any)

const WorkspaceWorkspaceIdRoute = WorkspaceWorkspaceIdImport.update({
  id: "/workspace/$workspaceId",
  path: "/workspace/$workspaceId",
  getParentRoute: () => rootRoute,
} as any)

const AuthSignupRoute = AuthSignupImport.update({
  id: "/auth/signup",
  path: "/auth/signup",
  getParentRoute: () => rootRoute,
} as any)

const AuthResetPasswordRoute = AuthResetPasswordImport.update({
  id: "/auth/reset-password",
  path: "/auth/reset-password",
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: "/auth/login",
  path: "/auth/login",
  getParentRoute: () => rootRoute,
} as any)

const AuthForgotPasswordRoute = AuthForgotPasswordImport.update({
  id: "/auth/forgot-password",
  path: "/auth/forgot-password",
  getParentRoute: () => rootRoute,
} as any)

const AuthActivateRoute = AuthActivateImport.update({
  id: "/auth/activate",
  path: "/auth/activate",
  getParentRoute: () => rootRoute,
} as any)

const IamUsersIndexRoute = IamUsersIndexImport.update({
  id: "/iam/users/",
  path: "/iam/users/",
  getParentRoute: () => rootRoute,
} as any)

const IamPoliciesIndexRoute = IamPoliciesIndexImport.update({
  id: "/iam/policies/",
  path: "/iam/policies/",
  getParentRoute: () => rootRoute,
} as any)

const IamUsersNewRoute = IamUsersNewImport.update({
  id: "/iam/users/new",
  path: "/iam/users/new",
  getParentRoute: () => rootRoute,
} as any)

const IamUsersUserIdRoute = IamUsersUserIdImport.update({
  id: "/iam/users/$userId",
  path: "/iam/users/$userId",
  getParentRoute: () => rootRoute,
} as any)

const IamPoliciesUsersRoute = IamPoliciesUsersImport.update({
  id: "/iam/policies/users",
  path: "/iam/policies/users",
  getParentRoute: () => rootRoute,
} as any)

const IamPoliciesPolicyIdRoute = IamPoliciesPolicyIdImport.update({
  id: "/iam/policies/$policyId",
  path: "/iam/policies/$policyId",
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/"
      path: "/"
      fullPath: "/"
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/auth/activate": {
      id: "/auth/activate"
      path: "/auth/activate"
      fullPath: "/auth/activate"
      preLoaderRoute: typeof AuthActivateImport
      parentRoute: typeof rootRoute
    }
    "/auth/forgot-password": {
      id: "/auth/forgot-password"
      path: "/auth/forgot-password"
      fullPath: "/auth/forgot-password"
      preLoaderRoute: typeof AuthForgotPasswordImport
      parentRoute: typeof rootRoute
    }
    "/auth/login": {
      id: "/auth/login"
      path: "/auth/login"
      fullPath: "/auth/login"
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof rootRoute
    }
    "/auth/reset-password": {
      id: "/auth/reset-password"
      path: "/auth/reset-password"
      fullPath: "/auth/reset-password"
      preLoaderRoute: typeof AuthResetPasswordImport
      parentRoute: typeof rootRoute
    }
    "/auth/signup": {
      id: "/auth/signup"
      path: "/auth/signup"
      fullPath: "/auth/signup"
      preLoaderRoute: typeof AuthSignupImport
      parentRoute: typeof rootRoute
    }
    "/workspace/$workspaceId": {
      id: "/workspace/$workspaceId"
      path: "/workspace/$workspaceId"
      fullPath: "/workspace/$workspaceId"
      preLoaderRoute: typeof WorkspaceWorkspaceIdImport
      parentRoute: typeof rootRoute
    }
    "/iam/": {
      id: "/iam/"
      path: "/iam"
      fullPath: "/iam"
      preLoaderRoute: typeof IamIndexImport
      parentRoute: typeof rootRoute
    }
    "/workspace/": {
      id: "/workspace/"
      path: "/workspace"
      fullPath: "/workspace"
      preLoaderRoute: typeof WorkspaceIndexImport
      parentRoute: typeof rootRoute
    }
    "/iam/policies/$policyId": {
      id: "/iam/policies/$policyId"
      path: "/iam/policies/$policyId"
      fullPath: "/iam/policies/$policyId"
      preLoaderRoute: typeof IamPoliciesPolicyIdImport
      parentRoute: typeof rootRoute
    }
    "/iam/policies/users": {
      id: "/iam/policies/users"
      path: "/iam/policies/users"
      fullPath: "/iam/policies/users"
      preLoaderRoute: typeof IamPoliciesUsersImport
      parentRoute: typeof rootRoute
    }
    "/iam/users/$userId": {
      id: "/iam/users/$userId"
      path: "/iam/users/$userId"
      fullPath: "/iam/users/$userId"
      preLoaderRoute: typeof IamUsersUserIdImport
      parentRoute: typeof rootRoute
    }
    "/iam/users/new": {
      id: "/iam/users/new"
      path: "/iam/users/new"
      fullPath: "/iam/users/new"
      preLoaderRoute: typeof IamUsersNewImport
      parentRoute: typeof rootRoute
    }
    "/iam/policies/": {
      id: "/iam/policies/"
      path: "/iam/policies"
      fullPath: "/iam/policies"
      preLoaderRoute: typeof IamPoliciesIndexImport
      parentRoute: typeof rootRoute
    }
    "/iam/users/": {
      id: "/iam/users/"
      path: "/iam/users"
      fullPath: "/iam/users"
      preLoaderRoute: typeof IamUsersIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute
  "/auth/activate": typeof AuthActivateRoute
  "/auth/forgot-password": typeof AuthForgotPasswordRoute
  "/auth/login": typeof AuthLoginRoute
  "/auth/reset-password": typeof AuthResetPasswordRoute
  "/auth/signup": typeof AuthSignupRoute
  "/workspace/$workspaceId": typeof WorkspaceWorkspaceIdRoute
  "/iam": typeof IamIndexRoute
  "/workspace": typeof WorkspaceIndexRoute
  "/iam/policies/$policyId": typeof IamPoliciesPolicyIdRoute
  "/iam/policies/users": typeof IamPoliciesUsersRoute
  "/iam/users/$userId": typeof IamUsersUserIdRoute
  "/iam/users/new": typeof IamUsersNewRoute
  "/iam/policies": typeof IamPoliciesIndexRoute
  "/iam/users": typeof IamUsersIndexRoute
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute
  "/auth/activate": typeof AuthActivateRoute
  "/auth/forgot-password": typeof AuthForgotPasswordRoute
  "/auth/login": typeof AuthLoginRoute
  "/auth/reset-password": typeof AuthResetPasswordRoute
  "/auth/signup": typeof AuthSignupRoute
  "/workspace/$workspaceId": typeof WorkspaceWorkspaceIdRoute
  "/iam": typeof IamIndexRoute
  "/workspace": typeof WorkspaceIndexRoute
  "/iam/policies/$policyId": typeof IamPoliciesPolicyIdRoute
  "/iam/policies/users": typeof IamPoliciesUsersRoute
  "/iam/users/$userId": typeof IamUsersUserIdRoute
  "/iam/users/new": typeof IamUsersNewRoute
  "/iam/policies": typeof IamPoliciesIndexRoute
  "/iam/users": typeof IamUsersIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/": typeof IndexRoute
  "/auth/activate": typeof AuthActivateRoute
  "/auth/forgot-password": typeof AuthForgotPasswordRoute
  "/auth/login": typeof AuthLoginRoute
  "/auth/reset-password": typeof AuthResetPasswordRoute
  "/auth/signup": typeof AuthSignupRoute
  "/workspace/$workspaceId": typeof WorkspaceWorkspaceIdRoute
  "/iam/": typeof IamIndexRoute
  "/workspace/": typeof WorkspaceIndexRoute
  "/iam/policies/$policyId": typeof IamPoliciesPolicyIdRoute
  "/iam/policies/users": typeof IamPoliciesUsersRoute
  "/iam/users/$userId": typeof IamUsersUserIdRoute
  "/iam/users/new": typeof IamUsersNewRoute
  "/iam/policies/": typeof IamPoliciesIndexRoute
  "/iam/users/": typeof IamUsersIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | "/"
    | "/auth/activate"
    | "/auth/forgot-password"
    | "/auth/login"
    | "/auth/reset-password"
    | "/auth/signup"
    | "/workspace/$workspaceId"
    | "/iam"
    | "/workspace"
    | "/iam/policies/$policyId"
    | "/iam/policies/users"
    | "/iam/users/$userId"
    | "/iam/users/new"
    | "/iam/policies"
    | "/iam/users"
  fileRoutesByTo: FileRoutesByTo
  to:
    | "/"
    | "/auth/activate"
    | "/auth/forgot-password"
    | "/auth/login"
    | "/auth/reset-password"
    | "/auth/signup"
    | "/workspace/$workspaceId"
    | "/iam"
    | "/workspace"
    | "/iam/policies/$policyId"
    | "/iam/policies/users"
    | "/iam/users/$userId"
    | "/iam/users/new"
    | "/iam/policies"
    | "/iam/users"
  id:
    | "__root__"
    | "/"
    | "/auth/activate"
    | "/auth/forgot-password"
    | "/auth/login"
    | "/auth/reset-password"
    | "/auth/signup"
    | "/workspace/$workspaceId"
    | "/iam/"
    | "/workspace/"
    | "/iam/policies/$policyId"
    | "/iam/policies/users"
    | "/iam/users/$userId"
    | "/iam/users/new"
    | "/iam/policies/"
    | "/iam/users/"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthActivateRoute: typeof AuthActivateRoute
  AuthForgotPasswordRoute: typeof AuthForgotPasswordRoute
  AuthLoginRoute: typeof AuthLoginRoute
  AuthResetPasswordRoute: typeof AuthResetPasswordRoute
  AuthSignupRoute: typeof AuthSignupRoute
  WorkspaceWorkspaceIdRoute: typeof WorkspaceWorkspaceIdRoute
  IamIndexRoute: typeof IamIndexRoute
  WorkspaceIndexRoute: typeof WorkspaceIndexRoute
  IamPoliciesPolicyIdRoute: typeof IamPoliciesPolicyIdRoute
  IamPoliciesUsersRoute: typeof IamPoliciesUsersRoute
  IamUsersUserIdRoute: typeof IamUsersUserIdRoute
  IamUsersNewRoute: typeof IamUsersNewRoute
  IamPoliciesIndexRoute: typeof IamPoliciesIndexRoute
  IamUsersIndexRoute: typeof IamUsersIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthActivateRoute: AuthActivateRoute,
  AuthForgotPasswordRoute: AuthForgotPasswordRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthResetPasswordRoute: AuthResetPasswordRoute,
  AuthSignupRoute: AuthSignupRoute,
  WorkspaceWorkspaceIdRoute: WorkspaceWorkspaceIdRoute,
  IamIndexRoute: IamIndexRoute,
  WorkspaceIndexRoute: WorkspaceIndexRoute,
  IamPoliciesPolicyIdRoute: IamPoliciesPolicyIdRoute,
  IamPoliciesUsersRoute: IamPoliciesUsersRoute,
  IamUsersUserIdRoute: IamUsersUserIdRoute,
  IamUsersNewRoute: IamUsersNewRoute,
  IamPoliciesIndexRoute: IamPoliciesIndexRoute,
  IamUsersIndexRoute: IamUsersIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/auth/activate",
        "/auth/forgot-password",
        "/auth/login",
        "/auth/reset-password",
        "/auth/signup",
        "/workspace/$workspaceId",
        "/iam/",
        "/workspace/",
        "/iam/policies/$policyId",
        "/iam/policies/users",
        "/iam/users/$userId",
        "/iam/users/new",
        "/iam/policies/",
        "/iam/users/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/auth/activate": {
      "filePath": "auth/activate.tsx"
    },
    "/auth/forgot-password": {
      "filePath": "auth/forgot-password.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/auth/reset-password": {
      "filePath": "auth/reset-password.tsx"
    },
    "/auth/signup": {
      "filePath": "auth/signup.tsx"
    },
    "/workspace/$workspaceId": {
      "filePath": "workspace/$workspaceId.tsx"
    },
    "/iam/": {
      "filePath": "iam/index.tsx"
    },
    "/workspace/": {
      "filePath": "workspace/index.tsx"
    },
    "/iam/policies/$policyId": {
      "filePath": "iam/policies/$policyId.tsx"
    },
    "/iam/policies/users": {
      "filePath": "iam/policies/users.tsx"
    },
    "/iam/users/$userId": {
      "filePath": "iam/users/$userId.tsx"
    },
    "/iam/users/new": {
      "filePath": "iam/users/new.tsx"
    },
    "/iam/policies/": {
      "filePath": "iam/policies/index.tsx"
    },
    "/iam/users/": {
      "filePath": "iam/users/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
