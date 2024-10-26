import { type HTMLAttributes } from "react";

import { cn } from "@/utils/styles";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-card bg-grey-800", className)}
            {...props}
        />
    );
}

export { Skeleton };
