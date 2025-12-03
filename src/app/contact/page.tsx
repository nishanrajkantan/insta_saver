import React from 'react';
import { Mail } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-zinc-50 px-4 py-24 dark:bg-black text-zinc-900 dark:text-white flex items-center justify-center">
            <div className="max-w-xl w-full space-y-8 text-center">
                <h1 className="text-4xl font-bold">Contact Us</h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                    Have questions, suggestions, or just want to say hi? We'd love to hear from you!
                </p>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                            <Mail size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold">Email Us</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            For support, feedback, or business inquiries:
                        </p>
                        <a
                            href="mailto:nrktech16@gmail.com"
                            className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            nrktech16@gmail.com
                        </a>
                    </div>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    We usually respond within 24-48 hours.
                </p>
            </div>
        </div>
    );
}
