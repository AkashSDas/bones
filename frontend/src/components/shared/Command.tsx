import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import {
    type ComponentPropsWithoutRef,
    type ElementRef,
    type HTMLAttributes,
    forwardRef,
} from "react";

import { cn } from "@/utils/styles";

import { Dialog, DialogContent } from "./Dialog";

const Command = forwardRef<
    ElementRef<typeof CommandPrimitive>,
    ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function ({ className, ...props }, ref) {
    return (
        <CommandPrimitive
            ref={ref}
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-md bg-grey-900 text-white",
                className,
            )}
            {...props}
        />
    );
});

Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;

function CommandDialog({ children, ...props }: CommandDialogProps) {
    return (
        <Dialog {...props}>
            <DialogContent className="p-0 overflow-hidden">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-grey-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    );
}

const CommandInput = forwardRef<
    ElementRef<typeof CommandPrimitive.Input>,
    ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function ({ className, ...props }, ref) {
    return (
        <div
            className="flex items-center px-3 border-b border-b-grey-800"
            // eslint-disable-next-line react/no-unknown-property
            cmdk-input-wrapper=""
        >
            <SearchIcon className="w-4 h-4 mr-2 opacity-50 shrink-0" />
            <CommandPrimitive.Input
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-grey-600 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        </div>
    );
});

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = forwardRef<
    ElementRef<typeof CommandPrimitive.List>,
    ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function ({ className, ...props }, ref) {
    return (
        <CommandPrimitive.List
            ref={ref}
            className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    );
});

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = forwardRef<
    ElementRef<typeof CommandPrimitive.Empty>,
    ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function (props, ref) {
    return (
        <CommandPrimitive.Empty
            ref={ref}
            className="py-6 text-sm text-center"
            {...props}
        />
    );
});

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = forwardRef<
    ElementRef<typeof CommandPrimitive.Group>,
    ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function ({ className, ...props }, ref) {
    return (
        <CommandPrimitive.Group
            ref={ref}
            className={cn(
                "overflow-hidden p-1 text-grey-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-grey-200",
                className,
            )}
            {...props}
        />
    );
});

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = forwardRef<
    ElementRef<typeof CommandPrimitive.Separator>,
    ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function ({ className, ...props }, ref) {
    return (
        <CommandPrimitive.Separator
            ref={ref}
            className={cn("-mx-1 h-px bg-grey-800", className)}
            {...props}
        />
    );
});

CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = forwardRef<
    ElementRef<typeof CommandPrimitive.Item>,
    ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(function ({ className, ...props }, ref) {
    return (
        <CommandPrimitive.Item
            ref={ref}
            className={cn(
                "relative flex cursor-pointer gap-2 select-none items-center rounded-card px-2 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-grey-800 data-[selected=true]:text-grey-400 data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                className,
            )}
            {...props}
        />
    );
});

CommandItem.displayName = CommandPrimitive.Item.displayName;

function CommandShortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={cn("ml-auto text-xs tracking-widest text-grey-500", className)}
            {...props}
        />
    );
}

CommandShortcut.displayName = "CommandShortcut";

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
};
