import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

type EmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    className?: string;
};

function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
    return (
        <Empty className={cn(className)}>
            <EmptyHeader>
                {Icon ? (
                    <EmptyMedia variant="icon">
                        <Icon />
                    </EmptyMedia>
                ) : null}
                <EmptyTitle>{title}</EmptyTitle>
                {description ? <EmptyDescription>{description}</EmptyDescription> : null}
            </EmptyHeader>
            {children ? <EmptyContent>{children}</EmptyContent> : null}
        </Empty>
    );
}

export { EmptyState };
export type { EmptyStateProps };
