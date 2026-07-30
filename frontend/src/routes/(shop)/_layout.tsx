import { createFileRoute } from "@tanstack/react-router";
import ShopLayout from "@/components/layout/shop/ShopLayout";

export const Route = createFileRoute("/(shop)/_layout")({
    component: ShopLayout,
});
