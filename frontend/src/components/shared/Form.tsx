import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
    type ComponentPropsWithoutRef,
    type ElementRef,
    type HTMLAttributes,
    forwardRef,
    useId,
} from "react";
import {
    Controller,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
    FormProvider,
} from "react-hook-form";
import "react-hook-form";

import { FormFieldContext, FormItemContext, useFormField } from "@/hooks/form";
import { cn } from "@/utils/styles";

import { Label } from "./Label";

export const Form = FormProvider;

export function FormField<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
}

export const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    function ({ className, ...props }, ref) {
        const id = useId();

        return (
            <FormItemContext.Provider value={{ id }}>
                <div ref={ref} className={cn("space-y-1", className)} {...props} />
            </FormItemContext.Provider>
        );
    },
);

FormItem.displayName = "FormItem";

export const FormLabel = forwardRef<
    ElementRef<typeof LabelPrimitive.Root>,
    ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(function ({ className, ...props }, ref) {
    const { error, formItemId } = useFormField();

    return (
        <Label
            ref={ref}
            className={cn(error && "text-highlight-error", className)}
            htmlFor={formItemId}
            {...props}
        />
    );
});

FormLabel.displayName = "FormLabel";

export const FormControl = forwardRef<
    ElementRef<typeof Slot>,
    ComponentPropsWithoutRef<typeof Slot>
>(function (props, ref) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
        <Slot
            ref={ref}
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
});

FormControl.displayName = "FormControl";

export const FormDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(function ({ className, ...props }, ref) {
    const { formDescriptionId } = useFormField();

    return (
        <p
            ref={ref}
            id={formDescriptionId}
            className={cn("text-sm text-grey-400", className)}
            {...props}
        />
    );
});

FormDescription.displayName = "FormDescription";

export const FormMessage = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(function ({ className, children, ...props }, ref) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
        return null;
    }

    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-sm font-medium text-highlight-error", className)}
            {...props}
        >
            {body}
        </p>
    );
});

FormMessage.displayName = "FormMessage";
