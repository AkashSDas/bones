import type { Meta, StoryObj } from "@storybook/react";

import { Loader } from "@/components/shared/Loader";

const meta: Meta<typeof Loader> = {
    title: "Components/Loader",
    component: Loader,
    argTypes: {
        sizeInPx: {
            control: { type: "number" },
            defaultValue: 24,
        },
        color: {
            control: { type: "select", options: ["white"] },
            defaultValue: "white",
        },
    },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
    args: {
        sizeInPx: 24,
        color: "white",
    },
};
