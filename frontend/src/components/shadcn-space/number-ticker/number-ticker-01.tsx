"use client";

import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NumberTickerProps = {
    end: number;
    start?: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    format?: (value: number) => string;
    className?: string;
};

function NumberTicker({
    end,
    start = 0,
    duration = 2,
    decimals = 0,
    prefix = "",
    suffix = "",
    format,
    className,
}: NumberTickerProps) {
    const [value, setValue] = useState(start);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        let frame: number;
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;

            const progress = timestamp - startTimeRef.current;
            const percent = Math.min(progress / (duration * 1000), 1);

            // ease-out cubic for smooth animation
            const eased = 1 - Math.pow(1 - percent, 3);

            const current = start + (end - start) * eased;
            setValue(current);

            if (percent < 1) {
                frame = requestAnimationFrame(animate);
            }
        };

        frame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frame);
    }, [start, end, duration]);

    const ticker = (
        <span className={className}>
            {prefix}
            {format ? format(value) : value.toFixed(decimals)}
            {suffix}
        </span>
    );

    if (!format) {
        return ticker;
    }

    const actualValue = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(end);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help" tabIndex={0}>
                        {ticker}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        {prefix}
                        {actualValue}
                        {suffix}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export { NumberTicker };
export type { NumberTickerProps };
