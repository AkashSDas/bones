import { useGetApiV1WorkspaceWorkspaceId } from "@/gen/endpoints/workspace/workspace";
import { useAuth } from "@/hooks/auth";

type Props = {
    workspaceId: string;
};

function IDEAccess(props: Pick<Props, "workspaceId">) {}

export function WorkspaceIDE(props: Props) {
    return <div>IDE</div>;
}
