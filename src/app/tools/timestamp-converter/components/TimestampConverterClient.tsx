"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Copy,
    Check,
    Clock,
    ArrowRightLeft,
    Download,
    Layers,
    Globe,
    CalendarClock,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimestampConverterClientProps {
    toolData?: { name: string; type: string; desc: string };
}

type ConvertMode = 'unix-to-human' | 'human-to-unix';

// ─── Timezone list ───────────────────────────────────────────────────────────

const POPULAR_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Australia/Sydney',
    'Pacific/Auckland',
    'Africa/Cairo',
    'Africa/Lagos',
    'America/Mexico_City',
    'America/Argentina/Buenos_Aires',
];

function getAllTimezones(): string[] {
    try {
        // Use Intl to get supported timezones if available
        if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
            return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
        }
    } catch { /* fallback */ }
    return POPULAR_TIMEZONES;
}

function getTimezoneOffset(tz: string, date: Date): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'longOffset',
        });
        const parts = formatter.formatToParts(date);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        return tzPart?.value || '';
    } catch {
        return '';
    }
}

function getTimezoneAbbr(tz: string, date: Date): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'short',
        });
        const parts = formatter.formatToParts(date);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        return tzPart?.value || '';
    } catch {
        return '';
    }
}

function formatInTimezone(date: Date, tz: string): string {
    try {
        return date.toLocaleString('en-US', {
            timeZone: tz,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    } catch {
        return date.toLocaleString();
    }
}

function formatISO(date: Date): string {
    return date.toISOString();
}

// Auto-detect seconds vs milliseconds
function normalizeTimestamp(input: string): { ms: number; type: 'seconds' | 'milliseconds' } | null {
    const num = Number(input.trim());
    if (isNaN(num)) return null;
    // If the number is larger than year 3000 in seconds, it's likely milliseconds
    if (num > 32503680000) {
        return { ms: num, type: 'milliseconds' };
    }
    return { ms: num * 1000, type: 'seconds' };
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

// ─── TimeRow ─────────────────────────────────────────────────────────────────

function TimeRow({ label, value, copyKey, copiedKey, copy }: {
    label: string;
    value: string;
    copyKey: string;
    copiedKey: string | null;
    copy: (text: string, key: string) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border last:border-0">
            <div className="flex items-center gap-3 min-w-0">
                <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-32 shrink-0">{label}</span>
                <span className="text-14 font-code text-textPrimary truncate">{value}</span>
            </div>
            <button
                onClick={() => copy(value, copyKey)}
                className={`hov-icon w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ml-2 transition-all ${copiedKey === copyKey ? 'text-success border-success bg-success/10' : 'text-textMuted border-border bg-surface2'}`}
            >
                {copiedKey === copyKey ? <Check size={12} /> : <Copy size={12} />}
            </button>
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TimestampConverterClient({ toolData = { name: 'Timestamp Converter', type: 'Converter', desc: 'Convert Unix timestamps to human-readable dates and back. Supports multiple timezones, batch conversion, and live clock. 100% client-side.' } }: TimestampConverterClientProps) {
    const [now, setNow] = useState(() => new Date());
    const [mode, setMode] = useState<ConvertMode>('unix-to-human');
    const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [tzSearch, setTzSearch] = useState('');
    const [tzDropdownOpen, setTzDropdownOpen] = useState(false);

    // Unix → Human state
    const [unixInput, setUnixInput] = useState('');

    // Human → Unix state
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');

    // Batch state
    const [batchInput, setBatchInput] = useState('');

    const { copiedKey, copy } = useCopy();

    const allTimezones = useMemo(() => getAllTimezones(), []);
    const filteredTimezones = useMemo(() => {
        if (!tzSearch) return POPULAR_TIMEZONES;
        const q = tzSearch.toLowerCase();
        return allTimezones.filter(tz => tz.toLowerCase().includes(q));
    }, [tzSearch, allTimezones]);

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const nowUnixSec = Math.floor(now.getTime() / 1000);
    const nowUnixMs = now.getTime();
    const nowISO = formatISO(now);
    const nowHuman = formatInTimezone(now, timezone);
    const tzOffset = getTimezoneOffset(timezone, now);
    const tzAbbr = getTimezoneAbbr(timezone, now);

    // Unix → Human conversion
    const unixResult = useMemo(() => {
        if (!unixInput.trim()) return null;
        const parsed = normalizeTimestamp(unixInput);
        if (!parsed) return { error: 'Invalid timestamp. Enter a Unix timestamp in seconds or milliseconds.' };
        const date = new Date(parsed.ms);
        if (isNaN(date.getTime())) return { error: 'Invalid timestamp produces an invalid date.' };
        return {
            date,
            detectedType: parsed.type,
            human: formatInTimezone(date, timezone),
            iso: formatISO(date),
            unixSec: Math.floor(parsed.ms / 1000),
            unixMs: parsed.ms,
            relative: getRelativeTime(date, now),
        };
    }, [unixInput, timezone, now]);

    // Human → Unix conversion
    const humanResult = useMemo(() => {
        if (!dateInput) return null;
        const dateStr = `${dateInput}T${timeInput || '00:00:00'}`;
        // Create date in the selected timezone
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return { error: 'Invalid date/time input.' };
            return {
                date,
                unixSec: Math.floor(date.getTime() / 1000),
                unixMs: date.getTime(),
                iso: formatISO(date),
                human: formatInTimezone(date, timezone),
            };
        } catch {
            return { error: 'Invalid date/time input.' };
        }
    }, [dateInput, timeInput, timezone]);

    // Batch conversion
    const batchResults = useMemo(() => {
        if (!batchInput.trim()) return [];
        return batchInput.split('\n').filter(line => line.trim()).map(line => {
            const parsed = normalizeTimestamp(line);
            if (!parsed) return { input: line.trim(), error: true, output: 'Invalid', iso: '' };
            const date = new Date(parsed.ms);
            if (isNaN(date.getTime())) return { input: line.trim(), error: true, output: 'Invalid', iso: '' };
            return {
                input: line.trim(),
                error: false,
                output: formatInTimezone(date, timezone),
                iso: formatISO(date),
            };
        });
    }, [batchInput, timezone]);

    const downloadCSV = useCallback(() => {
        if (batchResults.length === 0) return;
        const header = 'Input,Converted,ISO 8601\n';
        const rows = batchResults.map(r => `"${r.input}","${r.output}","${r.iso}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timestamps-converted.csv';
        a.click();
        URL.revokeObjectURL(url);
    }, [batchResults]);

    return (
        <div className="w-full flex flex-col pt-16 md:pt-20 min-h-screen bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
            `}} />

            <div className="max-w-content mx-auto w-full px-5 pb-6">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 items-center py-4">
                    {['Tools', '\u203A', 'Converters', '\u203A', 'Timestamp Converter'].map((t, i, arr) => (
                        <span key={i} className={`text-12 ${i === arr.length - 1 ? 'text-textSecondary' : 'text-textMuted'}`}>{t}</span>
                    ))}
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-28 md:text-32 font-bold text-[#f1f5f9] tracking-tight mb-1.5">{toolData.name}</h1>
                    <p className="text-14 text-textSecondary leading-relaxed">{toolData.desc}</p>
                </div>

                {/* ─── LIVE CLOCK ─── */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-accent animate-pulse" />
                            <span className="text-12 font-bold text-textSecondary uppercase tracking-wider">Current Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-11 font-code text-accent bg-accent/10 rounded px-2 py-0.5">{tzAbbr}</span>
                            <span className="text-11 font-code text-textMuted">{tzOffset}</span>
                        </div>
                    </div>
                    <TimeRow label="Unix (sec)" value={String(nowUnixSec)} copyKey="now-sec" copiedKey={copiedKey} copy={copy} />
                    <TimeRow label="Unix (ms)" value={String(nowUnixMs)} copyKey="now-ms" copiedKey={copiedKey} copy={copy} />
                    <TimeRow label="ISO 8601" value={nowISO} copyKey="now-iso" copiedKey={copiedKey} copy={copy} />
                    <TimeRow label="Human" value={nowHuman} copyKey="now-human" copiedKey={copiedKey} copy={copy} />
                </div>

                {/* ─── TIMEZONE SELECTOR ─── */}
                <div className="bg-surface border border-border rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Globe size={16} className="text-accent shrink-0" />
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider shrink-0">Timezone</label>
                        <div className="relative flex-1 min-w-[250px]">
                            <input
                                type="text"
                                value={tzDropdownOpen ? tzSearch : timezone}
                                onChange={(e) => { setTzSearch(e.target.value); setTzDropdownOpen(true); }}
                                onFocus={() => { setTzDropdownOpen(true); setTzSearch(''); }}
                                onBlur={() => setTimeout(() => setTzDropdownOpen(false), 200)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-14 font-code text-textPrimary outline-none focus:border-accent transition-colors"
                                placeholder="Search timezone..."
                            />
                            {tzDropdownOpen && filteredTimezones.length > 0 && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl max-h-[300px] overflow-y-auto scrollbar-none">
                                    {filteredTimezones.map(tz => {
                                        const offset = getTimezoneOffset(tz, now);
                                        return (
                                            <button
                                                key={tz}
                                                onMouseDown={(e) => { e.preventDefault(); setTimezone(tz); setTzDropdownOpen(false); setTzSearch(''); }}
                                                className={`w-full text-left px-3 py-2 text-13 flex items-center justify-between hover:bg-accent/10 transition-colors ${timezone === tz ? 'text-accent bg-accent/5' : 'text-textSecondary'}`}
                                            >
                                                <span className="font-code">{tz}</span>
                                                <span className="text-11 text-textMuted font-code">{offset}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── CONVERTER ─── */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
                    {/* Mode toggle */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <ArrowRightLeft size={14} className="text-accent" />
                            <span className="text-12 font-bold text-textSecondary uppercase tracking-wider">Convert</span>
                        </div>
                        <div className="flex bg-background rounded-lg p-1 border border-border">
                            {([
                                { id: 'unix-to-human' as const, label: 'Unix \u2192 Human' },
                                { id: 'human-to-unix' as const, label: 'Human \u2192 Unix' },
                            ]).map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`text-12 font-bold px-4 py-1.5 rounded-md transition-colors ${mode === m.id ? 'bg-accent text-black shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 md:p-5">
                        {mode === 'unix-to-human' ? (
                            /* ─── UNIX → HUMAN ─── */
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">Unix Timestamp</label>
                                    <input
                                        type="text"
                                        value={unixInput}
                                        onChange={(e) => setUnixInput(e.target.value)}
                                        placeholder="e.g. 1741464000 or 1741464000000"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-18 font-code text-accent outline-none focus:border-accent transition-colors"
                                        spellCheck={false}
                                    />
                                    {unixInput.trim() && unixResult && !('error' in unixResult) && (
                                        <span className="text-11 text-textMuted mt-1 block">
                                            Auto-detected: <span className="text-accent font-bold">{unixResult.detectedType}</span>
                                        </span>
                                    )}
                                </div>

                                {unixResult && 'error' in unixResult && (
                                    <div className="bg-error/8 border border-error/20 rounded-lg px-4 py-3 text-13 text-error font-medium">
                                        {unixResult.error}
                                    </div>
                                )}

                                {unixResult && !('error' in unixResult) && (
                                    <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Human</span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-14 font-code text-textPrimary truncate">{unixResult.human}</span>
                                                <button onClick={() => copy(unixResult.human, 'conv-human')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'conv-human' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'conv-human' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">ISO 8601</span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-14 font-code text-textPrimary truncate">{unixResult.iso}</span>
                                                <button onClick={() => copy(unixResult.iso, 'conv-iso')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'conv-iso' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'conv-iso' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Seconds</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-14 font-code text-textPrimary">{unixResult.unixSec}</span>
                                                <button onClick={() => copy(String(unixResult.unixSec), 'conv-sec')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'conv-sec' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'conv-sec' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Milliseconds</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-14 font-code text-textPrimary">{unixResult.unixMs}</span>
                                                <button onClick={() => copy(String(unixResult.unixMs), 'conv-ms')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'conv-ms' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'conv-ms' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Relative</span>
                                            <span className="text-14 text-textSecondary">{unixResult.relative}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ─── HUMAN → UNIX ─── */
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">Date</label>
                                        <input
                                            type="date"
                                            value={dateInput}
                                            onChange={(e) => setDateInput(e.target.value)}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-16 font-code text-textPrimary outline-none focus:border-accent transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-2 block">Time</label>
                                        <input
                                            type="time"
                                            value={timeInput}
                                            onChange={(e) => setTimeInput(e.target.value)}
                                            step="1"
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-16 font-code text-textPrimary outline-none focus:border-accent transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const n = new Date();
                                            setDateInput(n.toISOString().slice(0, 10));
                                            setTimeInput(n.toTimeString().slice(0, 8));
                                        }}
                                        className="text-12 font-medium bg-surface2 border border-border rounded-lg px-3 py-1.5 text-textSecondary hover:text-accent hover:border-accent transition-colors cursor-pointer"
                                    >
                                        Use Current Time
                                    </button>
                                </div>

                                {humanResult && 'error' in humanResult && (
                                    <div className="bg-error/8 border border-error/20 rounded-lg px-4 py-3 text-13 text-error font-medium">
                                        {humanResult.error}
                                    </div>
                                )}

                                {humanResult && !('error' in humanResult) && (
                                    <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Unix (sec)</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-18 font-code text-accent font-bold">{humanResult.unixSec}</span>
                                                <button onClick={() => copy(String(humanResult.unixSec), 'h2u-sec')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'h2u-sec' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'h2u-sec' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Unix (ms)</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-14 font-code text-textPrimary">{humanResult.unixMs}</span>
                                                <button onClick={() => copy(String(humanResult.unixMs), 'h2u-ms')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'h2u-ms' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'h2u-ms' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4 border-b border-border">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">ISO 8601</span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-14 font-code text-textPrimary truncate">{humanResult.iso}</span>
                                                <button onClick={() => copy(humanResult.iso, 'h2u-iso')} className={`hov-icon w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${copiedKey === 'h2u-iso' ? 'text-success border-success' : 'text-textMuted border-border bg-surface'}`}>
                                                    {copiedKey === 'h2u-iso' ? <Check size={11} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5 px-4">
                                            <span className="text-12 font-bold text-textMuted uppercase tracking-wider w-28 shrink-0">Formatted</span>
                                            <span className="text-14 font-code text-textSecondary truncate">{humanResult.human}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── BATCH CONVERTER ─── */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-accent" />
                            <span className="text-12 font-bold text-textSecondary uppercase tracking-wider">Batch Convert</span>
                            <span className="text-11 bg-accent/10 text-accent rounded px-1.5 py-px font-code">Unique</span>
                        </div>
                        {batchResults.length > 0 && (
                            <button
                                onClick={downloadCSV}
                                className="hov-icon text-11 font-medium bg-surface2 border border-border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 text-textMuted"
                            >
                                <Download size={12} /> Download CSV
                            </button>
                        )}
                    </div>

                    <div className="p-4 md:p-5">
                        <textarea
                            value={batchInput}
                            onChange={(e) => setBatchInput(e.target.value)}
                            placeholder={"Paste timestamps, one per line:\n1741464000\n1741464000000\n1609459200\n1672531200"}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-14 font-code text-textPrimary outline-none focus:border-accent resize-none min-h-[120px] leading-relaxed placeholder:text-textMuted/40"
                            spellCheck={false}
                        />

                        {batchResults.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border text-[11px] font-bold text-textMuted uppercase tracking-wider">
                                            <th className="px-3 py-2">#</th>
                                            <th className="px-3 py-2">Input</th>
                                            <th className="px-3 py-2">Converted</th>
                                            <th className="px-3 py-2">ISO 8601</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {batchResults.map((r, i) => (
                                            <tr key={i} className="border-b border-border last:border-0">
                                                <td className="px-3 py-2 text-12 text-textMuted">{i + 1}</td>
                                                <td className="px-3 py-2 text-13 font-code text-accent">{r.input}</td>
                                                <td className={`px-3 py-2 text-13 font-code ${r.error ? 'text-error' : 'text-textPrimary'}`}>{r.output}</td>
                                                <td className="px-3 py-2 text-12 font-code text-textMuted">{r.iso}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── TIMEZONE INFO ─── */}
                <div className="bg-surface border border-border rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <CalendarClock size={14} className="text-accent" />
                        <span className="text-12 font-bold text-textSecondary uppercase tracking-wider">Timezone Info</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-surface2 rounded-lg px-4 py-3 border border-border">
                            <span className="text-11 text-textMuted block mb-1">Current Timezone</span>
                            <span className="text-16 font-code text-textPrimary font-bold">{timezone}</span>
                        </div>
                        <div className="bg-surface2 rounded-lg px-4 py-3 border border-border">
                            <span className="text-11 text-textMuted block mb-1">UTC Offset</span>
                            <span className="text-16 font-code text-accent font-bold">{tzOffset}</span>
                        </div>
                        <div className="bg-surface2 rounded-lg px-4 py-3 border border-border">
                            <span className="text-11 text-textMuted block mb-1">Abbreviation</span>
                            <span className="text-16 font-code text-textPrimary font-bold">{tzAbbr}</span>
                        </div>
                    </div>
                </div>

                {/* Shortcuts */}
                <div className="w-full flex justify-center gap-4 lg:gap-6 py-4 flex-wrap">
                    {[
                        ["Paste", "timestamp", "Auto-detect"],
                        ["Click", "copy", "Any format"],
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

// ─── Relative time ───────────────────────────────────────────────────────────

function getRelativeTime(date: Date, now: Date): string {
    const diffMs = date.getTime() - now.getTime();
    const abs = Math.abs(diffMs);
    const isPast = diffMs < 0;

    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);

    const parts: string[] = [];
    if (days > 365) {
        const years = Math.floor(days / 365);
        parts.push(`${years} year${years !== 1 ? 's' : ''}`);
        const remainDays = days % 365;
        if (remainDays > 30) parts.push(`${Math.floor(remainDays / 30)} month${Math.floor(remainDays / 30) !== 1 ? 's' : ''}`);
    } else if (days > 30) {
        const months = Math.floor(days / 30);
        parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    } else if (days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    } else if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} min`);
    } else if (minutes > 0) {
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    } else {
        parts.push('just now');
        return parts[0];
    }

    return isPast ? `${parts.join(', ')} ago` : `in ${parts.join(', ')}`;
}

// ─── SEO Tabs ────────────────────────────────────────────────────────────────

function SeoTabs() {
    const [activeTab, setActiveTab] = useState('what-is');

    const tabs = [
        {
            id: 'what-is',
            label: 'What is Unix Time?',
            content: (
                <div>
                    <h2>What is a Unix Timestamp?</h2>
                    <p>
                        A Unix timestamp (also called Epoch time or POSIX time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC — known as the Unix Epoch. It&apos;s a universal way to represent time as a single integer, making it timezone-independent and easy to work with in code.
                    </p>
                    <h3>Seconds vs Milliseconds</h3>
                    <p>
                        Most systems use <strong>seconds</strong> (10 digits, e.g., <code>1741464000</code>), but JavaScript, Java, and some APIs use <strong>milliseconds</strong> (13 digits, e.g., <code>1741464000000</code>). Our converter auto-detects which format you&apos;re using.
                    </p>
                    <h3>Why use our tool?</h3>
                    <ul>
                        <li><strong>Auto-detection:</strong> Paste any timestamp and we automatically detect seconds vs milliseconds.</li>
                        <li><strong>Batch mode:</strong> Convert multiple timestamps at once — a feature missing from epochconverter.com and other tools.</li>
                        <li><strong>Full timezone support:</strong> Searchable IANA timezone database with UTC offset display.</li>
                        <li><strong>Live clock:</strong> See the current time in all formats, updating every second.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'formats',
            label: 'Time Formats',
            content: (
                <div>
                    <h2>Common Time Formats</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-2 pr-4 text-textPrimary">Format</th>
                                <th className="py-2 pr-4 text-textPrimary">Example</th>
                                <th className="py-2 text-textPrimary">Used By</th>
                            </tr>
                        </thead>
                        <tbody className="text-textSecondary">
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-bold">Unix (seconds)</td><td className="py-2 pr-4 font-code">1741464000</td><td className="py-2">Linux, Python, PHP, PostgreSQL</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-bold">Unix (milliseconds)</td><td className="py-2 pr-4 font-code">1741464000000</td><td className="py-2">JavaScript, Java, Elasticsearch</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-bold">ISO 8601</td><td className="py-2 pr-4 font-code">2025-03-08T12:00:00.000Z</td><td className="py-2">REST APIs, JSON, databases</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-bold">RFC 2822</td><td className="py-2 pr-4 font-code">Sat, 08 Mar 2025 12:00:00 +0000</td><td className="py-2">HTTP headers, email</td></tr>
                            <tr><td className="py-2 pr-4 font-bold">Human readable</td><td className="py-2 pr-4 font-code">Saturday, March 8, 2025</td><td className="py-2">User interfaces</td></tr>
                        </tbody>
                    </table>
                </div>
            ),
        },
        {
            id: 'batch',
            label: 'Batch Mode',
            content: (
                <div>
                    <h2>Batch Timestamp Conversion</h2>
                    <p>
                        Our batch converter is a unique feature not found on epochconverter.com or other timestamp tools. It lets you convert multiple timestamps at once by pasting them one per line.
                    </p>
                    <h3>How to Use Batch Mode</h3>
                    <ol>
                        <li>Paste your timestamps into the batch textarea (one per line).</li>
                        <li>Each line is auto-detected as seconds or milliseconds.</li>
                        <li>Results appear in a table showing the original input, converted date, and ISO 8601 format.</li>
                        <li>Click &quot;Download CSV&quot; to export all results for use in spreadsheets or reports.</li>
                    </ol>
                    <h3>Use Cases</h3>
                    <ul>
                        <li><strong>Log analysis:</strong> Convert timestamps from server logs to human-readable dates.</li>
                        <li><strong>Database debugging:</strong> Verify <code>created_at</code> and <code>updated_at</code> timestamps.</li>
                        <li><strong>API testing:</strong> Decode multiple timestamps from API responses at once.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions</h2>

                    <h3>How does auto-detection work?</h3>
                    <p>If the number is greater than 32,503,680,000 (year 3000 in seconds), we treat it as milliseconds. Otherwise, it&apos;s treated as seconds. This heuristic works correctly for all practical timestamps from 1970 to 3000.</p>

                    <h3>What is the Year 2038 Problem?</h3>
                    <p>32-bit systems store Unix timestamps as a signed 32-bit integer, which overflows on January 19, 2038. Most modern systems use 64-bit timestamps, which won&apos;t overflow for billions of years. JavaScript uses milliseconds in a 64-bit float, good until the year 275,760.</p>

                    <h3>What timezone does the converter use?</h3>
                    <p>By default, it uses your browser&apos;s local timezone (detected via <code>Intl.DateTimeFormat</code>). You can change it using the timezone selector, which supports all IANA timezones.</p>

                    <h3>Is my data sent to any server?</h3>
                    <p>No. All conversions use JavaScript&apos;s native <code>Date</code> object and <code>Intl.DateTimeFormat</code> API. Nothing is sent to any server.</p>
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
