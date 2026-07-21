import { Link } from "@tanstack/react-router";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { headerNav } from "@/components/layout/data/header-data";
import { cn } from "@/lib/utils";
import LinkItem from "./LinkItem";

export function DesktopNav() {
    return (
        <NavigationMenu delayDuration={0} className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
                {headerNav.map((item) =>
                    item.children?.length ? (
                        <NavigationMenuItem key={item.label} className="bg-transparent">
                            <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 focus:bg-white/10 data-active:bg-white/10 data-[state=open]:bg-white/10">
                                {item.label}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="p-1">
                                {(() => {
                                    const allHaveDescriptions = item.children.every((c) => c.description);
                                    const someHaveDescriptions = item.children.some((c) => c.description);

                                    if (allHaveDescriptions) {
                                        return (
                                            <div className="grid w-150 gap-2 p-5 md:grid-cols-2">
                                                {item.children.map((child) => (
                                                    <LinkItem
                                                        key={child.to}
                                                        href={child.to as string}
                                                        label={child.label}
                                                        icon={child.icon && <child.icon />}
                                                        className="rounded-lg bg-transparent duration-200 hover:bg-gray-200/50 hover:shadow-sm focus:bg-gray-500/5"
                                                        description={child.description}
                                                    />
                                                ))}
                                            </div>
                                        );
                                    }

                                    if (someHaveDescriptions) {
                                        return (
                                            <div className="flex w-125 gap-2 p-1">
                                                <div className="flex flex-1 flex-col gap-1 rounded-xl bg-white/5 p-3">
                                                    {item.children
                                                        .filter((c) => c.description)
                                                        .map((child) => (
                                                            <LinkItem
                                                                key={child.to}
                                                                href={child.to as string}
                                                                label={child.label}
                                                                icon={child.icon && <child.icon />}
                                                                className="bg-transparent hover:bg-white/10 focus:bg-white/5"
                                                                description={child.description}
                                                            />
                                                        ))}
                                                </div>
                                                <div className="flex flex-1 flex-col gap-1 p-3">
                                                    {item.children
                                                        .filter((c) => !c.description)
                                                        .map((child) => (
                                                            <LinkItem
                                                                key={child.to}
                                                                href={child.to as string}
                                                                label={child.label}
                                                                icon={child.icon && <child.icon />}
                                                                className="bg-transparent hover:bg-white/10 focus:bg-white/5"
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid w-48 gap-1 p-2 md:w-56 md:grid-cols-1">
                                            {item.children.map((child) => (
                                                <LinkItem
                                                    key={child.to}
                                                    href={child.to as string}
                                                    label={child.label}
                                                    icon={child.icon && <child.icon />}
                                                    className="bg-transparent hover:bg-white/5 focus:bg-white/5"
                                                />
                                            ))}
                                        </div>
                                    );
                                })()}
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    ) : (
                        <NavigationMenuItem key={item.label} className="rounded-md bg-transparent text-white hover:bg-white/10">
                            <Link
                                to={item.to ?? "/"}
                                className={cn(
                                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-50"
                                )}
                            >
                                {item.label}
                            </Link>
                        </NavigationMenuItem>
                    )
                )}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
