import {
    BarChart,
    Home,
    LayoutDashboard,
    ShoppingCart,
    Users,
    MessageCircleDashed,
    User,
    ShieldCheck,
    Settings,
    MapPin,
    Wallet,
    BookMarkedIcon,
    Image,
} from "lucide-react";

const sharedSidebarItems = [
    { title: "Profile", url: "/dashboard/settings/profile", icon: User },
    { title: "Security", url: "/dashboard/settings/security", icon: ShieldCheck },
    { title: "Addresses", url: "/dashboard/settings/addresses", icon: MapPin },
];

export const settingsSidebarItems = [
    { title: "Profile", href: "/dashboard/settings/profile", icon: User },
    { title: "Security", href: "/dashboard/settings/security", icon: ShieldCheck },
    { title: "Addresses", href: "/dashboard/settings/addresses", icon: MapPin },
];

export const sidebarData = {
    adminNav: [
        {
            title: "Management",
            items: [
                { title: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
                { title: "Orders", url: "/dashboard/admin/orders", icon: ShoppingCart },
                { title: "Users", url: "/dashboard/admin/users", icon: Users },
                { title: "Payments", url: "/dashboard/admin/payments", icon: Wallet },
                { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart },
                { title: "Media", url: "/dashboard/admin/media", icon: Image },
            ],
        },

        {
            title: "Other",
            items: [{ title: "Settings", icon: Settings, items: sharedSidebarItems }],
        },
    ],
    customerNav: [
        {
            title: "Menu",
            items: [
                { title: "Dashboard", url: "/dashboard/customer", icon: Home },
                { title: "My Orders", url: "/dashboard/customer/orders", icon: ShoppingCart },
                { title: "My Payments", url: "/dashboard/customer/payments", icon: Wallet },
                { title: "My Wishlist", url: "/dashboard/customer/wishlist", icon: BookMarkedIcon },
                { title: "My Reviews", url: "/dashboard/customer/reviews", icon: MessageCircleDashed },
            ],
        },

        {
            title: "Other",
            items: [
                {
                    title: "Settings",
                    icon: Settings,
                    items: sharedSidebarItems,
                },
            ],
        },
    ],
};
