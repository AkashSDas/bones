import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import type React from "react";
import { useEffect } from "react";
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
import { Loader } from "@/components/shared/Loader";
import { PasswordStrengthBar } from "@/components/shared/PasswordStrengthBar";
import { ToastAction } from "@/components/shared/toast";
import { usePostApiV1IamAccountResetPasswordResetToken } from "@/gen/endpoints/iam-account/iam-account";
import { usePasswordStrength } from "@/hooks/form";
import { useToast } from "@/hooks/toast";

const FormSchema = z.object({ newPassword: z.string() });
const SearchSchema = z.object({
    token: fallback(z.string().length(16), "").default(""),
});

export const Route = createFileRoute("/auth/reset-password")({
    component: ResetPasswordPage,
    validateSearch: zodSearchValidator(SearchSchema),
});

function ResetPasswordPage(): React.JSX.Element {
    const { token } = Route.useSearch();
    const navigate = useNavigate({ from: "/auth/reset-password" });
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { newPassword: "" },
    });

    const strength = usePasswordStrength(
        () => form.getValues().newPassword,
        form.watch("newPassword"),
    );

    const mutation = usePostApiV1IamAccountResetPasswordResetToken({
        mutation: {
            onError(e) {
                toast({
                    variant: "error",
                    title: "Failed",
                    description: e.response?.data.message,
                    action: (
                        <ToastAction
                            altText="Try again"
                            onClick={() => navigate({ to: "/auth/forgot-password" })}
                        >
                            Try Again
                        </ToastAction>
                    ),
                });
            },
            onSuccess(data) {
                toast({
                    variant: "success",
                    title: "Password Updated",
                    description: data.data.message,
                });
                navigate({ to: "/auth/login" });
            },
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        await mutation.mutateAsync({
            data: { password: values.newPassword },
            resetToken: token,
        });
    }

    useEffect(
        function redirectOnEmptyToken() {
            if (!token) {
                toast({
                    variant: "error",
                    title: "Invalid or expired link",
                    description: "Invalid password reset link. Try again",
                });
                navigate({ to: "/auth/forgot-password" });
            }
        },
        [token],
    );

    return (
        <main className="my-5 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <h1 className="h2">Reset Password</h1>

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
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <Loader /> : "Change Password"}
                    </Button>
                </form>
            </Form>
        </main>
    );
}
