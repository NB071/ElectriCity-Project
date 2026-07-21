// ref: https://github.com/satnaing/shadcn-admin/blob/main/src/features/settings/components/content-section.tsx

import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";

type ContentSectionProps = {
    title: string;
    desc: string;
    children: React.JSX.Element;
    withRefresh?: boolean;
    RefreshFunction?: () => void;
    withCTA?: boolean;
    ctaText?: string;
    ctaFunction?: () => void;
    ctaIcon?: React.JSX.Element;
};

export function ContentSection({ title, desc, children, withRefresh, RefreshFunction, withCTA, ctaText, ctaFunction, ctaIcon }: ContentSectionProps) {
    return (
        <div className="m-5 flex flex-1 flex-col">
            <div className="flex-none">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-medium">{title}</h2>
                    {withRefresh && (
                        <Button variant="outline" size="icon" onClick={RefreshFunction}>
                            <RefreshCcw className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                        </Button>
                    )}
                    {withCTA && ctaText && ctaFunction && (
                        <Button variant="default" size="sm" onClick={ctaFunction} className="ml-auto">
                            {ctaIcon}
                            {ctaText}
                        </Button>
                    )}
                </div>
                <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
            <Separator className="my-5 flex-none" />
            <div className="faded-bottom flex h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12">
                <div className="-mx-1 w-full px-1.5">{children}</div>
            </div>
        </div>
    );
}
