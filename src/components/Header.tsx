import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white">
                        <Instagram size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        InstaFetch
                    </span>
                </Link>

                <nav className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Link href="/" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                        Home
                    </Link>
                    <Link href="/privacy-policy" className="hidden sm:block transition-colors hover:text-zinc-900 dark:hover:text-white">
                        Privacy
                    </Link>
                    <Link href="/contact" className="hidden sm:block transition-colors hover:text-zinc-900 dark:hover:text-white">
                        Contact
                    </Link>
                </nav>
            </div>
        </header>
    );
}
