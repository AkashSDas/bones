import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { cn } from "@/utils/styles";

const variants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

type Ref = ElementRef<typeof LabelPrimitive.Root>;
type Props = ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof variants>;

const Label = forwardRef<Ref, Props>(function ({ className, ...props }, ref) {
    return (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(variants(), className)}
            {...props}
        />
    );
});

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
