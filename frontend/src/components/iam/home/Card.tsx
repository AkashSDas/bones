import { cn } from "@/utils/styles";

export type CardProps = {
    title: string;
    description: string;
    action?: React.JSX.Element | null;
    useSelectAllForDescription?: boolean;
};

export function Card(props: CardProps): React.JSX.Element {
    return (
        <div
            className={cn(
                "flex flex-col items-start md:items-end gap-2 md:flex-row peer peer-first:pt-4",
                props.action === undefined ? "justify-start" : "justify-between",
            )}
        >
            <div className="flex flex-col w-full gap-1">
                <span className="text-sm">{props.title}</span>
                <span
                    className={cn(
                        "text-grey-500 text-sm",
                        props.useSelectAllForDescription ? "select-all" : null,
                    )}
                >
                    {props.description}
                </span>
            </div>

            <div className="w-fit min-w-fit">{props.action}</div>
        </div>
    );
}
