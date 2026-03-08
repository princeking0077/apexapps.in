"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Braces, Paintbrush, Binary, Database, Clock, SearchCode, Palette, Key, Timer, Code } from 'lucide-react';
import ToolCard, { ToolCardProps } from './ToolCard';

const FILTERS = ['All', 'Formatter', 'Encoder', 'Converter', 'Validator', 'Builder'];

const TOOLS_DATA: ToolCardProps[] = [
    {
        name: "JSON Formatter",
        slug: "json-formatter",
        description: "Format, validate, and minify JSON instantly",
        category: "Formatter",
        icon: <Braces size={24} />,
        isPopular: true,
    },
    {
        name: "CSS Minifier",
        slug: "css-minifier",
        description: "Compress CSS for production, beautify for dev",
        category: "Formatter",
        icon: <Paintbrush size={24} />,
    },
    {
        name: "Base64 Encoder",
        slug: "base64-encoder",
        description: "Encode and decode text, images, and files",
        category: "Encoder",
        icon: <Binary size={24} />,
    },
    {
        name: "SQL Formatter",
        slug: "sql-formatter",
        description: "Beautify SQL queries with dialect support",
        category: "Formatter",
        icon: <Database size={24} />,
    },
    {
        name: "Cron Builder",
        slug: "cron-builder",
        description: "Build and explain cron expressions visually",
        category: "Builder",
        icon: <Clock size={24} />,
    },
    {
        name: "Regex Tester",
        slug: "regex-tester",
        description: "Test regex with live highlights and explanations",
        category: "Validator",
        icon: <SearchCode size={24} />,
    },
    {
        name: "Color Tools",
        slug: "color-tools",
        description: "HEX/RGB/HSL converter + WCAG contrast check",
        category: "Converter",
        icon: <Palette size={24} />,
    },
    {
        name: "JWT Decoder",
        slug: "jwt-decoder",
        description: "Decode and inspect JWT tokens offline",
        category: "Encoder",
        icon: <Key size={24} />,
        isNew: true,
    },
    {
        name: "Timestamp Converter",
        slug: "timestamp-converter",
        description: "Convert Unix timestamps with timezone support",
        category: "Converter",
        icon: <Timer size={24} />,
    },
    {
        name: "HTML Formatter",
        slug: "html-formatter",
        description: "Beautify HTML with live preview pane",
        category: "Formatter",
        icon: <Code size={24} />,
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function ToolsGrid() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#tools-')) {
                const cat = hash.replace('#tools-', '');
                if (FILTERS.includes(cat)) {
                    setActiveFilter(cat);
                }
            } else if (hash === '#tools' || hash === '') {
                setActiveFilter('All');
            }
        };
        handleHashChange(); // Execute on initial mount
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
        if (filter === 'All') {
            window.history.replaceState(null, '', window.location.pathname + '#tools');
        } else {
            window.history.replaceState(null, '', window.location.pathname + `#tools-${filter}`);
        }
    };

    const filteredTools = TOOLS_DATA.filter((tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || tool.category === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <section id="tools" className="w-full bg-background py-20 px-6 relative z-20">
            <div className="max-w-content mx-auto">

                {/* Section Header */}
                <div className="mb-12">
                    <div className="mb-2">
                        <span className="text-11 font-bold text-textMuted uppercase tracking-[0.2em]">Developer Toolbox</span>
                    </div>
                    <h2 className="text-32 md:text-40 font-extrabold mb-8 tracking-tight">
                        <span className="text-textPrimary">All </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#00dfd8]">{TOOLS_DATA.length} Tools</span>
                    </h2>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search size={16} className="text-textMuted group-focus-within:text-accent transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search tools… (e.g. JSON, JWT, SQL)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-surface border border-border focus:border-accent/60 rounded-xl text-14 text-textPrimary placeholder:text-textMuted/60 outline-none transition-all shadow-sm focus:shadow-[0_0_20px_rgba(0,184,255,0.12)]"
                            />
                        </div>

                        {/* Filter Pills */}
                        <div className="flex overflow-x-auto w-full md:w-auto pb-1 md:pb-0 gap-2 scrollbar-none">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => handleFilterClick(filter)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl font-medium text-13 transition-all duration-200 border ${activeFilter === filter
                                        ? 'bg-accent text-black font-bold border-accent shadow-[0_0_16px_rgba(0,184,255,0.30)]'
                                        : 'bg-surface border-border text-textMuted hover:text-textPrimary hover:border-textMuted/40'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid Area */}
                {filteredTools.length > 0 ? (
                    <motion.div
                        key={activeFilter + searchQuery} // Force remount on filter/search change
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {filteredTools.map((tool) => (
                            <motion.div key={tool.slug} variants={itemVariants} className="h-full">
                                <ToolCard {...tool} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-border rounded-xl">
                        <p className="text-textSecondary text-lg font-medium">No tools found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchQuery(''); handleFilterClick('All'); }}
                            className="mt-4 text-accent hover:text-accentHover font-medium underline underline-offset-4"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

            </div>
        </section>
    );
}
