import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/shared/Button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shared/Form";
import { Input } from "@/components/shared/Input";
import { PasswordStrengthBar } from "@/components/shared/PasswordStrengthBar";
import { usePasswordStrength } from "@/hooks/form";

export const Route = createFileRoute("/auth/reset-password")({
    component: ResetPasswordPage,
});

const FormSchema = z.object({
    newPassword: z.string().email(),
});

function ResetPasswordPage(): React.JSX.Element {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { newPassword: "" },
    });

    const strength = usePasswordStrength(
        () => form.getValues().newPassword,
        form.watch("newPassword"),
    );

    function onSubmit(values: z.infer<typeof FormSchema>) {
        console.log({ values });
    }

    return (
        <main className="my-2 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <h1 className="h2"></h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 md:space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormDescription>
                                    Add your new account for your Bones account
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        type="password"
                                        minLength={8}
                                        maxLength={255}
                                        required
                                        {...field}
                                    />
                                </FormControl>

                                <PasswordStrengthBar
                                    strengthPercentage={strength.score}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-[38px] md:h-[46px] text-sm md:text-base"
                    >
                        Change Password
                    </Button>
                </form>
            </Form>
        </main>
    );
}
