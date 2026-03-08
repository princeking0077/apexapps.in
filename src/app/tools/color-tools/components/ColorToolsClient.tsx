"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    Copy,
    Check,
    Pipette,
    Contrast,
    Palette,
    ImageIcon,
    Upload,
    CheckCircle2,
    XCircle,
    Download,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColorToolsClientProps {
    toolData?: { name: string; type: string; desc: string };
}

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface CMYK { c: number; m: number; y: number; k: number }

type TabId = 'converter' | 'contrast' | 'tints' | 'palette';

// ─── Color Conversion Utilities ──────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

function hexToRgb(hex: string): RGB | null {
    const h = hex.replace('#', '');
    let r: number, g: number, b: number;
    if (h.length === 3) {
        r = parseInt(h[0] + h[0], 16);
        g = parseInt(h[1] + h[1], 16);
        b = parseInt(h[2] + h[2], 16);
    } else if (h.length === 6) {
        r = parseInt(h.slice(0, 2), 16);
        g = parseInt(h.slice(2, 4), 16);
        b = parseInt(h.slice(4, 6), 16);
    } else return null;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
}

function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360, s = hsl.s / 100, l = hsl.l / 100;
    if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
}

function rgbToCmyk(rgb: RGB): CMYK {
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
        c: Math.round(((1 - r - k) / (1 - k)) * 100),
        m: Math.round(((1 - g - k) / (1 - k)) * 100),
        y: Math.round(((1 - b - k) / (1 - k)) * 100),
        k: Math.round(k * 100),
    };
}

function cmykToRgb(cmyk: CMYK): RGB {
    const c = cmyk.c / 100, m = cmyk.m / 100, y = cmyk.y / 100, k = cmyk.k / 100;
    return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k)),
    };
}

// WCAG relative luminance
function relativeLuminance(rgb: RGB): number {
    const toLinear = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

function contrastRatio(fg: RGB, bg: RGB): number {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Generate tints (lighter) and shades (darker)
function generateScale(hex: string): { step: number; hex: string; rgb: RGB }[] {
    const base = hexToRgb(hex);
    if (!base) return [];
    const hsl = rgbToHsl(base);
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const lightnessMap: Record<number, number> = {
        50: 97, 100: 94, 200: 86, 300: 76, 400: 64,
        500: 50, 600: 40, 700: 32, 800: 24, 900: 17, 950: 10,
    };
    return steps.map(step => {
        const l = lightnessMap[step];
        const rgb = hslToRgb({ h: hsl.h, s: hsl.s, l });
        return { step, hex: rgbToHex(rgb), rgb };
    });
}

// ─── Copy Hook ───────────────────────────────────────────────────────────────

function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const copy = useCallback((text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    }, []);
    return { copiedKey, copy };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ColorToolsClient({ toolData = { name: 'Color Tools', type: 'Converter', desc: 'Convert HEX, RGB, HSL, CMYK. Check WCAG contrast, generate tints & shades, extract palettes from images. 100% client-side.' } }: ColorToolsClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>('converter');

    // Read hash on mount
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as TabId;
        if (['converter', 'contrast', 'tints', 'palette'].includes(hash)) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setActiveTab(hash);
        }
    }, []);

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        window.history.replaceState(null, '', `#${tab}`);
    };

    const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'converter', label: 'Converter', icon: <Pipette size={15} /> },
        { id: 'contrast', label: 'Contrast', icon: <Contrast size={15} /> },
        { id: 'tints', label: 'Tints & Shades', icon: <Palette size={15} /> },
        { id: 'palette', label: 'Palette', icon: <ImageIcon size={15} /> },
    ];

    return (
        <div className="w-full flex flex-col pt-16 md:pt-20 min-h-screen bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
                .color-input-swatch { border: 2px solid var(--color-border); cursor: pointer; }
                .color-input-swatch:hover { border-color: var(--color-accent); }
                .shade-chip:hover { transform: scale(1.08); }
                .shade-chip { transition: transform 0.1s; cursor: pointer; }
            `}} />

            <div className="max-w-content mx-auto w-full px-5 pb-6">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 items-center py-4">
                    {['Tools', '\u203A', 'Converters', '\u203A', 'Color Tools'].map((t, i, arr) => (
                        <span key={i} className={`text-12 ${i === arr.length - 1 ? 'text-textSecondary' : 'text-textMuted'}`}>{t}</span>
                    ))}
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-28 md:text-32 font-bold text-[#f1f5f9] tracking-tight mb-1.5">{toolData.name}</h1>
                    <p className="text-14 text-textSecondary leading-relaxed">{toolData.desc}</p>
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-border mb-6 overflow-x-auto scrollbar-none gap-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 text-13 font-medium px-5 py-3.5 border-b-2 cursor-pointer transition-all whitespace-nowrap -mb-[1px] ${activeTab === tab.id ? 'text-accent border-accent' : 'text-textMuted border-transparent hover:text-[#cad5e8]'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'converter' && <ConverterTab />}
                {activeTab === 'contrast' && <ContrastTab />}
                {activeTab === 'tints' && <TintsTab />}
                {activeTab === 'palette' && <PaletteTab />}
            </div>

            <SeoTabs />
        </div>
    );
}

// ─── TAB 1: Converter ────────────────────────────────────────────────────────

function ConverterTab() {
    const [hex, setHex] = useState('#00b8ff');
    const [rgbText, setRgbText] = useState('0, 184, 255');
    const [hslText, setHslText] = useState('197, 100%, 50%');
    const [cmykText, setCmykText] = useState('100%, 28%, 0%, 0%');
    const { copiedKey, copy } = useCopy();

    const rgb = useMemo(() => hexToRgb(hex), [hex]);
    const hsl = useMemo(() => rgb ? rgbToHsl(rgb) : null, [rgb]);
    const cmyk = useMemo(() => rgb ? rgbToCmyk(rgb) : null, [rgb]);

    const syncFromHex = useCallback((h: string) => {
        setHex(h);
        const r = hexToRgb(h);
        if (!r) return;
        setRgbText(`${r.r}, ${r.g}, ${r.b}`);
        const hs = rgbToHsl(r);
        setHslText(`${hs.h}, ${hs.s}%, ${hs.l}%`);
        const cm = rgbToCmyk(r);
        setCmykText(`${cm.c}%, ${cm.m}%, ${cm.y}%, ${cm.k}%`);
    }, []);

    const handleHexChange = (v: string) => {
        setHex(v);
        if (/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(v)) {
            const h = v.startsWith('#') ? v : `#${v}`;
            syncFromHex(h);
        }
    };

    const handleRgbChange = (v: string) => {
        setRgbText(v);
        const parts = v.split(',').map(s => parseInt(s.trim()));
        if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
            const r: RGB = { r: parts[0], g: parts[1], b: parts[2] };
            const h = rgbToHex(r);
            setHex(h);
            const hs = rgbToHsl(r);
            setHslText(`${hs.h}, ${hs.s}%, ${hs.l}%`);
            const cm = rgbToCmyk(r);
            setCmykText(`${cm.c}%, ${cm.m}%, ${cm.y}%, ${cm.k}%`);
        }
    };

    const handleHslChange = (v: string) => {
        setHslText(v);
        const parts = v.replace(/%/g, '').split(',').map(s => parseInt(s.trim()));
        if (parts.length === 3 && parts.every(n => !isNaN(n))) {
            const hs: HSL = { h: clamp(parts[0], 0, 360), s: clamp(parts[1], 0, 100), l: clamp(parts[2], 0, 100) };
            const r = hslToRgb(hs);
            const h = rgbToHex(r);
            setHex(h);
            setRgbText(`${r.r}, ${r.g}, ${r.b}`);
            const cm = rgbToCmyk(r);
            setCmykText(`${cm.c}%, ${cm.m}%, ${cm.y}%, ${cm.k}%`);
        }
    };

    const handleCmykChange = (v: string) => {
        setCmykText(v);
        const parts = v.replace(/%/g, '').split(',').map(s => parseInt(s.trim()));
        if (parts.length === 4 && parts.every(n => !isNaN(n))) {
            const cm: CMYK = { c: clamp(parts[0], 0, 100), m: clamp(parts[1], 0, 100), y: clamp(parts[2], 0, 100), k: clamp(parts[3], 0, 100) };
            const r = cmykToRgb(cm);
            const h = rgbToHex(r);
            setHex(h);
            setRgbText(`${r.r}, ${r.g}, ${r.b}`);
            const hs = rgbToHsl(r);
            setHslText(`${hs.h}, ${hs.s}%, ${hs.l}%`);
        }
    };

    const textColor = hsl && hsl.l > 55 ? '#000' : '#fff';

    const fields = [
        { label: 'HEX', value: hex, onChange: handleHexChange, copyVal: hex, key: 'hex', prefix: '' },
        { label: 'RGB', value: rgbText, onChange: handleRgbChange, copyVal: `rgb(${rgbText})`, key: 'rgb', prefix: 'rgb(' },
        { label: 'HSL', value: hslText, onChange: handleHslChange, copyVal: `hsl(${hslText})`, key: 'hsl', prefix: 'hsl(' },
        { label: 'CMYK', value: cmykText, onChange: handleCmykChange, copyVal: `cmyk(${cmykText})`, key: 'cmyk', prefix: 'cmyk(' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Color fields */}
            <div className="flex flex-col gap-4">
                {fields.map(f => (
                    <div key={f.key} className="bg-surface border border-border rounded-xl p-4">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">{f.label}</label>
                        <div className="flex items-center gap-2">
                            {f.prefix && <span className="text-14 text-textMuted font-code">{f.prefix}</span>}
                            <input
                                type="text"
                                value={f.value}
                                onChange={(e) => f.onChange(e.target.value)}
                                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-16 font-code text-textPrimary outline-none focus:border-accent transition-colors"
                                spellCheck={false}
                            />
                            {f.prefix && <span className="text-14 text-textMuted font-code">)</span>}
                            <button
                                onClick={() => copy(f.copyVal, f.key)}
                                className={`hov-icon w-9 h-9 rounded-md border flex items-center justify-center transition-all ${copiedKey === f.key ? 'text-success border-success bg-success/10' : 'text-textMuted border-border bg-surface2'}`}
                            >
                                {copiedKey === f.key ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview + picker */}
            <div className="flex flex-col gap-4">
                {/* Large swatch */}
                <div
                    className="rounded-xl border border-border h-48 flex items-center justify-center text-20 font-bold font-code transition-colors"
                    style={{ backgroundColor: rgb ? rgbToHex(rgb) : hex, color: textColor }}
                >
                    {hex.toUpperCase()}
                </div>

                {/* Native color picker */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-3 block">Color Picker</label>
                    <input
                        type="color"
                        value={rgb ? rgbToHex(rgb) : '#000000'}
                        onChange={(e) => syncFromHex(e.target.value)}
                        className="color-input-swatch w-full h-12 rounded-lg bg-transparent cursor-pointer"
                    />
                </div>

                {/* Quick info */}
                {rgb && hsl && cmyk && (
                    <div className="bg-surface border border-border rounded-xl p-4 text-13 text-textSecondary">
                        <div className="grid grid-cols-2 gap-2">
                            <span>Red: <span className="text-textPrimary font-code">{rgb.r}</span></span>
                            <span>Hue: <span className="text-textPrimary font-code">{hsl.h}\u00B0</span></span>
                            <span>Green: <span className="text-textPrimary font-code">{rgb.g}</span></span>
                            <span>Saturation: <span className="text-textPrimary font-code">{hsl.s}%</span></span>
                            <span>Blue: <span className="text-textPrimary font-code">{rgb.b}</span></span>
                            <span>Lightness: <span className="text-textPrimary font-code">{hsl.l}%</span></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── TAB 2: Contrast Checker ─────────────────────────────────────────────────

function PassFail({ pass, label }: { pass: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${pass ? 'bg-success/10 border-success/20' : 'bg-error/10 border-error/20'}`}>
            {pass ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-error" />}
            <span className={`text-13 font-medium ${pass ? 'text-success' : 'text-error'}`}>{label}</span>
            <span className={`text-11 ml-auto ${pass ? 'text-success' : 'text-error'}`}>{pass ? 'Pass' : 'Fail'}</span>
        </div>
    );
}

function ContrastTab() {
    const [fgHex, setFgHex] = useState('#ffffff');
    const [bgHex, setBgHex] = useState('#1a1a2e');
    const { copiedKey, copy } = useCopy();

    const fgRgb = useMemo(() => hexToRgb(fgHex) || { r: 255, g: 255, b: 255 }, [fgHex]);
    const bgRgb = useMemo(() => hexToRgb(bgHex) || { r: 0, g: 0, b: 0 }, [bgHex]);
    const ratio = useMemo(() => contrastRatio(fgRgb, bgRgb), [fgRgb, bgRgb]);

    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3;
    const aaaNormal = ratio >= 7;
    const aaaLarge = ratio >= 4.5;

    // Suggestion: find closest passing color by adjusting lightness
    const suggestion = useMemo(() => {
        if (aaNormal) return null;
        const fgHsl = rgbToHsl(fgRgb);
        const bgLum = relativeLuminance(bgRgb);

        // Try darker
        let darkerHex: string | null = null;
        for (let l = fgHsl.l; l >= 0; l--) {
            const testRgb = hslToRgb({ ...fgHsl, l });
            const testLum = relativeLuminance(testRgb);
            const r = (Math.max(testLum, bgLum) + 0.05) / (Math.min(testLum, bgLum) + 0.05);
            if (r >= 4.5) { darkerHex = rgbToHex(testRgb); break; }
        }

        // Try lighter
        let lighterHex: string | null = null;
        for (let l = fgHsl.l; l <= 100; l++) {
            const testRgb = hslToRgb({ ...fgHsl, l });
            const testLum = relativeLuminance(testRgb);
            const r = (Math.max(testLum, bgLum) + 0.05) / (Math.min(testLum, bgLum) + 0.05);
            if (r >= 4.5) { lighterHex = rgbToHex(testRgb); break; }
        }

        return { darkerHex, lighterHex };
    }, [fgRgb, bgRgb, aaNormal]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            {/* Color pickers */}
            <div className="flex flex-col gap-4">
                {/* Foreground */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">Foreground (Text)</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={fgHex} onChange={(e) => setFgHex(e.target.value)} className="color-input-swatch w-12 h-10 rounded-lg bg-transparent" />
                        <input type="text" value={fgHex} onChange={(e) => setFgHex(e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-16 font-code text-textPrimary outline-none focus:border-accent" spellCheck={false} />
                        <button onClick={() => copy(fgHex, 'fg')} className={`hov-icon w-9 h-9 rounded-md border flex items-center justify-center ${copiedKey === 'fg' ? 'text-success border-success' : 'text-textMuted border-border bg-surface2'}`}>
                            {copiedKey === 'fg' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* Background */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">Background</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={bgHex} onChange={(e) => setBgHex(e.target.value)} className="color-input-swatch w-12 h-10 rounded-lg bg-transparent" />
                        <input type="text" value={bgHex} onChange={(e) => setBgHex(e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-16 font-code text-textPrimary outline-none focus:border-accent" spellCheck={false} />
                        <button onClick={() => copy(bgHex, 'bg')} className={`hov-icon w-9 h-9 rounded-md border flex items-center justify-center ${copiedKey === 'bg' ? 'text-success border-success' : 'text-textMuted border-border bg-surface2'}`}>
                            {copiedKey === 'bg' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* WCAG Results */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Contrast Ratio</label>
                        <span className={`text-24 font-bold font-code ${ratio >= 4.5 ? 'text-success' : ratio >= 3 ? 'text-warning' : 'text-error'}`}>
                            {ratio.toFixed(2)}:1
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <PassFail pass={aaNormal} label="AA Normal Text" />
                        <PassFail pass={aaLarge} label="AA Large Text" />
                        <PassFail pass={aaaNormal} label="AAA Normal Text" />
                        <PassFail pass={aaaLarge} label="AAA Large Text" />
                    </div>
                </div>

                {/* Suggestions */}
                {suggestion && (
                    <div className="bg-accent/5 border border-accent/15 rounded-xl p-4">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-3 block">Suggestions to pass AA</label>
                        <div className="flex flex-col gap-2">
                            {suggestion.darkerHex && (
                                <button onClick={() => setFgHex(suggestion.darkerHex!)} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2 hover:border-accent transition-colors cursor-pointer text-left">
                                    <div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: suggestion.darkerHex }} />
                                    <span className="text-13 text-textSecondary">Darken foreground to <code className="text-accent">{suggestion.darkerHex}</code></span>
                                </button>
                            )}
                            {suggestion.lighterHex && (
                                <button onClick={() => setFgHex(suggestion.lighterHex!)} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2 hover:border-accent transition-colors cursor-pointer text-left">
                                    <div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: suggestion.lighterHex }} />
                                    <span className="text-13 text-textSecondary">Lighten foreground to <code className="text-accent">{suggestion.lighterHex}</code></span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Live preview */}
            <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-border p-8 min-h-[300px] flex flex-col gap-6 justify-center" style={{ backgroundColor: bgHex }}>
                    <h2 className="text-32 font-bold" style={{ color: fgHex }}>Heading Text</h2>
                    <p className="text-16 leading-relaxed" style={{ color: fgHex }}>
                        This is normal body text rendered with your chosen foreground color on the selected background.
                        Check if the text is easily readable at this contrast ratio of {ratio.toFixed(2)}:1.
                    </p>
                    <p className="text-12" style={{ color: fgHex }}>
                        Small text like captions and footnotes requires a higher contrast ratio (4.5:1 for AA, 7:1 for AAA).
                    </p>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg font-bold text-14" style={{ backgroundColor: fgHex, color: bgHex }}>Button</button>
                        <button className="px-4 py-2 rounded-lg font-bold text-14 border-2" style={{ borderColor: fgHex, color: fgHex, background: 'transparent' }}>Outlined</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── TAB 3: Tints & Shades ──────────────────────────────────────────────────

function TintsTab() {
    const [baseHex, setBaseHex] = useState('#00b8ff');
    const { copiedKey, copy } = useCopy();

    const scale = useMemo(() => generateScale(baseHex), [baseHex]);

    const exportCSS = useCallback(() => {
        const lines = scale.map(s => `  --color-${s.step}: ${s.hex};`).join('\n');
        copy(`:root {\n${lines}\n}`, 'export-css');
    }, [scale, copy]);

    const exportTailwind = useCallback(() => {
        const lines = scale.map(s => `        ${s.step}: '${s.hex}',`).join('\n');
        copy(`module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n${lines}\n        },\n      },\n    },\n  },\n}`, 'export-tw');
    }, [scale, copy]);

    const exportSCSS = useCallback(() => {
        const lines = scale.map(s => `  ${s.step}: ${s.hex},`).join('\n');
        copy(`$brand-colors: (\n${lines}\n);`, 'export-scss');
    }, [scale, copy]);

    return (
        <div className="flex flex-col gap-6">
            {/* Base color input */}
            <div className="bg-surface border border-border rounded-xl p-4">
                <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">Base Color</label>
                <div className="flex items-center gap-3 flex-wrap">
                    <input type="color" value={baseHex} onChange={(e) => setBaseHex(e.target.value)} className="color-input-swatch w-12 h-10 rounded-lg bg-transparent" />
                    <input type="text" value={baseHex} onChange={(e) => setBaseHex(e.target.value)} className="w-32 bg-background border border-border rounded-lg px-3 py-2 text-16 font-code text-textPrimary outline-none focus:border-accent" spellCheck={false} />
                    <div className="flex gap-2 ml-auto">
                        <button onClick={exportCSS} className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5 ${copiedKey === 'export-css' ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}>
                            {copiedKey === 'export-css' ? <Check size={12} /> : <Download size={12} />} CSS
                        </button>
                        <button onClick={exportTailwind} className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5 ${copiedKey === 'export-tw' ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}>
                            {copiedKey === 'export-tw' ? <Check size={12} /> : <Download size={12} />} Tailwind
                        </button>
                        <button onClick={exportSCSS} className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5 ${copiedKey === 'export-scss' ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}>
                            {copiedKey === 'export-scss' ? <Check size={12} /> : <Download size={12} />} SCSS
                        </button>
                    </div>
                </div>
            </div>

            {/* Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-0">
                {scale.map(s => {
                    const hsl = rgbToHsl(s.rgb);
                    const textColor = hsl.l > 55 ? '#000' : '#fff';
                    return (
                        <button
                            key={s.step}
                            onClick={() => copy(s.hex, `shade-${s.step}`)}
                            className="shade-chip flex flex-col items-center justify-center py-6 sm:py-10 border border-border first:rounded-l-xl last:rounded-r-xl sm:first:rounded-l-xl sm:last:rounded-r-xl"
                            style={{ backgroundColor: s.hex }}
                            title={`Click to copy ${s.hex}`}
                        >
                            <span className="text-12 font-bold" style={{ color: textColor }}>{s.step}</span>
                            <span className="text-[10px] font-code mt-1" style={{ color: textColor, opacity: 0.8 }}>
                                {copiedKey === `shade-${s.step}` ? 'Copied!' : s.hex}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border text-[11px] font-bold text-textMuted uppercase tracking-wider">
                            <th className="px-4 py-2">Step</th>
                            <th className="px-4 py-2">HEX</th>
                            <th className="px-4 py-2">RGB</th>
                            <th className="px-4 py-2">HSL</th>
                            <th className="px-4 py-2">Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scale.map(s => {
                            const h = rgbToHsl(s.rgb);
                            return (
                                <tr key={s.step} className="border-b border-border last:border-0">
                                    <td className="px-4 py-2 text-13 font-bold text-textPrimary">{s.step}</td>
                                    <td className="px-4 py-2 text-13 font-code text-accent cursor-pointer" onClick={() => copy(s.hex, `t-${s.step}`)}>{copiedKey === `t-${s.step}` ? 'Copied!' : s.hex}</td>
                                    <td className="px-4 py-2 text-13 font-code text-textSecondary">{s.rgb.r}, {s.rgb.g}, {s.rgb.b}</td>
                                    <td className="px-4 py-2 text-13 font-code text-textSecondary">{h.h}, {h.s}%, {h.l}%</td>
                                    <td className="px-4 py-2"><div className="w-8 h-5 rounded border border-border" style={{ backgroundColor: s.hex }} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── TAB 4: Palette Extractor ────────────────────────────────────────────────

function PaletteTab() {
    const [colors, setColors] = useState<string[]>([]);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { copiedKey, copy } = useCopy();

    const extractColors = useCallback((img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize for performance
        const maxSize = 100;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = Math.floor(img.width * ratio);
        canvas.height = Math.floor(img.height * ratio);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const pixelCount = canvas.width * canvas.height;

        // Simple k-means-like quantization: bucket colors
        const bucketSize = 32;
        const buckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

        for (let i = 0; i < pixelCount * 4; i += 4) {
            const r = Math.floor(imageData[i] / bucketSize) * bucketSize;
            const g = Math.floor(imageData[i + 1] / bucketSize) * bucketSize;
            const b = Math.floor(imageData[i + 2] / bucketSize) * bucketSize;
            const a = imageData[i + 3];
            if (a < 128) continue; // Skip transparent

            const key = `${r},${g},${b}`;
            const existing = buckets.get(key);
            if (existing) {
                existing.r += imageData[i];
                existing.g += imageData[i + 1];
                existing.b += imageData[i + 2];
                existing.count++;
            } else {
                buckets.set(key, { r: imageData[i], g: imageData[i + 1], b: imageData[i + 2], count: 1 });
            }
        }

        // Sort by frequency, take top colors
        const sorted = Array.from(buckets.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        // Filter out colors that are too similar
        const result: string[] = [];
        for (const bucket of sorted) {
            const avgR = Math.round(bucket.r / bucket.count);
            const avgG = Math.round(bucket.g / bucket.count);
            const avgB = Math.round(bucket.b / bucket.count);
            const hex = rgbToHex({ r: avgR, g: avgG, b: avgB });

            // Check distance from existing results
            const isTooSimilar = result.some(existing => {
                const exRgb = hexToRgb(existing);
                if (!exRgb) return false;
                const dist = Math.sqrt((avgR - exRgb.r) ** 2 + (avgG - exRgb.g) ** 2 + (avgB - exRgb.b) ** 2);
                return dist < 60;
            });

            if (!isTooSimilar) {
                result.push(hex);
                if (result.length >= 8) break;
            }
        }

        setColors(result);
    }, []);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            setImageSrc(src);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => extractColors(img);
            img.src = src;
        };
        reader.readAsDataURL(file);
    }, [extractColors]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="flex flex-col gap-6">
            <canvas ref={canvasRef} className="hidden" />

            {/* Upload area */}
            <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-textMuted'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <Upload size={32} className="mx-auto mb-3 text-textMuted" />
                <p className="text-14 text-textSecondary font-medium">Drop an image here or click to upload</p>
                <p className="text-12 text-textMuted mt-1">Supports JPG, PNG, WebP, SVG</p>
            </div>

            {/* Image preview + palette */}
            {imageSrc && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt="Uploaded" className="w-full max-h-[400px] object-contain rounded-xl border border-border bg-surface" />

                    <div className="flex flex-col gap-3">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Extracted Palette</label>
                        {colors.map((hex, i) => {
                            const rgb = hexToRgb(hex);
                            const hsl = rgb ? rgbToHsl(rgb) : null;
                            const textColor = hsl && hsl.l > 55 ? '#000' : '#fff';
                            return (
                                <button
                                    key={i}
                                    onClick={() => copy(hex, `pal-${i}`)}
                                    className="flex items-center gap-3 rounded-lg border border-border overflow-hidden hover:border-accent transition-colors cursor-pointer"
                                >
                                    <div className="w-16 h-12 shrink-0 flex items-center justify-center" style={{ backgroundColor: hex }}>
                                        {copiedKey === `pal-${i}` && <Check size={16} style={{ color: textColor }} />}
                                    </div>
                                    <div className="flex-1 px-3 py-2 text-left">
                                        <span className="text-14 font-code text-textPrimary block">{hex}</span>
                                        {rgb && <span className="text-11 text-textMuted font-code">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── SEO Tabs ────────────────────────────────────────────────────────────────

function SeoTabs() {
    const [activeTab, setActiveTab] = useState('what-is');

    const tabs = [
        {
            id: 'what-is',
            label: 'About Color Tools',
            content: (
                <div>
                    <h2>Free Online Color Tools Suite</h2>
                    <p>
                        Our Color Tools suite brings together the most essential color utilities developers and designers need into a single page. All processing runs entirely in your browser using pure JavaScript math &mdash; no server calls, no libraries, no data uploaded.
                    </p>
                    <h3>What&apos;s Included</h3>
                    <ul>
                        <li><strong>Color Converter:</strong> Instantly convert between HEX, RGB, HSL, and CMYK formats. Edit any field and all others update in real time.</li>
                        <li><strong>WCAG Contrast Checker:</strong> Test foreground/background color pairs against WCAG 2.1 accessibility standards. See pass/fail results for AA and AAA levels, with color suggestions.</li>
                        <li><strong>Tints & Shades Generator:</strong> Generate a full 11-step scale (50-950) from any base color. Export as CSS custom properties, Tailwind config, or SCSS map.</li>
                        <li><strong>Palette Extractor:</strong> Upload an image and extract its dominant colors using Canvas API pixel sampling.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'formats',
            label: 'Color Formats',
            content: (
                <div>
                    <h2>Understanding Color Formats</h2>
                    <h3>HEX</h3>
                    <p>Hexadecimal color codes like <code>#FF5733</code> represent colors using base-16. Each pair of digits encodes red, green, and blue (0-255 as 00-FF). Shorthand like <code>#F00</code> expands to <code>#FF0000</code>.</p>
                    <h3>RGB</h3>
                    <p><code>rgb(255, 87, 51)</code> uses decimal values 0-255 for each channel. This maps directly to how screens display color by mixing red, green, and blue light.</p>
                    <h3>HSL</h3>
                    <p><code>hsl(14, 100%, 60%)</code> describes color using Hue (0-360\u00B0 on the color wheel), Saturation (0-100%), and Lightness (0-100%). More intuitive for humans than RGB.</p>
                    <h3>CMYK</h3>
                    <p><code>cmyk(0%, 66%, 80%, 0%)</code> is used in print. Cyan, Magenta, Yellow, and Key (black) are subtracted from white. Not natively supported in CSS but essential for print design.</p>
                </div>
            ),
        },
        {
            id: 'wcag',
            label: 'WCAG Guidelines',
            content: (
                <div>
                    <h2>WCAG Contrast Requirements</h2>
                    <p>The Web Content Accessibility Guidelines (WCAG) 2.1 define minimum contrast ratios to ensure text readability for users with visual impairments.</p>
                    <h3>Contrast Levels</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-2 pr-4 text-textPrimary">Level</th>
                                <th className="py-2 pr-4 text-textPrimary">Normal Text</th>
                                <th className="py-2 text-textPrimary">Large Text</th>
                            </tr>
                        </thead>
                        <tbody className="text-textSecondary">
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-bold">AA</td><td className="py-2 pr-4">4.5:1</td><td className="py-2">3:1</td></tr>
                            <tr><td className="py-2 pr-4 font-bold">AAA</td><td className="py-2 pr-4">7:1</td><td className="py-2">4.5:1</td></tr>
                        </tbody>
                    </table>
                    <p className="mt-4"><strong>Large text</strong> is defined as 18pt (24px) or 14pt bold (18.66px bold).</p>
                    <p>The contrast ratio formula uses relative luminance: <code>(L1 + 0.05) / (L2 + 0.05)</code> where L1 is the lighter color.</p>
                </div>
            ),
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions</h2>

                    <h3>How is the tint/shade scale generated?</h3>
                    <p>We convert your base color to HSL, then generate 11 steps by mapping fixed lightness values (97% for step 50 down to 10% for step 950) while preserving the hue and saturation.</p>

                    <h3>How does the palette extractor work?</h3>
                    <p>The image is drawn to a small canvas (max 100px) for performance. We bucket pixels into groups by quantizing RGB values, then select the most frequent buckets while filtering out colors that are too similar (Euclidean distance &lt; 60 in RGB space).</p>

                    <h3>Why don&apos;t my CMYK values match my print software?</h3>
                    <p>Our CMYK conversion uses a simple formula without ICC color profiles. Professional print workflows use device-specific profiles which produce different CMYK values for accurate color reproduction.</p>

                    <h3>Is my data sent to any server?</h3>
                    <p>No. All conversions, contrast calculations, and image analysis run entirely in your browser. Images are processed locally using the Canvas API and are never uploaded.</p>
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
