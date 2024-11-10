import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // Loads from $HOME/.kube/config or from KUBECONFIG env variable

export const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// ===============================
// Manage resource names in k8s
// ===============================

export const k8sNames = {
    getWorkspaceNamespace(accountId: string): `workspace-${string}` {
        return `workspace-${accountId}`;
    },
};
