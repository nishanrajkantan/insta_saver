import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 px-4 py-24 dark:bg-black text-zinc-900 dark:text-white">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
                <p className="text-zinc-600 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">1. Introduction</h2>
                    <p>
                        Welcome to InstaFetch ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website instafetch.net.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
                    <p>
                        We do not collect any personal information from you directly. We do not require you to create an account or provide your name, email address, or phone number to use our service.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Usage Data:</strong> We may collect non-personal information about how you interact with our website, such as your IP address, browser type, device type, and pages visited. This is done via Google Analytics.</li>
                        <li><strong>Cookies:</strong> We use cookies to enhance your experience and for analytics purposes. You can choose to disable cookies through your browser settings.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
                    <p>
                        We use the collected information for the following purposes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To provide and maintain our service.</li>
                        <li>To monitor the usage of our service and improve user experience.</li>
                        <li>To detect, prevent, and address technical issues.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
                    <p>
                        We use third-party services such as Google Analytics and Google AdSense. These third parties may access your data to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                    </p>
                    <p>
                        <strong>Google AdSense:</strong> We use Google AdSense to display ads. Google uses cookies to serve ads based on your prior visits to our website or other websites. You can opt-out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:nrktech16@gmail.com" className="text-blue-500 hover:underline">nrktech16@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
