import Link from 'next/link';

const TOOL_LINKS = [
    { href: '/tools/json-formatter', label: 'JSON Formatter' },
    { href: '/tools/css-minifier', label: 'CSS Minifier' },
    { href: '/tools/base64-encoder', label: 'Base64 Encoder' },
    { href: '/tools/sql-formatter', label: 'SQL Formatter' },
    { href: '/tools/jwt-decoder', label: 'JWT Decoder' },
    { href: '/tools/timestamp-converter', label: 'Timestamp Converter' },
    { href: '/tools/color-tools', label: 'Color Tools' },
    { href: '/tools/cron-builder', label: 'Cron Builder' },
    { href: '/tools/regex-tester', label: 'Regex Tester' },
    { href: '/tools/html-formatter', label: 'HTML Formatter' },
    { href: '/tools/twitter-gif-downloader', label: 'Twitter GIF Downloader' },
];

const LEGAL_LINKS = [
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/contact', label: 'Contact' },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative border-t border-border/60 bg-[#050810] mt-auto overflow-hidden">

            {/* Subtle glow at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-48 bg-accent/[0.03] blur-3xl pointer-events-none" />

            <div className="relative max-w-content mx-auto px-6 py-14 z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

                    {/* Brand column */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-1.5 mb-4 no-underline group">
                            <span className="font-code text-20 font-bold tracking-tight">
                                <span className="text-white group-hover:text-textPrimary transition-colors">apex</span>
                                <span className="text-accent">apps.in</span>
                            </span>
                        </Link>
                        <p className="text-13 text-textMuted leading-relaxed max-w-[260px] mb-5">
                            Free developer tools that run entirely in your browser. Zero data uploaded. Ever.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-12 font-bold text-success">100% Client-Side Processing</span>
                        </div>
                    </div>

                    {/* Tools column */}
                    <div>
                        <h3 className="text-11 font-bold text-textMuted uppercase tracking-[0.15em] mb-5">Tools</h3>
                        <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                            {TOOL_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-13 text-textMuted hover:text-accent transition-colors no-underline leading-none"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company column */}
                    <div>
                        <h3 className="text-11 font-bold text-textMuted uppercase tracking-[0.15em] mb-5">Company</h3>
                        <ul className="flex flex-col gap-3">
                            {LEGAL_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-13 text-textMuted hover:text-accent transition-colors no-underline"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* AdSense note */}
                        <div className="mt-6 p-3 rounded-xl bg-surface/60 border border-border/60">
                            <p className="text-11 text-textMuted leading-relaxed">
                                We display ads via Google AdSense to keep all tools free. Your tool data is never shared.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-12 text-textMuted">
                        © {year}{' '}
                        <Link href="/" className="text-textMuted hover:text-accent transition-colors no-underline">
                            apexapps.in
                        </Link>
                        . All rights reserved.
                    </p>
                    <p className="text-12 text-textMuted text-center sm:text-right">
                        Built for developers. No sign-up, no tracking, no nonsense.
                    </p>
                </div>
            </div>
        </footer>
    );
}
