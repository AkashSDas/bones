import { type InputHTMLAttributes, forwardRef } from "react";

import { cn, tw } from "@/utils/styles";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function ({ className, type = "text", ...props }, ref) {
        return (
            <input
                type={type}
                className={cn(
                    tw`h-[38px] w-full bg-grey-900 rounded-input border-[1.5px] border-grey-800 md:h-[46px] px-3 md:px-[14px] focus-visible:outline-none placeholder:text-grey-600 focus-visible:ring-[1.5px] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50`,
                    className,
                    type === "password"
                        ? tw`text-[30px] md:text-[50px] tracking-wider`
                        : "",
                )}
                ref={ref}
                {...props}
            />
        );
    },
);

Input.displayName = "Input";

export { Input };
