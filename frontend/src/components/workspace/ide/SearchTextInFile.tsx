import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Checkbox } from "@/components/shared/Checkbox";
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
    matchCase: z.boolean(),
    matchWholeWord: z.boolean(),
    useRegex: z.boolean(),
});

export function SearchTextInFile() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            query: "",
            matchCase: false,
            matchWholeWord: false,
            useRegex: false,
        },
    });

    const contextWindow = useWorkspaceStore((s) => s.contextWindow);
    const { connectionStatus } = useWorkspaceBridgeStore();
    const {
        isSearchingTextInFiles,
        setSearchTextInFileQueryResult,
        setSearchTextInFileTotalResults,
        searchTextInFileQueryResult,
        searchTextInFileTotalResults,
    } = useWorkspaceSearchStore();
    const { searchTextInFile } = useWorkspaceFileTree();

    const { addTab } = useWorkspacePane();
    const { getFile } = useWorkspaceFileTree();

    const isConnected = connectionStatus === "connected";

    function onSubmit(data: z.infer<typeof FormSchema>) {
        if (isConnected) {
            setSearchTextInFileTotalResults(NaN);
            setSearchTextInFileQueryResult([]);
            searchTextInFile(
                data.query,
                data.matchCase,
                data.matchWholeWord,
                data.useRegex,
            );
        }
    }

    return (
        <div
            className={cn(
                "p-2 no-scrollbar h-full overflow-y-auto overflow-x-hidden border-r border-r-grey-900 !pb-12 group",
                contextWindow === "textSearch" ? "block" : "hidden",
            )}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mb-2 space-y-1">
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Search for text</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter text"
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

                    <FormField
                        control={form.control}
                        name="matchCase"
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
                                    <FormLabel className="text-grey-400">
                                        Match case
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="matchWholeWord"
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
                                    <FormLabel className="text-grey-400">
                                        Match whole word
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="useRegex"
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
                                    <FormLabel className="text-grey-400">
                                        Use regex
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <hr className="my-4 border-grey-800" />

            {isSearchingTextInFiles ? (
                <div className="flex items-center justify-center w-full my-10">
                    <Loader />
                </div>
            ) : null}

            {Number.isNaN(searchTextInFileTotalResults) ? null : (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-grey-400">
                        Result count: {searchTextInFileTotalResults}
                    </p>

                    {searchTextInFileQueryResult?.map((item) => {
                        const { file, previewContent } = item;

                        return (
                            <div
                                key={item.file.absolutePath}
                                className="flex flex-col gap-1 mt-2 mb-2 cursor-pointer"
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
