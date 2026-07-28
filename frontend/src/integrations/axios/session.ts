// In-memory client session (browser-visible state; auth stays in httpOnly cookies).
// Guest cart token is also mirrored to sessionStorage so SPA reloads can still send
// X-Cart-Session when the httpOnly cart_session cookie is missing/cross-origin.

const CART_STORAGE_KEY = "electricity.cart_session";

function readStoredCartToken(): string | null {
    try {
        const value = sessionStorage.getItem(CART_STORAGE_KEY);
        return value && value.length > 0 ? value : null;
    } catch {
        return null;
    }
}

function writeStoredCartToken(token: string | null): void {
    try {
        if (token) sessionStorage.setItem(CART_STORAGE_KEY, token);
        else sessionStorage.removeItem(CART_STORAGE_KEY);
    } catch {
        // ignore quota / private-mode failures
    }
}

let cartToken: string | null = readStoredCartToken();

export const session = {
    cart: {
        get(): string | null {
            return cartToken;
        },
        set(token: string | null): void {
            cartToken = token;
            writeStoredCartToken(token);
        },
        clear(): void {
            cartToken = null;
            writeStoredCartToken(null);
        },
    },
    clear(): void {
        session.cart.clear();
    },
};
