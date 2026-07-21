export type MockCartOption = {
    category_name: string;
    name: string;
    price_delta: number;
};

export type MockCartItem = {
    id: string;
    name: string;
    base_price: number;
    quantity: number;
    image: string;
    configuration?: { options: MockCartOption[] };
};

export const MOCK_ITEMS: MockCartItem[] = [
    {
        id: "1",
        name: "CyberRunner Model X",
        base_price: 85000,
        quantity: 1,
        image: "/logo192.png",
        configuration: {
            options: [
                { category_name: "Color", name: "Midnight Black", price_delta: 2000 },
                { category_name: "Wheels", name: '22" Turbine Wheels', price_delta: 5500 },
            ],
        },
    },
    {
        id: "2",
        name: "EcoDrive Compact",
        base_price: 35000,
        quantity: 1,
        image: "/logo192.png",
        configuration: {
            options: [{ category_name: "Battery", name: "Long Range Plus", price_delta: 7000 }],
        },
    },
    {
        id: "3",
        name: "Standard Charger Wallbox",
        base_price: 500,
        quantity: 2,
        image: "/logo192.png",
    },
    {
        id: "4",
        name: "Standard Charger Wallbox",
        base_price: 500,
        quantity: 2,
        image: "/logo192.png",
    },
    {
        id: "5",
        name: "CyberRunner Model X",
        base_price: 85000,
        quantity: 1,
        image: "/logo192.png",
        configuration: {
            options: [
                { category_name: "Color", name: "Midnight Black", price_delta: 2000 },
                { category_name: "Wheels", name: '22" Turbine Wheels', price_delta: 5500 },
            ],
        },
    },
    {
        id: "6",
        name: "EcoDrive Compact",
        base_price: 35000,
        quantity: 1,
        image: "/logo192.png",
        configuration: {
            options: [{ category_name: "Battery", name: "Long Range Plus", price_delta: 7000 }],
        },
    },
    {
        id: "7",
        name: "Standard Charger Wallbox",
        base_price: 500,
        quantity: 2,
        image: "/logo192.png",
    },
    {
        id: "8",
        name: "Standard Charger Wallbox",
        base_price: 500,
        quantity: 2,
        image: "/logo192.png",
    },
    {
        id: "9",
        name: "CyberRunner Model X",
        base_price: 85000,
        quantity: 1,
        image: "/logo192.png",
        configuration: {
            options: [
                { category_name: "Color", name: "Midnight Black", price_delta: 2000 },
                { category_name: "Wheels", name: '22" Turbine Wheels', price_delta: 5500 },
            ],
        },
    },
    {
        id: "10",
        name: "EcoDrive Compact",
        base_price: 35000,
        quantity: 1,
        image: "/logo192.png",
        configuration: {
            options: [{ category_name: "Battery", name: "Long Range Plus", price_delta: 7000 }],
        },
    },
    {
        id: "11",
        name: "Standard Charger Wallbox",
        base_price: 500,
        quantity: 2,
        image: "/logo192.png",
    },
    {
        id: "12",
        name: "Standard Charger Wallbox",
        base_price: 500,
        quantity: 2,
        image: "/logo192.png",
    },
];

// Resolves unit price based on base price and selected options
export function resolveUnitPrice(item: MockCartItem) {
    if (!item.configuration) return item.base_price;
    const optionsTotal = item.configuration.options.reduce((sum, opt) => sum + opt.price_delta, 0);
    return item.base_price + optionsTotal;
}
