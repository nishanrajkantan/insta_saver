import { NextRequest, NextResponse } from "next/server";
import { InstagramGraphQLFetcher } from "@/lib/graphql-fetcher";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const sessionId = process.env.INSTAGRAM_SESSION_ID;

        if (!sessionId) {
            return NextResponse.json(
                { error: "Stories require authentication. Please configure INSTAGRAM_SESSION_ID." },
                { status: 403 }
            );
        }

        const fetcher = new InstagramGraphQLFetcher(sessionId);

        // First, get the user profile to extract userId
        const profile = await fetcher.fetchUserProfile(username);

        if (!profile) {
            return NextResponse.json(
                { error: "Could not find user profile" },
                { status: 404 }
            );
        }

        // Now fetch stories using the userId
        const stories = await fetcher.fetchStories(profile.userId);

        return NextResponse.json({
            success: true,
            type: 'stories',
            data: stories,
            username: profile.username,
        });

    } catch (error: any) {
        console.error("Stories API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
