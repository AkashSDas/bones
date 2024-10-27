import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
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
import { Loader } from "@/components/shared/Loader";
import { PasswordStrengthBar } from "@/components/shared/PasswordStrengthBar";
import { usePostApiV1IamAccount } from "@/gen/endpoints/iam-account/iam-account";
import { useAuth, useAuthStore } from "@/hooks/auth";
import { usePasswordStrength } from "@/hooks/form";
import { useToast } from "@/hooks/toast";

export const Route = createFileRoute("/auth/signup")({
    component: SignupPage,
});

const FormSchema = z.object({
    email: z.string().email(),
    accountName: z.string().min(6).max(255),
    password: z.string().min(8).max(255),
});

function SignupPage(): React.JSX.Element {
    const { isLoading } = useAuth({ redirectToLoggedInUserHomePage: true });

    if (isLoading) {
        return <Loader variant="page" sizeInPx={30} />;
    } else {
        return <Content />;
    }
}

function Content(): React.JSX.Element {
    const { toast } = useToast();
    const login = useAuthStore((s) => s.login);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            accountName: "",
            password: "",
        },
    });

    const strength = usePasswordStrength(
        () => form.getValues().password,
        form.watch("password"),
    );

    const mutation = usePostApiV1IamAccount({
        mutation: {
            onError(e) {
                toast({
                    variant: "error",
                    title: "Failed",
                    description: e.response?.data.message,
                });
            },
            async onSuccess(data) {
                login(data.data.accessToken);

                toast({
                    variant: "success",
                    title: "Logged In",
                    description: data.data.message,
                });
            },
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        await mutation.mutateAsync({ data: values });
    }

    return (
        <main className="my-5 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <h1 className="h2">Signup</h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 md:space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormDescription>
                                    Used for account recovery and other administrative
                                    functions
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        placeholder="example@gmail.com"
                                        type="email"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Name</FormLabel>
                                <FormDescription>
                                    Choose a name for your account. Can be changed later
                                    on in settings
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        placeholder="Lean Startup"
                                        type="text"
                                        minLength={6}
                                        maxLength={255}
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormDescription>
                                    Choose a name for your account. Can be changed later
                                    on in settings
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
                        Create Account
                    </Button>
                </form>
            </Form>

            <div className="flex items-center gap-4 py-6">
                <div className="w-full h-[1px] bg-grey-800" />
                <div className="text-sm font-medium uppercase">OR</div>
                <div className="w-full h-[1px] bg-grey-800" />
            </div>

            <Button variant="secondary" asChild>
                <Link to="/auth/login">{`Don't have an account? Login`}</Link>
            </Button>
        </main>
    );
}
