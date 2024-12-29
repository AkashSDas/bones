import { keepPreviousData } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MoveLeftIcon, MoveRightIcon, RotateCwIcon, TrashIcon } from "lucide-react";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Loader } from "@/components/shared/Loader";
import {
    useDeleteApiV1WorkspaceWorkspaceId,
    useGetApiV1Workspace,
} from "@/gen/endpoints/workspace/workspace";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";
import { workspaceKeys } from "@/utils/react-query";

const LIMIT = 20;

export function YourWorkspaceSection() {
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState("");

    const { authHeader } = useAuth();

    const query = useGetApiV1Workspace(
        {
            limit: LIMIT.toString(),
            offset: offset.toString(),
            search: search !== "" ? search : undefined,
        },
        {
            axios: { headers: authHeader },
            query: {
                initialData: undefined,
                queryKey: workspaceKeys.workspaces(
                    LIMIT.toString(),
                    offset.toString(),
                    search !== "" ? search : undefined,
                ),
                placeholderData: keepPreviousData,
            },
        },
    );

    function searchByName(e: ChangeEvent<HTMLInputElement>): void {
        const v = e.target.value;

        if (v === "") {
            setSearch("");
        } else if (v.length > 3) {
            setSearch(v);
        }
    }

    const searchByNameDebounced = useDebounceCallback(searchByName, 300);

    const totalWorkspaces = query.data?.data?.total ?? 0;
    const isLoading = query.isLoading || query.isFetching;

    const refetch = useCallback(() => query.refetch(), [query]);

    return (
        <section className="w-full max-w-[740px] mx-auto flex flex-col gap-1">
            <h2 className="h3">Your Workspace</h2>
            <p className="text-sm text-grey-500">Workspaces created in your account.</p>

            <div className="flex gap-1 justify-center items-center mt-2">
                <Input
                    className={"!h-8 w-full text-sm"}
                    placeholder="Search by name"
                    onChange={searchByNameDebounced}
                />

                <Button
                    variant="secondary"
                    size="icon"
                    className="!h-8 !w-8"
                    disabled={query.isFetching}
                    onClick={async () => {
                        await query.refetch();
                    }}
                >
                    {query.isFetching ? <Loader /> : <RotateCwIcon />}
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    className="!w-8 !h-8"
                    aria-label="Previous"
                    onClick={() => {
                        if (offset > 0) {
                            setOffset(offset - LIMIT);
                        }
                    }}
                    disabled={offset === 0 || query.isFetching}
                >
                    <MoveLeftIcon />
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    className="!w-8 !h-8"
                    aria-label="Next"
                    onClick={() => {
                        if (offset + LIMIT < totalWorkspaces) {
                            setOffset(offset + LIMIT);
                        }
                    }}
                    disabled={offset + LIMIT >= totalWorkspaces || query.isFetching}
                >
                    <MoveRightIcon />
                </Button>
            </div>

            <div className="flex flex-col gap-1 transition-height rounded-card space-y">
                {isLoading ? <Loader variant="section" /> : null}

                {!isLoading && query.data?.data?.workspaces.length === 0 ? (
                    <p className="my-4 text-sm text-grey-500">No workspaces found</p>
                ) : null}

                {!isLoading && query.data?.data?.workspaces.length !== 0
                    ? query.data?.data?.workspaces.map((workspace) => (
                          <WorkspaceCard
                              key={workspace.workspaceId}
                              workspaceId={workspace.workspaceId}
                              label={workspace.name}
                              containerImage={workspace.containerImage}
                              containerImageTag={workspace.containerImageTag}
                              refetch={refetch}
                          />
                      ))
                    : null}
            </div>
        </section>
    );
}

const ICONS = [
    {
        icons: [{ filename: "go-original", alt: "Go" }],
        label: "Go",
        containerImage: "workspace",
        containerTag: "go1.23",
        supported: true,
    },
    {
        icons: [{ filename: "python-original", alt: "Python" }],
        label: "Python",
        containerImage: "workspace",
        containerTag: "python3.13",
        supported: true,
    },
    {
        icons: [
            { filename: "vite", alt: "Vite" },
            { filename: "react-original", alt: "React" },
        ],
        label: "React with Vite",
        containerImage: "workspace",
        containerTag: "vite-react18",
        supported: true,
    },
    {
        icons: [{ filename: "deno2", alt: "Deno" }],
        label: "Hono with Deno2",
        containerImage: "workspace",
        containerTag: "hono4.6-deno2.0",
        supported: true,
    },
    {
        icons: [
            { filename: "rust-plain", alt: "Rust" },
            { filename: "actix", alt: "Actix" },
        ],
        label: "Actix",
        containerImage: "workspace",
        containerTag: "actix",
        supported: false,
    },
    {
        icons: [{ filename: "mongodb", alt: "MongoDB" }],
        label: "MongoDB",
        containerImage: "workspace",
        containerTag: "mongodb",
        supported: false,
    },
    {
        icons: [{ filename: "postgres", alt: "Postgres" }],
        label: "Postgres",
        containerImage: "workspace",
        containerTag: "postgres",
        supported: false,
    },
    {
        icons: [{ filename: "typescript-original", alt: "TypeScript" }],
        label: "TypeScript",
        containerImage: "workspace",
        containerTag: "typescript",
        supported: false,
    },
    {
        icons: [{ filename: "ubuntu-plain", alt: "Ubuntu" }],
        label: "Ubuntu",
        containerImage: "workspace",
        containerTag: "ubuntu",
        supported: false,
    },
    {
        icons: [{ filename: "c-original", alt: "C" }],
        label: "C",
        containerImage: "workspace",
        containerTag: "c",
        supported: false,
    },
];

function WorkspaceCard(props: {
    workspaceId: string;
    label: string;
    containerImage: string;
    containerImageTag: string;
    refetch?: () => void;
}) {
    const icons = useMemo(
        function getIcons() {
            for (const icon of ICONS) {
                if (
                    icon.containerImage === props.containerImage &&
                    icon.containerTag === props.containerImageTag
                ) {
                    return icon.icons;
                }
            }

            return [{ filename: "ubuntu-plain", alt: "Ubuntu" }];
        },
        [props.containerImage, props.containerImageTag],
    );

    const { authHeader } = useAuth();
    const { toast } = useToast();

    const mutation = useDeleteApiV1WorkspaceWorkspaceId({
        axios: { headers: authHeader },
        mutation: {
            async onSettled() {
                if (props.refetch) props.refetch();

                toast({
                    variant: "success",
                    title: "Workspace Deleted",
                    description: "Workspace has been deleted successfully",
                });
            },
        },
    });

    return (
        <Link to="/workspace/$workspaceId" params={{ workspaceId: props.workspaceId }}>
            <div className="flex gap-4 items-center px-4 w-full h-10 cursor-pointer rounded-card hover:bg-grey-900">
                <img src={`/tools/${icons[0].filename}.svg`} alt={icons[0].alt} />
                <span className="w-full text-sm text-grey-400">{props.label}</span>

                <Button
                    variant="ghost"
                    size="icon"
                    className="!w-8 !h-8"
                    disabled={mutation.isPending}
                    aria-label="Delete workspace"
                    onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        await mutation.mutateAsync({ workspaceId: props.workspaceId });
                    }}
                >
                    {mutation.isPending ? (
                        <Loader />
                    ) : (
                        <TrashIcon className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </Link>
    );
}
