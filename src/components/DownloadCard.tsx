"use client";

import { motion } from "framer-motion";
import { ExternalLink, Play, Image as ImageIcon, Download } from "lucide-react";
import { useState } from "react";

import { downloadMedia, resolveCarousel } from "@/app/actions";

import StorySelectionModal from "./StorySelectionModal";

interface DownloadCardProps {
    data: {
        type: "image" | "video" | "highlight" | "carousel";
        url: string;
        thumbnail?: string;
        title?: string;
        description?: string;
        shortcode?: string;
        id?: string;
        media?: {
            type: "image" | "video";
            url: string;
            thumbnail?: string;
        }[];
    };
}

export default function DownloadCard({ data }: DownloadCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [highlightStories, setHighlightStories] = useState<any[]>([]);

    const handleDownload = async () => {
        console.log('[DownloadCard] handleDownload clicked', {
            id: data.id,
            type: data.type,
            shortcode: data.shortcode,
            mediaCount: data.media?.length
        });

        // For highlights, just download the cover image directly
        if (data.type === 'highlight') {
            await performDownload(undefined, data.thumbnail);
            return;
        }

        // Always try to resolve the post details to check for carousel media
        // This is necessary because the list API often fails to identify carousel posts
        setIsDownloading(true);
        setIsResolving(true);
        try {
            console.log('[DownloadCard] Resolving carousel...');
            if (data.shortcode) {
                const result = await resolveCarousel(data.shortcode);
                console.log('[DownloadCard] Resolution result:', result);

                // If we found carousel media, show the modal
                if (result.success && result.media && result.media.length > 0) {
                    const carouselItems = result.media.map((item: any, index: number) => ({
                        id: `${data.id}-${index}`,
                        url: item.url,
                        thumbnail: item.thumbnail || item.url,
                        type: item.type,
                    }));
                    setHighlightStories(carouselItems);
                    setShowModal(true);
                    setIsDownloading(false);
                    setIsResolving(false);
                    return;
                }
            }
        } catch (error) {
            console.error("[DownloadCard] Failed to resolve carousel:", error);
            // Continue to normal download if resolution fails
        } finally {
            setIsResolving(false);
        }

        console.log('[DownloadCard] Proceeding to normal download');
        // If no carousel media found or resolution failed, proceed with normal download
        await performDownload(data.shortcode, data.thumbnail);
    };

    const performDownload = async (shortcode?: string, thumbnail?: string) => {
        try {
            setIsDownloading(true);

            // If we have a direct URL (like from highlight cover), download it directly
            if (!shortcode && thumbnail) {
                const response = await fetch(thumbnail);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `instagram-${Date.now()}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return;
            }

            if (!shortcode) {
                throw new Error("No shortcode available");
            }

            const result = await downloadMedia(shortcode, thumbnail);

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.data && result.filename) {
                const a = document.createElement("a");
                a.href = result.data;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Download failed:", error);
            // Only open in new tab if it's a real post and download failed
            if (shortcode && !thumbnail?.startsWith('blob:')) {
                window.open(`https://www.instagram.com/p/${shortcode}/`, "_blank");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const isStory = data.title === 'Instagram Story';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full overflow-hidden rounded-2xl bg-white/80 shadow-xl backdrop-blur-md dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800"
            >
                <div className={`relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${isStory ? 'aspect-[9/16]' : 'aspect-square'}`}>
                    {data.type === "video" ? (
                        <video
                            src={data.thumbnail}
                            controls
                            className="h-full w-full object-cover"
                            poster={data.thumbnail}
                        />
                    ) : (
                        <img
                            src={data.thumbnail}
                            alt="Instagram Content"
                            className="h-full w-full object-cover"
                        />
                    )}
                    <div className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm">
                        {data.type === "video" ? <Play size={20} /> : <ImageIcon size={20} />}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5em]">
                        {data.title || "Instagram Post"}
                    </h3>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 p-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {isDownloading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : null}
                        <span className="leading-none">
                            {isResolving || isDownloading ? "Downloading..." : "Download"}
                        </span>
                    </button>
                </div>
            </motion.div>

            <StorySelectionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                items={highlightStories}
                title={data.title || "Select Media"}
                onDownload={(item) => {
                    performDownload(undefined, item.url || item.thumbnail);
                }}
            />
        </>
    );
}
