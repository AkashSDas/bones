import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";

import { Button } from "@/components/shared/Button";

const meta: Meta<typeof Button> = {
    title: "Components/Button",
    component: Button,
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["default", "secondary", "ghost", "info", "error", "success"],
        },
        size: {
            control: { type: "select" },
            options: ["default", "icon"],
        },
        asChild: {
            control: { type: "boolean" },
        },
        disabled: {
            control: { type: "boolean" },
        },
    },
    args: {
        variant: "default",
        size: "default",
        disabled: false,
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        variant: "default",
        children: "Default Button",
    },
};

export const Secondary: Story = {
    args: {
        variant: "secondary",
        children: "Secondary Button",
    },
};

export const Success: Story = {
    args: {
        variant: "success",
        children: "Success Button",
    },
};

export const Error: Story = {
    args: {
        variant: "error",
        children: "Error Button",
    },
};

export const Ghost: Story = {
    args: {
        variant: "ghost",
        children: "Ghost Button",
    },
};

export const IconSize: Story = {
    args: {
        size: "icon",
        children: <Search />,
        "aria-label": "Search",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: "Disabled Button",
    },
};

export const AsChild: Story = {
    args: {
        asChild: true,
        children: (
            <a href="#" target="_blank">
                Link Button
            </a>
        ),
    },
};
