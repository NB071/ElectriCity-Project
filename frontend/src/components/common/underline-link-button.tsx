// components/ui/underline-link-button.tsx
import { forwardRef, type ReactNode } from "react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnderlineLinkButtonProps extends LinkComponentProps {
    icon?: LucideIcon | null;
    className?: string;
    lineOffset?: string;
    children?: ReactNode;
}

export const UnderlineLinkButton = forwardRef<HTMLAnchorElement, UnderlineLinkButtonProps>(
    ({ icon: Icon = ArrowUpRight, className, lineOffset = "after:-bottom-0.5", children, ...linkProps }, ref) => {
        return (
            <Button
                variant="link"
                asChild
                className={cn(
                    "group text-foreground relative shrink-0 gap-1 hover:no-underline",
                    "after:absolute after:left-0 after:h-px after:bg-current",
                    lineOffset,
                    "after:origin-left after:bg-size-[0%_1px]",
                    "after:w-0 after:transition-[width] after:duration-300 motion-reduce:after:transition-none",
                    "hover:after:w-full focus-visible:after:w-full",
                    className
                )}
            >
                <Link ref={ref} {...linkProps}>
                    {children}
                    {Icon && (
                        <Icon
                            data-icon="inline-end"
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                        />
                    )}
                </Link>
            </Button>
        );
    }
);

UnderlineLinkButton.displayName = "UnderlineLinkButton";
