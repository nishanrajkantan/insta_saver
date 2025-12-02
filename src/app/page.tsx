"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Instagram, AlertCircle } from "lucide-react";
import DownloadCard from "@/components/DownloadCard";
import Features from "@/components/Features";

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

    const [loadingMore, setLoadingMore] = useState(false);

    const handleLoadMore = async () => {
        if (!data?.nextCursor || loadingMore) return;

        setLoadingMore(true);
        try {
            const res = await fetch("/api/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, cursor: data.nextCursor }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to fetch more posts");
            }

            if (result.data?.posts) {
                setData((prev: any) => ({
                    ...prev,
                    posts: [...prev.posts, ...result.data.posts],
                    nextCursor: result.data.nextCursor,
                }));
            }
        } catch (err: any) {
            console.error("Load more error:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Easter eggs for developers 🥚
    useEffect(() => {
        console.log('%c🚀 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #ff006e;');
        console.log('%c👀 Found the secret messages, huh?', 'font-size: 16px; color: #8338ec;');
        console.log('%c💡 Fun fact: This app can download carousel posts with up to 10 images!', 'font-size: 14px; color: #3a86ff;');
        console.log('%c🎨 Built with Next.js, Tailwind, and way too much coffee ☕', 'font-size: 14px; color: #fb5607;');
        console.log('%c🐛 If you find a bug, congrats! You get a free virtual cookie 🍪', 'font-size: 14px; color: #06ffa5;');
        console.log('%c📧 Wanna hire the dev? Good luck finding me! 😎', 'font-size: 14px; color: #ffbe0b;');
        console.log('%c⚠️ Disclaimer: We are NOT affiliated with Instagram. Please dont sue us, Zuck! 🙏', 'font-size: 12px; font-style: italic; color: #666;');
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-24 dark:bg-black">
            {/* 
                👋 Hello there, inspector!
                You found the secret comment section!
                🎉 Achievement unlocked: "HTML Detective"
                
                Quick stats:
                - Lines of code: Too many to count
                - Bugs fixed: Infinity + 1
                - Coffees consumed: Yes
                - Hours of sleep: What's that?
                
                Fun fact: The developer wrote this at 3 AM 🌙
            */}

            {/* Coming Soon Banner */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
                <p className="animate-pulse">
                    🚀 Coming Soon: Stories & Highlights Download - Stay Tuned!
                </p>
            </div>

            {/* Background Gradients */}
            {/* These circles are just vibing in the background, living their best life 🔵🟣 */}
            <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-purple-500/30 blur-[100px]" />
            <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-pink-500/30 blur-[100px]" />

            <div className="z-10 w-full max-w-xl text-center">
                {/* 🎨 The beautiful UI you see was NOT made by a designer. 
                     It was made by a developer with Pinterest and Stack Overflow open in 47 tabs. */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white shadow-lg">
                        <Instagram size={32} />
                    </div>
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        InstaFetch
                    </h1>
                    <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
                        Download Instagram Posts, Reels & Carousels instantly.
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
                            placeholder="Paste Instagram username or link..."
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

                    {/* Structured Profile Data */}
                    {data && !Array.isArray(data) && data.posts && (
                        <div className="space-y-12 w-full max-w-[1600px]">
                            {/* Stories Section - Coming Soon */}
                            {/* {data.stories && data.stories.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-left pl-2">Stories</h2>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {data.stories.map((item: any, index: number) => (
                                            <DownloadCard key={item.id || `story-${index}`} data={item} />
                                        ))}
                                    </div>
                                </div>
                            )} */}

                            {/* Highlights Section - Coming Soon */}
                            {/* {data.highlights && data.highlights.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-left pl-2">Highlights</h2>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {data.highlights.map((item: any, index: number) => (
                                            <DownloadCard key={item.id || `highlight-${index}`} data={item} />
                                        ))}
                                    </div>
                                </div>
                            )} */}

                            {/* Posts Section */}
                            {data.posts && data.posts.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-left pl-2">Posts</h2>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {data.posts.map((item: any, index: number) => (
                                            <DownloadCard key={item.id || `post-${index}`} data={item} />
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {data.nextCursor && (
                                        <div className="flex justify-center pt-8">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                            >
                                                {loadingMore ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    "Load More"
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Single Item or Legacy Array Data */}
                    {data && Array.isArray(data) && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {data.map((item: any, index: number) => (
                                <DownloadCard key={item.id || index} data={item} />
                            ))}
                        </div>
                    )}

                    {/* Single Object (Post/Story) */}
                    {data && !Array.isArray(data) && !data.posts && (
                        <div className="flex justify-center">
                            <DownloadCard data={data} />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* 
                🎓 Developer's Note:
                If you're reading this, you probably know more about web dev than my mom.
                She still thinks I "fix computers" for a living. Close enough, mom. Close enough.
                
                PS: Yes, I know this comment is useless. But so is checking the HTML in DevTools
                instead of just using the app. Yet here we are. 🤷‍♂️
                
                PPS: The API we use is kinda slow sometimes. Blame Instagram, not me.
                
                PPPS: Okay fine, maybe blame me a little bit.
            */}
            <Features />
        </main>
    );
}
