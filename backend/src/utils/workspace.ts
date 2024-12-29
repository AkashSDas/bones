import { env } from "./env";

import * as k8s from "@kubernetes/client-node";
import { z } from "zod";

import { WorkspaceSchemas } from "@/api/workspace/workspace.schema";
import { dal } from "@/db/dal";
import { type AccountId, type AccountPk } from "@/db/models/account";
import { UserPk } from "@/db/models/user";
import { WorkspaceClient, WorkspaceId, WorkspacePk } from "@/db/models/workspace";
import { k8sApi, k8sKind, k8sNames, k8sNetworkingApi } from "@/lib/k8s";
import { log } from "@/lib/logger";

import { BadRequestError, InternalServerError } from "./http";

/** K8s config version */
const API_VERSION = "v1";
const NETWORKING_API_VERSION = "networking.k8s.io/v1";

/** Service offered by Bones */
const SERVICE_NAME = "workspace";

/** This class takes care of all of management related to workspaces */
export class WorkspaceManager {
    constructor(private accountId: AccountId) {}

    /** Check workspace initialized for account */
    async checkInitialization(): Promise<boolean> {
        const namespace = k8sNames.workspaceNamespace(this.accountId);

        try {
            await k8sApi.readNamespace(namespace);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create a namespace for this account. This is will keep all of kubernetes resources
     * under same namespace. Also, if I delete the namespace, all resources in it will be
     * terminated (easy peasy)
     **/
    async initialize(accountPk: AccountPk): Promise<string> {
        const namespace = k8sNames.workspaceNamespace(this.accountId);

        try {
            await k8sApi.readNamespace(namespace);
            log.info(`Namespace '${namespace}' for workspace already exists`);
            throw new BadRequestError({ message: "Workspace already initialized" });
        } catch (e) {
            log.error(`Failed to read namespace: ${e}`);

            if (e instanceof BadRequestError) {
                throw e;
            }

            if (e instanceof k8s.HttpError) {
                try {
                    log.info(`Creating namespace '${namespace}' for workspace`);

                    await k8sApi.createNamespace(this.buildNamespaceConfig(namespace));
                    await dal.iamPermission.createWorkspaceServiceWide(accountPk);

                    return namespace;
                } catch (e) {
                    log.error(`Failed to create namespace: ${e}. Rolling back`);
                    await dal.iamPermission.deleteWorkspaceServiceWide(accountPk);
                }
            }

            throw new InternalServerError({
                message: "Failed to initialize workspace",
            });
        }
    }

    /**
     * This will delete namespace related to a workspace and along with that it will
     * terminate all of the resources inside that namespace
     */
    async deinitialize(accountPk: AccountPk) {
        try {
            const exists = await dal.workspace.existsByAccountId(accountPk);
            if (exists) {
                await dal.workspace.deleteByAccountId(accountPk);
            }

            const namespace = k8sNames.workspaceNamespace(this.accountId);
            await k8sApi.deleteNamespace(namespace);
        } catch (e) {
            log.error(`Failed to delete namespace: ${e}`);

            throw new InternalServerError({
                message: "Failed to deinitialize workspace",
            });
        }
    }

    /**
     * Create a new workspace based on container img and tag
     * @returns Workspace URL
     */
    async create(
        accountPk: AccountPk,
        userPk: UserPk | null,
        workspaceName: string,
        containerImage: z.infer<
            typeof WorkspaceSchemas.CreateWorkspaceRequestBody.shape.containerImage
        >,
        containerImageTag: z.infer<
            typeof WorkspaceSchemas.CreateWorkspaceRequestBody.shape.containerImageTag
        >,
    ): Promise<{ workspaceURL: string; workspace: WorkspaceClient }> {
        const namespace = k8sNames.workspaceNamespace(this.accountId);
        let workspacePk: WorkspacePk | null = null;

        try {
            const { workspace } = await dal.workspace.create(
                accountPk,
                {
                    name: workspaceName,
                    containerImage,
                    containerImageTag,
                },
                userPk,
            );

            workspacePk = workspace.id;

            log.info(`Workspace created: ${workspacePk}`);

            // These operations must be done in the same order without running them concurrently

            const workspaceId = workspace.workspaceId;
            const workspaceDomain = k8sNames.workspaceDomain(workspaceId);

            const pod = await k8sApi.createNamespacedPod(
                namespace,
                this.buildPodConfig({
                    workspaceId,
                    accountId: this.accountId,
                    containerImage,
                    containerImageTag,
                }),
            );

            log.info(`Pod created: ${pod}`);

            const service = await k8sApi.createNamespacedService(
                namespace,
                this.buildServiceConfig({ workspaceId, accountId: this.accountId }),
            );

            log.info(`Service created: ${service}`);

            const ingress = await k8sNetworkingApi.createNamespacedIngress(
                namespace,
                this.buildIngressConfig({
                    workspaceId,
                    workspaceDomain,
                    accountId: this.accountId,
                }),
            );

            log.info(`Ingress created: ${ingress}`);

            return {
                workspaceURL: `http://${workspaceDomain}`,
                workspace,
            };
        } catch (e) {
            log.fatal(`Failed to create workspace resources: ${e}. Rollback`);

            if (workspacePk) {
                await dal.workspace.deleteByWorkspaceId(workspacePk);
                log.info("Workspace deleted");
            }

            throw new InternalServerError({ message: "Failed to create workspace" });
        }
    }

    async delete(workspacePk: WorkspacePk, workspaceId: WorkspaceId) {
        const namespace = k8sNames.workspaceNamespace(this.accountId);

        try {
            await dal.workspace.deleteByWorkspaceId(workspacePk);

            log.info("Workspace deleted");

            // These operations must be done in the same order without running them concurrently

            await k8sNetworkingApi.deleteNamespacedIngress(
                k8sNames.workspaceIngress(workspaceId),
                namespace,
            );

            log.info("Ingress deleted");

            await k8sApi.deleteNamespacedService(
                k8sNames.workspaceService(workspaceId),
                namespace,
            );

            log.info("Service deleted");

            await k8sApi.deleteNamespacedPod(
                k8sNames.workspacePod(workspaceId),
                namespace,
            );

            log.info("Pod deleted");
        } catch (e) {
            log.fatal(`Failed to delete workspace: ${e}`);
            throw new InternalServerError({ message: "Failed to delete workspace" });
        }
    }

    // ==========================
    // Build k8s config
    // ==========================

    private buildNamespaceConfig(namespace: string): k8s.V1Namespace {
        return {
            apiVersion: API_VERSION,
            kind: k8sKind.Namespace,
            metadata: {
                name: namespace,
                labels: {
                    name: namespace,
                    accountId: this.accountId,
                },
            },
        };
    }

    private buildPodConfig(config: {
        workspaceId: string;
        accountId: string;
        containerImage: string;
        containerImageTag: string;
    }): k8s.V1Pod {
        return {
            apiVersion: API_VERSION,
            kind: k8sKind.Pod,
            metadata: {
                name: k8sNames.workspacePod(config.workspaceId),
                labels: {
                    app: SERVICE_NAME,
                    podName: k8sNames.workspacePod(config.workspaceId),
                    accountId: config.accountId,
                },
            },
            spec: {
                containers: [
                    {
                        name: k8sNames.workspaceMainContainer(config.workspaceId),
                        image: `${config.containerImage}:${config.containerImageTag}`,
                        imagePullPolicy: "IfNotPresent",

                        // Exposing multiple ports. This will give users the option to map any internal port
                        // to any of these exposed ports
                        ports: env.WORKSPACE_EXPOSED_PORTS.map((port) => ({
                            containerPort: port,
                        })),

                        // TODO: add constraints to CPU and memory
                    },
                ],
            },
        };
    }

    private buildServiceConfig(config: {
        workspaceId: string;
        accountId: string;
    }): k8s.V1Service {
        return {
            apiVersion: API_VERSION,
            kind: k8sKind.Service,
            metadata: {
                name: k8sNames.workspaceService(config.workspaceId),
                labels: {
                    app: SERVICE_NAME,
                    accountId: config.accountId,
                    podName: k8sNames.workspacePod(config.workspaceId),
                },
            },
            spec: {
                // This could also be done using LoadBalancer. In that case, using Ingress
                // inside KinD along with cloud-provider-kind will create external IP using
                // which workspace main container could be accessed. Not sure about domain mapping
                //
                // But, here I'm using ClusterIP since we can create a LoadBalancer using
                // nginx-ingress and along with cloud-provider-kind and KinD we will get an
                // external IP and we can configure dnsmasq (in case of local testing in MacOS)
                // to use that external IP for `workspaceDomain` and this domain will be used
                // in the Ingress that will be create for a workspace and then we use the domain
                // to access workspace main container and in this case we won't need a LoadBalancer
                // for workspace (we would need only one LoadBalancer for nginx-ingress)
                type: "ClusterIP",
                selector: {
                    podName: k8sNames.workspacePod(config.workspaceId),
                },
                ports: env.WORKSPACE_EXPOSED_PORTS.map((port) => ({
                    name: k8sNames.workspaceServicePort(port),
                    protocol: "TCP",
                    port: port,
                    targetPort: port,
                })),
            },
        };
    }

    private buildIngressConfig(config: {
        workspaceId: string;
        accountId: string;
        workspaceDomain: string;
    }): k8s.V1Ingress {
        return {
            apiVersion: NETWORKING_API_VERSION,
            kind: k8sKind.Ingress,
            metadata: {
                name: k8sNames.workspaceIngress(config.workspaceId),
                labels: {
                    app: SERVICE_NAME,
                    accountId: config.accountId,
                    podName: k8sNames.workspacePod(config.workspaceId),
                },
                annotations: {
                    "kubernetes.io/ingress.class": "nginx",
                    "nginx.ingress.kubernetes.io/rewrite-target": "/",
                    "nginx.ingress.kubernetes.io/ssl-redirect": "false",
                    "nginx.ingress.kubernetes.io/use-regex": "true",

                    // Add WebSocket support
                    "nginx.ingress.kubernetes.io/proxy-read-timeout": "3600",
                    "nginx.ingress.kubernetes.io/proxy-send-timeout": "3600",
                    "nginx.ingress.kubernetes.io/proxy-body-size": "8m",

                    // Header handling
                    "nginx.ingress.kubernetes.io/proxy-set-headers": "true",

                    // Enable WebSocket
                    "nginx.ingress.kubernetes.io/enable-websocket": "true",
                },
            },
            spec: {
                ingressClassName: "nginx",
                rules: [
                    {
                        host: config.workspaceDomain,
                        http: {
                            paths: [
                                {
                                    path: "/",
                                    pathType: "Prefix",
                                    backend: {
                                        service: {
                                            name: k8sNames.workspaceService(
                                                config.workspaceId,
                                            ),

                                            // Ingress domain mapping will be for port 80
                                            port: { number: 80 },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };
    }
}
