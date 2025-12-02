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
        // Handle stories: /stories/username/123...
        if (parts[0] === 'stories' && parts.length >= 2) return parts[1];
        return null;
    } catch (e) {
        return null;
    }
}

function extractStoryId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split("/").filter((p) => p);
        // /stories/username/1234567890/
        if (parts[0] === 'stories' && parts.length >= 3) {
            return parts[2];
        }
        return null;
    } catch (e) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let { url, cursor } = body;

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
        const storyId = extractStoryId(url);
        if (storyId) {
            // Story URL
            const story = await fetcher.fetchStory(storyId);
            if (!story) {
                return NextResponse.json(
                    { error: "Could not fetch story. It might be expired or private." },
                    { status: 422 }
                );
            }
            return NextResponse.json({
                success: true,
                type: 'story',
                data: [story],
            });
        } else if (isProfileUrl(url)) {
            // Profile URL
            const username = extractUsername(url);
            if (!username) {
                return NextResponse.json(
                    { error: "Could not extract username" },
                    { status: 400 }
                );
            }

            // If cursor is present, just fetch next page of posts
            if (cursor) {
                const { posts, nextCursor } = await fetcher.fetchUserPosts(username, cursor);
                return NextResponse.json({
                    success: true,
                    type: 'profile_posts',
                    data: {
                        posts,
                        nextCursor
                    }
                });
            }

            // 1. Fetch Profile Info first to get basic info
            const userInfo = await fetcher.fetchUserInfo(username);

            if (!userInfo) {
                return NextResponse.json(
                    { error: "Could not fetch profile. The account might be private or the API limit may have been reached." },
                    { status: 422 }
                );
            }

            // 2. Fetch Posts, Stories (disabled/empty), and Highlights in parallel
            const [postsResult, storiesResult, highlightsResult] = await Promise.allSettled([
                fetcher.fetchUserPosts(username),
                fetcher.fetchUserStories(userInfo.userId),
                fetcher.fetchUserHighlights(username)
            ]);

            const postsData = postsResult.status === 'fulfilled' ? postsResult.value : { posts: [], nextCursor: undefined };
            const stories = storiesResult.status === 'fulfilled' ? storiesResult.value : [];
            const highlights = highlightsResult.status === 'fulfilled' ? highlightsResult.value : [];

            return NextResponse.json({
                success: true,
                type: 'profile',
                data: {
                    stories,
                    highlights,
                    posts: postsData.posts,
                    nextCursor: postsData.nextCursor
                },
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
