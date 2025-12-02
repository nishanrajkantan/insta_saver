import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path");
    const query = searchParams.get("query");

    if (!path) {
        return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
        return NextResponse.json({ error: "API key or host not set" }, { status: 500 });
    }

    const url = `https://${apiHost}${path}${query ? `?${query}` : ""}`;
    console.log(`[Probe] Fetching: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost,
            },
        });

        const data = await response.json();
        return NextResponse.json({
            url,
            status: response.status,
            data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
