import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-black">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        InstaFetch
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        © {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>

                <div className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Link href="/privacy-policy" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                        Privacy Policy
                    </Link>
                    <Link href="/contact" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                        Contact Us
                    </Link>
                </div>
            </div>
        </footer>
    );
}
