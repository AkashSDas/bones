import { keepPreviousData } from "@tanstack/react-query";
import {
    ChevronDownIcon,
    CircleUserIcon,
    KeyRoundIcon,
    UserIcon,
    UsersIcon,
    XIcon,
} from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import {
    useGetApiV1IamPermissionPermissionId,
    usePatchApiV1IamPermissionPermissionId,
} from "@/gen/endpoints/iam-permission/iam-permission";
import { useGetApiV1IamUser } from "@/gen/endpoints/iam-user/iam-user";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";
import { iamKeys } from "@/utils/react-query";
import { cn } from "@/utils/styles";

import { Button } from "../../shared/Button";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../shared/Dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../shared/DropdownMenu";
import { Input } from "../../shared/Input";
import { Loader } from "../../shared/Loader";

const LIMIT = 20;

export function IAMUsersDialog(props: {
    permissionId: string;
    excludeUsers: { accessType: "read" | "write"; userId: string }[];
}) {
    const [offset, setOffset] = useState(0);
    const [username, setUsername] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<
        {
            username: string;
            userId: string;
        }[]
    >([]);

    const { toast } = useToast();

    const [permissionType, setPermissionType] = useState<"read" | "write">("read");

    const { authHeader } = useAuth();

    const query = useGetApiV1IamUser(
        {
            limit: LIMIT.toString(),
            offset: offset.toString(),
            search: username !== "" ? username : undefined,
        },
        {
            axios: { headers: authHeader, withCredentials: true },
            query: {
                initialData: undefined,
                queryKey: iamKeys.iamUsers(
                    LIMIT.toString(),
                    offset.toString(),
                    username !== "" ? username : undefined,
                ),
                placeholderData: keepPreviousData,
            },
        },
    );

    const iamPermissionQuery = useGetApiV1IamPermissionPermissionId(
        props.permissionId,
        {
            axios: { headers: authHeader },
            query: { queryKey: iamKeys.iamPolicy(props.permissionId) },
        },
    );

    function searchByName(e: ChangeEvent<HTMLInputElement>): void {
        const v = e.target.value;

        setOffset(0);
        setUsername(v);
    }

    const searchByNameDebounced = useDebounceCallback(searchByName, 300);

    const addUsersMutation = usePatchApiV1IamPermissionPermissionId({
        axios: { headers: authHeader, withCredentials: true },
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add users to policy</DialogTitle>

                <DialogDescription>
                    Search for users to add to the policy
                </DialogDescription>
            </DialogHeader>

            <div className="flex overflow-hidden flex-col gap-2">
                <Input
                    className="!h-10 text-sm focus:ring-0 focus-visible:ring-0"
                    type="search"
                    placeholder="Search for users"
                    onChange={searchByNameDebounced}
                />

                <div className="flex overflow-x-auto gap-2 items-center no-scrollbar">
                    <div className="flex gap-1 items-center px-2 h-7 text-sm rounded-md border bg-grey-900 text-nowrap text-grey-400 border-grey-800">
                        <UsersIcon size="14px" />
                        Total users:{" "}
                        <span className="font-medium">
                            {query.data?.data?.total ?? 0}
                        </span>
                    </div>

                    <div className="flex gap-1 items-center px-2 h-7 text-sm rounded-md border bg-grey-900 text-nowrap text-grey-400 border-grey-800">
                        <KeyRoundIcon size="14px" />
                        Permission Type:{" "}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    {permissionType === "read" ? "Read" : "Write"}
                                    <ChevronDownIcon />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Permission Type</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuRadioGroup
                                    value={permissionType}
                                    onValueChange={
                                        setPermissionType as unknown as (
                                            v: string,
                                        ) => void
                                    }
                                    className="space-y-1"
                                >
                                    <DropdownMenuRadioItem value={"read"}>
                                        Read
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value={"write"}>
                                        Write
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {selectedUsers.map((user) => {
                        return (
                            <div
                                key={user.userId}
                                className="flex gap-1 items-center px-2 h-7 text-sm rounded-md border bg-grey-900 text-nowrap text-grey-400 border-grey-800"
                            >
                                <UserIcon size="14px" />

                                <span>{user.username}</span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="max-h-5 max-w-5"
                                    onClick={() => {
                                        setSelectedUsers((prev) =>
                                            prev.filter(
                                                (u) => u.userId !== user.userId,
                                            ),
                                        );
                                    }}
                                >
                                    <XIcon size="14px" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2">
                    {query.data?.data.users.map((user) => {
                        const isSelected = selectedUsers.some(
                            (u) => u.userId === user.userId,
                        );
                        const alreadyAdded = props.excludeUsers.some(
                            (u) =>
                                u.userId === user.userId &&
                                u.accessType === permissionType,
                        );

                        return (
                            <div key={user.userId}>
                                <span
                                    className={cn(
                                        "flex gap-2 items-center p-2 w-full h-10 text-sm rounded-md border border-transparent transition-colors hover:bg-grey-800",
                                        isSelected ? "border-brand-700" : "",
                                        alreadyAdded
                                            ? "opacity-50 cursor-not-allowed bg-grey-800"
                                            : "",
                                    )}
                                    onClick={() => {
                                        if (alreadyAdded) {
                                            toast({
                                                title: "User already added",
                                                description:
                                                    "This user has already been added to this policy",
                                                variant: "error",
                                            });
                                            return;
                                        }

                                        if (isSelected) {
                                            setSelectedUsers(
                                                selectedUsers.filter(
                                                    (u) => u.userId !== user.userId,
                                                ),
                                            );
                                        } else {
                                            setSelectedUsers([
                                                ...selectedUsers,
                                                {
                                                    username: user.username,
                                                    userId: user.userId,
                                                },
                                            ]);
                                        }
                                    }}
                                >
                                    <CircleUserIcon size="14px" />
                                    {user.username}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button
                            onClick={async function () {
                                if (selectedUsers.length > 0) {
                                    await addUsersMutation.mutateAsync({
                                        permissionId: props.permissionId,
                                        data: {
                                            changeUsers: {
                                                changeType: "add",
                                                permissionType: permissionType,
                                                userIds: selectedUsers.map(
                                                    (u) => u.userId,
                                                ),
                                            },
                                        },
                                    });
                                    await iamPermissionQuery.refetch();

                                    setSelectedUsers([]);
                                    setOffset(0);
                                    setUsername("");
                                    setPermissionType("read");
                                } else {
                                    toast({
                                        title: "No users selected",
                                        description: "Please select at least one user",
                                        variant: "error",
                                    });
                                }
                            }}
                        >
                            {addUsersMutation.isPending ? (
                                <Loader sizeInPx={18} />
                            ) : null}
                            {addUsersMutation.isPending ? "Adding..." : "Add"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </div>
        </DialogContent>
    );
}
