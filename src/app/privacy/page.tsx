import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — ApexApps.in',
    description: 'Learn how ApexApps.in handles your data. All tools run 100% client-side. We collect minimal data to operate the site.',
};

export default function PrivacyPage() {
    const updated = 'March 8, 2025';
    return (
        <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
            <h1 className="text-32 font-bold text-textPrimary mb-2">Privacy Policy</h1>
            <p className="text-13 text-textMuted mb-10">Last updated: {updated}</p>

            <div className="prose prose-invert prose-p:text-textSecondary prose-headings:text-textPrimary prose-headings:font-ui prose-a:text-accent prose-li:text-textSecondary max-w-none text-14 leading-relaxed space-y-6">

                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to <strong>ApexApps.in</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate the website at{' '}
                        <a href="https://apexapps.in">https://apexapps.in</a>, which provides free developer tools. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
                    </p>
                </section>

                <section>
                    <h2>2. Our Core Privacy Promise</h2>
                    <p>
                        <strong>All tools on ApexApps.in run entirely in your browser.</strong> Your JSON, SQL, JWT tokens, CSS, HTML, images, and any other data you paste into our tools are processed locally by your device and are <strong>never sent to our servers</strong>. You can verify this by opening your browser&rsquo;s DevTools &rarr; Network tab while using any tool.
                    </p>
                </section>

                <section>
                    <h2>3. Information We Collect</h2>
                    <h3>3.1 Information Collected Automatically</h3>
                    <p>When you visit our website, we may automatically collect:</p>
                    <ul>
                        <li><strong>Log data:</strong> IP address, browser type, operating system, referring URLs, pages viewed, and timestamps. This is standard for web servers and is used for security and debugging.</li>
                        <li><strong>Usage analytics:</strong> We use privacy-friendly analytics (e.g., page views, session duration) to understand how our tools are used. This data is aggregated and not linked to individual users.</li>
                    </ul>

                    <h3>3.2 Information You Provide</h3>
                    <p>
                        If you contact us via email or a contact form, we collect the information you provide (name, email address, message) solely to respond to your inquiry.
                    </p>

                    <h3>3.3 Cookies</h3>
                    <p>
                        We may use essential cookies or local storage to save your tool preferences (e.g., selected formatting options). We do not use tracking cookies or third-party advertising cookies beyond those set by advertising partners (see Section 5).
                    </p>
                </section>

                <section>
                    <h2>4. How We Use Your Information</h2>
                    <ul>
                        <li>To operate and improve our website and tools</li>
                        <li>To prevent fraud and ensure security</li>
                        <li>To respond to your inquiries</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                    <p>We do not sell your personal data to third parties.</p>
                </section>

                <section>
                    <h2>5. Advertising (Google AdSense)</h2>
                    <p>
                        We use <strong>Google AdSense</strong> to display advertisements on our website. Google AdSense may use cookies and web beacons to serve ads based on your prior visits to our website and other websites. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and other sites on the Internet.
                    </p>
                    <p>
                        You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also opt out via the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative opt-out page</a>.
                    </p>
                    <p>
                        For more information, see <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google&rsquo;s advertising policies</a>.
                    </p>
                </section>

                <section>
                    <h2>6. Third-Party Services</h2>
                    <p>Our website may include links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies.</p>
                </section>

                <section>
                    <h2>7. Data Security</h2>
                    <p>We implement appropriate technical security measures to protect any information we collect. However, no method of transmission over the Internet is 100% secure.</p>
                </section>

                <section>
                    <h2>8. Children&rsquo;s Privacy</h2>
                    <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.</p>
                </section>

                <section>
                    <h2>9. Your Rights</h2>
                    <p>Depending on your location, you may have rights including access to, correction of, or deletion of your personal data. To exercise these rights, contact us at the address below.</p>
                </section>

                <section>
                    <h2>10. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.</p>
                </section>

                <section>
                    <h2>11. Contact Us</h2>
                    <p>If you have questions about this Privacy Policy, please contact us at:</p>
                    <p><strong>Email:</strong> <a href="mailto:contact@apexapps.in">contact@apexapps.in</a></p>
                    <p><strong>Website:</strong> <a href="https://apexapps.in/contact">https://apexapps.in/contact</a></p>
                </section>
            </div>
        </main>
    );
}
