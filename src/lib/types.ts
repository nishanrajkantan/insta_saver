// Shared types for Instagram data

export interface InstagramPost {
    id: string;
    type: 'image' | 'video' | 'carousel';
    thumbnail: string;
    url: string;
    title: string;
    description: string;
    shortcode?: string;
    media?: {
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
    }[];
}

export interface InstagramStory {
    id: string;
    type: 'image' | 'video';
    thumbnail: string;
    url: string;
    expiresAt: number;
}

export interface InstagramProfile {
    username: string;
    fullName: string;
    profilePic: string;
    userId: string;
    posts: InstagramPost[];
    nextCursor?: string;
}

export interface FetcherResponse {
    success: boolean;
    type: 'post' | 'profile' | 'stories';
    data: InstagramPost[] | InstagramStory[];
    error?: string;
}
