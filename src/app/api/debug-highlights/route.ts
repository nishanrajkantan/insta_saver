
import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;
    const username = 'f1';

    if (!apiKey || !apiHost) {
        return NextResponse.json({ error: 'Missing API key or host' }, { status: 500 });
    }

    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    async function request(endpoint: string) {
        const url = `https://${apiHost}${endpoint}`;
        log(`Fetching ${url}...`);
        try {
            const res = await fetch(url, {
                headers: {
                    'x-rapidapi-key': apiKey!,
                    'x-rapidapi-host': apiHost!,
                },
            });
            log(`Status: ${res.status}`);
            if (res.ok) {
                const json = await res.json();
                return { status: res.status, data: json };
            } else {
                const text = await res.text();
                log(`Error body: ${text.substring(0, 200)}`);
                return { status: res.status, error: text };
            }
        } catch (e: any) {
            log(`Fetch error: ${e.message}`);
            return { status: 0, error: e.message };
        }
    }

    // 1. Fetch Highlights
    const highlightsRes = await request(`/api/v1/highlights?id_or_username=${username}`);
    if (highlightsRes.status !== 200) {
        return NextResponse.json({ logs, error: 'Failed to fetch highlights' });
    }

    const highlights = highlightsRes.data?.data?.items || highlightsRes.data?.data?.highlights || [];
    if (highlights.length === 0) {
        log('No highlights found');
        return NextResponse.json({ logs, message: 'No highlights found' });
    }

    const firstHighlight = highlights[0];
    const highlightId = firstHighlight.id;
    log(`Found highlight: ${firstHighlight.title} (ID: ${highlightId})`);
    log(`Highlight keys: ${Object.keys(firstHighlight).join(', ')}`);

    // Check for nested items
    if (firstHighlight.items) log(`Found nested items: ${firstHighlight.items.length}`);
    if (firstHighlight.stories) log(`Found nested stories: ${firstHighlight.stories.length}`);
    if (firstHighlight.media) log(`Found nested media: ${firstHighlight.media.length}`);

    // 2. Probe Endpoints
    const probeEndpoints = [
        `/api/v1/highlight/stories?highlight_id=${highlightId}`,
        `/api/v1/highlights/stories?highlight_id=${highlightId}`,
        `/api/v1/highlight/items?highlight_id=${highlightId}`,
        `/api/v1/highlight/stories?id=${highlightId}`,
    ];

    const results: any = {};

    for (const endpoint of probeEndpoints) {
        log(`Probing ${endpoint}...`);
        const res = await request(endpoint);
        results[endpoint] = res;

        if (res.status === 200) {
            const data = res.data?.data;
            const items = data?.items || data?.stories || (Array.isArray(data) ? data : []);
            log(`Success? Found ${items.length || 'unknown'} items.`);
            if (items.length > 0) {
                log('Sample item keys: ' + Object.keys(items[0]).join(', '));
            }
        }
    }

    return NextResponse.json({ logs, results });
}
