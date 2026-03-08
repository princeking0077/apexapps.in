"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Github, Menu, X, TerminalSquare, SearchCode, Database, Paintbrush, Binary, Clock, Palette, Key, Timer, Code, Braces } from 'lucide-react';
import { Command } from 'cmdk';

const CATEGORIES = ['Formatters', 'Encoders', 'Converters', 'Validators', 'Builders'];

// Using the same data structure from ToolsGrid for search
const ALL_TOOLS = [
    { name: "JSON Formatter", slug: "json-formatter", category: "Formatter", icon: Braces },
    { name: "CSS Minifier", slug: "css-minifier", category: "Formatter", icon: Paintbrush },
    { name: "Base64 Encoder", slug: "base64-encoder", category: "Encoder", icon: Binary },
    { name: "SQL Formatter", slug: "sql-formatter", category: "Formatter", icon: Database },
    { name: "Cron Builder", slug: "cron-builder", category: "Builder", icon: Clock },
    { name: "Regex Tester", slug: "regex-tester", category: "Validator", icon: SearchCode },
    { name: "Color Tools", slug: "color-tools", category: "Converter", icon: Palette },
    { name: "JWT Decoder", slug: "jwt-decoder", category: "Encoder", icon: Key },
    { name: "Timestamp Converter", slug: "timestamp-converter", category: "Converter", icon: Timer },
    { name: "HTML Formatter", slug: "html-formatter", category: "Formatter", icon: Code }
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cmdOpen, setCmdOpen] = useState(false);

    // Handle scroll for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Command Palette shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-14 md:h-16 ${scrolled
                    ? 'bg-[#07090f]/90 backdrop-blur-xl border-b border-border/70 shadow-[0_1px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-transparent border-b border-transparent'
                    }`}
            >
                <div className="max-w-content mx-auto h-full px-4 md:px-6 flex items-center justify-between">

                    {/* LEFT: Logo */}
                    <Link href="/" className="flex flex-col mb-1 md:mb-0 group">
                        <span className="font-code text-18 md:text-20 font-bold tracking-tight">
                            <span className="text-white group-hover:text-textPrimary transition-colors">apex</span>
                            <span className="text-accent">apps.in</span>
                        </span>
                    </Link>

                    {/* CENTER: Quick Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 text-14">
                        {CATEGORIES.map(category => {
                            const filterCat = category.replace(/s$/, ''); // e.g. "Formatter"
                            return (
                                <div key={category} className="relative group p-2 cursor-pointer">
                                    <Link
                                        href={`/#tools-${filterCat}`}
                                        className="font-ui font-medium text-textSecondary group-hover:text-textPrimary transition-colors"
                                    >
                                        {category}
                                    </Link>
                                    {/* Mega Dropdown Indicator */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                                        <div className="bg-surface/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-2 min-w-[220px] flex flex-col gap-1">
                                            {ALL_TOOLS.filter(t => t.category === filterCat || t.category === category).map((tool) => {
                                                const Icon = tool.icon;
                                                return (
                                                    <Link
                                                        key={tool.slug}
                                                        href={`/tools/${tool.slug}`}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-textSecondary hover:text-textPrimary transition-colors group/item"
                                                    >
                                                        <div className="p-1.5 rounded-md bg-white/5 text-textMuted group-hover/item:text-accent group-hover/item:bg-accent/10 transition-colors">
                                                            <Icon size={16} />
                                                        </div>
                                                        <span className="text-14 font-medium leading-none">{tool.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search Button (Triggers Command Palette) */}
                        <button
                            onClick={() => setCmdOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface2/50 border border-white/5 hover:border-border text-textSecondary hover:text-textPrimary transition-colors text-12 font-code select-none"
                        >
                            <Search size={14} />
                            <span>Search tools...</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] ml-2">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>

                        {/* Mobile Search Icon */}
                        <button
                            onClick={() => setCmdOpen(true)}
                            className="md:hidden p-2 text-textSecondary hover:text-textPrimary focus:outline-none"
                        >
                            <Search size={20} />
                        </button>

                        {/* GitHub Link */}
                        <Link
                            href="https://github.com"
                            target="_blank"
                            className="p-2 text-textSecondary hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-md"
                        >
                            <Github size={20} />
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-textPrimary focus:outline-none"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE FULL-SCREEN MENU */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-xl pt-16 px-6 md:hidden">
                    <nav className="flex flex-col gap-6 mt-8">
                        {CATEGORIES.map(category => (
                            <div key={category} className="border-b border-border pb-4 last:border-0">
                                <span className="font-ui text-20 font-bold text-textPrimary">
                                    {category}
                                </span>
                                <div className="mt-4 flex flex-col gap-3">
                                    {ALL_TOOLS.filter(t => t.category === category || t.category + 's' === category).map((tool) => (
                                        <Link
                                            key={tool.slug}
                                            href={`/tools/${tool.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 text-16 text-textSecondary hover:text-accent font-medium py-1"
                                        >
                                            <TerminalSquare size={16} /> {/* Generic icon for mobile list */}
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            )}

            {/* CMDK COMMAND PALETTE MODAL */}
            {cmdOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setCmdOpen(false)}
                    />

                    {/* Command Window */}
                    <Command
                        className="relative w-full max-w-[600px] bg-surface rounded-xl border border-border shadow-2xl overflow-hidden font-ui flex flex-col"
                        label="Command Menu"
                    >
                        <div className="flex items-center border-b border-border px-4 py-3">
                            <Search size={18} className="text-textSecondary mr-3 shrink-0" />
                            <Command.Input
                                autoFocus
                                placeholder="Search tools, formats, conversions..."
                                className="flex-1 bg-transparent w-full outline-none text-textPrimary placeholder:text-textSecondary/50 text-16"
                            />
                            <button
                                onClick={() => setCmdOpen(false)}
                                className="text-12 font-code text-textSecondary px-2 py-1 bg-surface2 rounded border border-white/5 ml-2 hover:bg-border/50"
                            >
                                ESC
                            </button>
                        </div>

                        <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-none custom-cmd-scroll">
                            <Command.Empty className="py-12 text-center text-textSecondary text-14">
                                No tools found for this query.
                            </Command.Empty>

                            {CATEGORIES.map(category => {
                                // Determine robust category mapping
                                const catTools = ALL_TOOLS.filter(t => t.category === category || t.category + 's' === category);
                                if (catTools.length === 0) return null;

                                return (
                                    <Command.Group
                                        key={category}
                                        heading={category}
                                        className="text-[11px] font-bold text-textSecondary/70 uppercase tracking-widest px-2 py-2"
                                    >
                                        {catTools.map(tool => {
                                            const Icon = tool.icon;
                                            return (
                                                <Command.Item
                                                    key={tool.slug}
                                                    value={`${tool.name} ${tool.category} ${tool.slug}`}
                                                    onSelect={() => {
                                                        // In a real app useRouter().push(\`/tools/\${tool.slug}\`)
                                                        window.location.href = `/tools/${tool.slug}`;
                                                        setCmdOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-3 mt-1 rounded-md text-14 text-textSecondary hover:text-textPrimary aria-selected:bg-accent/10 aria-selected:text-accent cursor-pointer transition-colors"
                                                >
                                                    <Icon size={16} className="text-textSecondary shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-textPrimary aria-selected:text-accent">{tool.name}</span>
                                                    </div>
                                                </Command.Item>
                                            );
                                        })}
                                    </Command.Group>
                                );
                            })}
                        </Command.List>
                    </Command>
                </div>
            )}

            {/* Global styles for CMDK overrides */}
            <style dangerouslySetInnerHTML={{
                __html: `
        [cmdk-group-heading] {
            color: var(--color-textMuted);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 700;
            padding: 8px 8px 4px 8px;
            user-select: none;
        }
        [cmdk-item][aria-selected="true"] {
            background-color: rgba(0, 176, 255, 0.1);
            color: var(--color-accent);
        }
        [cmdk-item][aria-selected="true"] svg {
            color: var(--color-accent);
        }
        .custom-cmd-scroll::-webkit-scrollbar { width: 6px; }
        .custom-cmd-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-cmd-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
        .custom-cmd-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-textMuted); }
      `}} />
        </>
    );
}
