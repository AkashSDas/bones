import { keepPreviousData } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { useMemo } from "react";
import { z } from "zod";

import { AuthProtected } from "@/components/shared/AuthProtected";
import { Loader } from "@/components/shared/Loader";
import { useGetApiV1IamUser } from "@/gen/endpoints/iam-user/iam-user";
import { useAuth } from "@/hooks/auth";
import { formatDate, timeAgo } from "@/utils/datetime";
import { iamKeys } from "@/utils/react-query";
import { cn } from "@/utils/styles";

const SearchSchema = z.object({
    limit: fallback(z.number().max(100).min(20), 20).default(20),
    offset: fallback(z.number().min(0), 0).default(0),
    username: fallback(z.string().min(3), "").default(""),
});

export const Route = createFileRoute("/iam/users/")({
    component: () => (
        <AuthProtected>
            <IAMUsersView />
        </AuthProtected>
    ),
    validateSearch: zodSearchValidator(SearchSchema),
});

type IAMUserRow = {
    userId: string;
    username: string;
    passwordAge: string;
    createdOn: string;
    lastLoggedInAt: string;
    isBlocked: boolean;
};

const columnHelper = createColumnHelper<IAMUserRow>();

const columns = [
    columnHelper.accessor("userId", {
        header: () => "User ID",
        cell: (info) => <span className="select-all">{info.getValue()}</span>,
        minSize: 200,
        maxSize: 200,
    }),
    columnHelper.accessor("username", {
        header: () => "Username",
        cell: (info) => <span className="select-all">{info.getValue()}</span>,
    }),
    columnHelper.accessor("passwordAge", {
        header: () => "Password Age",
        cell: (info) => timeAgo(info.getValue()),
    }),
    columnHelper.accessor("lastLoggedInAt", {
        header: () => "Last Login",
        cell: (info) => formatDate(info.getValue(), "DD MMM YYYY AM/PM"),
    }),
    columnHelper.accessor("isBlocked", {
        header: () => "Blocked",
        cell: (info) => (
            <span
                className={cn(
                    "font-medium tracking-wider uppercase rounded-sm px-2 py-1 text-white",
                    info.getValue() ? "bg-error-500" : "bg-success-500",
                )}
            >
                {info.getValue() ? "Yes" : "No"}
            </span>
        ),
        maxSize: 34,
    }),
    columnHelper.accessor("createdOn", {
        header: () => "Created On",
        cell: (info) => formatDate(info.getValue(), "DD MMM YYYY AM/PM"),
    }),
];

function IAMUsersView() {
    const { offset, username, limit } = Route.useSearch();

    const { authHeader } = useAuth();

    const query = useGetApiV1IamUser(
        {
            limit: limit.toString(),
            offset: offset.toString(),
            search: username !== "" ? username : undefined,
        },
        {
            axios: { headers: authHeader, withCredentials: true },
            query: {
                initialData: undefined,
                queryKey: iamKeys.iamUsers(
                    limit.toString(),
                    offset.toString(),
                    username !== "" ? username : undefined,
                ),
                placeholderData: keepPreviousData,
            },
        },
    );

    const tableData = useMemo(
        function (): IAMUserRow[] {
            const data = query.data?.data.users ?? [];

            return data.map((user) => ({
                userId: user.userId,
                username: user.username,
                isBlocked: user.isBlocked,
                createdOn: user.createdAt,
                lastLoggedInAt: user.lastLoggedInAt,
                passwordAge: user.passwordAge,
            }));
        },
        [query.data?.data.users],
    );

    const table = useReactTable<IAMUserRow>({
        columns,
        data: tableData,
        debugTable: true,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange",
    });

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            <h2 className="mb-4 h3">IAM Users</h2>

            {query.isLoading ? <Loader variant="page" /> : null}

            <table className="min-w-full p-1 overflow-x-auto border w-fit rounded-card border-grey-800 border-card">
                <thead className="border-b border-b-grey-800">
                    {table.getHeaderGroups().map(function (headerGroup) {
                        return (
                            <tr
                                key={headerGroup.id}
                                className="divide-x text-start divide-grey-800 h-9"
                            >
                                {headerGroup.headers.map(function (header) {
                                    return (
                                        <th
                                            key={header.id}
                                            className={cn(
                                                "relative px-2 text-sm font-medium text-start group",
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
                                                    "absolute cursor-ew-resize -right-[2px] opacity-0 group-hover:opacity-100 transition-opacity top-0 w-[3px] h-[39px] bg-info-500",
                                                    header.column.getIsResizing()
                                                        ? "bg-info-600"
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
                                className="divide-x text-start divide-grey-800 h-9"
                            >
                                {row.getVisibleCells().map(function (cell) {
                                    return (
                                        <td
                                            key={cell.id}
                                            className="px-2 text-sm font-normal text-start text-grey-400"
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
        </main>
    );
}
