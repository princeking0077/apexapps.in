"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import {
    ArrowRightLeft,
    Settings2,
    Play,
    Copy,
    Download,
    Trash2,
    Upload,
    Check,
    ChevronRight
} from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

export interface ToolPageProps {
    toolName: string;
    toolType: string;
    toolDescription: string;
    lastUpdated?: string;
    inputLanguage?: string;
    outputLanguage?: string;
    input: string;
    output: string;
    setInput: (value: string) => void;
    onConvert: () => void;
    onSwap?: () => void;
    isReversible?: boolean;
    optionsPanel?: React.ReactNode;
    tabs?: Tab[];

    // New Aesthetic Props
    breadcrumbs?: string[];
    headerActions?: React.ReactNode;
    trustBadges?: Array<{ icon: React.ReactNode | string, text: string }>;
    topBanner?: React.ReactNode;
    onExample?: () => void;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    onMountInput?: (editor: any, monaco: any) => void;
    onMountOutput?: (editor: any, monaco: any) => void;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    customOutputComponent?: React.ReactNode;
    customStats?: React.ReactNode;
    errorBanner?: React.ReactNode;
    noPaddingTop?: boolean;
}

export function formatBytes(b: number) {
    if (b === undefined || b === null) return "0 B";
    if (b === 0) return "0 B";
    if (b < 1024) return b + " B";
    return (b / 1024).toFixed(1) + " KB";
}

export default function ToolPage({
    toolName,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toolType,
    toolDescription,
    lastUpdated,
    inputLanguage = "javascript",
    outputLanguage = "javascript",
    input,
    output,
    setInput,
    onConvert,
    onSwap,
    isReversible = false,
    optionsPanel,
    tabs = [],
    breadcrumbs = [],
    headerActions,
    trustBadges = [],
    topBanner,
    onExample,
    onMountInput,
    onMountOutput,
    customOutputComponent,
    customStats,
    errorBanner,
    noPaddingTop = false,
}: ToolPageProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : '');
    const [isCopied, setIsCopied] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleCopy() {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onConvert();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                handleCopy();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                setInput('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, output, onConvert, setInput]);

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${toolName.toLowerCase().replace(/\s+/g, '-')}-output.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                setInput(event.target.result);
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };
    const onDragLeave = () => setDragOver(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                setInput(event.target.result);
            }
        };
        reader.readAsText(file);
    };

    // Calculate generic sizes if customStats implies simple size tracking is wanted
    let inBytes = 0;
    try { inBytes = new TextEncoder().encode(input || "").length; } catch (e) { } // eslint-disable-line

    let outBytes = 0;
    try { outBytes = new TextEncoder().encode(output || "").length; } catch (e) { } // eslint-disable-line

    const defaultBreadcrumbs = ["Tools", "›", "Formatters", "›", toolName];
    const finalBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

    return (
        <div className={`w-full flex flex-col ${noPaddingTop ? '' : 'pt-16 md:pt-20'} min-h-screen bg-background`}>
            {/* Global Tool View Styles injected directly for precise matching */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
                .convert-btn-glow { transition: all 0.15s; box-shadow: 0 0 20px rgba(0,184,255,0.28); }
                .convert-btn-glow:hover { box-shadow: 0 0 32px rgba(0,184,255,0.45) !important; transform: scale(1.08); }
                .convert-btn-glow:active { transform: scale(0.96); }
                .tab-btn:hover { color: #cad5e8 !important; }
                .drag-active .panel-inner { border-color: var(--color-accent) !important; background: #070f18 !important; }
            `}} />

            {/* Page Header Area */}
            <div className="max-w-content mx-auto w-full px-5 pb-6">

                {/* BREADCRUMB */}
                <div className="flex gap-1 items-center py-4">
                    {finalBreadcrumbs.map((t, i) => {
                        const isLast = i === finalBreadcrumbs.length - 1;
                        const isSeparator = t === '›';
                        if (isSeparator) return <ChevronRight key={i} size={12} className="text-textMuted" />;
                        return (
                            <span key={i} className={`text-12 ${isLast ? 'text-textSecondary font-medium' : 'text-textMuted hover:text-textSecondary transition-colors cursor-pointer'}`}>
                                {t}
                            </span>
                        );
                    })}
                </div>

                {/* HEADER ROW */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
                    <div>
                        <h1 className="text-28 md:text-34 font-extrabold text-textPrimary tracking-tight mb-1.5">
                            {toolName}
                        </h1>
                        <p className="text-14 text-textSecondary leading-relaxed max-w-2xl">
                            {toolDescription}
                        </p>
                        {lastUpdated && (
                            <p className="text-12 text-textMuted mt-2 font-medium">
                                Last Updated: {lastUpdated}
                            </p>
                        )}
                    </div>

                    {/* DYNAMIC HEADER ACTIONS (eg. Mode Toggle) */}
                    <div className="flex items-center gap-2 shrink-0">
                        {optionsPanel && (
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className={`flex items-center gap-2 text-13 font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer ${showOptions
                                    ? 'bg-accent/10 border-accent/40 text-accent'
                                    : 'bg-surface border-border text-textSecondary hover:border-textMuted/40 hover:text-textPrimary'
                                    }`}
                            >
                                <Settings2 size={14} />
                                Options
                            </button>
                        )}
                        {headerActions && (
                            <div className="flex shrink-0">{headerActions}</div>
                        )}
                    </div>
                </div>

                {/* TRUST BADGES ROW */}
                {trustBadges.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                        {trustBadges.map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1">
                                <span className="text-12 text-textSecondary">{icon}</span>
                                <span className="text-11 text-textSecondary font-medium">{text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* TOP BANNER / SAVINGS BAR */}
                {topBanner && (
                    <div className="w-full mb-3 animate-in slide-in-from-top-2 fade-in duration-200">
                        {topBanner}
                    </div>
                )}

                {errorBanner && (
                    <div className="w-full mb-4 z-10 animate-in slide-in-from-top-2 fade-in duration-200">
                        {errorBanner}
                    </div>
                )}

                {/* ─── EDITOR AREA (Grid Layout) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_56px_1fr] items-stretch min-h-[400px] lg:h-[600px] relative">

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    {/* LEFT PANEL (Input) */}
                    <div
                        className={`panel h-full transition-colors duration-200 flex flex-col ${dragOver ? 'drag-active' : ''}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        <div className="panel-inner bg-surface border border-border rounded-xl lg:rounded-r-none lg:border-r-0 overflow-hidden h-full flex flex-col">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${input ? 'bg-accent' : 'bg-textMuted'}`} />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Input</span>
                                    {input && <span className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-px font-mono">{formatBytes(inBytes)}</span>}
                                </div>
                                <div className="flex gap-1.5">
                                    {onExample && (
                                        <button onClick={onExample} className="hov-icon text-11 text-textMuted bg-surface2 border border-border rounded-md px-2.5 py-1 cursor-pointer font-ui transition-all">
                                            Example
                                        </button>
                                    )}
                                    <button onClick={() => fileInputRef.current?.click()} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all" title="Upload File">
                                        <Upload size={14} />
                                    </button>
                                    <button onClick={() => setInput('')} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all" title="Clear">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Editor Body */}
                            <div className="flex-1 relative bg-transparent min-h-[300px]">
                                <Editor
                                    height="100%"
                                    language={inputLanguage}
                                    theme="vs-dark"
                                    value={input}
                                    onChange={(value) => setInput(value || '')}
                                    onMount={onMountInput}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        fontFamily: 'var(--font-jetbrains-mono)',
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on'
                                    }}
                                />
                            </div>

                            {/* Bottom Footer Inside Panel */}
                            <div className="flex justify-between px-4 py-1.5 border-t border-border bg-[#080c14]">
                                <span className="text-11 text-textMuted font-mono">{input.split('\n').length} lines · {inBytes} B</span>
                                <span className="text-11 text-textMuted">drag & drop a file</span>
                            </div>
                        </div>
                    </div>

                    {/* CENTER CONTROLS */}
                    <div className="flex lg:flex-col items-center justify-center gap-3 py-4 lg:py-0 w-full lg:w-14 bg-background z-10 shrink-0">
                        <button
                            onClick={onConvert}
                            className="convert-btn-glow w-[44px] h-[44px] rounded-full bg-gradient-to-br from-accent to-[#0077cc] text-white flex items-center justify-center border-none cursor-pointer hidden lg:flex hover:scale-110 active:scale-95"
                            title="Convert (Ctrl+Enter)"
                        >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                        </button>

                        {/* Mobile convert button */}
                        <button
                            onClick={onConvert}
                            className="convert-btn-glow w-full max-w-[200px] h-[44px] rounded-full bg-gradient-to-br from-accent to-[#0077cc] text-white flex lg:hidden items-center justify-center gap-2 font-bold font-ui text-14 border-none cursor-pointer"
                        >
                            <Play size={16} fill="currentColor" /> Convert Now
                        </button>

                        {isReversible && onSwap && (
                            <button
                                onClick={onSwap}
                                disabled={!output}
                                className={`hov-icon w-[34px] h-[34px] rounded-full flex items-center justify-center border transition-all ${output ? 'bg-surface border-border text-textSecondary cursor-pointer' : 'bg-surface border-border text-textMuted cursor-default opacity-50'}`}
                                title="Swap"
                            >
                                <ArrowRightLeft size={15} />
                            </button>
                        )}

                        {optionsPanel && (
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center border transition-all cursor-pointer ${showOptions ? 'bg-accent/10 border-accent text-accent' : 'bg-surface border-border text-textSecondary hover:bg-[#162030] hover:text-accent'}`}
                                title="Options"
                            >
                                <Settings2 size={15} />
                            </button>
                        )}
                    </div>

                    {/* RIGHT PANEL (Output) */}
                    <div className="panel h-full flex flex-col">
                        <div className="panel-inner bg-surface border border-border rounded-xl lg:rounded-l-none lg:border-l-0 overflow-hidden h-full flex flex-col">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${output ? 'bg-success' : 'bg-textMuted'}`} />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Output</span>
                                    {output && <span className="text-[10px] bg-success/10 text-success rounded px-1.5 py-px font-mono">{formatBytes(outBytes)}</span>}
                                </div>
                                <div className="flex gap-1.5">
                                    {output && (
                                        <>
                                            <button
                                                onClick={handleCopy}
                                                className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 ${isCopied ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}
                                            >
                                                {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                                {isCopied ? 'Copied' : 'Copy'}
                                            </button>
                                            <button onClick={handleDownload} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all" title="Download">
                                                <Download size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Editor Body */}
                            <div className="flex-1 relative bg-transparent min-h-[300px]">
                                {customOutputComponent || (
                                    <Editor
                                        height="100%"
                                        language={outputLanguage}
                                        theme="vs-dark"
                                        value={output}
                                        onMount={onMountOutput}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            fontFamily: 'var(--font-jetbrains-mono)',
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            wordWrap: 'on'
                                        }}
                                    />
                                )}
                            </div>

                            {/* Bottom Footer Inside Panel */}
                            <div className="flex justify-between items-center px-4 py-1.5 border-t border-border bg-[#080c14] min-h-[32px]">
                                <span className="text-11 text-textMuted font-mono">{output ? `${output.split('\n').length} lines · ${outBytes} B` : "0 B"}</span>
                                {customStats}
                            </div>
                        </div>
                    </div>

                </div>

                {/* OPTIONS PANEL */}
                {optionsPanel && showOptions && (
                    <div className="w-full mt-3 p-5 border border-accent/20 bg-surface rounded-2xl animate-in slide-in-from-top-2 fade-in duration-200 shadow-[0_0_20px_rgba(0,184,255,0.06)]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {optionsPanel}
                        </div>
                    </div>
                )}

                {/* SHORTCUTS HINTS */}
                <div className="w-full flex justify-center gap-4 lg:gap-6 py-4 flex-wrap">
                    {[
                        ["Ctrl", "Enter", "Convert"],
                        ["Ctrl", "Shift+C", "Copy"],
                        ["Ctrl", "L", "Clear"]
                    ].map(([m, k, a]) => (
                        <div key={a} className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-surface border border-border rounded text-textSecondary font-mono">{m}</span>
                            <span className="text-11 text-textMuted">+</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-surface border border-border rounded text-textSecondary font-mono">{k}</span>
                            <span className="text-11 text-textMuted ml-1">{a}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* ─── SEO TABS ─── */}
            {tabs.length > 0 && (
                <div className="border-t border-border mt-6 w-full bg-background">
                    <div className="max-w-content mx-auto px-5">
                        {/* Tab Bar */}
                        <div className="flex border-b border-border overflow-x-auto scrollbar-none gap-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`tab-btn text-13 font-medium px-5 py-3.5 border-b-2 cursor-pointer transition-all whitespace-nowrap -mb-[1px] ${activeTab === tab.id ? 'text-accent border-accent' : 'text-textMuted border-transparent'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="max-w-4xl py-10 pb-20 text-14 leading-relaxed">
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    className={`prose prose-invert prose-p:text-textSecondary prose-headings:text-textPrimary prose-headings:font-ui prose-a:text-accent prose-li:text-textSecondary max-w-none ${activeTab === tab.id ? 'block animate-in fade-in duration-300' : 'hidden'}`}
                                >
                                    {tab.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
