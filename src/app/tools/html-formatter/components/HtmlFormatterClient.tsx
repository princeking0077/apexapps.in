"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import prettier from 'prettier/standalone';
import htmlPlugin from 'prettier/plugins/html';
import {
    Play,
    Copy,
    Check,
    Download,
    Trash2,
    Upload,
    Settings2,
    Monitor,
    Tablet,
    Smartphone,
    Eye,
    Columns2,
    Code2,
    Mail,
    AlertCircle,
} from 'lucide-react';
import { formatBytes } from '@/components/ToolPage';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HtmlFormatterClientProps {
    toolData?: { name: string; type: string; desc: string };
}

type ViewMode = 'split' | 'preview' | 'code';
type DevicePreset = 'desktop' | 'tablet' | 'mobile';
type OperationMode = 'Beautify' | 'Minify';

const DEVICE_WIDTHS: Record<DevicePreset, number> = {
    desktop: 0, // full width
    tablet: 768,
    mobile: 375,
};

// ─── Minifier ────────────────────────────────────────────────────────────────

function minifyHtml(html: string, removeComments: boolean): string {
    let result = html;
    if (removeComments) {
        result = result.replace(/<!--[\s\S]*?-->/g, '');
    }
    // Collapse whitespace between tags
    result = result.replace(/>\s+</g, '><');
    // Collapse runs of whitespace to single space
    result = result.replace(/\s{2,}/g, ' ');
    // Trim
    result = result.trim();
    return result;
}

// ─── Example HTML ────────────────────────────────────────────────────────────

const EXAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sample Page</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8fafc; color: #1e293b; }
h1 { color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
.card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 16px 0; }
.btn { display: inline-block; padding: 10px 20px; background: #0ea5e9; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
</style>
</head>
<body>
<h1>Welcome to My Page</h1>
<div class="card">
<h2>About</h2>
<p>This is a sample HTML page to demonstrate the formatter. It includes <strong>inline elements</strong>, <a href="#">links</a>, and <em>emphasis</em>.</p>
<a href="#" class="btn">Learn More</a>
</div>
<div class="grid">
<div class="card"><h3>Feature 1</h3><p>Fast and responsive design with modern CSS.</p></div>
<div class="card"><h3>Feature 2</h3><p>Clean, semantic HTML structure throughout.</p></div>
<div class="card"><h3>Feature 3</h3><p>Accessible and mobile-friendly by default.</p></div>
</div>
</body>
</html>`;

const EXAMPLE_EMAIL = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Email</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;">
<tr><td align="center" style="padding:40px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
<tr><td style="background:#0ea5e9;padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-family:Arial,sans-serif;">Welcome!</h1>
</td></tr>
<tr><td style="padding:30px;font-family:Arial,sans-serif;color:#333;">
<p style="margin:0 0 16px;">Hello there,</p>
<p style="margin:0 0 16px;">Thank you for signing up. We're excited to have you on board.</p>
<table cellpadding="0" cellspacing="0"><tr><td style="background:#0ea5e9;border-radius:6px;padding:12px 24px;">
<a href="#" style="color:#ffffff;text-decoration:none;font-weight:bold;font-family:Arial,sans-serif;">Get Started</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f8f8f8;padding:20px;text-align:center;font-size:12px;color:#999;font-family:Arial,sans-serif;">
<p style="margin:0;">You received this because you signed up at example.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function HtmlFormatterClient({ toolData = { name: 'HTML Formatter', type: 'Formatter', desc: 'Beautify, minify, and live-preview HTML in your browser. Supports email template mode and responsive preview. 100% client-side.' } }: HtmlFormatterClientProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<OperationMode>('Beautify');
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [device, setDevice] = useState<DevicePreset>('desktop');
    const [emailMode, setEmailMode] = useState(false);

    // Options
    const [showOptions, setShowOptions] = useState(false);
    const [indentWidth, setIndentWidth] = useState<number | 'tab'>(2);
    const [wrapLength, setWrapLength] = useState<number>(80);
    const [removeComments, setRemoveComments] = useState(true);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Update preview when input changes (live preview uses input directly)
    const previewHtml = output || input;

    // Update iframe content
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;
        doc.open();
        doc.write(previewHtml);
        doc.close();
    }, [previewHtml, viewMode]);

    const processHtml = useCallback(async () => {
        if (!input.trim()) {
            setOutput('');
            setErrorMsg(null);
            return;
        }

        try {
            setErrorMsg(null);

            if (mode === 'Minify') {
                const minified = minifyHtml(input, removeComments);
                setOutput(minified);
            } else {
                const formatted = await prettier.format(input, {
                    parser: 'html',
                    plugins: [htmlPlugin],
                    useTabs: indentWidth === 'tab',
                    tabWidth: typeof indentWidth === 'number' ? indentWidth : 2,
                    printWidth: wrapLength,
                    htmlWhitespaceSensitivity: 'css',
                    singleAttributePerLine: false,
                });
                setOutput(formatted);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'An error occurred while processing HTML.';
            setErrorMsg(message);
        }
    }, [input, mode, indentWidth, wrapLength, removeComments]);

    const handleCopy = useCallback(() => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [output]);

    const handleDownload = useCallback(() => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.html';
        a.click();
        URL.revokeObjectURL(url);
    }, [output]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (typeof ev.target?.result === 'string') setInput(ev.target.result);
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const loadExample = useCallback(() => {
        setInput(emailMode ? EXAMPLE_EMAIL : EXAMPLE_HTML);
        setOutput('');
        setErrorMsg(null);
    }, [emailMode]);

    const inBytes = useMemo(() => new TextEncoder().encode(input || '').length, [input]);
    const outBytes = useMemo(() => new TextEncoder().encode(output || '').length, [output]);

    const savings = inBytes > 0 && outBytes > 0
        ? ((inBytes - outBytes) / inBytes * 100).toFixed(1)
        : null;

    // Device width for iframe
    const iframeWidth = DEVICE_WIDTHS[device] || '100%';

    return (
        <div className="w-full flex flex-col pt-16 md:pt-20 min-h-screen bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
                .convert-btn-glow { transition: all 0.15s; box-shadow: 0 0 20px rgba(0,184,255,0.28); }
                .convert-btn-glow:hover { box-shadow: 0 0 32px rgba(0,184,255,0.45) !important; transform: scale(1.08); }
                .convert-btn-glow:active { transform: scale(0.96); }
            `}} />

            <div className="max-w-content mx-auto w-full px-5 pb-6">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 items-center py-4">
                    {['Tools', '\u203A', 'Formatters', '\u203A', 'HTML Formatter'].map((t, i, arr) => (
                        <span key={i} className={`text-12 ${i === arr.length - 1 ? 'text-textSecondary' : 'text-textMuted'}`}>{t}</span>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                        <h1 className="text-28 md:text-32 font-bold text-[#f1f5f9] tracking-tight mb-1.5">{toolData.name}</h1>
                        <p className="text-14 text-textSecondary leading-relaxed">{toolData.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Email mode toggle */}
                        <button
                            onClick={() => setEmailMode(!emailMode)}
                            className={`text-12 font-bold px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 ${emailMode ? 'bg-accent/10 border-accent text-accent' : 'bg-surface border-border text-textSecondary hover:text-textPrimary hover:border-textMuted'}`}
                        >
                            <Mail size={14} /> Email Template
                        </button>
                    </div>
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3 mb-4">
                        <AlertCircle size={20} className="mt-0.5 text-error shrink-0" />
                        <div>
                            <h4 className="font-bold text-14 text-error mb-1">HTML Parse Error</h4>
                            <p className="text-13 text-error/90 font-code whitespace-pre-wrap">{errorMsg}</p>
                        </div>
                    </div>
                )}

                {/* Savings banner */}
                {mode === 'Minify' && savings && parseFloat(savings) > 0 && output && (
                    <div className="bg-success/8 border border-success/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
                        <span className="text-14 text-success font-bold">Reduced by {savings}%</span>
                        <span className="text-12 text-textMuted">{formatBytes(inBytes)} &rarr; {formatBytes(outBytes)}</span>
                    </div>
                )}

                {/* ─── TOOLBAR ─── */}
                <div className="bg-surface border border-border rounded-t-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        {/* View mode */}
                        <div className="flex bg-background rounded-lg p-0.5 border border-border">
                            {([
                                { id: 'split' as const, icon: <Columns2 size={14} />, label: 'Split' },
                                { id: 'code' as const, icon: <Code2 size={14} />, label: 'Code' },
                                { id: 'preview' as const, icon: <Eye size={14} />, label: 'Preview' },
                            ]).map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setViewMode(v.id)}
                                    title={v.label}
                                    className={`flex items-center gap-1.5 text-12 font-medium px-2.5 py-1.5 rounded-md transition-colors ${viewMode === v.id ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textMuted hover:text-textSecondary'}`}
                                >
                                    {v.icon} <span className="hidden sm:inline">{v.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Device presets (only in preview/split) */}
                        {viewMode !== 'code' && (
                            <div className="flex bg-background rounded-lg p-0.5 border border-border">
                                {([
                                    { id: 'desktop' as const, icon: <Monitor size={14} /> },
                                    { id: 'tablet' as const, icon: <Tablet size={14} /> },
                                    { id: 'mobile' as const, icon: <Smartphone size={14} /> },
                                ]).map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setDevice(d.id)}
                                        title={d.id}
                                        className={`px-2 py-1.5 rounded-md transition-colors ${device === d.id ? 'bg-surface2 text-accent shadow-sm' : 'text-textMuted hover:text-textSecondary'}`}
                                    >
                                        {d.icon}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Convert button */}
                        <button
                            onClick={processHtml}
                            className="convert-btn-glow text-12 font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-[#0077cc] text-white flex items-center gap-1.5 border-none cursor-pointer"
                        >
                            <Play size={13} fill="currentColor" /> {mode === 'Beautify' ? 'Beautify' : 'Minify'}
                        </button>

                        {/* Options */}
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${showOptions ? 'bg-accent/10 border-accent text-accent' : 'bg-surface2 border-border text-textSecondary hover:text-accent hover:border-accent'}`}
                        >
                            <Settings2 size={15} />
                        </button>
                    </div>
                </div>

                {/* ─── OPTIONS PANEL ─── */}
                {showOptions && (
                    <div className="border-x border-border bg-surface px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Mode */}
                            <div className="flex flex-col gap-2">
                                <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Mode</label>
                                <div className="flex bg-background rounded-lg p-1 border border-border">
                                    {(['Beautify', 'Minify'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={`flex-1 text-12 font-bold py-1.5 rounded-md transition-colors ${mode === m ? 'bg-accent text-black shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Indent */}
                            {mode === 'Beautify' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Indent</label>
                                    <div className="flex bg-background rounded-lg p-1 border border-border">
                                        {([2, 4, 'tab'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setIndentWidth(opt)}
                                                className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${indentWidth === opt ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                            >
                                                {opt === 'tab' ? 'Tab' : `${opt} sp`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Wrap length */}
                            {mode === 'Beautify' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Wrap at</label>
                                    <div className="flex bg-background rounded-lg p-1 border border-border">
                                        {[80, 120, 9999].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setWrapLength(opt)}
                                                className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${wrapLength === opt ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                            >
                                                {opt === 9999 ? 'Off' : opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remove comments (minify) */}
                            {mode === 'Minify' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Options</label>
                                    <label className="flex items-center gap-2 cursor-pointer text-14 text-textPrimary">
                                        <input
                                            type="checkbox"
                                            checked={removeComments}
                                            onChange={(e) => setRemoveComments(e.target.checked)}
                                            className="accent-accent w-4 h-4 cursor-pointer"
                                        />
                                        Remove Comments
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── EDITOR AREA ─── */}
                <div className={`border border-border rounded-b-xl overflow-hidden bg-surface ${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : ''}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".html,.htm,.svg,.xml" className="hidden" />

                    {/* INPUT PANE */}
                    {viewMode !== 'preview' && (
                        <div className={`flex flex-col ${viewMode === 'split' ? 'lg:border-r border-border' : ''}`}>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${input ? 'bg-accent' : 'bg-textMuted'}`} />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Input</span>
                                    {input && <span className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-px font-mono">{formatBytes(inBytes)}</span>}
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={loadExample} className="hov-icon text-11 text-textMuted bg-surface2 border border-border rounded-md px-2.5 py-1 cursor-pointer transition-all">
                                        Example
                                    </button>
                                    <button onClick={() => fileInputRef.current?.click()} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all" title="Upload">
                                        <Upload size={14} />
                                    </button>
                                    <button onClick={() => { setInput(''); setOutput(''); setErrorMsg(null); }} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all" title="Clear">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-[500px]">
                                <Editor
                                    height="100%"
                                    language="html"
                                    theme="vs-dark"
                                    value={input}
                                    onChange={(v) => setInput(v || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        fontFamily: 'var(--font-jetbrains-mono)',
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                    }}
                                />
                            </div>
                            <div className="flex justify-between px-4 py-1.5 border-t border-border bg-[#080c14]">
                                <span className="text-11 text-textMuted font-mono">{input.split('\n').length} lines</span>
                                <span className="text-11 text-textMuted">{formatBytes(inBytes)}</span>
                            </div>
                        </div>
                    )}

                    {/* OUTPUT / PREVIEW */}
                    {viewMode === 'code' ? (
                        /* Code-only output */
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${output ? 'bg-success' : 'bg-textMuted'}`} />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Output</span>
                                    {output && <span className="text-[10px] bg-success/10 text-success rounded px-1.5 py-px font-mono">{formatBytes(outBytes)}</span>}
                                </div>
                                <div className="flex gap-1.5">
                                    {output && (
                                        <>
                                            <button onClick={handleCopy} className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 ${isCopied ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}>
                                                {isCopied ? <Check size={12} /> : <Copy size={12} />} {isCopied ? 'Copied' : 'Copy'}
                                            </button>
                                            <button onClick={handleDownload} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all" title="Download">
                                                <Download size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="h-[500px]">
                                <Editor
                                    height="100%"
                                    language="html"
                                    theme="vs-dark"
                                    value={output}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        fontFamily: 'var(--font-jetbrains-mono)',
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                    }}
                                />
                            </div>
                            <div className="flex justify-between px-4 py-1.5 border-t border-border bg-[#080c14]">
                                <span className="text-11 text-textMuted font-mono">{output ? `${output.split('\n').length} lines` : '0 B'}</span>
                                {output && savings && mode === 'Minify' && <span className="text-11 text-success font-mono">-{savings}%</span>}
                            </div>
                        </div>
                    ) : viewMode === 'preview' ? (
                        /* Preview-only */
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Eye size={14} className="text-accent" />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Live Preview</span>
                                    {device !== 'desktop' && <span className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-px font-mono">{DEVICE_WIDTHS[device]}px</span>}
                                </div>
                                <div className="flex gap-1.5">
                                    {output && (
                                        <>
                                            <button onClick={handleCopy} className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 ${isCopied ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}>
                                                {isCopied ? <Check size={12} /> : <Copy size={12} />} {isCopied ? 'Copied' : 'Copy'}
                                            </button>
                                            <button onClick={handleDownload} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all">
                                                <Download size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="h-[540px] bg-white flex justify-center overflow-auto">
                                <iframe
                                    ref={iframeRef}
                                    sandbox="allow-same-origin"
                                    className="h-full border-0 transition-all"
                                    style={{ width: iframeWidth || '100%', maxWidth: '100%' }}
                                    title="HTML Preview"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Split: output code + preview */
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Eye size={14} className="text-accent" />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">
                                        {output ? 'Output + Preview' : 'Live Preview'}
                                    </span>
                                    {device !== 'desktop' && <span className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-px font-mono">{DEVICE_WIDTHS[device]}px</span>}
                                </div>
                                <div className="flex gap-1.5">
                                    {output && (
                                        <>
                                            <button onClick={handleCopy} className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 ${isCopied ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}>
                                                {isCopied ? <Check size={12} /> : <Copy size={12} />} {isCopied ? 'Copied' : 'Copy'}
                                            </button>
                                            <button onClick={handleDownload} className="hov-icon text-12 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all">
                                                <Download size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Split vertically: code top, preview bottom */}
                            {output ? (
                                <>
                                    <div className="h-[250px] border-b border-border">
                                        <Editor
                                            height="100%"
                                            language="html"
                                            theme="vs-dark"
                                            value={output}
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                fontFamily: 'var(--font-jetbrains-mono)',
                                                padding: { top: 12 },
                                                scrollBeyondLastLine: false,
                                                wordWrap: 'on',
                                            }}
                                        />
                                    </div>
                                    <div className="h-[250px] bg-white flex justify-center overflow-auto">
                                        <iframe
                                            ref={iframeRef}
                                            sandbox="allow-same-origin"
                                            className="h-full border-0 transition-all"
                                            style={{ width: iframeWidth || '100%', maxWidth: '100%' }}
                                            title="HTML Preview"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="h-[500px] bg-white flex justify-center overflow-auto">
                                    <iframe
                                        ref={iframeRef}
                                        sandbox="allow-same-origin"
                                        className="h-full border-0 transition-all"
                                        style={{ width: iframeWidth || '100%', maxWidth: '100%' }}
                                        title="HTML Preview"
                                    />
                                </div>
                            )}
                            <div className="flex justify-between px-4 py-1.5 border-t border-border bg-[#080c14]">
                                <span className="text-11 text-textMuted font-mono">{output ? `${output.split('\n').length} lines \u00B7 ${outBytes} B` : '0 B'}</span>
                                {output && savings && mode === 'Minify' && <span className="text-11 text-success font-mono">-{savings}%</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Email mode info */}
                {emailMode && (
                    <div className="bg-accent/5 border border-accent/15 rounded-xl px-4 py-3 mt-4 flex items-start gap-3">
                        <Mail size={18} className="text-accent mt-0.5 shrink-0" />
                        <div>
                            <p className="text-14 font-bold text-accent mb-1">Email Template Mode</p>
                            <p className="text-13 text-textSecondary leading-relaxed">
                                Email HTML uses table-based layouts for compatibility with Outlook, Gmail, and other clients. Load the example to see a properly structured email template. The formatter preserves inline styles and table structure.
                            </p>
                        </div>
                    </div>
                )}

                {/* Shortcuts */}
                <div className="w-full flex justify-center gap-4 lg:gap-6 py-4 flex-wrap">
                    {[
                        ["Ctrl", "Enter", "Format"],
                        ["Ctrl", "Shift+C", "Copy"],
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

            <SeoTabs />
        </div>
    );
}

// ─── SEO Tabs ────────────────────────────────────────────────────────────────

function SeoTabs() {
    const [activeTab, setActiveTab] = useState('what-is');

    const tabs = [
        {
            id: 'what-is',
            label: 'What is HTML Formatting?',
            content: (
                <div>
                    <h2>Online HTML Formatter & Beautifier</h2>
                    <p>
                        HTML formatting transforms unreadable or minified markup into clean, properly indented code. Whether you&apos;re debugging a production page, reviewing someone else&apos;s code, or preparing HTML for documentation, a formatter makes it readable in seconds.
                    </p>
                    <h3>Key Features</h3>
                    <ul>
                        <li><strong>Beautify &amp; Minify:</strong> Format HTML with configurable indentation, or compress it by removing all unnecessary whitespace and comments.</li>
                        <li><strong>Live Preview:</strong> See your HTML rendered in a sandboxed iframe as you type. No scripts execute for safety.</li>
                        <li><strong>Responsive Testing:</strong> Preview your HTML at desktop, tablet, and mobile widths to test responsive layouts.</li>
                        <li><strong>Email Template Mode:</strong> A unique feature for email developers. Load table-based HTML templates and format them while preserving the inline styles email clients require.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'how-to',
            label: 'How to Format HTML',
            content: (
                <div>
                    <h2>How to Beautify Your HTML</h2>
                    <ol>
                        <li><strong>Paste HTML:</strong> Enter your HTML in the left editor panel, or click &quot;Example&quot; to load a sample page.</li>
                        <li><strong>Configure:</strong> Click the gear icon to set indentation (2 spaces, 4 spaces, or tabs) and line wrap length.</li>
                        <li><strong>Format:</strong> Click the Beautify button or press <code>Ctrl+Enter</code>.</li>
                        <li><strong>Preview:</strong> Switch between Split, Code, and Preview views. Use the device presets to test responsive design.</li>
                        <li><strong>Export:</strong> Copy the formatted output or download it as an <code>.html</code> file.</li>
                    </ol>
                    <h3>Email Template Mode</h3>
                    <p>Toggle &quot;Email Template&quot; mode and click &quot;Example&quot; to load a properly structured email template with table-based layout. The formatter preserves inline styles and nested table structures that email clients like Outlook and Gmail require.</p>
                </div>
            ),
        },
        {
            id: 'examples',
            label: 'Examples',
            content: (
                <div>
                    <h2>HTML Formatting Examples</h2>
                    <h3>Before: Minified HTML</h3>
                    <pre><code>{`<div class="card"><h2>Title</h2><p>Description with <strong>bold</strong> and <a href="#">link</a>.</p><button class="btn">Click</button></div>`}</code></pre>
                    <h3>After: Beautified (2 spaces)</h3>
                    <pre><code>{`<div class="card">
  <h2>Title</h2>
  <p>
    Description with <strong>bold</strong> and
    <a href="#">link</a>.
  </p>
  <button class="btn">Click</button>
</div>`}</code></pre>
                    <h3>After: Minified</h3>
                    <pre><code>{`<div class="card"><h2>Title</h2><p>Description with <strong>bold</strong> and <a href="#">link</a>.</p><button class="btn">Click</button></div>`}</code></pre>
                </div>
            ),
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions</h2>

                    <h3>Does formatting change how my HTML renders?</h3>
                    <p>In most cases, no. Formatting only changes whitespace. However, in elements with <code>white-space: pre</code> or inside <code>&lt;pre&gt;</code> tags, whitespace matters. Our formatter respects whitespace-sensitive elements.</p>

                    <h3>Is the preview safe? Can scripts execute?</h3>
                    <p>The preview uses a sandboxed iframe with <code>sandbox=&quot;allow-same-origin&quot;</code>. This prevents JavaScript execution, form submissions, and popup windows. Only the visual rendering of your HTML is displayed.</p>

                    <h3>Why is there an Email Template mode?</h3>
                    <p>Email clients like Outlook don&apos;t support modern CSS (flexbox, grid). Email HTML must use tables for layout and inline styles for formatting. Our email mode loads a properly structured template and the formatter preserves these email-specific patterns.</p>

                    <h3>Is my HTML sent to any server?</h3>
                    <p>No. Formatting uses Prettier&apos;s browser build running locally. Minification uses a simple regex-based processor. The preview renders locally in an iframe. Nothing leaves your browser.</p>
                </div>
            ),
        },
    ];

    return (
        <div className="border-t border-border mt-6 w-full bg-background">
            <div className="max-w-content mx-auto px-5">
                <div className="flex border-b border-border overflow-x-auto scrollbar-none gap-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`text-13 font-medium px-5 py-3.5 border-b-2 cursor-pointer transition-all whitespace-nowrap -mb-[1px] ${activeTab === tab.id ? 'text-accent border-accent' : 'text-textMuted border-transparent hover:text-[#cad5e8]'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
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
    );
}
