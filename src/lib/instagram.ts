import { load } from "cheerio";

export const INSTAGRAM_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Upgrade-Insecure-Requests": "1",
};

export async function fetchInstagramContent(url: string, sessionId?: string) {
    const headers: Record<string, string> = { ...INSTAGRAM_HEADERS };
    if (sessionId) {
        headers["Cookie"] = `sessionid=${sessionId}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch Instagram page: ${response.status}`);
        }
        const html = await response.text();
        return html;
    } catch (error) {
        console.error("Error fetching Instagram content:", error);
        throw error;
    }
}

export function parseInstagramPost(html: string) {
    const $ = load(html);

    // Try to get Open Graph data first (easiest for public posts)
    const title = $('meta[property="og:title"]').attr("content") || "";
    const description = $('meta[property="og:description"]').attr("content") || "";
    const image = $('meta[property="og:image"]').attr("content");
    const video = $('meta[property="og:video"]').attr("content");
    const type = video ? "video" : "image";

    // If we found basic OG data, return it
    if (image || video) {
        return {
            type,
            thumbnail: image,
            url: video || image,
            title,
            description,
        };
    }

    return null;
}

export function isProfileUrl(url: string) {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split("/").filter((p) => p);
        // https://instagram.com/username or https://www.instagram.com/username/
        return parts.length === 1;
    } catch (e) {
        return false;
    }
}

export function parseInstagramProfile(html: string) {
    try {
        const $ = load(html);
        const posts: any[] = [];

        // Strategy 1: Scrape the DOM (if SSR'd)
        $('article a').each((_, element) => {
            const href = $(element).attr('href');
            const img = $(element).find('img').first();
            const src = img.attr('src');
            const alt = img.attr('alt') || "";

            if (href && (href.includes('/p/') || href.includes('/reel/'))) {
                posts.push({
                    type: href.includes('/reel/') ? 'video' : 'image',
                    thumbnail: src,
                    url: `https://www.instagram.com${href}`,
                    title: alt,
                    description: alt,
                    id: href.split('/')[3] || Math.random().toString(36).substr(2, 9),
                });
            }
        });

        if (posts.length > 0) return posts;

        // Strategy 2: Regex for JSON data (more aggressive)
        // Look for any occurrence of edge_owner_to_timeline_media
        const timelineMatch = html.match(/"edge_owner_to_timeline_media":\s*({[^}]+?edges":\[.*?\]})/);
        if (timelineMatch) {
            try {
                const edgesMatch = timelineMatch[1].match(/"edges":(\[.*?\])/);
                if (edgesMatch) {
                    const edges = JSON.parse(edgesMatch[1]);
                    return edges.map((edge: any) => {
                        const node = edge.node;
                        return {
                            type: node.is_video ? "video" : "image",
                            thumbnail: node.display_url,
                            url: `https://www.instagram.com/p/${node.shortcode}/`,
                            title: node.edge_media_to_caption?.edges[0]?.node?.text || "",
                            description: "",
                            id: node.id,
                            shortcode: node.shortcode,
                        };
                    });
                }
            } catch (e) {
                console.log("Regex JSON parse failed, trying next strategy");
            }
        }

        return null;
    } catch (e) {
        console.error("Error parsing profile:", e);
        return null;
    }
}
