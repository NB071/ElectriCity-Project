import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";

/** Default delay for live search inputs that hit the API without a submit button. */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Returns `value` after it has stayed unchanged for `delayMs`.
 * Use for live search fields that trigger API requests without a submit button.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = SEARCH_DEBOUNCE_MS): T {
    const [debounced, setDebounced] = useState(value);

    const setDebouncedDelayed = useMemo(
        () =>
            debounce((next: T) => {
                setDebounced(next);
            }, delayMs),
        [delayMs]
    );

    useEffect(() => {
        setDebouncedDelayed(value);
        return () => setDebouncedDelayed.cancel();
    }, [value, setDebouncedDelayed]);

    return debounced;
}
