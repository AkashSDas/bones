import * as ToastPrimitives from "@radix-ui/react-toast";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import {
    type ComponentPropsWithoutRef,
    type ElementRef,
    type ReactElement,
    forwardRef,
} from "react";

import { cn, tw } from "@/utils/styles";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = forwardRef<
    ElementRef<typeof ToastPrimitives.Viewport>,
    ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(function ({ className, ...props }, ref) {
    return (
        <ToastPrimitives.Viewport
            ref={ref}
            className={cn(
                tw`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]`,
                className,
            )}
            {...props}
        />
    );
});

ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const variants = cva(
    cn(
        tw`relative flex items-center justify-between w-full px-4 py-3 pr-8 space-x-2 overflow-hidden transition-transform duration-300 ease-in-out shadow-lg pointer-events-auto rounded-card group`,
        tw`data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]`,
        tw`data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out`,
        tw`data-[state=closed]:fade-out-90 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full`,
        tw`data-[state=open]:sm:slide-in-from-bottom-full`,
    ),
    {
        variants: {
            variant: {
                default: tw`border border-grey-700 bg-grey-800`,
                error: tw`border-none error group bg-error-500`,
                success: tw`border-none success group bg-success-500`,
                info: tw`border-none info group bg-info-500`,
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const Toast = forwardRef<
    ElementRef<typeof ToastPrimitives.Root>,
    ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
        VariantProps<typeof variants>
>(function ({ className, variant, ...props }, ref) {
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(variants({ variant }), className)}
            {...props}
        />
    );
});

Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = forwardRef<
    ElementRef<typeof ToastPrimitives.Action>,
    ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(function ({ className, ...props }, ref) {
    return (
        <ToastPrimitives.Action
            ref={ref}
            className={cn(
                tw`inline-flex items-center justify-center h-8 px-3 text-sm font-medium transition-colors shrink-0 rounded-btn focus:outline-none focus:ring-1`,
                tw`border-[1.5px] bg-grey-900 border-grey-800 hover:bg-grey-800 hover:border-grey-700 active:bg-grey-700 active:border-grey-600 disabled:bg-grey-900 disabled:border-grey-800`,
                tw`group-[.info]:border-info-600 group-[.info]:bg-info-500 group-[.info]:hover:bg-info-600 group-[.info]:active:bg-info-700 group-[.info]:disabled:bg-info-900`,
                tw`group-[.error]:border-error-600 group-[.error]:bg-error-500 group-[.error]:hover:bg-error-600 group-[.error]:active:bg-error-700 group-[.error]:disabled:bg-error-900`,
                tw`group-[.success]:border-success-600 group-[.success]:bg-success-500 group-[.success]:hover:bg-success-600 group-[.success]:active:bg-success-700 group-[.success]:disabled:bg-success-900`,
                className,
            )}
            {...props}
        />
    );
});

ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = forwardRef<
    ElementRef<typeof ToastPrimitives.Close>,
    ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(function ({ className, ...props }, ref) {
    return (
        <ToastPrimitives.Close
            ref={ref}
            className={cn(
                tw`absolute p-1 transition-opacity rounded-sm opacity-0 right-1 top-1 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100`,
                className,
            )}
            toast-close=""
            {...props}
        >
            <X className="w-4 h-4" />
        </ToastPrimitives.Close>
    );
});

ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = forwardRef<
    ElementRef<typeof ToastPrimitives.Title>,
    ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(function ({ className, ...props }, ref) {
    return (
        <ToastPrimitives.Title
            ref={ref}
            className={cn("text-sm font-semibold [&+div]:text-sm", className)}
            {...props}
        />
    );
});

ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = forwardRef<
    ElementRef<typeof ToastPrimitives.Description>,
    ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(function ({ className, ...props }, ref) {
    return (
        <ToastPrimitives.Description
            ref={ref}
            className={cn("text-sm opacity-90 select-all", className)}
            {...props}
        />
    );
});

ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = ReactElement<typeof ToastAction>;

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
};
