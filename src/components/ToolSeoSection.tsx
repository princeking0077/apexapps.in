import Link from 'next/link';
import { toolSeoContent, type ToolSeoContent } from '@/data/tool-seo-content';
import { BookOpen, ListChecks, Lightbulb, Scale, MessageCircleQuestion, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    slug: string;
}

export default function ToolSeoSection({ slug }: Props) {
    const content: ToolSeoContent | undefined = toolSeoContent[slug];
    if (!content) return null;

    // Convert intro body to array if it's a string for backwards compatibility,
    // or use it directly if it's already an array.
    const introParagraphs = Array.isArray(content.intro.body)
        ? content.intro.body
        : [content.intro.body];

    return (
        <section className="w-full bg-background border-t border-border mt-0 relative z-10">
            <div className="max-w-content mx-auto px-6 py-20 pb-28">

                {/* ─── INTRO ─── */}
                <div className="max-w-4xl mb-20 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 text-accent">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-28 md:text-32 font-extrabold text-textPrimary tracking-tight">
                            {content.intro.heading}
                        </h2>
                    </div>
                    <div className="space-y-5 text-16 text-textSecondary leading-relaxed">
                        {introParagraphs.map((paragraph: string, idx: number) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">

                    {/* ─── HOW TO USE ─── */}
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
                        <div className="flex items-center gap-2 mb-8">
                            <ListChecks size={24} className="text-accent" />
                            <h3 className="text-24 font-bold text-textPrimary tracking-tight">
                                {content.howTo.heading}
                            </h3>
                        </div>
                        <ol className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-border">
                            {content.howTo.steps.map((step: { title: string, desc: string }, i: number) => (
                                <li key={i} className="flex gap-6 relative z-10">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-surface border-2 border-border text-textPrimary font-bold flex items-center justify-center shadow-sm">
                                        {i + 1}
                                    </span>
                                    <div className="pt-2">
                                        <h4 className="text-16 font-bold text-textPrimary mb-1.5">{step.title}</h4>
                                        <p className="text-14 text-textSecondary leading-relaxed">{step.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* ─── WHEN TO USE ─── */}
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-150">
                        <div className="flex items-center gap-2 mb-8">
                            <Lightbulb size={24} className="text-[#FFB300]" />
                            <h3 className="text-24 font-bold text-textPrimary tracking-tight">
                                {content.whenToUse.heading}
                            </h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {content.whenToUse.cases.map((uc: { title: string, desc: string }, i: number) => (
                                <div key={i} className="bg-surface border border-border rounded-2xl p-6 hover:border-textMuted/40 transition-colors shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Lightbulb size={40} />
                                    </div>
                                    <h4 className="text-16 font-bold text-textPrimary mb-2 relative z-10">{uc.title}</h4>
                                    <p className="text-14 text-textSecondary leading-relaxed relative z-10">{uc.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── COMPARISON TABLE ─── */}
                <div className="mb-24 max-w-5xl animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
                    <div className="flex items-center gap-2 mb-8">
                        <Scale size={24} className="text-accent" />
                        <h3 className="text-24 font-bold text-textPrimary tracking-tight">{content.comparison.heading}</h3>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-border shadow-sm bg-surface">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface2/50 border-b border-border">
                                        <th className="px-6 py-4 text-13 font-bold text-textSecondary uppercase tracking-wider w-1/3">Feature</th>
                                        <th className="px-6 py-4 text-13 font-bold text-accent uppercase tracking-wider bg-accent/5">apexapps.in</th>
                                        {content.comparison.competitors.map((c: { name: string }) => (
                                            <th key={c.name} className="px-6 py-4 text-13 font-bold text-textSecondary uppercase tracking-wider">{c.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.comparison.rows.map((row: any, i: number) => (
                                        <tr key={i} className="border-b border-border last:border-0 hover:bg-surface2/30 transition-colors">
                                            <td className="px-6 py-4 text-14 text-textPrimary font-medium border-r border-border/50">{row.feature}</td>
                                            <td className="px-6 py-4 border-r border-border/50 bg-accent/[0.02]">
                                                {row.us === '✅' ? <CheckCircle2 size={18} className="text-success" /> : row.us === '❌' ? <XCircle size={18} className="text-error" /> : <span className="text-14 text-textSecondary font-medium">{row.us}</span>}
                                            </td>
                                            {content.comparison.competitors.map((c: { name: string }, ci: number) => (
                                                <td key={ci} className="px-6 py-4 border-r border-border/50 last:border-0">
                                                    {row.competitors[ci] === '✅' ? <CheckCircle2 size={18} className="text-success opacity-70" /> : row.competitors[ci] === '❌' ? <XCircle size={18} className="text-error opacity-70" /> : <span className="text-14 text-textSecondary">{row.competitors[ci]}</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ─── FAQ ─── */}
                <div className="mb-24 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
                    <div className="flex items-center gap-2 mb-8">
                        <MessageCircleQuestion size={24} className="text-[#a855f7]" />
                        <h3 className="text-24 font-bold text-textPrimary tracking-tight">{content.faq.heading}</h3>
                    </div>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'FAQPage',
                                mainEntity: content.faq.items.map((item: { q: string, a: string }) => ({
                                    '@type': 'Question',
                                    name: item.q,
                                    acceptedAnswer: { '@type': 'Answer', text: item.a },
                                })),
                            }),
                        }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {content.faq.items.map((item: { q: string, a: string }, i: number) => (
                            <div key={i} className="bg-surface border border-border rounded-2xl p-8 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-shadow">
                                <h4 className="text-16 font-bold text-textPrimary mb-3 leading-snug">{item.q}</h4>
                                <p className="text-14 text-textSecondary leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── RELATED TOOLS ─── */}
                <div className="bg-gradient-to-br from-surface to-surface2 border border-border rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Wrench size={20} className="text-accent" />
                                <h3 className="text-18 font-bold text-textPrimary tracking-tight">Keep Building with Related Tools</h3>
                            </div>
                            <p className="text-15 text-textSecondary leading-relaxed">{content.relatedTools.intro}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                            {content.relatedTools.links.map((link: { slug: string, name: string }) => (
                                <Link
                                    key={link.slug}
                                    href={`/tools/${link.slug}`}
                                    className="px-5 py-2.5 bg-background border border-border hover:border-accent/40 hover:text-accent text-textPrimary rounded-xl text-14 font-medium transition-all shadow-sm flex items-center gap-2 no-underline group"
                                >
                                    {link.name}
                                    <span className="text-textMuted group-hover:text-accent transition-colors group-hover:translate-x-0.5 transform">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
