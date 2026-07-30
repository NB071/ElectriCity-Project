import React from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface StaticPageTemplateProps {
    title: string;
    children: React.ReactNode;
}

export function StaticPageTemplate({ title, children }: StaticPageTemplateProps) {
    return (
        <div className="container mx-auto mt-14 max-w-5xl px-4 py-12 md:py-16">
            <div className="mb-8">
                <Breadcrumbs />
            </div>

            <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
                <div className="px-6 py-8 md:px-10 md:py-12">
                    <h1 className="mb-8 border-b pb-6 text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>

                    <div className="text-muted-foreground space-y-6 leading-relaxed">{children}</div>
                </div>
            </div>
        </div>
    );
}
