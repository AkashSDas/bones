import { useNavigate } from "@tanstack/react-router";

import { usePostApiV1Workspace } from "@/gen/endpoints/workspace/workspace";
import { type PostApiV1WorkspaceBody } from "@/gen/schemas";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";

import { Button } from "../../shared/Button";

type PredefinedWorkspace = {
    icons: { filename: string; alt: string }[];
    label: string;
    containerImage: string;
    containerTag: string;
    supported: boolean;
};

const PREDEFINED_WORKSPACES: PredefinedWorkspace[] = [
    {
        icons: [{ filename: "go-original", alt: "Go" }],
        label: "Go",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "go1.23" : "workspace-go1.23",
        supported: true,
    },
    {
        icons: [{ filename: "python-original", alt: "Python" }],
        label: "Python",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "python3.13" : "workspace-python3.13",
        supported: true,
    },
    {
        icons: [
            { filename: "vite", alt: "Vite" },
            { filename: "react-original", alt: "React" },
        ],
        label: "React with Vite",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "vite-react18" : "workspace-vite-react18",
        supported: true,
    },
    {
        icons: [{ filename: "deno2", alt: "Deno" }],
        label: "Hono with Deno2",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV
            ? "hono4.6-deno2.0"
            : "workspace-hono4.6-deno2.0",
        supported: true,
    },
    {
        icons: [
            { filename: "rust-plain", alt: "Rust" },
            { filename: "actix", alt: "Actix" },
        ],
        label: "Actix",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "actix" : "workspace-actix",
        supported: false,
    },
    {
        icons: [{ filename: "mongodb", alt: "MongoDB" }],
        label: "MongoDB",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "mongodb" : "workspace-mongodb",
        supported: false,
    },
    {
        icons: [{ filename: "postgres", alt: "Postgres" }],
        label: "Postgres",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "postgres" : "workspace-postgres",
        supported: false,
    },
    {
        icons: [{ filename: "typescript-original", alt: "TypeScript" }],
        label: "TypeScript",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "typescript" : "workspace-typescript",
        supported: false,
    },
    {
        icons: [{ filename: "ubuntu-plain", alt: "Ubuntu" }],
        label: "Ubuntu",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "ubuntu" : "workspace-ubuntu",
        supported: false,
    },
    {
        icons: [{ filename: "c-original", alt: "C" }],
        label: "C",
        containerImage: import.meta.env.DEV ? "workspace" : "bones",
        containerTag: import.meta.env.DEV ? "c" : "workspace-c",
        supported: false,
    },
];

export function PredefinedWorkspace() {
    const { toast } = useToast();

    const navigate = useNavigate();

    const { authHeader } = useAuth();

    const mutation = usePostApiV1Workspace({
        axios: { headers: authHeader },
        mutation: {
            onSuccess(data) {
                const { workspace } = data.data;

                toast({
                    title: "Success",
                    description: "Workspace created successfully",
                    variant: "success",
                });

                navigate({
                    to: `/workspace/$workspaceId`,
                    params: { workspaceId: workspace.workspaceId },
                });
            },
            onError(err) {
                toast({
                    title: "Error",
                    description: err.message,
                    variant: "error",
                });
            },
        },
    });

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {PREDEFINED_WORKSPACES.map((workspace, idx) => (
                <Button
                    variant="secondary"
                    key={idx}
                    className="h-9"
                    disabled={!workspace.supported || mutation.isPending}
                    onClick={() =>
                        mutation.mutateAsync({
                            // TODO: remove type casting
                            data: {
                                containerImage: workspace.containerImage,
                                containerImageTag: workspace.containerTag,
                                name: `${workspace.label} Workspace`,
                            } as PostApiV1WorkspaceBody,
                        })
                    }
                >
                    <span className="flex items-center gap-[2px]">
                        {workspace.icons.map((icon, idx) => (
                            <img
                                key={idx}
                                src={`/tools/${icon.filename}.svg`}
                                alt={icon.alt}
                            />
                        ))}
                    </span>

                    <span>{workspace.label}</span>
                </Button>
            ))}
        </div>
    );
}
