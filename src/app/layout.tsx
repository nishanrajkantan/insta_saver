import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://instafetch.net'),
    title: {
        default: "InstaFetch - Instagram Downloader | Save Reels, Stories & Photos",
        template: "%s | InstaFetch"
    },
    description: "Download Instagram Reels, Videos, Photos, Stories, and Carousels in high quality. Free, fast, and anonymous Instagram downloader. No login required.",
    keywords: [
        "instagram downloader",
        "instagram saver",
        "download instagram reels",
        "save instagram stories",
        "instagram photo downloader",
        "instagram carousel downloader",
        "ig saver",
        "instafetch",
        "instagram video download"
    ],
    authors: [{ name: "InstaFetch" }],
    creator: "InstaFetch",
    publisher: "InstaFetch",
    openGraph: {
        title: "InstaFetch - Best Instagram Downloader",
        description: "Download Instagram Reels, Stories, Photos & Carousels instantly. Free, fast, and secure.",
        url: 'https://instafetch.net',
        siteName: 'InstaFetch',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "InstaFetch - Download Instagram Content",
        description: "Save Instagram Reels, Stories & Photos in seconds.",
        creator: "@instafetch",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://instafetch.net',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Banner />
                <Header />
                {children}
                <Footer />
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-RZ9K01KZLL"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-RZ9K01KZLL');
                    `}
                </Script>
            </body>
        </html>
    );
}
