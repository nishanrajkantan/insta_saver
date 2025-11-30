import { NextRequest, NextResponse } from "next/server";
import { RapidAPIFetcher } from "@/lib/rapidapi-fetcher";

function isProfileUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split("/").filter((p) => p);
        // https://instagram.com/username or https://www.instagram.com/username/
        return parts.length === 1;
    } catch (e) {
        return false;
    }
}

function extractShortcode(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const match = urlObj.pathname.match(/\/(p|reel)\/([^\/]+)/);
        return match ? match[2] : null;
    } catch (e) {
        return null;
    }
}

function extractUsername(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split("/").filter((p) => p);
        if (parts.length === 1) return parts[0];
        return null;
    } catch (e) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: "URL or username is required" },
                { status: 400 }
            );
        }

        // If input doesn't include "instagram.com", treat it as a username and convert to URL
        if (!url.includes("instagram.com")) {
            // Assume it's a username, convert to profile URL
            url = `https://www.instagram.com/${url.replace('@', '')}/`;
        }

        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST;

        if (!apiKey || !apiHost) {
            return NextResponse.json(
                { error: "RapidAPI credentials not configured. Please set RAPIDAPI_KEY and RAPIDAPI_HOST in your environment." },
                { status: 500 }
            );
        }

        const fetcher = new RapidAPIFetcher(apiKey, apiHost);

        // Determine URL type
        if (isProfileUrl(url)) {
            // Profile URL
            const username = extractUsername(url);
            if (!username) {
                return NextResponse.json(
                    { error: "Could not extract username" },
                    { status: 400 }
                );
            }

            const profile = await fetcher.fetchUserProfile(username);

            if (!profile || profile.posts.length === 0) {
                return NextResponse.json(
                    { error: "Could not fetch profile. The account might be private or the API limit may have been reached." },
                    { status: 422 }
                );
            }

            return NextResponse.json({
                success: true,
                type: 'profile',
                data: profile.posts,
            });
        } else {
            // Post/Reel URL
            const shortcode = extractShortcode(url);
            if (!shortcode) {
                return NextResponse.json(
                    { error: "Could not extract post ID" },
                    { status: 400 }
                );
            }

            const post = await fetcher.fetchPost(shortcode);

            if (!post) {
                return NextResponse.json(
                    { error: "Could not fetch post. It might be private or deleted." },
                    { status: 422 }
                );
            }

            return NextResponse.json({
                success: true,
                type: 'post',
                data: [post],
            });
        }

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
