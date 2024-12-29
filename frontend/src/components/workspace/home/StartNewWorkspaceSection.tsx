import { UploadIcon } from "lucide-react";

import { Button } from "@/components/shared/Button";

import { PredefinedWorkspace } from "./PredefinedWorkspace";

export function StartNewWorkspaceSection() {
    return (
        <section className="w-full max-w-[740px] mx-auto flex flex-col gap-1">
            <h2 className="h3">Start New Workspace</h2>
            <p className="text-sm text-grey-500">
                Select a pre-defined workspace for a quick setup or upload your own
                project
            </p>

            <PredefinedWorkspace />

            <div className="flex gap-4 items-center py-6">
                <div className="text-sm font-medium uppercase text-grey-500">OR</div>
            </div>

            <div className="flex gap-1 items-center">
                <Button variant="secondary">
                    <img
                        src="/icons/github-original.svg"
                        alt="Load from Github"
                        className="w-5 h-5"
                    />
                    Load from Github
                </Button>

                <Button variant="secondary">
                    <img
                        src="/icons/gitlab-plain.svg"
                        alt="Load from Gitlab"
                        className="w-5 h-5"
                    />
                    Load from Gitlab
                </Button>

                <Button>
                    <UploadIcon />
                    Upload Project
                </Button>
            </div>
        </section>
    );
}
