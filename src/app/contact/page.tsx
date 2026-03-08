import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact — ApexApps.in',
    description: 'Get in touch with the ApexApps.in team. Report bugs, suggest tools, or ask questions.',
};

export default function ContactPage() {
    return (
        <main className="max-w-2xl mx-auto px-5 pt-24 pb-20">
            <div className="mb-10">
                <h1 className="text-32 font-bold text-textPrimary mb-2">Contact Us</h1>
                <p className="text-14 text-textSecondary leading-relaxed">
                    Have a bug report, a feature suggestion, or just want to say hi? We&rsquo;d love to hear from you.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="text-24 mb-3">🐛</div>
                    <h2 className="text-16 font-bold text-textPrimary mb-2">Bug Reports</h2>
                    <p className="text-13 text-textMuted leading-relaxed">
                        Found something broken? Tell us the tool, what you did, and what you expected. Screenshots help!
                    </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="text-24 mb-3">💡</div>
                    <h2 className="text-16 font-bold text-textPrimary mb-2">Feature Requests</h2>
                    <p className="text-13 text-textMuted leading-relaxed">
                        Got an idea for a new tool or an improvement to an existing one? We&rsquo;re always looking for what developers need.
                    </p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                <h2 className="text-18 font-bold text-textPrimary mb-6">Send us a message</h2>
                <form
                    action="mailto:contact@apexapps.in"
                    method="post"
                    encType="text/plain"
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="contact-name" className="block text-12 font-bold text-textSecondary uppercase tracking-wider mb-2">
                            Name
                        </label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            required
                            placeholder="Your name"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-14 text-textPrimary outline-none focus:border-accent transition-colors placeholder:text-textMuted/50"
                        />
                    </div>
                    <div>
                        <label htmlFor="contact-email" className="block text-12 font-bold text-textSecondary uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-14 text-textPrimary outline-none focus:border-accent transition-colors placeholder:text-textMuted/50"
                        />
                    </div>
                    <div>
                        <label htmlFor="contact-subject" className="block text-12 font-bold text-textSecondary uppercase tracking-wider mb-2">
                            Subject
                        </label>
                        <select
                            id="contact-subject"
                            name="subject"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-14 text-textPrimary outline-none focus:border-accent transition-colors cursor-pointer"
                        >
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="general">General Question</option>
                            <option value="advertising">Advertising Inquiry</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="contact-message" className="block text-12 font-bold text-textSecondary uppercase tracking-wider mb-2">
                            Message
                        </label>
                        <textarea
                            id="contact-message"
                            name="message"
                            required
                            rows={6}
                            placeholder="Describe your issue or idea..."
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-14 text-textPrimary outline-none focus:border-accent transition-colors resize-none placeholder:text-textMuted/50"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors text-14 cursor-pointer"
                    >
                        Send Message
                    </button>
                </form>
            </div>

            <div className="border-t border-border pt-6">
                <p className="text-13 text-textMuted">
                    Prefer email? Reach us directly at{' '}
                    <a href="mailto:contact@apexapps.in" className="text-accent hover:underline">
                        contact@apexapps.in
                    </a>
                </p>
                <p className="text-12 text-textMuted mt-2">
                    We typically respond within 1–2 business days.
                </p>
            </div>
        </main>
    );
}
