// temporary...
import { getApiBaseUrl } from "@/lib/env";

function mediaUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;

    const base = getApiBaseUrl();
    if (!base) return path;

    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${base}${encodeURI(normalized)}`;
}

export { mediaUrl };
