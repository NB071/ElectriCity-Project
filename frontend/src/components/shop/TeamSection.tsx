import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const teamMembers = [
    {
        name: "Nima B.",
        role: "Developer",
        image: "/about_us_1.jpg",
        email: "nima.b@project-electricity.app",
        phone: "+1 (123) 456-7890",
        bg: "bg-slate-100",
    },
    {
        name: "Saad A.",
        role: "Developer",
        image: "/about_us_2.jpg",
        email: "saad.a@project-electricity.app",
        phone: "+1 (123) 456-7890",
        bg: "bg-blue-50",
    },
    {
        name: "Shane C.",
        role: "Developer",
        image: "/about_us_3.jpg",
        email: "shane.c@project-electricity.app",
        phone: "+1 (123) 456-7890",
        bg: "bg-red-50",
    },
    {
        name: "Mohammad R.",
        role: "Developer",
        image: "/about_us_1.jpg",
        email: "mohammad.r@project-electricity.app",
        phone: "+1 (123) 456-7890",
        bg: "bg-green-50",
    },
];

export function TeamSection() {
    return (
        <section className="bg-background py-16 md:py-24">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <Badge variant="outline" className="my-5 h-7 w-fit rounded-full bg-white px-3 text-xs font-medium text-black shadow-sm">
                    Team
                </Badge>
                <h2 className="text-foreground mb-10 text-3xl font-bold tracking-tighter lg:text-4xl">Our Team</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {teamMembers.map((member, idx) => (
                        <div key={idx} className={cn("group relative flex flex-col items-center overflow-hidden rounded-3xl pt-8", member.bg)}>
                            <div className="flex w-full flex-col text-center">
                                <h3 className="text-foreground text-lg font-semibold">{member.name}</h3>
                                <p className="text-muted-foreground mt-1 text-sm">{member.role}</p>
                            </div>
                            <div className="relative mt-8 w-full flex-1 px-4 pb-4">
                                <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                                    />
                                    {/* Bottom-to-top items */}
                                    <div className="absolute inset-x-0 bottom-0 flex translate-y-4 flex-col gap-2 p-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="text-foreground hover:bg-muted flex items-center justify-center truncate rounded-full bg-white px-4 py-2 text-xs font-medium text-balance shadow-sm transition-colors"
                                        >
                                            {member.email}
                                        </a>
                                        <a
                                            href={`tel:${member.phone.replace(/\s+/g, "")}`}
                                            className="text-foreground hover:bg-muted flex items-center justify-center truncate rounded-full bg-white px-4 py-2 text-xs font-medium text-balance shadow-sm transition-colors"
                                        >
                                            {member.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
