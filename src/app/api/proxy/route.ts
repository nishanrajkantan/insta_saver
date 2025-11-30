import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        // Fetch the image from Instagram
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
        }

        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Content-Disposition': `attachment; filename="instagram-${Date.now()}.jpg"`,
            },
        });
    } catch (error: any) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json({ error: 'Failed to download' }, { status: 500 });
    }
}
