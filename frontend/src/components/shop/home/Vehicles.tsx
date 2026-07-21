import { useState } from "react";
import { Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { UnderlineLinkButton } from "@/components/common/underline-link-button";

import { VehicleCard, type CatalogListItem } from "../VehicleCard";
type CatalogListItemDraft = Omit<CatalogListItem, "image_urls">;

const TABS = [
    { value: "featured", label: "Featured" },
    { value: "hot_deal", label: "Hot Deals" },
    { value: "seasonal", label: "Seasonal" },
    { value: "clearance", label: "Clearance" },
] as const;

const MEDIA_EXT_BY_CID: Record<number, string> = {
    1: "/media/vehicles/Tesla Model 3 2026/ext.jpg",
    2: "/media/vehicles/Tesla Model Y 2023/ext.jpg",
    3: "/media/vehicles/Hyundai Ioniq 5 2026/ext.jpg",
    4: "/media/vehicles/Hyundai Kona Electric 2021/ext.jpg",
    5: "/media/vehicles/KIA EV6 2026/ext.jpg",
    6: "/media/vehicles/Kia EV9 2024/ext.jpg",
    7: "/media/vehicles/Ford Mustang Mach-E 2026/ext.jpg",
    10: "/media/vehicles/Chevrolet Bolt EV 2019/ext.jpg",
    12: "/media/vehicles/Rivian R1S 2024/ext.jpg",
    14: "/media/vehicles/Polestar 2 2022/ext.jpg",
    16: "/media/vehicles/Volkswagen ID.4 2026/ext.jpg",
    18: "/media/vehicles/Nissan Leaf 2018/ext.jpg",
    19: "/media/vehicles/Nissan Ariya 2026/ext.jpg",
    20: "/media/vehicles/BMW i4 2026/ext.jpg",
    22: "/media/vehicles/Audi Q4 e-tron 2026/ext.jpg",
    25: "/media/vehicles/Volvo XC40 Recharge 2022/ext.jpg",
};

const MOCK_VEHICLES: CatalogListItem[] = (
    [
        {
            id: 1,
            item_type: "vehicle",
            name: "Tesla Model 3",
            brand: { id: 1, name: "Tesla" },
            model: { id: 1, name: "Model 3" },
            base_price: 54990,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 1, name: "Great Price", description: null, discount_amount: 2500 }],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 12,
                exterior_color: "Pearl White",
                interior_color: "Black",
                body_shape: "Sedan",
                door_count: 4,
                drivetrain: "RWD",
            },
            category: "featured",
        },
        {
            id: 3,
            item_type: "vehicle",
            name: "Hyundai Ioniq 5",
            brand: { id: 2, name: "Hyundai" },
            model: { id: 3, name: "Ioniq 5" },
            base_price: 54999,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 0,
                exterior_color: "Atlas White",
                interior_color: "Gray",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "featured",
        },
        {
            id: 5,
            item_type: "vehicle",
            name: "Kia EV6",
            brand: { id: 3, name: "Kia" },
            model: { id: 5, name: "EV6" },
            base_price: 53995,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 2, name: "Low Mileage", description: null, discount_amount: 0 }],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 2,
                exterior_color: "Snow White Pearl",
                interior_color: "Black",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "featured",
        },
        {
            id: 7,
            item_type: "vehicle",
            name: "Ford Mustang Mach-E",
            brand: { id: 4, name: "Ford" },
            model: { id: 7, name: "Mustang Mach-E" },
            base_price: 59000,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 18,
                exterior_color: "Grabber Blue",
                interior_color: "Black",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "featured",
        },
        {
            id: 20,
            item_type: "vehicle",
            name: "BMW i4",
            brand: { id: 11, name: "BMW" },
            model: { id: 18, name: "i4" },
            base_price: 62000,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 3, name: "Great Price", description: null, discount_amount: 4000 }],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 5,
                exterior_color: "Alpine White",
                interior_color: "Cognac",
                body_shape: "Sedan",
                door_count: 4,
                drivetrain: "RWD",
            },
            category: "featured",
        },
        {
            id: 22,
            item_type: "vehicle",
            name: "Audi Q4 e-tron",
            brand: { id: 12, name: "Audi" },
            model: { id: 20, name: "Q4 e-tron" },
            base_price: 60000,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 0,
                exterior_color: "Navarra Blue",
                interior_color: "Gray",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "featured",
        },
        {
            id: 16,
            item_type: "vehicle",
            name: "Volkswagen ID.4",
            brand: { id: 9, name: "Volkswagen" },
            model: { id: 15, name: "ID.4" },
            base_price: 48000,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 15,
                exterior_color: "Moonstone Gray",
                interior_color: "Black",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "RWD",
            },
            category: "featured",
        },
        {
            id: 25,
            item_type: "vehicle",
            name: "Volvo XC40 Recharge",
            brand: { id: 15, name: "Volvo" },
            model: { id: 23, name: "XC40 Recharge" },
            base_price: 44500,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 4, name: "Great Price", description: null, discount_amount: 3500 }],
            vehicle: {
                year: 2023,
                condition: "used",
                mileage: 21000,
                exterior_color: "Crystal White",
                interior_color: "Charcoal",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "featured",
        },
        {
            id: 2,
            item_type: "vehicle",
            name: "Tesla Model Y",
            brand: { id: 1, name: "Tesla" },
            model: { id: 2, name: "Model Y" },
            base_price: 47500,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2023,
                condition: "used",
                mileage: 38200,
                exterior_color: "Deep Blue Metallic",
                interior_color: "White",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "hot_deal",
        },
        {
            id: 6,
            item_type: "vehicle",
            name: "Kia EV9",
            brand: { id: 3, name: "Kia" },
            model: { id: 6, name: "EV9" },
            base_price: 58900,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 5, name: "Low Mileage", description: null, discount_amount: 0 }],
            vehicle: {
                year: 2024,
                condition: "used",
                mileage: 22500,
                exterior_color: "Aurora Black Pearl",
                interior_color: "Brown",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "hot_deal",
        },
        {
            id: 12,
            item_type: "vehicle",
            name: "Rivian R1S",
            brand: { id: 6, name: "Rivian" },
            model: { id: 12, name: "R1S" },
            base_price: 92000,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2024,
                condition: "used",
                mileage: 18700,
                exterior_color: "Forest Green",
                interior_color: "Brown",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "hot_deal",
        },
        {
            id: 19,
            item_type: "vehicle",
            name: "Nissan Ariya",
            brand: { id: 10, name: "Nissan" },
            model: { id: 17, name: "Ariya" },
            base_price: 52000,
            stock: 5,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2026,
                condition: "new",
                mileage: 3,
                exterior_color: "Everest White",
                interior_color: "Blue",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "FWD",
            },
            category: "hot_deal",
        },
        {
            id: 4,
            item_type: "vehicle",
            name: "Hyundai Kona Electric",
            brand: { id: 2, name: "Hyundai" },
            model: { id: 4, name: "Kona Electric" },
            base_price: 33900,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 6, name: "Great Price", description: null, discount_amount: 1500 }],
            vehicle: {
                year: 2021,
                condition: "used",
                mileage: 61000,
                exterior_color: "Cyber Gray",
                interior_color: "Black",
                body_shape: "SUV",
                door_count: 5,
                drivetrain: "FWD",
            },
            category: "clearance",
        },
        {
            id: 10,
            item_type: "vehicle",
            name: "Chevrolet Bolt EV",
            brand: { id: 5, name: "Chevrolet" },
            model: { id: 10, name: "Bolt EV" },
            base_price: 21500,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 7, name: "Great Price", description: null, discount_amount: 2000 }],
            vehicle: {
                year: 2019,
                condition: "used",
                mileage: 88000,
                exterior_color: "Summit White",
                interior_color: "Gray",
                body_shape: "Hatchback",
                door_count: 5,
                drivetrain: "FWD",
            },
            category: "clearance",
        },
        {
            id: 14,
            item_type: "vehicle",
            name: "Polestar 2",
            brand: { id: 8, name: "Polestar" },
            model: { id: 14, name: "Polestar 2" },
            base_price: 39500,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [],
            vehicle: {
                year: 2022,
                condition: "used",
                mileage: 52000,
                exterior_color: "Thunder Gray",
                interior_color: "Black",
                body_shape: "Sedan",
                door_count: 5,
                drivetrain: "AWD",
            },
            category: "clearance",
        },
        {
            id: 18,
            item_type: "vehicle",
            name: "Nissan Leaf",
            brand: { id: 10, name: "Nissan" },
            model: { id: 16, name: "Leaf" },
            base_price: 16900,
            stock: 1,
            is_active: true,
            primary_image_url: null,
            promotions: [{ promo_id: 8, name: "Great Price", description: null, discount_amount: 900 }],
            vehicle: {
                year: 2018,
                condition: "used",
                mileage: 71000,
                exterior_color: "Gun Metallic",
                interior_color: "Gray",
                body_shape: "Hatchback",
                door_count: 5,
                drivetrain: "FWD",
            },
            category: "clearance",
        },
    ] satisfies CatalogListItemDraft[]
).map((item) => {
    const primary = MEDIA_EXT_BY_CID[item.id] ?? null;
    return {
        ...item,
        primary_image_url: primary,
        image_urls: galleryFromExt(primary),
    };
});

function galleryFromExt(extPath: string | null): string[] {
    if (!extPath) return [];
    const base = extPath.replace(/\/ext\.jpg$/i, "");
    return [`${base}/ext.jpg`, `${base}/int.jpg`];
}

function Vehicles() {
    const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("hot_deal");
    const [saved, setSaved] = useState<Set<number>>(new Set());

    function toggleSaved(id: number) {
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    return (
        <section className="bg-background pb-16 md:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col gap-3">
                            <Badge variant="outline" className="text-foreground h-7 w-fit rounded-full bg-white px-3 text-xs font-medium">
                                Vehicles
                            </Badge>
                            <h2 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Explore Vehicle Promotions</h2>
                            <TabsList variant="line" className="mt-2 w-full justify-start sm:w-auto">
                                {TABS.map((t) => (
                                    <TabsTrigger key={t.value} value={t.value}>
                                        {t.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <UnderlineLinkButton to="/catalog/deals" lineOffset="after:bottom-1" className="mb-1 self-start md:self-auto">
                            View All
                        </UnderlineLinkButton>
                    </div>

                    {TABS.map((t) => {
                        const items = MOCK_VEHICLES.filter((v) => v.category === t.value);
                        return (
                            <TabsContent key={t.value} value={t.value} className="mt-6">
                                {items.length > 0 ? (
                                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {items.map((item) => (
                                            <li key={item.id}>
                                                <VehicleCard item={item} saved={saved.has(item.id)} onToggleSave={() => toggleSaved(item.id)} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <Empty className="border">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Car className="text-muted-foreground" />
                                            </EmptyMedia>
                                            <EmptyTitle>No vehicles found</EmptyTitle>
                                            <EmptyDescription>
                                                We currently don't have any vehicles listed for {t.label.toLowerCase()}.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </section>
    );
}

export { Vehicles };
