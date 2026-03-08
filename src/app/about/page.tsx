import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About — ApexApps.in | Free Browser-Based Developer Tools',
    description: 'Learn about ApexApps.in — why we built these developer tools, our privacy-first philosophy, and what makes us different.',
};

const TOOLS = [
    { emoji: '📋', name: 'JSON Formatter', desc: 'Format, validate, and minify JSON' },
    { emoji: '🎨', name: 'CSS Minifier', desc: 'Minify and beautify CSS with live diff' },
    { emoji: '🔐', name: 'Base64 Encoder', desc: 'Encode/decode text, images, and files' },
    { emoji: '🗄️', name: 'SQL Formatter', desc: 'Format SQL for 5 database dialects' },
    { emoji: '🔑', name: 'JWT Decoder', desc: 'Decode and verify JSON Web Tokens' },
    { emoji: '🕒', name: 'Timestamp Converter', desc: 'Convert Unix timestamps across timezones' },
    { emoji: '🎨', name: 'Color Tools', desc: 'HEX/RGB/HSL conversion with WCAG checker' },
    { emoji: '⏰', name: 'Cron Builder', desc: 'Build cron expressions visually' },
    { emoji: '🔍', name: 'Regex Tester', desc: 'Test regex with live highlighting' },
    { emoji: '📄', name: 'HTML Formatter', desc: 'Beautify and preview HTML markup' },
];

export default function AboutPage() {
    return (
        <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
            <div className="mb-12">
                <h1 className="text-32 md:text-40 font-black text-textPrimary tracking-tight mb-4">
                    About <span className="text-accent">ApexApps.in</span>
                </h1>
                <p className="text-16 text-textSecondary leading-relaxed">
                    Free, fast, and privacy-respecting developer tools that run entirely in your browser.
                </p>
            </div>

            <div className="space-y-10 text-14 leading-relaxed text-textSecondary">
                <section>
                    <h2 className="text-20 font-bold text-textPrimary mb-3">Why we built this</h2>
                    <p>
                        Every developer has been there: you&rsquo;re debugging a production issue at 2 AM, you paste a JWT into some random website to decode it, and you immediately wonder &mdash; <em>did I just leak a token?</em>
                    </p>
                    <p className="mt-3">
                        The best developer tools should be fast, always available, and most importantly, <strong>private</strong>. That&rsquo;s why every tool on ApexApps.in runs entirely in your browser. Your data never leaves your machine.
                    </p>
                </section>

                <section>
                    <h2 className="text-20 font-bold text-textPrimary mb-3">Our tools</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TOOLS.map((tool) => (
                            <div key={tool.name} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
                                <span className="text-20">{tool.emoji}</span>
                                <div>
                                    <p className="text-14 font-bold text-textPrimary">{tool.name}</p>
                                    <p className="text-12 text-textMuted mt-0.5">{tool.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-20 font-bold text-textPrimary mb-3">Our privacy commitment</h2>
                    <div className="bg-success/5 border border-success/20 rounded-xl p-5">
                        <p className="text-14 font-bold text-success mb-2">🔒 Zero data uploaded. Ever.</p>
                        <p>
                            All processing happens locally using JavaScript in your browser. We don&rsquo;t have servers that touch your data. You can verify this at any time by opening DevTools &rarr; Network tab while using any tool &mdash; you&rsquo;ll see zero outgoing requests containing your data.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-20 font-bold text-textPrimary mb-3">Supporting the project</h2>
                    <p>
                        ApexApps.in is free to use and always will be. We display non-intrusive advertisements via Google AdSense to cover hosting and development costs. If you find these tools useful, the best way to support us is to use them and share them with colleagues.
                    </p>
                </section>

                <section className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors text-14"
                    >
                        Get in Touch
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-surface border border-border text-textPrimary font-bold rounded-xl hover:border-textMuted transition-colors text-14"
                    >
                        Explore All Tools
                    </Link>
                </section>
            </div>
        </main>
    );
}
