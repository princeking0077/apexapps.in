"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Shield, Lock, Zap, ArrowRight, Check } from 'lucide-react';

const RAW_INPUT = `{id:1,name:"John",email:"john@example.com",settings:{theme:"dark",notifications:true}}`;

const FORMATTED_OUTPUT = `{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}`;

const colorizeRaw = (text: string) => {
    if (!text) return "";
    let html = text.replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '<span class="text-[#e06c75]">$1</span>');
    html = html.replace(/"([^"\\]|\\.)*"/g, '<span class="text-[#98c379]">$&</span>');
    html = html.replace(/\b(true|false|null)\b/g, '<span class="text-[#d19a66]">$1</span>');
    html = html.replace(/\b([0-9]+)\b/g, '<span class="text-[#d19a66]">$1</span>');
    html = html.replace(/[{}]/g, '<span class="text-[#e5c07b]">$&</span>');
    return html;
};

const colorizeFormatted = (text: string) => {
    if (!text) return "";
    let html = text.replace(/"([^"\\]|\\.)*"/g, (match, p1, offset, fullString) => {
        // Check if there is a colon after the quote (handling whitespace)
        const afterMatch = fullString.slice(offset + match.length);
        if (/^\s*:/.test(afterMatch)) {
            return `< span class="text-[#e06c75]" > ${match}</span > `; // Key
        }
        return `< span class="text-[#98c379]" > ${match}</span > `; // String value
    });
    html = html.replace(/\b(true|false|null)\b/g, '<span class="text-[#d19a66]">$1</span>');
    html = html.replace(/\b([0-9]+)\b/g, '<span class="text-[#d19a66]">$1</span>');
    html = html.replace(/[{}]/g, '<span class="text-[#e5c07b]">$&</span>');
    return html;
};

export default function Hero() {
    const [copied, setCopied] = useState(false);
    const [phase, setPhase] = useState(0);
    // 0: idle, 1: typing raw, 2: wait, 3: typing formatted, 4: wait before loop
    const [rawText, setRawText] = useState("");
    const [formattedText, setFormattedText] = useState("");

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (phase === 0) {
            setRawText("");
            setFormattedText("");
            timeout = setTimeout(() => setPhase(1), 800);
        }
        return () => clearTimeout(timeout);
    }, [phase]);

    useEffect(() => {
        if (phase === 1) {
            let i = 0;
            const interval = setInterval(() => {
                setRawText(RAW_INPUT.slice(0, i + 1));
                i++;
                if (i >= RAW_INPUT.length) {
                    clearInterval(interval);
                    setTimeout(() => setPhase(2), 500);
                }
            }, 50); // Raw typing speed: 50ms per key
            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 2) {
            const timeout = setTimeout(() => setPhase(3), 200);
            return () => clearTimeout(timeout);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 3) {
            let i = 0;
            const interval = setInterval(() => {
                setFormattedText(FORMATTED_OUTPUT.slice(0, i + 1));
                i++;
                if (i >= FORMATTED_OUTPUT.length) {
                    clearInterval(interval);
                    setTimeout(() => setPhase(4), 5000); // Pause for 5s at end to read
                }
            }, 15); // Formatting speed: 15ms per key (faster)
            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 4) {
            const timeout = setTimeout(() => setPhase(0), 100);
            return () => clearTimeout(timeout);
        }
    }, [phase]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-background text-textPrimary py-32 px-6">

            {/* Dynamic Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(to right, var(--color-surface2, #1E2535) 1px, transparent 1px), linear-gradient(to bottom, var(--color-surface2, #1E2535) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
                    }}
                />
            </div>

            {/* Radial soft glow — stronger! */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1400px] h-[900px] pointer-events-none"
                style={{
                    background: 'radial-gradient(closest-side, rgba(0, 176, 255, 0.18) 0%, transparent 100%)',
                }}
            />

            {/* Main Content */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative z-10 w-full max-w-content mx-auto flex flex-col items-center text-center"
            >

                {/* Trust Badges */}
                <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4 mb-10">
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/50 backdrop-blur-md px-4 py-1.5 text-sm font-ui shadow-sm hover:border-accent/40 transition-colors cursor-default">
                        <Shield size={16} className="text-accent" />
                        <span className="text-textPrimary font-medium">100% Client-Side</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/50 backdrop-blur-md px-4 py-1.5 text-sm font-ui shadow-sm hover:border-accent/40 transition-colors cursor-default">
                        <Lock size={16} className="text-accent" />
                        <span className="text-textPrimary font-medium">No Server Calls</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/50 backdrop-blur-md px-4 py-1.5 text-sm font-ui shadow-sm hover:border-accent/40 transition-colors cursor-default hidden sm:flex">
                        <Zap size={16} className="text-accent" />
                        <span className="text-textPrimary font-medium">Instant Results</span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.div variants={item} className="mb-6 relative">
                    <h1 className="font-ui text-[40px] md:text-[64px] lg:text-[80px] font-extrabold tracking-tight leading-[1.1]">
                        <span className="text-textPrimary block drop-shadow-sm">Free Developer Tools.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#00DFD8] to-accent block mt-2 pb-2">
                            Zero Data Uploaded. Ever.
                        </span>
                    </h1>
                </motion.div>

                {/* Subheadline */}
                <motion.p variants={item} className="font-ui text-18 md:text-24 text-textSecondary max-w-3xl mb-12 leading-relaxed">
                    10 essential tools for frontend and backend developers.
                    Everything runs in your browser — your code never leaves your machine.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto">
                    <Link
                        href="/#tools"
                        className="w-full sm:w-auto relative group overflow-hidden bg-accent text-black font-ui font-bold rounded-xl px-8 py-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_24px_rgba(0,184,255,0.30)] hover:shadow-[0_0_40px_rgba(0,184,255,0.50)] ring-1 ring-accent/50 flex items-center justify-center gap-2 no-underline"
                    >
                        <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                        <span className="relative flex items-center justify-center gap-2">Explore All Tools</span>
                    </Link>

                    <Link
                        href="/tools/json-formatter"
                        className="w-full sm:w-auto text-textPrimary hover:text-white font-ui font-medium px-8 py-4 rounded-xl bg-surface/40 hover:bg-surface border border-border/60 hover:border-accent/40 transition-all duration-300 flex items-center justify-center gap-2 group backdrop-blur-sm no-underline"
                    >
                        Try JSON Formatter
                        <ArrowRight size={18} className="text-textSecondary group-hover:text-accent transition-all duration-300 group-hover:translate-x-1" />
                    </Link>
                </motion.div>

            </motion.div>

            {/* Live Mini-Demo window with Apple-like polish and Typewriter Animation */}
            <motion.div
                initial={{ opacity: 0, y: 100, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl mx-auto relative z-20 perspective-1000"
            >
                <div className="absolute -inset-1 bg-gradient-to-b from-accent/20 to-transparent rounded-[16px] blur-lg opacity-50 pointer-events-none" />

                <div className="relative bg-[#0d121c] rounded-xl border border-border/80 overflow-hidden shadow-2xl ring-1 ring-white/5">
                    {/* Header */}
                    <div className="px-4 py-3 bg-[#131a27] border-b border-border/60 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 text-12 font-code text-textSecondary/70 uppercase tracking-widest hidden sm:block">
                            json-formatter.app
                        </div>
                        <button
                            onClick={handleCopy}
                            className="px-3 py-1.5 rounded-md bg-surface border border-border hover:border-accent text-xs font-ui text-textPrimary flex items-center gap-2 transition-all relative overflow-hidden group"
                        >
                            {copied ? <Check size={14} className="text-success" /> : <span className="text-textSecondary group-hover:text-textPrimary transition-colors">Copy</span>}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 h-full">
                        {/* Input Side - Animated typing */}
                        <div className="p-6 relative group md:min-h-[340px] h-[340px]">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                            <p className="text-12 text-accent/80 font-ui uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                <span className={`w - 2 h - 2 rounded - full bg - accent ${phase === 1 ? 'animate-pulse' : 'opacity-80'} `} /> Raw Input
                            </p>
                            <pre className="font-code text-[15px] sm:text-[14px] text-textSecondary whitespace-pre-wrap leading-[1.7] tracking-[0.2px]">
                                <span dangerouslySetInnerHTML={{ __html: colorizeRaw(rawText) }} />
                                <span className={`text - accent font - bold ${(phase === 1 || (phase === 0 && rawText === '')) ? 'animate-pulse opacity-100' : 'opacity-0'} `}>|</span>
                            </pre>
                        </div>

                        {/* Output Side - Animated highlighting */}
                        <div className="p-6 bg-[#0a0e16] relative md:min-h-[340px] h-[340px] overflow-hidden">
                            <p className="text-12 text-success font-ui uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                <span className={`w - 2 h - 2 rounded - full bg - success ${phase === 3 ? 'animate-pulse' : 'opacity-80'} `} /> Output Formatted
                            </p>
                            <pre className="font-code text-[15px] sm:text-[14px] text-textPrimary overflow-x-hidden leading-[1.7] tracking-[0.2px]">
                                <span dangerouslySetInnerHTML={{ __html: colorizeFormatted(formattedText) }} />
                                <span className={`text - success font - bold ${phase === 3 ? 'animate-pulse opacity-100' : 'opacity-0'} `}>|</span>
                            </pre>
                        </div>
                    </div>
                </div>
            </motion.div>

        </section>
    );
}
