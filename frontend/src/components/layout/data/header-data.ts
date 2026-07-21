import { CalculatorIcon, BotIcon, UsersIcon, FileTextIcon, ShieldIcon, HelpCircleIcon, CarIcon, TagIcon, ScaleIcon } from "lucide-react";

export type NavItem = {
    label: string;
    to?: string;
    icon?: React.ComponentType;
    description?: string;
    children?: NavItem[];
};

export const headerNav: NavItem[] = [
    { label: "Home", to: "/" },
    {
        label: "Catalog",
        to: "/catalog",
        children: [
            { label: "All Vehicles", to: "/catalog", icon: CarIcon, description: "Browse our entire EV inventory" },
            { label: "Deals", to: "/catalog/deals", icon: TagIcon, description: "Explore the latest offers and discounts" },
            { label: "Compare", to: "/catalog/compare", icon: ScaleIcon, description: "Compare vehicles side by side" },
        ],
    },
    {
        label: "Pages",
        children: [
            { label: "Loan Calculator", to: "/loan-calculator", icon: CalculatorIcon, description: "Calculate your estimated monthly payments" },
            { label: "Chatbot", to: "/chatbot", icon: BotIcon, description: "Get instant answers from our AI assistant" },
            { label: "About Us", to: "/about", icon: UsersIcon, description: "Learn more about our story and team" },
            { label: "FAQ", to: "/faq", icon: HelpCircleIcon, description: "Find answers to our most common questions" },
            { label: "Terms of Service", to: "/terms", icon: FileTextIcon, description: "Read our rules, guidelines, and terms" },
            { label: "Privacy Policy", to: "/privacy", icon: ShieldIcon, description: "Learn how we collect and protect your data" },
        ],
    },
    {
        label: "Brands",
        to: "/brands",
    },
    { label: "Contact", to: "/contact" },
];

export const footerLinks = {
    company: [
        { label: "About Us", to: "/about" },
        { label: "Careers", to: "/careers" },
        { label: "FAQs", to: "/faq" },
        { label: "Finance", to: "/loan-calculator" },
        { label: "Contact Us", to: "/contact" },
    ],
    quickLinks: [
        { label: "All Vehicles", to: "/catalog" },
        { label: "Hot Deals", to: "/catalog/deals" },
        { label: "AI Assistant", to: "/chatbot" },
        { label: "Sign In", to: "/auth/login" },
    ],
    brands: [
        { label: "Tesla", to: "/catalog?brand=Tesla" },
        { label: "BMW", to: "/catalog?brand=BMW" },
        { label: "Audi", to: "/catalog?brand=Audi" },
        { label: "Hyundai", to: "/catalog?brand=Hyundai" },
        { label: "Nissan", to: "/catalog?brand=Nissan" },
        { label: "Volkswagen", to: "/catalog?brand=Volkswagen" },
    ],
    vehicleTypes: [
        { label: "SUV", to: "/catalog?type=SUV" },
        { label: "Sedan", to: "/catalog?type=Sedan" },
        { label: "Hatchback", to: "/catalog?type=Hatchback" },
        { label: "Coupe", to: "/catalog?type=Coupe" },
        { label: "Hybrid", to: "/catalog?type=Hybrid" },
    ],
};
