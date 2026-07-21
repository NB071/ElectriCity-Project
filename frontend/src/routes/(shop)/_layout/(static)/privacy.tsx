import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(shop)/_layout/(static)/privacy")({
    component: PrivacyComponent,
});

const privacySections = [
    {
        id: "information-collection",
        title: "1. Information Collection",
        label: "Information Collection",
        content: [
            "At ElectriCity, we are committed to protecting your privacy and ensuring the security of your personal information. When you use our Platform, we may collect various types of information, including but not limited to your name, email address, physical address, phone number, and payment details. This information is collected when you create an account, place an order, or subscribe to our newsletter.",
            "We also automatically collect certain technical data when you interact with our website, such as your IP address, browser type, operating system, and browsing behavior. This information helps us optimize our Platform and provide a better user experience. We may use cookies and similar tracking technologies to gather this data, subject to your cookie preferences.",
            "Certain portions of our application may require the collection of precise geographical data to calculate accurate shipping and vehicle delivery constraints. Depending on your device permissions, we will request access to these hardware features dynamically. Rest assured, you maintain full control over the geospatial data exposed to ElectriCity through standard mobile and web browser controls.",
            "In addition to direct inputs, we occasionally acquire supplementary demographic and firmographic data from certified third-party analytics providers. This enriched dataset serves exclusively to verify identities during high-value vehicle transactions and strictly adheres to global financial regulations.",
        ],
    },
    {
        id: "use-of-information",
        title: "2. How We Use Your Information",
        label: "Use of Information",
        content: [
            "The personal information we collect is used primarily to process your transactions, deliver your purchased vehicles or services, and communicate with you regarding your orders. We may also use your contact information to send you important updates, promotional materials, and newsletters, provided you have opted in to receive such communications.",
            "Additionally, we analyze the technical data collected to understand user behavior, improve our website functionality, and enhance our services. Your data allows us to personalize your experience on ElectriCity, displaying content and recommendations that are most relevant to your interests.",
            "When permitted by applicable law or with your explicit consent, we may utilize automated decision-making and profiling systems. These systems help match your purchasing history with potential new vehicle models or accessories you may be interested in, essentially forming the core of our recommendation engine.",
            "Furthermore, in the interest of public safety, certain vehicle diagnostic information collected natively through our fleet API integrations may be anonymized and shared with traffic authorities or infrastructure planning committees. Your direct personal identity remains scrubbed and undiscoverable in these aggregated telemetry reports.",
        ],
    },
    {
        id: "data-sharing",
        title: "3. Data Sharing and Disclosure",
        label: "Data Sharing",
        content: [
            "ElectriCity does not sell, rent, or trade your personal information to third parties. We may share your data with trusted service providers who assist us in operating our Platform, conducting our business, or servicing you, provided that these parties agree to keep your information confidential.",
            "We may also disclose your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety. Non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.",
            "In the event of a merger, acquisition, reorganization, bankruptcy, or sale of substantial assets, your information—as a core business asset—may be transferred to the acquiring entity. We will ensure that the successor entity upholds the commitments established within this Privacy Policy or directly requests your renewed consent before substantially altering data practices.",
            "We occasionally organize joint promotional campaigns with automotive manufacturer partners (e.g. Tesla, BMW). Data submitted directly within these co-branded portals is subject to the privacy policies of both ElectriCity and the respective partner. We encourage you to review all associated terms before participating.",
        ],
    },
    {
        id: "data-security",
        title: "4. Data Security",
        label: "Data Security",
        content: [
            "We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. Our secure servers use advanced encryption protocols (such as SSL) to protect sensitive data during transmission.",
            "While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee its absolute security. We urge you to take steps to protect your personal information, such as choosing strong passwords and logging out of your account after use.",
            "Internally, we practice the principle of least privilege, ensuring that only ElectriCity employees and designated contractors who require access to your data to perform their job functions can view it. Strict physical and logical access controls govern all of our database infrastructure.",
            "We also operate a continuous bug bounty program and engage third-party cybersecurity firms to conduct routine penetration tests against our application architecture. If a data breach were to occur that affects your personally identifiable information, we are bound by policy to notify you and appropriate regulatory bodies within statutorily mandated timeframes.",
        ],
    },
    {
        id: "your-rights",
        title: "5. Your Privacy Rights",
        label: "Your Rights",
        content: [
            "Depending on your jurisdiction, you may have certain rights regarding your personal information. These rights may include the ability to access, correct, delete, or restrict the processing of your data. You may also have the right to object to our use of your data or to request the transfer of your information to another service provider.",
            "To exercise these rights, please contact our support team. We will respond to your request within a reasonable timeframe and in accordance with applicable laws. Please note that we may need to verify your identity before fulfilling your request to ensure the security of your data.",
            "If you reside in a jurisdiction enforcing the General Data Protection Regulation (GDPR) or the California Consumer Privacy Act (CCPA), you are entitled to request an export of the specific pieces of data we hold on you. Please navigate to your Account settings dashboard, where you can natively trigger a verifiable GDPR/CCPA data pull request.",
            "You always possess the untethered right to revoke consent for any non-essential data processing. However, please be advised that revoking consent for critical data processing operations—such as payment or shipping details—will inherently limit our ability to fulfill orders or provide certain high-level functionalities across the ElectriCity platform.",
        ],
    },
];

function PrivacyComponent() {
    const [activeSection, setActiveSection] = useState("information-collection");

    useEffect(() => {
        const handleScroll = () => {
            const sections = privacySections.map((s) => document.getElementById(s.id));
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
                <h1 className="text-foreground mb-24 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">Privacy Policy</h1>

                <div className="flex flex-col gap-12 md:flex-row md:items-start lg:gap-24">
                    {/* Left Sticky Sidebar */}
                    <div className="sticky top-32 hidden w-55 shrink-0 md:block">
                        <ul className="border-muted flex flex-col space-y-5 border-l">
                            {privacySections.map((section) => (
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
                            {privacySections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Right Content */}
                    <div className="flex flex-1 flex-col gap-28">
                        {privacySections.map((section) => (
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
