import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";

import { cn, tw } from "@/utils/styles";

const Checkbox = forwardRef<
    ElementRef<typeof CheckboxPrimitive.Root>,
    ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function ({ className, ...props }, ref) {
    return (
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                tw`w-4 h-4 border rounded-sm shadow bg-grey-800 peer shrink-0 border-grey-700 focus-visible:outline-none`,
                tw`focus-visible:ring-1 focus-visible:bg-info-500 disabled:cursor-not-allowed disabled:opacity-50`,
                tw`data-[state=checked]:bg-brand-500 data-[state=checked]:text-grey-200`,
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                className={cn("flex items-center justify-center text-current")}
            >
                <CheckIcon className="w-4 h-4" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
