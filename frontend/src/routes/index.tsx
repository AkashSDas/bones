import { Link, createFileRoute } from "@tanstack/react-router";
import {
    ContainerIcon,
    FlameIcon,
    GitForkIcon,
    KeyRoundIcon,
    PlugIcon,
} from "lucide-react";
import type React from "react";

/** Services offered by Bones */
const services = [
    {
        Icon: KeyRoundIcon,
        label: "IAM",
        description: "Manage access to account",
        href: "/iam" as const,
    },
    {
        Icon: ContainerIcon,
        label: "Workspace",
        description: "Manage your software project in one place",
        href: "/workspace" as const,
    },
];

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage(): React.JSX.Element {
    return (
        <main className="my-5 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-4">
            <section className="w-full max-w-[740px] mx-auto">
                <h2 className="mb-4 h2">Available Services</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {services.map((_, idx) => (
                        <AvailableServiceCard key={idx} idx={idx} />
                    ))}
                </div>
            </section>
        </main>
    );
}

function AvailableServiceCard(props: { idx: number }): React.JSX.Element {
    const { Icon, label, description, href } = services[props.idx];

    return (
        <Link to={href}>
            <div className="w-full flex gap-3 p-3 bg-grey-900 border-[1.5px] border-grey-800 rounded-card hover:bg-grey-800 hover:border-grey-700 transition-colors">
                <div className="w-9 h-9 min-w-9 min-h-9 rounded-card bg-grey-800 border-[1.5px] border-grey-700 flex justify-center items-center">
                    {<Icon size={18} />}
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{label}</h3>
                    <span className="text-sm text-grey-500">{description}</span>
                </div>
            </div>
        </Link>
    );
}
