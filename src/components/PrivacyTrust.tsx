"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Code2, LockKeyhole, ArrowRight, Github, Check } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyTrust() {
    return (
        <section className="w-full relative py-32 bg-background overflow-hidden border-t border-border">

            {/* Dynamic Background glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"
            />

            <div className="max-w-content mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface2 border border-border mb-6">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-12 font-ui font-bold text-textSecondary uppercase tracking-widest">Privacy First</span>
                    </div>
                    <h2 className="text-[36px] md:text-[56px] font-extrabold text-textPrimary mb-6 leading-[1.1] tracking-tight">
                        Your Code Stays <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-textSecondary">On Your Machine 🔒</span>
                    </h2>
                    <p className="text-18 md:text-20 text-textSecondary leading-relaxed">
                        Unlike other online tools, apexapps.in processes everything locally in your browser.
                        We have <strong className="text-textPrimary font-semibold">no servers</strong> that receive your data.
                    </p>
                </motion.div>

                {/* 3-Column Explainer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="group flex flex-col items-center md:items-start text-center md:text-left bg-surface/30 hover:bg-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-accent/30 transition-all duration-300"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-white/10 text-textPrimary group-hover:text-accent flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-20 font-bold text-textPrimary mb-3 group-hover:text-white transition-colors">No Upload. No Logs.</h3>
                        <p className="text-textSecondary leading-relaxed">
                            Every tool runs via JavaScript entirely in your active browser tab. Open DevTools and verify — zero network requests on processing.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group flex flex-col items-center md:items-start text-center md:text-left bg-surface/30 hover:bg-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-accent/30 transition-all duration-300"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-white/10 text-textPrimary group-hover:text-accent flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-lg">
                            <Code2 size={28} />
                        </div>
                        <h3 className="text-20 font-bold text-textPrimary mb-3 group-hover:text-white transition-colors">Paste Secrets Safely</h3>
                        <p className="text-textSecondary leading-relaxed">
                            Developers regularly paste API keys, JWTs, and database configs. We engineered for that reality. Your sensitive data is absolutely safe.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="group flex flex-col items-center md:items-start text-center md:text-left bg-surface/30 hover:bg-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-accent/30 transition-all duration-300"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-white/10 text-textPrimary group-hover:text-accent flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                            <LockKeyhole size={28} />
                        </div>
                        <h3 className="text-20 font-bold text-textPrimary mb-3 group-hover:text-white transition-colors">Enterprise-Ready</h3>
                        <p className="text-textSecondary leading-relaxed">
                            Compatible with strict company policies that ban online formatters after the massive Nov 2025 credential leak incident.
                        </p>
                    </motion.div>

                </div>

                {/* Mac-style Mockup Network Tab with Parallax */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="max-w-4xl mx-auto rounded-xl p-[1px] bg-gradient-to-b from-border to-transparent shadow-2xl mb-16 relative"
                >
                    <div className="absolute -inset-4 bg-accent/10 blur-[50px] rounded-full opacity-50 z-0" />
                    <div className="bg-[#0b0e14] rounded-xl overflow-hidden relative z-10 w-full">
                        {/* Mockup Header */}
                        <div className="px-4 py-3 bg-[#131a27] flex items-center gap-6 border-b border-border/60 text-xs font-ui font-medium text-textMuted select-none shadow-sm">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                            </div>
                            <div className="flex gap-4">
                                <span className="hover:text-textPrimary cursor-pointer transition-colors">Elements</span>
                                <span className="hover:text-textPrimary cursor-pointer transition-colors">Console</span>
                                <span className="hover:text-textPrimary cursor-pointer transition-colors">Sources</span>
                                <span className="text-accent border-b-2 border-accent pb-[10px] -mb-[12px]">Network</span>
                                <span className="hover:text-textPrimary cursor-pointer transition-colors">Performance</span>
                            </div>
                        </div>

                        {/* Mockup Content */}
                        <div className="p-6 font-code text-[13px] text-textSecondary overflow-x-auto">
                            <pre className="text-textMuted whitespace-pre leading-relaxed">
                                <span className="text-white">Filter</span>   Fetch/XHR   JS   CSS   Img   Media   Font   Doc   WS   Manifest   Other
                                <div className="h-px bg-border/50 my-2 w-full" />
                                Name                  Status   Type       Initiator     Size      Time
                                <div className="h-px bg-border/50 my-2 w-full" />

                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.3, delay: 1 }}
                                    className="mt-4"
                                >
                                    <span className="text-textSecondary">[Press &quot;Format JSON&quot;]</span>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.3, delay: 1.5 }}
                                        className="text-success flex items-center gap-2 mt-2"
                                    >
                                        <Check size={14} /> 0 requests            0 B transferred                               0 ms
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.4, delay: 2.2 }}
                                        className="text-textMuted italic bg-surface/30 px-3 py-1.5 rounded bg-amber-500/5 text-amber-500/80 border border-amber-500/10 inline-block mt-4"
                                    >
                                        <span className="font-bold">Info:</span> Total privacy verified. No payload sent over the wire.
                                    </motion.div>
                                </motion.div>
                            </pre>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-textSecondary hover:text-white font-ui font-semibold transition duration-300 group py-2"
                    >
                        See how it works
                        <Github size={18} className="ml-2 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                        <ArrowRight size={18} className="group-hover:translate-x-1 group-hover:text-accent transition-transform duration-300" />
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
