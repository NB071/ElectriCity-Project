// The purpose of this file is to guard routes based on the user's role.

import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

function withRoleGuard(requiredRoles: string[]) {
    return {
        staticData: { requiredRoles },
        beforeLoad: ({ location }: { location: { href: string } }) => {
            const auth = useAuthStore.getState();
            const role = auth.user?.role;

            if (!role || !requiredRoles.includes(role)) {
                const destination = auth.status === "authenticated" ? "/dashboard" : "/auth/login";
                throw redirect({
                    to: destination,
                    search: { redirect: location.href },
                });
            }
        },
    };
}

export default withRoleGuard;
