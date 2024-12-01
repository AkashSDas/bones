import { keepPreviousData } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import {
    ALargeSmallIcon,
    CalendarIcon,
    ExternalLinkIcon,
    EyeIcon,
    HammerIcon,
    IdCardIcon,
    MoveLeftIcon,
    MoveRightIcon,
    PenIcon,
    RotateCwIcon,
    SearchIcon,
    TelescopeIcon,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useDebounceCallback, useMediaQuery } from "usehooks-ts";
import { z } from "zod";

import { AuthProtected } from "@/components/shared/AuthProtected";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Loader } from "@/components/shared/Loader";
import { useGetApiV1IamPermission } from "@/gen/endpoints/iam-permission/iam-permission";
import { GetApiV1IamPermission200PermissionsItem } from "@/gen/schemas";
import { useAuth } from "@/hooks/auth";
import { formatDate } from "@/utils/datetime";
import { iamKeys } from "@/utils/react-query";
import { cn } from "@/utils/styles";

const SearchSchema = z.object({
    limit: fallback(z.number().max(100).min(20), 20).default(20),
    offset: fallback(z.number().min(0), 0).default(0),
    search: fallback(z.string().min(3), "").default(""),
});

export const Route = createFileRoute("/iam/policies/")({
    component: () => (
        <AuthProtected forRoles={["admin"]}>
            <IAMPoliciesView />
        </AuthProtected>
    ),
    validateSearch: zodSearchValidator(SearchSchema),
});

type IAMPolicyRow = {
    permissionId: string;
    name: string;
    serviceType: GetApiV1IamPermission200PermissionsItem["serviceType"];
    isServiceWide: boolean;
    readAll: boolean;
    writeAll: boolean;
    createdAt: string;
    updatedAt: string;
    users: GetApiV1IamPermission200PermissionsItem["users"];
};

const columnHelper = createColumnHelper<IAMPolicyRow>();

const columns = [
    columnHelper.accessor("permissionId", {
        header: () => (
            <span className="flex gap-2 items-center">
                <IdCardIcon size="16px" />
                Policy ID
            </span>
        ),
        cell: (info) => {
            const permissionId = info.getValue();

            return (
                <div className="relative min-w-full group">
                    <span className="select-all">{info.getValue()}</span>

                    <Link
                        to="/iam/policies/$policyId"
                        params={{ policyId: permissionId }}
                        target="_blank"
                    >
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
    columnHelper.accessor("name", {
        header: () => (
            <span className="flex gap-2 items-center">
                <ALargeSmallIcon size="16px" />
                Policy Name
            </span>
        ),
        cell: (info) => <span className="select-all">{info.getValue()}</span>,
    }),
    columnHelper.accessor("serviceType", {
        header: () => (
            <span className="flex gap-2 items-center">
                <HammerIcon size="16px" />
                Service Type
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
    columnHelper.accessor("isServiceWide", {
        header: () => (
            <span className="flex gap-2 items-center">
                <TelescopeIcon size="16px" />
                Service Wide
            </span>
        ),
        cell: (info) => (
            <span
                className={cn(
                    "font-medium text-xs !h-6 tracking-wider uppercase rounded-sm px-4 py-1 text-white",
                    info.getValue() ? "bg-error-500" : "bg-success-500",
                )}
            >
                {info.getValue() ? "Yes" : "No"}
            </span>
        ),
        maxSize: 34,
    }),
    columnHelper.accessor("readAll", {
        header: () => (
            <span className="flex gap-2 items-center">
                <EyeIcon size="16px" />
                Read All
            </span>
        ),
        cell: (info) => (
            <span
                className={cn(
                    "font-medium text-xs !h-6 tracking-wider uppercase rounded-sm px-4 py-1 text-white",
                    info.getValue() ? "bg-error-500" : "bg-success-500",
                )}
            >
                {info.getValue() ? "Yes" : "No"}
            </span>
        ),
        maxSize: 34,
    }),
    columnHelper.accessor("writeAll", {
        header: () => (
            <span className="flex gap-2 items-center">
                <PenIcon size="16px" />
                Write All
            </span>
        ),
        cell: (info) => (
            <span
                className={cn(
                    "font-medium text-xs !h-6 tracking-wider uppercase rounded-sm px-4 py-1 text-white",
                    info.getValue() ? "bg-error-500" : "bg-success-500",
                )}
            >
                {info.getValue() ? "Yes" : "No"}
            </span>
        ),
        maxSize: 34,
    }),
    columnHelper.accessor("createdAt", {
        header: () => (
            <span className="flex gap-2 items-center">
                <CalendarIcon size="16px" />
                Created On
            </span>
        ),
        cell: (info) => formatDate(info.getValue(), "DD MMM YYYY AM/PM"),
    }),
    columnHelper.accessor("updatedAt", {
        header: () => (
            <span className="flex gap-2 items-center">
                <CalendarIcon size="16px" />
                Updated On
            </span>
        ),
        cell: (info) => formatDate(info.getValue(), "DD MMM YYYY AM/PM"),
    }),
];

function IAMPoliciesView() {
    const { offset, search, limit } = Route.useSearch();
    const navigate = useNavigate();

    const { authHeader } = useAuth();

    const query = useGetApiV1IamPermission(
        {
            limit: limit.toString(),
            offset: offset.toString(),
            search: search !== "" ? search : undefined,
        },
        {
            axios: { headers: authHeader, withCredentials: true },
            query: {
                initialData: undefined,
                queryKey: iamKeys.iamPolicies(
                    limit.toString(),
                    offset.toString(),
                    search !== "" ? search : undefined,
                ),
                placeholderData: keepPreviousData,
            },
        },
    );

    const tableData = useMemo(
        function (): IAMPolicyRow[] {
            const data = query.data?.data.permissions ?? [];

            return data.map((policy) => ({
                permissionId: policy.permissionId,
                serviceType: policy.serviceType,
                isServiceWide: policy.isServiceWide,
                readAll: policy.readAll,
                writeAll: policy.writeAll,
                users: policy.users,
                name: policy.name,
                createdAt: policy.createdAt,
                updatedAt: policy.updatedAt,
            }));
        },
        [query.data?.data.permissions],
    );

    const table = useReactTable<IAMPolicyRow>({
        columns,
        data: tableData,
        debugTable: true,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange",
    });

    function searchByName(e: ChangeEvent<HTMLInputElement>): void {
        const v = e.target.value;

        if (v === "") {
            navigate({
                to: ".",
                search: { search: "", limit, offset: 0 },
            });
        } else if (v.length > 3) {
            navigate({
                to: ".",
                search: { search: v, limit, offset: 0 },
            });
        }
    }

    const [showSearchInput, setShowSearchInput] = useState(false);
    const matches = useMediaQuery("(max-width: 768px)");
    const searchByNameDebounced = useDebounceCallback(searchByName, 300);

    useEffect(
        function openSearchInput() {
            if (search !== "") {
                setShowSearchInput(true);
            }
        },
        [search],
    );

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            <div className="flex flex-col gap-1 justify-between items-start mb-2 w-full md:items-center md:flex-row">
                <h2 className="h3">IAM Policies</h2>

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
                            disabled={query.isFetching}
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
                                placeholder="Search by policy name"
                                defaultValue={search}
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
                        variant="secondary"
                        className="!px-3 text-sm !h-8"
                        disabled={offset === 0 || query.isFetching}
                        onClick={() => {
                            navigate({
                                to: ".",
                                search: { offset: offset - 1, search, limit },
                            });
                        }}
                    >
                        <MoveLeftIcon />{" "}
                        <span className="hidden md:block">Previous</span>
                    </Button>

                    <Button
                        variant="secondary"
                        className="!px-3 text-sm !h-8"
                        disabled={
                            (query.data?.data.permissions.length ?? 0) < limit ||
                            query.isFetching
                        }
                        onClick={() => {
                            navigate({
                                to: ".",
                                search: { offset: offset + 1, search, limit },
                            });
                        }}
                    >
                        <span className="hidden md:block">Next</span> <MoveRightIcon />
                    </Button>
                </div>
            </div>

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
                                                    header.column.columnDef.header,
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
        </main>
    );
}
