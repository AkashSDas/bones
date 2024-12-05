import { Link } from "@tanstack/react-router";
import {
    type RowSelectionState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ALargeSmallIcon,
    ExternalLinkIcon,
    IdCardIcon,
    KeyRoundIcon,
    PlusIcon,
    RotateCwIcon,
    SearchIcon,
    TrashIcon,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useDebounceCallback, useMediaQuery } from "usehooks-ts";

import {
    useGetApiV1IamPermissionPermissionId,
    usePatchApiV1IamPermissionPermissionId,
} from "@/gen/endpoints/iam-permission/iam-permission";
import { type GetApiV1IamPermissionPermissionId200 } from "@/gen/schemas";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";
import { iamKeys } from "@/utils/react-query";
import { cn } from "@/utils/styles";

import { Button } from "../shared/Button";
import { Checkbox } from "../shared/Checkbox";
import { DialogTrigger } from "../shared/Dialog";
import { Input } from "../shared/Input";
import { Loader } from "../shared/Loader";

type IAMUser = GetApiV1IamPermissionPermissionId200["permission"]["users"][number];

type Props = {
    policyId: string;
};

type IAMUserRow = IAMUser;

const columnHelper = createColumnHelper<IAMUserRow>();

const columns = [
    columnHelper.accessor("userId", {
        header: ({ table }) => (
            <span className="flex gap-2 items-center">
                <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    // onChange={table.getToggleAllRowsSelectedHandler()} TODO: Not working
                    onClick={table.getToggleAllRowsSelectedHandler()}
                />
                <IdCardIcon size="16px" />
                User ID
            </span>
        ),
        cell: (info) => {
            const userId = info.getValue();

            return (
                <div className="flex relative gap-2 items-center min-w-full group">
                    <Checkbox
                        checked={info.row.getIsSelected()}
                        // onChange={info.row.getToggleSelectedHandler()} TODO: Not working
                        onClick={info.row.getToggleSelectedHandler()}
                    />

                    <span className="select-all">{info.getValue()}</span>

                    <Link to="/iam/users/$userId" params={{ userId }} target="_blank">
                        <Button
                            variant="secondary"
                            className="absolute right-0 !px-2 text-xs font-normal tracking-wide -translate-y-1/2 shadow-lg md:hidden md:group-hover:flex max-h-7 text-grey-500 top-1/2"
                        >
                            <ExternalLinkIcon />
                            <span className="hidden md:block">OPEN</span>
                        </Button>
                    </Link>
                </div>
            );
        },
        minSize: 200,
        maxSize: 200,
    }),
    columnHelper.accessor("username", {
        header: () => (
            <span className="flex gap-2 items-center">
                <ALargeSmallIcon size="16px" />
                Username
            </span>
        ),
        cell: (info) => <span className="select-all">{info.getValue()}</span>,
    }),
    columnHelper.accessor("accessType", {
        header: () => (
            <span className="flex gap-2 items-center">
                <KeyRoundIcon size="16px" />
                Access Type
            </span>
        ),
        cell: (info) => {
            const serviceType = info.getValue().toUpperCase();
            return (
                <span className="font-medium text-xs !h-6 tracking-wider uppercase rounded-sm px-4 py-1 text-white bg-info-500">
                    {serviceType}
                </span>
            );
        },
    }),
];

export function PolicyUsers({ policyId }: Props): React.JSX.Element {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const { authHeader } = useAuth();

    const query = useGetApiV1IamPermissionPermissionId(policyId, {
        axios: { headers: authHeader },
        query: { queryKey: iamKeys.iamPolicy(policyId) },
    });

    const data = query.data?.data;
    const users = useMemo(() => data?.permission.users ?? [], [data]);
    const policyName = data?.permission.name ?? "";

    const [filteredUsers, setFilteredUsers] = useState<IAMUser[]>(users);

    useEffect(
        function syncFilteredUsers() {
            setFilteredUsers(users);
        },
        [users],
    );

    const tableData = useMemo(
        function (): IAMUserRow[] {
            return filteredUsers.map((user) => ({
                userId: user.userId,
                username: user.username,
                accessType: user.accessType,
                createdAt: user.createdAt,
                isBlocked: user.isBlocked,
                lastLoggedInAt: user.lastLoggedInAt,
                passwordAge: user.passwordAge,
                updatedAt: user.updatedAt,
            }));
        },
        [filteredUsers, query.isFetched],
    );

    const table = useReactTable<IAMUserRow>({
        columns,
        data: tableData,
        debugTable: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
        getRowId: (row) => `${row.userId}_${row.accessType}`,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange",
    });

    function searchByName(e: ChangeEvent<HTMLInputElement>): void {
        const v = e.target.value;

        if (v === "") {
            setFilteredUsers(users);
        } else if (v.length > 0) {
            const filtered = users.filter((user) =>
                user.username.toLowerCase().includes(v.toLowerCase()),
            );
            setFilteredUsers(filtered);
        }
    }

    const [showSearchInput, setShowSearchInput] = useState(false);
    const matches = useMediaQuery("(max-width: 768px)");
    const searchByNameDebounced = useDebounceCallback(searchByName, 300);

    const removeUsersMutation = usePatchApiV1IamPermissionPermissionId({
        axios: { headers: authHeader, withCredentials: true },
    });

    const { toast } = useToast();

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-2">
            {!query.isLoading && data === undefined ? (
                <div className="flex flex-col gap-1 my-4 w-full">
                    <h2 className="h3">Policy</h2>

                    <div className="flex justify-between items-center w-full">
                        <p className="text-grey-400">Policy not found</p>

                        <Link to="/iam/policies">
                            <Button className="w-fit">See other policies</Button>
                        </Link>
                    </div>
                </div>
            ) : null}

            {query.isLoading ? <Loader variant="page" /> : null}

            {data?.permission ? (
                <>
                    <div className="flex flex-col gap-1 justify-between items-start mb-2 w-full md:items-center md:flex-row">
                        <h2 className="h3">{policyName} Users</h2>

                        <div
                            className={cn(
                                "flex gap-2 items-center self-end",
                                matches ? "!w-full md:w-60" : null,
                            )}
                        >
                            <div
                                className={cn(
                                    "flex gap-1 items-center",
                                    matches ? "w-full md:w-60" : null,
                                )}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="!h-8 !w-8 hidden md:flex"
                                    onClick={() => {
                                        setShowSearchInput((v) => !v);
                                    }}
                                >
                                    <SearchIcon />
                                </Button>

                                {showSearchInput || matches ? (
                                    <Input
                                        autoFocus
                                        className={cn(
                                            "!h-8 transition-width",
                                            showSearchInput || matches
                                                ? "w-full md:w-60"
                                                : "w-0",
                                        )}
                                        placeholder="Search by username"
                                        onChange={searchByNameDebounced}
                                    />
                                ) : null}
                            </div>

                            <Button
                                variant="ghost"
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
                                variant="ghost"
                                size="icon"
                                className="!h-8 !w-8"
                                aria-label="Remove users from policy"
                                disabled={Object.keys(rowSelection).length === 0}
                                onClick={async function removeUsersFromPolicy() {
                                    const users = Object.keys(rowSelection).map((k) => {
                                        const [userId, accessType] = k.split("_");
                                        return { userId, accessType };
                                    });

                                    // Key is access type and value is an array of user ids
                                    const groupedUsers = users.reduce(
                                        (acc, user) => {
                                            if (!acc[user.accessType]) {
                                                acc[user.accessType] = [];
                                            }
                                            acc[user.accessType].push(user.userId);
                                            return acc;
                                        },
                                        {} as Record<string, string[]>,
                                    );

                                    const promises: Promise<unknown>[] = [];

                                    if (groupedUsers["read"]) {
                                        promises.push(
                                            removeUsersMutation.mutateAsync({
                                                permissionId: policyId,
                                                data: {
                                                    changeUsers: {
                                                        changeType: "remove",
                                                        permissionType: "read",
                                                        userIds: groupedUsers["read"],
                                                    },
                                                },
                                            }),
                                        );
                                    }

                                    if (groupedUsers["write"]) {
                                        promises.push(
                                            removeUsersMutation.mutateAsync({
                                                permissionId: policyId,
                                                data: {
                                                    changeUsers: {
                                                        changeType: "remove",
                                                        permissionType: "write",
                                                        userIds: groupedUsers["write"],
                                                    },
                                                },
                                            }),
                                        );
                                    }

                                    await Promise.all(promises);
                                    await query.refetch();

                                    toast({
                                        title: "Success",
                                        description: "Users removed from policy",
                                        variant: "success",
                                    });
                                }}
                            >
                                {removeUsersMutation.isPending ? (
                                    <Loader />
                                ) : (
                                    <TrashIcon />
                                )}
                            </Button>

                            <DialogTrigger asChild>
                                <Button
                                    size="icon"
                                    className="!h-8 !w-8"
                                    aria-label="Add users to policy"
                                >
                                    <PlusIcon />
                                </Button>
                            </DialogTrigger>
                        </div>
                    </div>

                    <Tags
                        isServiceWide={data.permission.isServiceWide}
                        readAll={data.permission.readAll}
                        writeAll={data.permission.writeAll}
                    />

                    <section className="overflow-x-auto !mt-0 no-scrollbar">
                        <table className="p-1 table-auto w-full !mt-0 border rounded-card border-grey-800">
                            <thead className="border-b border-b-grey-800">
                                {table.getHeaderGroups().map(function (headerGroup) {
                                    return (
                                        <tr
                                            key={headerGroup.id}
                                            className="h-9 divide-x text-start divide-grey-800"
                                        >
                                            {headerGroup.headers.map(function (header) {
                                                return (
                                                    <th
                                                        key={header.id}
                                                        className={cn(
                                                            "relative px-2 text-sm font-normal text-nowrap text-grey-500 text-start group",
                                                        )}
                                                        style={{
                                                            width: `${header.getSize()}px`,
                                                        }}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}

                                                        <div
                                                            onMouseDown={header.getResizeHandler()}
                                                            onTouchStart={header.getResizeHandler()}
                                                            className={cn(
                                                                "absolute cursor-col-resize -right-[3px] opacity-0 group-hover:opacity-100 hover:opacity-100 active:opacity-100 transition-opacity top-0 w-[6px] h-[36px] bg-info-400",
                                                                header.column.getIsResizing()
                                                                    ? "bg-info-500"
                                                                    : null,
                                                            )}
                                                        />
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </thead>

                            <tbody className="divide-y divide-grey-800">
                                {table.getRowModel().rows.map(function (row) {
                                    return (
                                        <tr
                                            key={row.id}
                                            className="h-9 divide-x text-start divide-grey-800"
                                        >
                                            {row.getVisibleCells().map(function (cell) {
                                                return (
                                                    <td
                                                        key={cell.id}
                                                        className="px-2 text-sm font-normal text-nowrap text-start text-grey-100"
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
                </>
            ) : null}
        </main>
    );
}

function Tags(props: { isServiceWide: boolean; readAll: boolean; writeAll: boolean }) {
    const tags: string[] = [];

    tags.push(`Service Wide - ${props.isServiceWide ? "Yes" : "No"}`);
    tags.push(`Read All - ${props.readAll ? "Yes" : "No"}`);
    tags.push(`Write All - ${props.writeAll ? "Yes" : "No"}`);

    return (
        <span className="flex gap-2 items-center pb-2">
            {tags.map((tag, idx) => (
                <span
                    key={idx}
                    className="font-medium text-xs !h-6 tracking-wider uppercase rounded-sm px-2 py-1 text-white bg-info-500"
                >
                    {tag}
                </span>
            ))}
        </span>
    );
}
