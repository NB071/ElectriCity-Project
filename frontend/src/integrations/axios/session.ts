// Axios session management (in-memory).

let accessToken: string | null = null;
let cartSession: string | null = null;

export function getAccessToken(): string | null {
    return accessToken;
}

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

export function clearAccessToken(): void {
    accessToken = null;
}

export function getCartSession(): string | null {
    return cartSession;
}

export function setCartSession(sessionToken: string | null): void {
    cartSession = sessionToken;
}

export function clearCartSession(): void {
    cartSession = null;
}

export function clearClientSession(): void {
    clearAccessToken();
    clearCartSession();
}
