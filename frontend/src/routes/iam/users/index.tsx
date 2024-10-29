import { keepPreviousData } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import {
    BanIcon,
    CalendarIcon,
    ClockIcon,
    ExternalLinkIcon,
    IdCardIcon,
    LockIcon,
    SignatureIcon,
} from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import { AuthProtected } from "@/components/shared/AuthProtected";
import { Button } from "@/components/shared/Button";
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
        header: () => (
            <span className="flex items-center gap-2">
                <IdCardIcon size="16px" />
                User ID
            </span>
        ),
        cell: (info) => {
            const userId = info.cell.row.original.userId;

            return (
                <div className="relative min-w-full group">
                    <span className="select-all">{info.getValue()}</span>

                    <Link to="/iam/users/$userId" params={{ userId }} target="_blank">
                        <Button
                            variant="secondary"
                            className="absolute right-0 !px-2 text-xs font-normal tracking-wide -translate-y-1/2 shadow-lg md:hidden md:group-hover:flex max-h-7 text-grey-500 top-1/2"
                        >
                            <ExternalLinkIcon />
                            OPEN
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
            <span className="flex items-center gap-2">
                <SignatureIcon size="16px" />
                Username
            </span>
        ),
        cell: (info) => <span className="select-all">{info.getValue()}</span>,
    }),
    columnHelper.accessor("passwordAge", {
        header: () => (
            <span className="flex items-center gap-2">
                <LockIcon size="16px" />
                Username
            </span>
        ),
        cell: (info) => timeAgo(info.getValue()),
    }),
    columnHelper.accessor("lastLoggedInAt", {
        header: () => (
            <span className="flex items-center gap-2">
                <ClockIcon size="16px" />
                Last Login
            </span>
        ),
        cell: (info) => timeAgo(info.getValue()),
    }),
    columnHelper.accessor("isBlocked", {
        header: () => (
            <span className="flex items-center gap-2">
                <BanIcon size="16px" />
                Blocked
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
    columnHelper.accessor("createdOn", {
        header: () => (
            <span className="flex items-center gap-2">
                <CalendarIcon size="16px" />
                Created On
            </span>
        ),
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

            <section className="overflow-x-auto">
                <table className="p-1 table-auto w-full !mt-0 border rounded-card border-grey-800">
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
                                                    "text-nowrap relative px-2 text-sm font-medium text-grey-500 text-start group",
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
                                    className="divide-x text-start divide-grey-800 h-9"
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
