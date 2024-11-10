import { Link, useNavigate } from "@tanstack/react-router";
import {
    ContainerIcon,
    KeyRoundIcon,
    MenuIcon,
    PlusIcon,
    SearchIcon,
    UsersIcon,
} from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useBoolean } from "usehooks-ts";

import Logo from "@/assets/svgs/logo.svg?react";
import { useAuth, useLogout } from "@/hooks/auth";

import { Button } from "./Button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "./Command";
import { Loader } from "./Loader";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTrigger } from "./Sheet";
import { Skeleton } from "./Skeleton";

export function Navbar(): React.JSX.Element {
    const { isLoading, isLoggedIn } = useAuth();
    const { isPending, logout } = useLogout();

    return (
        <nav className="flex items-center justify-between w-full h-12 gap-2 px-4 border-b md:h-14 md:px-8 bg-grey-950 border-b-grey-800">
            <Link to="/">
                <Logo className="h-[23.15px] w-[37.98px] md:h-[30.86px] md:w-[50.64px]" />
            </Link>

            <MobileSideMenu />

            <div className="items-center justify-end hidden gap-4 md:flex">
                {isLoading ? (
                    <Skeleton className="w-full h-9 min-w-32" />
                ) : isLoggedIn ? (
                    <>
                        <CommandPalette />

                        <Button
                            variant="secondary"
                            onClick={logout}
                            disabled={isPending}
                        >
                            {isPending ? <Loader sizeInPx={18} /> : null}
                            {isPending ? "Logging Out" : "Logout"}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" asChild>
                            <Link to="/auth/login">Login</Link>
                        </Button>

                        <Button asChild>
                            <Link to="/auth/signup">Create Account</Link>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}

function MobileSideMenu(): React.JSX.Element {
    const { isLoading, isLoggedIn } = useAuth();
    const { isPending, logout } = useLogout();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="visible md:hidden">
                    <MenuIcon />
                </Button>
            </SheetTrigger>

            <SheetContent>
                <SheetFooter>
                    {isLoading ? (
                        <Skeleton className="w-full h-9 min-w-32" />
                    ) : isLoggedIn ? (
                        <SheetClose asChild>
                            <Button
                                variant="secondary"
                                onClick={logout}
                                disabled={isPending}
                                className="w-full"
                            >
                                {isPending ? <Loader sizeInPx={18} /> : null}
                                {isPending ? "Logging Out" : "Logout"}
                            </Button>
                        </SheetClose>
                    ) : (
                        <div className="flex flex-col w-full gap-2">
                            <SheetClose asChild>
                                <Button variant="secondary" asChild className="w-full">
                                    <Link to="/auth/login">Login</Link>
                                </Button>
                            </SheetClose>

                            <SheetClose asChild>
                                <Button asChild className="w-full">
                                    <Link to="/auth/signup">Create Account</Link>
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function CommandPalette() {
    const { value, toggle, setTrue, setValue, setFalse } = useBoolean();

    const navigate = useNavigate();

    useEffect(function () {
        const down = (e: KeyboardEvent) => {
            if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <Button size="icon" variant="ghost" onClick={setTrue}>
                <SearchIcon />
            </Button>

            <CommandDialog open={value} onOpenChange={setValue}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Services">
                        <Link to="/iam" onClick={setFalse}>
                            <CommandItem
                                onSelect={() => {
                                    navigate({ to: "/iam" });
                                    setFalse();
                                }}
                            >
                                <KeyRoundIcon fontSize="14px" />
                                <span>IAM</span>
                            </CommandItem>
                        </Link>

                        <Link to="/workspace" onClick={setFalse}>
                            <CommandItem
                                onSelect={() => {
                                    navigate({ to: "/workspace" });
                                    setFalse();
                                }}
                            >
                                <ContainerIcon fontSize="14px" />
                                <span>Workspace</span>
                            </CommandItem>
                        </Link>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="IAM">
                        <Link to="/iam/users" onClick={setFalse}>
                            <CommandItem
                                onSelect={() => {
                                    navigate({ to: "/iam/users" });
                                    setFalse();
                                }}
                            >
                                <UsersIcon />
                                <span>See all IAM user users</span>
                            </CommandItem>
                        </Link>

                        <Link to="/iam/users/new" onClick={setFalse}>
                            <CommandItem
                                onSelect={() => {
                                    navigate({ to: "/iam/users/new" });
                                    setFalse();
                                }}
                            >
                                <PlusIcon />
                                <span>Create IAM user</span>
                            </CommandItem>
                        </Link>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
