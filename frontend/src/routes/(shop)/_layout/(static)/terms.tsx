import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(shop)/_layout/(static)/terms")({
    component: TermsComponent,
});

const termsSections = [
    {
        id: "introduction",
        title: "1. Introduction",
        label: "Introduction",
        content: [
            "Welcome to ElectriCity. These Terms and Conditions govern your use of the ElectriCity website, mobile applications, and electric vehicle purchasing services (collectively, the 'Platform'). By accessing or using our Platform, you agree to comply with and be bound by these Terms and Conditions.",
            "Our mission is to provide you with seamless access to high-quality, sustainable electric vehicles. We reserve the right to amend these Terms at any time without prior notice. Please review these Terms periodically. Your continued use of the Platform after any modifications signifies your acceptance of the updated Terms.",
            "If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service. Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page.",
            "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.",
        ],
    },
    {
        id: "use-of-sites",
        title: "2. Your Use of the ElectriCity Sites",
        label: "Use of Platform",
        content: [
            "You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the Platform strictly in accordance with these Terms. As a condition of your use of the Platform, you warrant to ElectriCity that you will not use the Platform for any purpose that is unlawful or prohibited by these Terms.",
            "You may not use the Platform in any manner that could damage, disable, overburden, or impair the Platform or interfere with any other party's use and enjoyment. You agree not to attempt to gain unauthorized access to any part of the Platform, other accounts, computer systems, or networks connected to the Platform.",
            "All content included as part of the Service, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the Site, is the property of ElectriCity or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.",
            "You agree to observe and abide by all copyright and other proprietary notices, legends or other restrictions contained in any such content and will not make any changes thereto. You will not modify, publish, transmit, reverse engineer, participate in the transfer or sale, create derivative works, or in any way exploit any of the content, in whole or in part, found on the Site.",
        ],
    },
    {
        id: "account-payments",
        title: "3. Account & Payments",
        label: "Account & Payments",
        content: [
            "To access certain features of the Platform such as purchasing a vehicle or booking a test drive, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.",
            "All payments for electric vehicles, deposits, and services must be made through our secure payment gateway. We accept major credit cards, debit cards, and approved financing plans. All transactions are securely encrypted, and ElectriCity does not store your raw payment information. In the event of a failed payment, your order will be suspended pending resolution.",
            "Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.",
            "You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.",
        ],
    },
    {
        id: "orders-delivery",
        title: "4. Vehicle Orders and Delivery",
        label: "Manage Orders",
        content: [
            "When you place an order for a vehicle, you are making an offer to purchase. An order is only confirmed once you receive a formal confirmation email containing your vehicle configuration and delivery timeline. We reserve the right to cancel any order if the vehicle becomes unavailable or due to pricing errors.",
            "Delivery estimates are provided in good faith but are not guaranteed. Home delivery is available within selected regions. The vehicle remains the property of ElectriCity until full payment has been received and the final delivery handover is completed.",
            "We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us.",
            "If in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination; and/or accordingly may deny you access to our Services (or any part thereof).",
        ],
    },
    {
        id: "returns-refunds",
        title: "5. Returns and Refunds",
        label: "Returns & Refunds",
        content: [
            "We offer a 7-Day Money-Back Guarantee for all certified pre-owned electric vehicles. If you are not completely satisfied with your purchase, you may return the vehicle within 7 days of delivery, provided it has been driven less than 250 miles and remains in its original condition.",
            "New vehicle returns are subject to the manufacturer's specific return and warranty policies. Refund processing may take up to 10 business days and will be credited to the original method of payment. Shipping and processing fees are non-refundable.",
            "To be eligible for a return, your item must be in the exact same condition that you received it. Any vehicle modification, accessory installation or removal, or physical alteration to the interior or exterior of the vehicle strictly violates our return and refund policy and your claim will be immediately denied.",
            "Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.",
        ],
    },
];

function TermsComponent() {
    const [activeSection, setActiveSection] = useState("introduction");

    useEffect(() => {
        const handleScroll = () => {
            const sections = termsSections.map((s) => document.getElementById(s.id));
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Trigger once to set initial active section immediately
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 100, // Header offset
                behavior: "smooth",
            });
            setActiveSection(id);
        }
    };

    return (
        <div className="bg-background mt-12 min-h-screen py-56 pt-12 md:pt-16">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-foreground mb-24 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">Terms and Conditions</h1>

                <div className="flex flex-col gap-12 md:flex-row md:items-start lg:gap-24">
                    {/* Left Sticky Sidebar */}
                    <div className="sticky top-32 hidden w-55 shrink-0 md:block">
                        <ul className="border-muted flex flex-col space-y-5 border-l">
                            {termsSections.map((section) => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => scrollTo(section.id)}
                                        className={cn(
                                            "-ml-px flex w-full items-center text-left text-sm font-medium transition-colors",
                                            activeSection === section.id
                                                ? "border-l-2 border-blue-600 pl-4 text-blue-600"
                                                : "text-muted-foreground hover:text-foreground border-l-2 border-transparent pl-4 hover:border-slate-300"
                                        )}
                                    >
                                        {section.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mobile TOC */}
                    <div className="border-muted block border-b pb-6 md:hidden">
                        <label className="text-foreground mb-2 block text-sm font-semibold">Jump to section:</label>
                        <select
                            className="border-muted text-foreground focus:ring-primary/20 w-full rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            value={activeSection}
                            onChange={(e) => scrollTo(e.target.value)}
                        >
                            {termsSections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Right Content */}
                    <div className="flex flex-1 flex-col gap-28">
                        {termsSections.map((section) => (
                            <section id={section.id} key={section.id} className="scroll-mt-32">
                                <h2 className="text-foreground mb-6 text-xl font-semibold">{section.title}</h2>
                                <div className="text-muted-foreground flex flex-col gap-6 text-[15px] leading-[1.8]">
                                    {section.content.map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
