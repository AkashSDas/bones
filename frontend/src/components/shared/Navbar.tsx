import { Link } from "@tanstack/react-router";
import { MenuIcon, SearchIcon } from "lucide-react";
import type React from "react";

import Logo from "@/assets/svgs/logo.svg?react";

import { Button } from "./Button";

export function Navbar(): React.JSX.Element {
    return (
        <nav className="flex items-center justify-between w-full h-12 px-4 border-b gap-2 md:h-14 md:px-8 bg-grey-950 border-b-grey-800">
            <Link to="/">
                <Logo className="h-[23.15px] w-[37.98px] md:h-[30.86px] md:w-[50.64px]" />
            </Link>

            <Button variant="secondary" size="icon" className="visible md:hidden">
                <MenuIcon />
            </Button>

            <div className="items-center justify-end hidden gap-4 md:flex">
                {/* TODO: this should open a search so logged in and not logged in user can search/navigate */}
                <Button size="icon" variant="ghost">
                    <SearchIcon />
                </Button>

                <Button variant="secondary" asChild>
                    <Link to="/auth/login">Login</Link>
                </Button>

                <Button asChild>
                    <Link to="/auth/signup">Create Account</Link>
                </Button>
            </div>
        </nav>
    );
}
