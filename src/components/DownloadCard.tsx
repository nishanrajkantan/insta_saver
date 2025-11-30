"use client";

import { motion } from "framer-motion";
import { ExternalLink, Play, Image as ImageIcon, Download } from "lucide-react";

import { downloadMedia } from "@/app/actions";

interface DownloadCardProps {
    data: {
        type: "image" | "video";
        url: string;
        thumbnail?: string;
        title?: string;
        description?: string;
        shortcode?: string;
    };
}

export default function DownloadCard({ data }: DownloadCardProps) {
    const handleDownload = async () => {
        try {
            if (!data.shortcode) {
                throw new Error("No shortcode available");
            }

            const result = await downloadMedia(data.shortcode, data.thumbnail);

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
            // Fallback
            window.open(`https://www.instagram.com/p/${data.shortcode}/`, "_blank");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white/80 shadow-xl backdrop-blur-md dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
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

            <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {data.title || "Instagram Post"}
                </h3>
                <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {data.description || "No description available."}
                </p>

                <button
                    onClick={handleDownload}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-3.5 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                >
                    <Download size={20} />
                    Download
                </button>
            </div>
        </motion.div>
    );
}
