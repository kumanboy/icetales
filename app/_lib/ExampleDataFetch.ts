export type FetchOptions = RequestInit & {
    timeoutMs?: number;    // abort after this many ms (default 10s)
    retries?: number;      // number of retries on network failure (default 0)
    retryDelayMs?: number; // delay between retries (default 500ms)
};

function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * Generic JSON fetch helper with timeout and optional retries.
 * Usage: const data = await fetchJson<MyType>('/api/thing', { method: 'GET' });
 */
export async function fetchJson<T = unknown>(
    input: RequestInfo,
    init: FetchOptions = {}
): Promise<T> {
    const {
        timeoutMs = 10000,
        retries = 0,
        retryDelayMs = 500,
        ...requestInit
    } = init;

    let attempt = 0;
    while (true) {
        attempt++;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(input, { ...requestInit, signal: controller.signal });
            clearTimeout(timeout);

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                const err = new Error(`Request failed: ${res.status} ${res.statusText}`) as any;
                err.status = res.status;
                err.body = text;
                throw err;
            }

            // Try parse JSON; if empty body, return undefined as any
            const text = await res.text();
            if (!text) return undefined as any as T;
            return JSON.parse(text) as T;
        } catch (err: any) {
            clearTimeout(timeout);
            const isAbort = err && (err.name === 'AbortError' || err.message === 'The user aborted a request.');
            const isLast = attempt > retries;
            // For abort or non-network errors, don't retry
            if (isLast || (!isAbort && !(err instanceof TypeError))) {
                throw err;
            }
            // retry on transient network errors (TypeError from fetch)
            await delay(retryDelayMs);
        }
    }
}

/**
 * Example convenience function for fetching example data.
 * Replace url and type with your API specifics.
 */
export async function fetchExampleData(): Promise<{ id: number; title: string }[]> {
    return fetchJson<{ id: number; title: string }[]>('/api/examples', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeoutMs: 8000,
        retries: 1,
    });
}