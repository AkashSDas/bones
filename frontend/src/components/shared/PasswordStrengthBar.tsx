import { useEffect, useMemo, useState } from "react";

import { cn } from "@/utils/styles";

const NUM_OF_STRENGTH_BARS = 5;

export function PasswordStrengthBar(props: { strengthPercentage: number }) {
    const [activeBars, setActiveBars] = useState(0);
    const { strengthPercentage } = props;

    useEffect(() => {
        const barsToActivate = Math.ceil(
            (strengthPercentage / 100) * NUM_OF_STRENGTH_BARS,
        );

        function activateBars(): void {
            setActiveBars(0); // Reset before animation
            for (let i = 1; i <= barsToActivate; i++) {
                setTimeout(() => setActiveBars(i), i * 300);
            }
        }

        activateBars();
    }, [strengthPercentage]);

    const barColor = useMemo(
        function (): string {
            if (strengthPercentage <= 20) {
                return "bg-error-400"; // Very weak
            } else if (strengthPercentage <= 40) {
                return "bg-yellow-500"; // Weak
            } else if (strengthPercentage <= 60) {
                return "bg-yellow-500"; // Moderate
            } else if (strengthPercentage <= 80) {
                return "bg-success-400"; // Strong
            } else {
                return "bg-success-400"; // Very strong
            }
        },
        [strengthPercentage],
    );

    return (
        <div className="flex w-full mt-4 space-x-2">
            {[...Array(5)].map((_, index) => (
                <div
                    key={index}
                    className={cn("w-full h-1 rounded-[1px]", {
                        "bg-grey-800": index >= activeBars,
                        [barColor]: index < activeBars,
                    })}
                />
            ))}
        </div>
    );
}
