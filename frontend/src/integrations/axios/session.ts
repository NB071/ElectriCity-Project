// In-memory client session (browser-visible state; auth stays in httpOnly cookies).

let cartToken: string | null = null;

export const session = {
    cart: {
        get(): string | null {
            return cartToken;
        },
        set(token: string | null): void {
            cartToken = token;
        },
        clear(): void {
            cartToken = null;
        },
    },
    clear(): void {
        session.cart.clear();
    },
};
