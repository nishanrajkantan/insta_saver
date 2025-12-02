"use client";

import { motion } from "framer-motion";
import { Image, Video, History, Zap, Shield, Smartphone } from "lucide-react";

const features = [
    {
        icon: <Image className="h-6 w-6" />,
        title: "Photos",
        description: "Download high-quality photos from any public Instagram account.",
        color: "from-pink-500 to-rose-500",
    },
    {
        icon: <Video className="h-6 w-6" />,
        title: "Reels & Videos",
        description: "Save Reels and videos with audio in original quality.",
        color: "from-purple-500 to-indigo-500",
    },
    {
        icon: <History className="h-6 w-6" />,
        title: "Stories",
        description: "View and download stories anonymously (Coming Soon).",
        color: "from-yellow-400 to-orange-500",
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: "Instant",
        description: "No login required. Just paste the link and download.",
        color: "from-green-400 to-emerald-500",
    },
    {
        icon: <Shield className="h-6 w-6" />,
        title: "Secure",
        description: "We don't store your data. Your privacy is our priority.",
        color: "from-blue-400 to-cyan-500",
    },
    {
        icon: <Smartphone className="h-6 w-6" />,
        title: "Responsive",
        description: "Works perfectly on mobile, tablet, and desktop devices.",
        color: "from-red-400 to-pink-500",
    },
];

export default function Features() {
    return (
        <section className="relative z-10 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
                        Everything you need
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                        The ultimate tool for saving Instagram content. Fast, free, and easy to use.
                    </p>
                </motion.div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-8 backdrop-blur-sm transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
                        >
                            <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                                {feature.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
