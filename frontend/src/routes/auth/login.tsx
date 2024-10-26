import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDownIcon, CircleAlert } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/shared/Alert";
import { Button } from "@/components/shared/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";
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
import { usePostApiV1IamAccountLogin } from "@/gen/endpoints/iam-account/iam-account";
import { usePostApiV1IamUserLogin } from "@/gen/endpoints/iam-user/iam-user";
import { useToast } from "@/hooks/toast";

const FormType = {
    ACCOUNT: "Account",
    IAM_USER: "IAM User",
} as const;

const AccountFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(255),
});

const IAMUserFormSchema = z.object({
    accountId: z.string().uuid({ message: "Invalid Account ID" }),
    iamUsername: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
});

export const Route = createFileRoute("/auth/login")({
    component: LoginPage,
});

function LoginPage(): React.JSX.Element {
    const [formType, setFormType] = useState<(typeof FormType)[keyof typeof FormType]>(
        FormType.ACCOUNT,
    );

    return (
        <main className="my-5 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <div className="flex items-center justify-between gap-1">
                <h1 className="h2">Login</h1>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary">
                            {formType}
                            <ChevronDownIcon />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>Account Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuRadioGroup
                            value={formType}
                            onValueChange={
                                setFormType as unknown as (v: string) => void
                            }
                            className="space-y-1"
                        >
                            <DropdownMenuRadioItem value={FormType.ACCOUNT}>
                                Account
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value={FormType.IAM_USER}>
                                IAM User
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {formType === FormType.IAM_USER ? <IAMUserFormLogin /> : <AccountLogin />}
        </main>
    );
}

function AccountLogin(): React.JSX.Element {
    const { toast } = useToast();
    const navigate = useNavigate({ from: "/auth/login" });

    const form = useForm<z.infer<typeof AccountFormSchema>>({
        resolver: zodResolver(AccountFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const mutation = usePostApiV1IamAccountLogin({
        mutation: {
            onError(e) {
                toast({
                    variant: "error",
                    title: "Login Failed",
                    description: e.response?.data.message,
                });
            },
            onSuccess(data) {
                // TODO: login the user using this access token
                const accessToken = data.data.accessToken;

                toast({
                    variant: "success",
                    title: "Logged In",
                    description: "Logged in as an Admin user",
                });

                navigate({ to: "/iam" });
            },
        },
    });

    async function onSubmit(values: z.infer<typeof AccountFormSchema>) {
        await mutation.mutateAsync({ data: values });
    }

    return (
        <section>
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
                                    Account owner that performs tasks requiring
                                    unrestricted access
                                </FormDescription>
                                <FormControl>
                                    <Input type="email" required {...field} />
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
                                <div className="flex items-center justify-between gap-1">
                                    <FormLabel>Password</FormLabel>

                                    <Link
                                        to="/auth/forgot-password"
                                        className="underline a"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>

                                <FormControl>
                                    <Input
                                        type="password"
                                        minLength={8}
                                        maxLength={255}
                                        required
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-[38px] md:h-[46px] text-sm md:text-base"
                    >
                        Login as Root User
                    </Button>
                </form>
            </Form>

            <div className="flex items-center gap-4 py-6">
                <div className="w-full h-[1px] bg-grey-800" />
                <div className="text-sm font-medium uppercase">OR</div>
                <div className="w-full h-[1px] bg-grey-800" />
            </div>

            <Button variant="secondary" asChild>
                <Link to="/auth/signup">{`Don't have account? Signup`}</Link>
            </Button>
        </section>
    );
}

function IAMUserFormLogin(): React.JSX.Element {
    const { toast } = useToast();
    const navigate = useNavigate({ from: "/auth/login" });

    const [showForgotPwdInstruction, setShowForgotPwdInstruction] = useState(false);

    const form = useForm<z.infer<typeof IAMUserFormSchema>>({
        resolver: zodResolver(IAMUserFormSchema),
        defaultValues: {
            accountId: "",
            iamUsername: "",
            password: "",
        },
    });

    const mutation = usePostApiV1IamUserLogin({
        mutation: {
            onError(e) {
                toast({
                    variant: "error",
                    title: "Login Failed",
                    description: e.response?.data.message,
                });
            },
            onSuccess(data) {
                // TODO: login the user using this access token
                const accessToken = data.data.accessToken;

                toast({
                    variant: "success",
                    title: "Logged In",
                    description: "Logged in as an IAM user",
                });

                navigate({ to: "/iam" });
            },
        },
    });

    async function onSubmit(values: z.infer<typeof IAMUserFormSchema>) {
        await mutation.mutateAsync({
            data: {
                accountId: values.accountId,
                username: values.iamUsername,
                password: values.password,
            },
        });
    }

    return (
        <section>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 md:space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account ID</FormLabel>
                                <FormControl>
                                    <Input type="text" required {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="iamUsername"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>IAM Username</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        minLength={3}
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
                                <div className="flex items-center justify-between gap-1">
                                    <FormLabel>Password</FormLabel>

                                    <p
                                        className="underline cursor-pointer a decoration-dashed"
                                        onClick={() => {
                                            setShowForgotPwdInstruction(true);
                                        }}
                                    >
                                        Having Trouble?
                                    </p>
                                </div>

                                <FormControl>
                                    <Input
                                        type="password"
                                        minLength={8}
                                        maxLength={255}
                                        required
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {showForgotPwdInstruction ? (
                        <Alert variant="info" className="">
                            <CircleAlert className="w-5 h-5" />

                            <AlertTitle>IAM User Issues</AlertTitle>
                            <AlertDescription>
                                For IAM users, contact your administrator to reset your
                                password.
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <Button
                        type="submit"
                        className="w-full h-[38px] md:h-[46px] text-sm md:text-base"
                    >
                        Login as IAM User
                    </Button>
                </form>
            </Form>
        </section>
    );
}
