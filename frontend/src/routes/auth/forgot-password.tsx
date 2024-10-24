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

export const Route = createFileRoute("/auth/forgot-password")({
    component: ForgotPasswordPage,
});

const FormSchema = z.object({
    email: z.string().email(),
});

function ForgotPasswordPage(): React.JSX.Element {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { email: "" },
    });

    function onSubmit(values: z.infer<typeof FormSchema>) {
        console.log({ values });
    }

    return (
        <main className="my-5 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <h1 className="h2">Forgot Password</h1>

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
                                    Password reset instructions will be sent to your
                                    registered Bones account
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

                    <Button
                        type="submit"
                        className="w-full h-[38px] md:h-[46px] text-sm md:text-base"
                    >
                        Send Instructions
                    </Button>
                </form>
            </Form>
        </main>
    );
}
