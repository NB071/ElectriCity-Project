import { Link, useLocation } from "@tanstack/react-router";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";

export function Breadcrumbs() {
    const location = useLocation();

    // Split the pathname by '/' and remove empty segments
    const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");

    // If we're on the home page, don't show breadcrumbs
    if (pathSegments.length === 0) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {pathSegments.length > 0 && <BreadcrumbSeparator />}

                {pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;

                    // Reconstruct the path up to this segment
                    const path = "/" + pathSegments.slice(0, index + 1).join("/");

                    // Format segment string (e.g. "my-account" -> "My Account")
                    const formattedSegment = segment
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

                    return (
                        <React.Fragment key={path}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={path}>{formattedSegment}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>

                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
