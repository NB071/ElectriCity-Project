import { createFileRoute } from "@tanstack/react-router";
import { StaticPageTemplate } from "@/components/common/StaticPageTemplate";
import { FAQSection } from "@/components/shop/FAQSection";

export const Route = createFileRoute("/(shop)/_layout/(static)/faq")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <StaticPageTemplate title="Frequently Asked Questions">
            <FAQSection />
        </StaticPageTemplate>
    );
}
