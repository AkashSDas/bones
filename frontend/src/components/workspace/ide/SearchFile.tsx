import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CodeBlock } from "@/components/shared/CodeBlock";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/shared/Form";
import { Input } from "@/components/shared/Input";
import { Loader } from "@/components/shared/Loader";
import { useWorkspaceFileTree } from "@/hooks/workspace";
import { useWorkspacePane } from "@/hooks/workspace-pane";
import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceSearchStore } from "@/store/workspace-search";
import { cn } from "@/utils/styles";

import { FileIcon } from "./FileIcon";

const FormSchema = z.object({
    query: z.string(),
});

export function SearchFile() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { query: "" },
    });

    const contextWindow = useWorkspaceStore((s) => s.contextWindow);
    const { connectionStatus } = useWorkspaceBridgeStore();
    const { isSearchingFiles, setSearchFileQueryResult, searchFileQueryResult } =
        useWorkspaceSearchStore();
    const { searchFile } = useWorkspaceFileTree();

    const { addTab } = useWorkspacePane();
    const { getFile } = useWorkspaceFileTree();

    const isConnected = connectionStatus === "connected";

    function onSubmit({ query }: z.infer<typeof FormSchema>) {
        if (isConnected) {
            setSearchFileQueryResult(null);
            searchFile(query);
        }
    }

    return (
        <div
            className={cn(
                "p-2 no-scrollbar h-full overflow-y-auto overflow-x-hidden border-r border-r-grey-900 !pb-12 group",
                contextWindow === "fileSearch" ? "block" : "hidden",
            )}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 md:space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">Search File</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter filename"
                                        type="text"
                                        minLength={3}
                                        maxLength={255}
                                        required
                                        className="text-sm !h-10"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <hr className="my-4 border-grey-800" />

            {isSearchingFiles ? (
                <div className="flex items-center justify-center w-full my-10">
                    <Loader />
                </div>
            ) : null}

            {searchFileQueryResult === null ? null : (
                <div className="flex flex-col gap-4">
                    {searchFileQueryResult?.map((item) => {
                        const { file, previewContent } = item;

                        return (
                            <div
                                key={item.file.absolutePath}
                                className="flex flex-col gap-2 mt-2 mb-2 cursor-pointer"
                                onClick={function openFile() {
                                    addTab({ file, type: "codeFile" });
                                    getFile(file.absolutePath);
                                }}
                            >
                                <div className="flex items-center gap-1">
                                    <FileIcon
                                        filename={file.name}
                                        width={18}
                                        height={18}
                                        isFile
                                    />

                                    <span className="text-sm">{file.name}</span>
                                </div>

                                <CodeBlock
                                    filename={file.name}
                                    codeText={previewContent}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
