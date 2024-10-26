import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import {
    type ComponentPropsWithoutRef,
    type ElementRef,
    type HTMLAttributes,
    forwardRef,
} from "react";

import Logo from "@/assets/svgs/logo.svg?react";
import { cn, tw } from "@/utils/styles";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = forwardRef<
    ElementRef<typeof SheetPrimitive.Overlay>,
    ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(function ({ className, ...props }, ref) {
    return (
        <SheetPrimitive.Overlay
            className={cn(
                tw`inset-0 fixed z-50 bg-grey-950/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`,
                className,
            )}
            {...props}
            ref={ref}
        />
    );
});

SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const variants = cva(
    cn(
        tw`fixed z-50 gap-4 transition ease-in-out bg-grey-950 border-grey-800 shadow-[-16px_16px_32px_0px_rgba(0,0,0,0.1)]`,
        tw`data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out`,
    ),
    {
        variants: {
            side: {
                top: tw`inset-x-0 shadow-lg top-0 border-b data-[state=closed]slide-out-to-top data-[state=open]:slide-in-from-top`,
                bottom: tw`inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom`,
                left: tw`inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm`,
                right: tw`inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm`,
            },
        },
        defaultVariants: {
            side: "right",
        },
    },
);

type SheetContentProps = ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
    VariantProps<typeof variants>;

const SheetContent = forwardRef<
    ElementRef<typeof SheetPrimitive.Content>,
    SheetContentProps
>(function ({ side = "right", className, children, ...props }, ref) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Content
                ref={ref}
                className={cn(variants({ side }), className)}
                {...props}
            >
                <div className="flex items-center justify-between h-12 gap-2 px-4 border-b md:h-14 md:px-8 bg-grey-950 border-b-grey-800">
                    <SheetClose asChild>
                        <Link to="/">
                            <Logo className="h-[23.15px] w-[37.98px] md:h-[30.86px] md:w-[50.64px]" />
                        </Link>
                    </SheetClose>

                    <SheetPrimitive.Close className="rounded-btn opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 bg-grey-800 border border-grey-700 focus:ring-info-500 flex justify-center items-center w-6 h-6 focus:ring-offset-1 focus:ring-offset-info-500 disabled:pointer-events-none data-[state=open]:bg-grey-800">
                        <X className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                    </SheetPrimitive.Close>
                </div>

                <div className="p-6">{children}</div>
            </SheetPrimitive.Content>
        </SheetPortal>
    );
});

SheetContent.displayName = SheetPrimitive.Content.displayName;

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col space-y-2 text-center sm:text-left",
                className,
            )}
            {...props}
        />
    );
}

SheetHeader.displayName = "SheetHeader";

function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className,
            )}
            {...props}
        />
    );
}

SheetFooter.displayName = "SheetFooter";

const SheetTitle = forwardRef<
    ElementRef<typeof SheetPrimitive.Title>,
    ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(function ({ className, ...props }, ref) {
    return (
        <SheetPrimitive.Title
            ref={ref}
            className={cn("text-lg font-semibold text-white", className)}
            {...props}
        />
    );
});

SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = forwardRef<
    ElementRef<typeof SheetPrimitive.Description>,
    ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(function ({ className, ...props }, ref) {
    return (
        <SheetPrimitive.Description
            ref={ref}
            className={cn("text-sm text-grey-500", className)}
            {...props}
        />
    );
});

SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
};
