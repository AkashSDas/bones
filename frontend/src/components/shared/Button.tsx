import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/styles";

const variants = cva(
    "inline-flex font-body items-center justify-center text-sm md:text-sm font-medium transition-colors whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 md:[&_svg]:size-[18px] [&_svg]:shrink-0 disabled:opacity-70 shadow",
    {
        variants: {
            variant: {
                default: `bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-900`,
                secondary: `border bg-grey-900 border-grey-800 hover:bg-grey-800 hover:border-grey-700 active:bg-grey-700 active:border-grey-600 disabled:bg-grey-900 disabled:border-grey-800`,
                ghost: `hover:bg-grey-800 active:bg-grey-700`,
                info: `bg-info-500 hover:bg-info-600 active:bg-info-700 disabled:bg-info-900`,
                error: `bg-error-500 hover:bg-error-600 active:bg-error-700 disabled:bg-error-900`,
                success: `bg-success-500 hover:bg-success-600 active:bg-success-700 disabled:bg-success-900`,
            },
            size: {
                default: "h-9 px-[14px] md:h-9 md:px-4",
                icon: "w-9 h-9 min-w-9 md:h-9 md:w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof variants> & {
        asChild?: boolean;
    };

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
    { asChild = false, className, variant, size, ...props },
    ref,
) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            className={cn(variants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    );
});

Button.displayName = "Button";

export { Button };
