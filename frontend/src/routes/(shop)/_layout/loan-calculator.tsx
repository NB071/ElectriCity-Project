import { LoanCalculator } from "@/components/shop/LoanCalculator";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(shop)/_layout/loan-calculator")({
    component: RouteComponent,
});

function RouteComponent() {
    return <LoanCalculator transparent />;
}
