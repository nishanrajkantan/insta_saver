import { NextRequest, NextResponse } from 'next/server';
import { RapidAPIFetcher } from '@/lib/rapidapi-fetcher';

export async function POST(request: NextRequest) {
    try {
        const { shortcode } = await request.json();

        if (!shortcode) {
            return NextResponse.json({ error: 'Shortcode required' }, { status: 400 });
        }

        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST;

        if (!apiKey || !apiHost) {
            return NextResponse.json({ error: 'API not configured' }, { status: 500 });
        }

        const fetcher = new RapidAPIFetcher(apiKey, apiHost);
        const post = await fetcher.fetchPost(shortcode);

        if (!post || !post.url) {
            return NextResponse.json({ error: 'Media URL not found' }, { status: 404 });
        }

        const mediaRes = await fetch(post.url);
        if (!mediaRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch media' }, { status: 502 });
        }
        const buffer = Buffer.from(await mediaRes.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': mediaRes.headers.get('Content-Type') || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="instagram-${Date.now()}.${post.type === 'video' ? 'mp4' : 'jpg'}"`,
            },
        });
    } catch (error: any) {
        console.error('[Download API] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
