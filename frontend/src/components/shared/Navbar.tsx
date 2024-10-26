import { Link } from "@tanstack/react-router";
import { MenuIcon, SearchIcon } from "lucide-react";
import type React from "react";

import Logo from "@/assets/svgs/logo.svg?react";
import { useAuth, useLogout } from "@/hooks/auth";

import { Button } from "./Button";
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
                {/* TODO: this should open a search so logged in and not logged in user can search/navigate */}
                <Button size="icon" variant="ghost">
                    <SearchIcon />
                </Button>

                {isLoading ? (
                    <Skeleton className="w-full h-9 min-w-32" />
                ) : isLoggedIn ? (
                    <Button variant="secondary" onClick={logout} disabled={isPending}>
                        {isPending ? <Loader sizeInPx={18} /> : null}
                        {isPending ? "Logging Out" : "Logout"}
                    </Button>
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
                        <SheetClose>
                            <Button
                                variant="secondary"
                                onClick={logout}
                                disabled={isPending}
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
