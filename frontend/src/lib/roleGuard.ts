// Guards dashboard child routes by role using the user already loaded by /dashboard.

import { redirect } from "@tanstack/react-router";
import type { AuthUser } from "@/hooks/use-me";
import { dashboardHomeFor } from "@/lib/auth";

type GuardArgs = {
    context: { user?: AuthUser };
    location: { href: string };
};

function withRoleGuard(requiredRoles: string[]) {
    return {
        staticData: { requiredRoles },
        beforeLoad: ({ context, location }: GuardArgs) => {
            const user = context.user;

            if (!user) {
                throw redirect({ to: "/auth/login", search: { redirect: location.href } });
            }

            if (!requiredRoles.includes(user.role)) {
                throw redirect({ to: dashboardHomeFor(user) });
            }

            return { user };
        },
    };
}

export default withRoleGuard;
