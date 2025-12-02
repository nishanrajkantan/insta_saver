"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Image as ImageIcon, Play } from "lucide-react";

interface Story {
    id: string;
    url: string;
    thumbnail: string;
    type: "image" | "video";
    date?: number;
}

interface StorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: Story[];
    onDownload: (item: Story) => void;
    title: string;
}

export default function StorySelectionModal({
    isOpen,
    onClose,
    items,
    onDownload,
    title,
}: StorySelectionModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container - Centered */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 max-h-[85vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
                                        >
                                            <img
                                                src={item.thumbnail}
                                                alt="Thumbnail"
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Type Indicator */}
                                            <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
                                                {item.type === "video" ? (
                                                    <Play size={14} />
                                                ) : (
                                                    <ImageIcon size={14} />
                                                )}
                                            </div>

                                            {/* Download Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => onDownload(item)}
                                                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
                                                >
                                                    <Download size={16} />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
