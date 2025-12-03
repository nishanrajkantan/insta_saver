import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "InstaFetch - Download Instagram Content",
    description: "Download Instagram Posts, Reels, and Carousels easily.",
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
