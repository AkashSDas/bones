import { env } from "@/utils/env";

import * as k8s from "@kubernetes/client-node";

import { log } from "./logger";

const kc = new k8s.KubeConfig();

if (env.ENV === "development") {
    kc.loadFromDefault(); // Loads from $HOME/.kube/config or from KUBECONFIG env variable
} else if (env.K8S_CLUSTER_API_URL) {
    kc.loadFromCluster();
} else {
    log.fatal(`K8s cluster not setup for env ${env.ENV}`);
}

export const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

export const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

// ===============================
// Manage resource names in k8s
// ===============================

export const K8sKind = {
    Namespace: "Namespace",
    Pod: "Pod",
    Service: "Service",
    Ingress: "Ingress",
} as const;

export const k8sNames = {
    /** Domain using which a workspace will be accessed */
    workspaceDomain(workspaceId: string): string {
        return `${workspaceId}.${env.WORKSPACE_DOMAIN_SUFFIX}`;
    },

    workspaceNamespace(accountId: string): `workspace-${string}` {
        return `workspace-${accountId}`;
    },
    workspacePod(workspaceId: string): `workspace-pod-${string}` {
        return `workspace-pod-${workspaceId}`;
    },
    workspaceService(workspaceId: string): `workspace-service-${string}` {
        return `workspace-service-${workspaceId}`;
    },
    workspaceServicePort(portNumber: number): `port-${number}` {
        return `port-${portNumber}`;
    },
    workspaceIngress(workspaceId: string): `workspace-ingress-${string}` {
        return `workspace-ingress-${workspaceId}`;
    },

    /** Inside this container user's workspace will be running */
    workspaceMainContainer(workspaceId: string): `workspace-main-container-${string}` {
        return `workspace-main-container-${workspaceId}`;
    },
};
