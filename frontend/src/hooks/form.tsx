import { createContext, useContext, useMemo } from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName;
};

type FormItemContextValue = {
    id: string;
};

export const FormFieldContext = createContext<FormFieldContextValue>(
    {} as FormFieldContextValue,
);

export const FormItemContext = createContext<FormItemContextValue>(
    {} as FormItemContextValue,
);

export function useFormField() {
    const fieldContext = useContext(FormFieldContext);
    const itemContext = useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
}

export function usePasswordStrength(getPassword: () => string, watchPassword: string) {
    const strength = useMemo(
        function getPasswordStrength() {
            const password = getPassword();

            let score = 0;
            let strength = "Very Weak";

            if (password.length >= 8) score += 20;
            if (password.length >= 12) score += 10;

            if (/\d/.test(password)) score += 20; // number
            if (/[a-z]/.test(password)) score += 10; // lowercase
            if (/[A-Z]/.test(password)) score += 20; // uppercase
            if (/[\W_]/.test(password)) score += 20; // special characters
            if (password.length >= 16) score += 10;

            if (score >= 80) strength = "Very Strong";
            else if (score >= 60) strength = "Strong";
            else if (score >= 40) strength = "Moderate";
            else if (score >= 20) strength = "Weak";

            return { score, strength };
        },
        [watchPassword],
    );

    return strength;
}
