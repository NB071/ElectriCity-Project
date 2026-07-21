import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { SearchIcon, SearchSlashIcon } from "lucide-react";

export function FAQSection() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [activeCategory, setActiveCategory] = React.useState("all");

    const categories = [
        { id: "all", label: "All" },
        { id: "general", label: "General Questions" },
        { id: "shopping", label: "Shopping Experience" },
        { id: "account", label: "Account & Profile" },
        { id: "orders", label: "Orders & Checkout" },
    ];

    const filtered = faqs.filter((faq) => {
        const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
        const matchesSearch =
            faq.title.toLowerCase().includes(searchTerm.toLowerCase()) || faq.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="mx-auto min-h-screen w-full max-w-3xl">
            <div className="px-4 py-16 lg:px-6">
                <InputGroup className="max-w-sm">
                    <InputGroupInput onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search FAQs..." value={searchTerm} />
                    <InputGroupAddon>
                        <SearchIcon data-icon="inline-start" />
                    </InputGroupAddon>
                </InputGroup>
            </div>

            <div className="flex flex-wrap gap-1 border-b px-4 md:gap-3">
                {categories.map((cat) => (
                    <button className="flex flex-col" key={cat.id} onClick={() => setActiveCategory(cat.id)} type="button">
                        <span
                            className={cn(
                                "text-muted-foreground hover:text-primary p-1 text-sm md:p-2 md:text-base",
                                activeCategory === cat.id && "text-primary"
                            )}
                        >
                            {cat.label}
                        </span>
                        {activeCategory === cat.id && <span className="bg-primary h-0.5 w-full rounded-full" />}
                    </button>
                ))}
            </div>

            <Accordion className="space-y-2 border-0! px-4 py-12 lg:px-6" collapsible type="single">
                {filtered.map((faq) => (
                    <AccordionItem className="rounded-lg border px-4 shadow-xs" key={faq.id} value={faq.id.toString()}>
                        <AccordionTrigger className="hover:no-underline">{faq.title}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-2 pb-4">{faq.content}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {filtered.length === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <SearchIcon />
                        </EmptyMedia>
                        <EmptyTitle>No FAQs found matching your search.</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => setSearchTerm("")} variant="outline">
                            <SearchSlashIcon data-icon="inline-start" />
                            Clear search
                        </Button>
                    </EmptyContent>
                </Empty>
            )}

            <div className="flex items-center px-4 py-6 lg:px-6">
                <p className="text-muted-foreground">
                    Can't find what you're looking for? Ask our{" "}
                    <Link className="text-primary hover:underline" to="/chatbot">
                        AI Chatbot
                    </Link>{" "}
                    or{" "}
                    <Link className="text-primary hover:underline" to="/contact">
                        Contact Us
                    </Link>
                </p>
            </div>
        </div>
    );
}

const faqs = [
    {
        id: "about_store",
        category: "general",
        title: "About ElectriCity",
        content:
            "ElectriCity is an online store specializing in electric vehicles. We sell new and used EVs from brands like Tesla, Ford, and Toyota. Browse the catalog, compare models, customize options, and check out online or through your account dashboard.",
    },
    {
        id: "finding_products",
        category: "shopping",
        title: "Finding products on the website",
        content:
            "Open the Shop / Catalog section to browse all vehicles. Use the vehicle listing page to scroll inventory, or open Search to look up a brand or model by name. Each vehicle card links to a details page with photos, specs, price, and available options.",
    },
    {
        id: "search_and_filters",
        category: "shopping",
        title: "Search and filters",
        content:
            "Use Search when you know a brand or model name (e.g. Model 3, bZ4X). Use Browse filters to narrow results by price range, new vs used, year, mileage, body style, and drivetrain.",
    },
    {
        id: "vehicle_details",
        category: "shopping",
        title: "Vehicle details pages",
        content:
            "Click any vehicle in the catalog to open its details page. You will see base price, year, condition, mileage, images, promotions, review summary, options already equipped on the vehicle, and any extra customization options still available for purchase. Used vehicles also show history such as prior owners and accident status.",
    },
    {
        id: "customization",
        category: "shopping",
        title: "Customization options",
        content:
            "Vehicle details show two kinds of options: equipped options already installed on that car (especially used inventory), and customizations still available for purchase such as color, interior, or wheels with any price delta. After choosing available add-ons, you can save a configuration and add it to your cart. Some vehicles have no extra purchase options.",
    },
    {
        id: "compare_vehicles",
        category: "shopping",
        title: "Compare vehicles",
        content:
            "Use Compare on the catalog to view two or more vehicles side by side (price, specs, and key attributes). Select the vehicles you are interested in from browse or search, then open the compare view to decide which fits you best.",
    },
    {
        id: "account_login",
        category: "account",
        title: "Account and login",
        content:
            "Create an account or sign in from the site header. A logged-in customer can open the dashboard for orders, wishlist, and profile settings. Wishlist and reviews require an account. You can shop and use a cart as a guest; signing in merges your guest cart into your account cart when your session is still valid. Guest checkout may also be available without signing in.",
    },
    {
        id: "account_management",
        category: "account",
        title: "Account management and profile",
        content:
            "Open your customer dashboard and go to the Profile page to manage your account. There you can update your first name, last name, email, and phone number; change your password (your current password is required); and view your active login sessions. To delete your account, use Delete account on the Profile page while signed in and confirm with your current password. Deletion is permanent for login purposes (your account is deactivated), and you will receive a confirmation email. After deletion you cannot sign in with that account. For order history questions after deletion, contact support with your order ID.",
    },
    {
        id: "cart",
        category: "orders",
        title: "Shopping cart",
        content:
            "Add vehicles from the details page to your cart as a guest or while signed in. You can add a base vehicle or a saved configuration. Open the cart to review items, quantities, promotions shown on each vehicle, and totals before checkout. Guests keep a temporary cart for their browsing session; when you sign in, that guest cart is merged into your account cart. After you are logged in, cart contents stay with your account.",
    },
    {
        id: "checkout_orders",
        category: "orders",
        title: "Checkout and orders",
        content:
            "Proceed to checkout from your cart. Enter shipping and billing details, review the order total, and submit payment. After placing an order, view status and history in your customer dashboard. Order confirmation includes your order ID and line items.",
    },
    {
        id: "payments",
        category: "orders",
        title: "Payments",
        content:
            "We accept major payment methods such as credit card, debit card, and Apple Pay at checkout. If a payment fails, you can retry with another method. Payment status appears on your order in the dashboard once processing completes.",
    },
    {
        id: "reviews",
        category: "orders",
        title: "Reviews",
        content:
            "Logged-in customers who purchased a vehicle can leave a rating and review on its catalog details page. Reviews help other shoppers and appear as an average rating on listing and detail views.",
    },
    {
        id: "wishlist",
        category: "account",
        title: "Wishlist",
        content:
            "Save vehicles to your wishlist while logged in to compare later or buy when ready. Wishlist status is available from vehicle detail pages for authenticated customers.",
    },
    {
        id: "contact_support",
        category: "general",
        title: "Contact and support",
        content:
            "For order issues, account help, or questions not answered here, contact ElectriCity support through the Contact page or your dashboard help section. Include your order ID when asking about a specific purchase. Profile and account settings (including delete account) are on the dashboard Profile page.",
    },
];
