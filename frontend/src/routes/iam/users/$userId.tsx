import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CopyIcon, IdCardIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCopyToClipboard } from "usehooks-ts";
import { z } from "zod";

import { AuthProtected } from "@/components/shared/AuthProtected";
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
import { Checkbox } from "@/components/shared/checkbox";
import {
    useDeleteApiV1IamUserUserId,
    useGetApiV1IamUserUserId,
    usePatchApiV1IamUserUserId,
} from "@/gen/endpoints/iam-user/iam-user";
import { type GetApiV1IamUserUserId200 } from "@/gen/schemas";
import { useAuth } from "@/hooks/auth";
import { usePasswordStrength } from "@/hooks/form";
import { iamKeys } from "@/utils/react-query";

export const Route = createFileRoute("/iam/users/$userId")({
    component: () => (
        <AuthProtected forRoles={["admin"]}>
            <IAMUserDetails />
        </AuthProtected>
    ),
});

function IAMUserDetails() {
    const { userId } = Route.useParams();
    const { authHeader } = useAuth();

    const query = useGetApiV1IamUserUserId(userId, {
        axios: { headers: authHeader },
        query: { queryKey: iamKeys.iamUser(userId) },
    });

    const data = query.data?.data;

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            <section className="w-full max-w-[740px] mx-auto">
                <h2 className="h3">IAM User Details</h2>

                {query.isLoading ? <Loader variant="page" /> : null}

                {!query.isLoading && data === undefined ? (
                    <div className="flex items-center justify-between gap-1 my-4">
                        <p className="text-grey-400">IAM user not found</p>

                        <Link to="/iam/users">
                            <Button className="w-fit">See other users</Button>
                        </Link>
                    </div>
                ) : null}

                {data?.user ? <UserDetails user={data.user} /> : null}
            </section>
        </main>
    );
}

const FormSchema = z.object({
    username: z.string().min(3).optional(),
    password: z.string().min(8).max(255).optional(),
    generateNewPassword: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
});

function UserDetails({ user }: { user: GetApiV1IamUserUserId200["user"] }) {
    const navigate = useNavigate();

    const { authHeader } = useAuth();

    const initialValues = {
        username: user.username,
        isBlocked: user.isBlocked,
    };

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialValues,
    });

    const { watch, setValue, resetField, getValues } = form;
    const generateNewPassword = watch("generateNewPassword");
    const isBlocked = watch("isBlocked");

    const [newPwd, setNewPwd] = useState({ show: false, pwd: "" });
    const [_, copy] = useCopyToClipboard();

    const strength = usePasswordStrength(
        () => getValues().password ?? "",
        watch("password") ?? "",
    );

    const updateMutation = usePatchApiV1IamUserUserId({
        axios: { headers: authHeader, params: { userId: user.userId } },
        mutation: {
            onSuccess(data) {
                if (data.data.generatedPassword) {
                    setNewPwd({ show: true, pwd: data.data.generatedPassword });
                }
            },
        },
    });

    const deleteMutation = useDeleteApiV1IamUserUserId({
        axios: { headers: authHeader, params: { userId: user.userId } },
        mutation: {
            onSuccess() {
                navigate({ to: ".." });
            },
        },
    });

    const disableBtn = updateMutation.isPending || deleteMutation.isPending;

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        // Get only changed and defined values
        const modifiedValues = Object.keys(values).reduce(
            (acc, key) => {
                const newValue = values[key as keyof typeof values];
                const initialValue = initialValues[key as keyof typeof initialValues];

                if (newValue !== initialValue && newValue !== undefined) {
                    acc[key as keyof typeof values] = newValue;
                }
                return acc;
            },
            {} as Record<string, string | boolean>,
        );

        // Proceed with the mutation if we have any changed values
        if (Object.keys(modifiedValues).length > 0) {
            await updateMutation.mutateAsync({
                userId: user.userId,
                data: modifiedValues,
            });
        }
    }

    useEffect(
        function resetPwdOneGeneratePwdSelect() {
            if (generateNewPassword) {
                setValue("password", "");
            }
        },
        [isBlocked, resetField, setValue],
    );

    useEffect(
        function resetEverythingOnBlockingUser() {
            if (isBlocked) {
                resetField("username");
                resetField("password");
                setValue("generateNewPassword", false);
            }
        },
        [isBlocked, resetField, setValue],
    );

    return (
        <div className="flex flex-col gap-1 mt-4">
            <div className="flex items-center gap-1 text-sm">
                <IdCardIcon size="16px" />
                <span className="font-medium">IAM User ID:</span>
                <span className="select-all text-grey-500">{user.userId}</span>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-8 space-y-6 md:space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormDescription>
                                    Unique username for the current user
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        placeholder="James Admin"
                                        type="text"
                                        minLength={6}
                                        maxLength={255}
                                        disabled={isBlocked}
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
                                    Add new password for the IAM user to use
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        type="password"
                                        minLength={8}
                                        maxLength={255}
                                        disabled={isBlocked || generateNewPassword}
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

                    <FormField
                        control={form.control}
                        name="generateNewPassword"
                        render={({ field }) => (
                            <FormItem className="flex items-start gap-3">
                                <FormControl>
                                    <Checkbox
                                        className="w-5 h-5 mt-1"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isBlocked}
                                    />
                                </FormControl>

                                <div className="flex flex-col w-full gap-2">
                                    <FormLabel>Generate Password</FormLabel>
                                    <FormDescription>
                                        System generated user password for login
                                    </FormDescription>

                                    {newPwd.show ? (
                                        <div className="flex items-center w-full gap-1 px-2 py-[1px] text-sm border rounded-card border-grey-800 bg-grey-900 text-grey-500">
                                            <span className="w-full">{newPwd.pwd}</span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-8 h-8"
                                                aria-label="Copy Generated Password"
                                                type="button"
                                                onClick={() => copy(newPwd.pwd)}
                                            >
                                                <CopyIcon />
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isBlocked"
                        render={({ field }) => (
                            <FormItem className="flex items-start gap-3">
                                <FormControl>
                                    <Checkbox
                                        className="w-5 h-5 mt-1"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>

                                <div className="flex flex-col w-full gap-2">
                                    <FormLabel>Blocked</FormLabel>
                                    <FormDescription>
                                        User will be blocked from performing any action
                                    </FormDescription>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col w-full gap-2 sm:flex-row">
                        <Button variant="secondary" className="w-full" type="button">
                            Reset
                        </Button>
                        <Button className="w-full" disabled={disableBtn} type="submit">
                            {updateMutation.isPending ? (
                                <span>
                                    <Loader /> Saving
                                </span>
                            ) : (
                                "Saving"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            <hr className="my-16 border border-grey-800" />

            <div className="flex flex-col items-start justify-start gap-2 md:items-center md:justify-between md:flex-row">
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Delete IAM User</p>
                    <p className="text-[12.8px] text-grey-500">
                        Entire record related this user will be gone
                    </p>
                </div>

                <Button
                    variant="error"
                    disabled={disableBtn}
                    onClick={() => deleteMutation.mutateAsync({ userId: user.userId })}
                    type="button"
                >
                    {deleteMutation.isPending ? (
                        <span>
                            <Loader /> Deleting
                        </span>
                    ) : (
                        "Delete"
                    )}
                </Button>
            </div>
        </div>
    );
}
