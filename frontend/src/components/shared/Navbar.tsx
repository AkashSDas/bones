import { MenuIcon, SearchIcon } from "lucide-react";
import React from "react";

import Logo from "@/assets/svgs/logo.svg?react";

import { Button } from "./Button";

export function Navbar(): React.JSX.Element {
    return (
        <nav className="flex items-center justify-between w-full h-12 gap-2 px-4 border-b md:h-14 md:px-8 bg-grey-950 border-b-grey-800">
            <Logo className="h-[23.15px] w-[37.98px] md:h-[30.86px] md:w-[50.64px]" />

            <Button variant="secondary" size="icon" className="visible md:hidden">
                <MenuIcon />
            </Button>

            <div className="items-center justify-end hidden gap-4 md:flex">
                <Button size="icon" variant="ghost">
                    <SearchIcon />
                </Button>
                <Button variant="secondary">Login</Button>
                <Button>Create Account</Button>
            </div>
        </nav>
    );
}
