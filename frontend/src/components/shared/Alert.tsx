import { VariantProps, cva } from "class-variance-authority";
import { HTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/styles";

const variants = cva(
    "relative w-full rounded-card border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
    {
        variants: {
            variant: {
                default: "border-grey-700 bg-grey-800",
                info: "border-transparent bg-blue-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const Alert = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement> & VariantProps<typeof variants>
>(function ({ className, variant, ...props }, ref) {
    return (
        <div
            ref={ref}
            role="alert"
            className={cn(variants({ variant }), className)}
            {...props}
        />
    );
});

Alert.displayName = "Alert";

const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
    function ({ className, ...props }, ref) {
        return (
            <h5
                ref={ref}
                className={cn("mb-1 font-bold leading-none tracking-tight", className)}
                {...props}
            />
        );
    },
);

AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(function ({ className, ...props }, ref) {
    return (
        <div
            ref={ref}
            className={cn("text-sm [&_p]:leading-relaxed", className)}
            {...props}
        />
    );
});

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
