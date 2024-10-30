import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
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
import { usePostApiV1IamUser } from "@/gen/endpoints/iam-user/iam-user";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";

export const Route = createFileRoute("/iam/users/new")({
    component: () => (
        <AuthProtected forRoles={["admin"]}>
            <CreateIAMUser />
        </AuthProtected>
    ),
});

const FormSchema = z.object({ username: z.string() });

function CreateIAMUser() {
    const { authHeader } = useAuth();

    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { username: "" },
    });

    const [newPwd, setNewPwd] = useState({ show: false, pwd: "" });
    const [_, copy] = useCopyToClipboard();

    const mutation = usePostApiV1IamUser({
        axios: { headers: authHeader },
        mutation: {
            onError(e) {
                toast({
                    variant: "error",
                    title: "Failed",
                    description: e.response?.data.message,
                });
            },
            onSuccess(data) {
                if (data.data.generatedPassword) {
                    setNewPwd({
                        pwd: data.data.generatedPassword,
                        show: true,
                    });
                }

                toast({
                    variant: "success",
                    title: "IAM User Created",
                    description: "Successfully created IAM user",
                });
            },
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        await mutation.mutateAsync({ data: values });
    }

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            <section className="w-full max-w-[740px] mx-auto">
                <h2 className="h3">Create New IAM User</h2>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6 md:space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormDescription>
                                        IAM username which can be changed later on
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            placeholder="James Admin"
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

                        {newPwd.show ? (
                            <div className="flex items-center w-full gap-1 px-2 py-[1px] text-sm border rounded-card border-grey-800 bg-grey-900 text-grey-500">
                                <span className="w-full">
                                    <span className="font-medium text-gray-200">
                                        Generated password:{" "}
                                    </span>
                                    <span>{newPwd.pwd}</span>
                                </span>

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

                        <Button
                            type="submit"
                            className="w-full h-[38px] md:h-[46px] text-sm md:text-base"
                        >
                            Create User
                        </Button>
                    </form>
                </Form>
            </section>
        </main>
    );
}
