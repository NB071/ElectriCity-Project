// The purpose of this file is to guard routes based on the user's role.

import { redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { dashboardHomeFor, ensureAuthUser } from "@/lib/auth";

type GuardArgs = {
    context: { queryClient: QueryClient };
    location: { href: string };
};

function withRoleGuard(requiredRoles: string[]) {
    return {
        staticData: { requiredRoles },
        beforeLoad: async ({ context, location }: GuardArgs) => {
            const user = await ensureAuthUser(context.queryClient);

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
