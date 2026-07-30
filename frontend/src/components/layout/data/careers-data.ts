export type LocationType = "remote" | "hybrid" | "onsite";
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";

export interface JobPosition {
    id: string;
    title: string;
    department: string;
    location: string;
    locationType: LocationType;
    employmentType: EmploymentType;
    postedDate: string;
    salaryRange: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
    applicationDeadline?: string;
    teamSize: number;
    reportingTo: string;
    featured?: boolean;
}

export const mockJobs: JobPosition[] = [
    {
        id: "ev-sales-associate",
        title: "EV Sales Associate",
        department: "Sales",
        location: "Toronto, ON",
        locationType: "onsite",
        employmentType: "full-time",
        postedDate: "2023-06-15",
        description:
            "Join our flagship Toronto showroom as an EV Sales Associate. You will guide customers through our diverse catalog of electric vehicles, offering test rides and explaining financing options.",
        requirements: [
            "2+ years of retail sales experience, preferably in automotive or electronics",
            "Passion for sustainable energy and electric vehicles",
            "Excellent communication and customer service skills",
            "Ability to work weekends and holidays",
            "Valid driver's license",
        ],
        responsibilities: [
            "Greet and assist customers in the showroom",
            "Provide deep product knowledge on various EV models, specs, and ranges",
            "Conduct test rides and safety briefings",
            "Assist customers with financing applications and checkout processes",
            "Maintain showroom presentation and vehicle cleanliness",
            "Follow up with leads and schedule showroom appointments",
        ],
        benefits: [
            "Competitive base salary plus uncapped commission",
            "Health, dental, and vision insurance",
            "Employee discount on all EVs and accessories",
            "Paid training and certification programs",
            "Generous PTO and paid holidays",
        ],
        salaryRange: "$50,000 - $70,000 + Commission",
        applicationDeadline: "2023-08-31",
        teamSize: 12,
        reportingTo: "Showroom Manager",
        featured: true,
    },
    {
        id: "master-ev-technician",
        title: "Master EV Technician",
        department: "Service",
        location: "Markham, ON",
        locationType: "onsite",
        employmentType: "full-time",
        postedDate: "2023-06-20",
        description:
            "We are seeking a highly skilled EV Technician for our Markham service center. You will diagnose, repair, and maintain our cutting-edge electric bikes, scooters, and vehicles.",
        requirements: [
            "3+ years of experience in automotive or PEV (Personal Electric Vehicle) repair",
            "Certification in High Voltage systems is a strong plus",
            "Strong diagnostic skills using digital tools",
            "Ability to lift heavy components safely",
        ],
        responsibilities: [
            "Perform advanced diagnostics on high-voltage and drivetrain systems",
            "Execute software updates and recalibrations for battery management",
            "Document all repair work thoroughly in the vehicle service log",
            "Mentor junior technicians on PEV maintenance best practices",
        ],
        benefits: [
            "Top-tier compensation for specialized EV skills",
            "Comprehensive health benefits suite",
            "Regular paid training for new EV platforms",
            "Tool allowance and safety gear provided",
        ],
        salaryRange: "$70,000 - $90,000",
        applicationDeadline: "2023-09-15",
        teamSize: 8,
        reportingTo: "Service Center Director",
        featured: true,
    },
    {
        id: "ecommerce-manager",
        title: "E-Commerce Manager",
        department: "Marketing",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        postedDate: "2023-06-25",
        description:
            "Lead our digital storefront strategy! You will manage product listings, optimize conversion rates, and coordinate with logistics to ensure a seamless online customer experience.",
        requirements: [
            "4+ years of e-commerce management experience",
            "Strong analytical skills and data-driven mindset",
            "Experience with modern headless commerce platforms",
            "Understanding of SEO and digital marketing campaigns",
        ],
        responsibilities: [
            "Oversee online product catalog and digital merchandising",
            "Track and analyze web metrics to identify conversion bottlenecks",
            "Collaborate with the engineering team to deploy web enhancements",
            "Manage digital advertising budgets across multiple regions",
        ],
        benefits: [
            "Competitive salary with performance bonuses",
            "Remote work flexibility",
            "Comprehensive health care plan",
            "Company-provided laptop and home office stipend",
        ],
        salaryRange: "$90,000 - $120,000",
        teamSize: 5,
        reportingTo: "VP of Marketing",
    },
    {
        id: "logistics-coordinator",
        title: "Logistics Coordinator",
        department: "Logistics",
        location: "North York, ON",
        locationType: "hybrid",
        employmentType: "full-time",
        postedDate: "2023-07-01",
        description:
            "Ensure our EVs reach our customers safely and efficiently. You will coordinate freight shipments, manage inventory at our North York warehouse, and optimize delivery routes.",
        requirements: [
            "2+ years of supply chain or logistics experience",
            "Excellent organizational and multi-tasking abilities",
            "Familiarity with inventory management software",
            "Strong vendor negotiation skills",
        ],
        responsibilities: [
            "Coordinate inbound and outbound freight shipments",
            "Manage direct-to-consumer delivery partner relationships",
            "Optimize warehouse storage footprint for varying vehicle sizes",
            "Process multi-channel orders and coordinate cross-border logistics",
        ],
        benefits: [
            "Stable salary with quarterly supply chain incentives",
            "Health and dental plans",
            "Commuter subsidy options",
            "Generous vacation days",
        ],
        salaryRange: "$60,000 - $75,000",
        applicationDeadline: "2023-08-01",
        teamSize: 10,
        reportingTo: "Head of Supply Chain",
    },
    {
        id: "fullstack-developer",
        title: "Fullstack E-Commerce Developer",
        department: "Engineering",
        location: "Remote",
        locationType: "remote",
        employmentType: "contract",
        postedDate: "2023-07-05",
        description:
            "Help us build the most performant EV purchasing platform! You'll work on our React/Node stack to build new catalog features and integration with financing APIs.",
        requirements: [
            "3+ years of Fullstack JavaScript/TypeScript experience",
            "Proficiency in React and modern state management",
            "Experience building RESTful APIs",
            "Familiarity with payment gateways (Stripe, PayPal)",
        ],
        responsibilities: [
            "Develop and maintain reactive storefront applications",
            "Build secure checkout and financing integrations",
            "Refactor legacy codebase to modern React architectural standards",
            "Participate in agile sprints and code reviews",
        ],
        benefits: [
            "High hourly contract rate",
            "Complete remote autonomy",
            "Opportunity to shape modern tech stacks",
            "Flexibility on operating hours",
        ],
        salaryRange: "$80 - $110 / hr",
        teamSize: 4,
        reportingTo: "Engineering Manager",
        featured: true,
    },
];
