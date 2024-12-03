import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { usePatchApiV1IamPermissionPermissionId } from "@/gen/endpoints/iam-permission/iam-permission";
import { type GetApiV1IamPermissionPermissionId200 } from "@/gen/schemas";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";

import { Button } from "../shared/Button";
import { Checkbox } from "../shared/Checkbox";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../shared/Form";
import { Input } from "../shared/Input";

type Props = {
    permission: GetApiV1IamPermissionPermissionId200["permission"];
};

const FormSchema = z.object({
    name: z.string().min(3).optional(),
    readAll: z.boolean().optional(),
    writeAll: z.boolean().optional(),
});

export function PolicyUpdateForm({ permission: perm }: Props) {
    const initialValues = {
        name: perm.name,
        readAll: perm.readAll,
        writeAll: perm.writeAll,
    };

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialValues,
    });

    const { authHeader } = useAuth();

    const { toast } = useToast();

    const updateMutation = usePatchApiV1IamPermissionPermissionId({
        axios: { headers: authHeader },
        mutation: {
            onSuccess() {
                toast({
                    title: "Success",
                    description: "Permission updated successfully",
                    variant: "success",
                });
            },
        },
    });

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
                permissionId: perm.permissionId,
                data: modifiedValues,
            });
        }
    }

    return (
        <div className="flex flex-col gap-1 mt-4">
            <h2 className="h3">Policy Details</h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-8 space-y-6 md:space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Policy Name</FormLabel>
                                <FormDescription>
                                    Descriptive name for the policy
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        placeholder="Workspace wide policy"
                                        type="text"
                                        minLength={6}
                                        maxLength={255}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="readAll"
                        render={({ field }) => (
                            <FormItem className="flex gap-3 items-start">
                                <FormControl>
                                    <Checkbox
                                        className="mt-1 w-5 h-5"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>

                                <div className="flex flex-col gap-2 w-full">
                                    <FormLabel>Read All</FormLabel>
                                    <FormDescription>
                                        This will give all of the IAM users permission
                                        to read all data that the policy is scoped to.
                                        This will take precedence over per IAM user
                                        scope permission
                                    </FormDescription>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="writeAll"
                        render={({ field }) => (
                            <FormItem className="flex gap-3 items-start">
                                <FormControl>
                                    <Checkbox
                                        className="mt-1 w-5 h-5"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>

                                <div className="flex flex-col gap-2 w-full">
                                    <FormLabel>Write All</FormLabel>
                                    <FormDescription>
                                        This will give all of the IAM users permission
                                        to write all data that the policy is scoped to.
                                        This will take precedence over per IAM user
                                        scope permission
                                    </FormDescription>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col gap-2 w-full sm:flex-row">
                        <Button
                            variant="secondary"
                            className="w-full"
                            type="button"
                            onClick={() => form.reset(initialValues)}
                        >
                            Reset
                        </Button>

                        <Button
                            className="w-full"
                            disabled={updateMutation.isPending}
                            type="submit"
                        >
                            {updateMutation.isPending ? <Loader /> : "Save"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
