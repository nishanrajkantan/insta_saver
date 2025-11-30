"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Instagram, AlertCircle } from "lucide-react";
import DownloadCard from "@/components/DownloadCard";

export default function Home() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await fetch("/api/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to fetch content");
            }

            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-24 dark:bg-black">
            {/* Background Gradients */}
            <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-purple-500/30 blur-[100px]" />
            <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-pink-500/30 blur-[100px]" />

            <div className="z-10 w-full max-w-xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white shadow-lg">
                        <Instagram size={32} />
                    </div>
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        InstaSaver
                    </h1>
                    <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
                        Download Instagram Posts, Reels & Stories instantly.
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="relative mb-12"
                >
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Paste Instagram Link here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-12 pr-4 text-lg shadow-sm transition-all focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="absolute right-2 rounded-xl bg-zinc-900 px-4 py-2 font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Go"}
                        </button>
                    </div>
                </motion.form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 flex items-center justify-center gap-2 rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        >
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    {data && Array.isArray(data) && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {data.map((item: any, index: number) => (
                                <DownloadCard key={item.id || index} data={item} />
                            ))}
                        </div>
                    )}

                    {data && !Array.isArray(data) && (
                        <div className="flex justify-center">
                            <DownloadCard data={data} />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
