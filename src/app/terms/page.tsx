import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service — ApexApps.in',
    description: 'Read the terms and conditions for using ApexApps.in developer tools.',
};

export default function TermsPage() {
    const updated = 'March 8, 2025';
    return (
        <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
            <h1 className="text-32 font-bold text-textPrimary mb-2">Terms of Service</h1>
            <p className="text-13 text-textMuted mb-10">Last updated: {updated}</p>

            <div className="prose prose-invert prose-p:text-textSecondary prose-headings:text-textPrimary prose-headings:font-ui prose-a:text-accent prose-li:text-textSecondary max-w-none text-14 leading-relaxed space-y-6">

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using <strong>ApexApps.in</strong> (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service.
                    </p>
                </section>

                <section>
                    <h2>2. Description of Service</h2>
                    <p>
                        ApexApps.in provides free, browser-based developer tools including JSON formatters, SQL formatters, Base64 encoders, JWT decoders, and more. All tools process data locally in your browser. No data is transmitted to our servers during tool usage.
                    </p>
                </section>

                <section>
                    <h2>3. Use of the Service</h2>
                    <p>You agree to use the Service only for lawful purposes. You may not:</p>
                    <ul>
                        <li>Use the Service in any way that violates applicable local, national, or international law or regulation</li>
                        <li>Attempt to gain unauthorized access to any part of the Service or its related systems</li>
                        <li>Use automated tools to scrape, crawl, or excessively request content from the Service</li>
                        <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                        <li>Use the Service to transmit harmful, offensive, or illegal content</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by ApexApps.in and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                    </p>
                </section>

                <section>
                    <h2>5. Disclaimers and Limitation of Liability</h2>
                    <p>
                        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses.
                    </p>
                    <p>
                        <strong>To the fullest extent permitted by law, ApexApps.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages</strong> arising from your use of the Service, even if we have been advised of the possibility of such damages.
                    </p>
                    <p>
                        You are solely responsible for verifying the accuracy of any output produced by our tools before using it in production environments.
                    </p>
                </section>

                <section>
                    <h2>6. Third-Party Advertising</h2>
                    <p>
                        We may display advertisements served by Google AdSense and other third-party advertising networks. These advertisers may use cookies for personalized advertising. We are not responsible for the content of third-party advertisements.
                    </p>
                </section>

                <section>
                    <h2>7. Privacy</h2>
                    <p>
                        Your use of the Service is also governed by our <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by reference.
                    </p>
                </section>

                <section>
                    <h2>8. Modifications to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes your acceptance of the revised Terms.
                    </p>
                </section>

                <section>
                    <h2>9. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                    </p>
                </section>

                <section>
                    <h2>10. Contact Us</h2>
                    <p>If you have questions about these Terms, please contact us:</p>
                    <p><strong>Email:</strong> <a href="mailto:contact@apexapps.in">contact@apexapps.in</a></p>
                    <p><strong>Website:</strong> <a href="https://apexapps.in/contact">https://apexapps.in/contact</a></p>
                </section>
            </div>
        </main>
    );
}
