"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';
import {
    Clock,
    Calendar,
    CalendarDays,
    CalendarRange,
    Timer,
    Copy,
    Check,
    ChevronRight,
    Play,
    Zap,
    RotateCcw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type CronDialect = 'unix' | 'aws' | 'kubernetes' | 'github';
type FieldMode = 'every' | 'specific' | 'range' | 'step';
type CronMode = 'builder' | 'parser';

interface FieldState {
    mode: FieldMode;
    specific: number[];
    rangeStart: number;
    rangeEnd: number;
    step: number;
}

interface CronBuilderClientProps {
    toolData?: {
        name: string;
        type: string;
        desc: string;
    };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FIELD_DEFS = [
    { key: 'minute', label: 'Minute', icon: Timer, min: 0, max: 59 },
    { key: 'hour', label: 'Hour', icon: Clock, min: 0, max: 23 },
    { key: 'dayOfMonth', label: 'Day of Month', icon: Calendar, min: 1, max: 31 },
    { key: 'month', label: 'Month', icon: CalendarRange, min: 1, max: 12 },
    { key: 'dayOfWeek', label: 'Day of Week', icon: CalendarDays, min: 0, max: 6 },
] as const;

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DIALECT_INFO: Record<CronDialect, { label: string; fields: number; note: string }> = {
    unix: { label: 'Unix / Linux', fields: 5, note: 'Standard 5-field cron: min hour dom month dow' },
    aws: { label: 'AWS EventBridge', fields: 6, note: 'Uses 6 fields with year. Uses ? for day conflicts' },
    kubernetes: { label: 'Kubernetes', fields: 5, note: 'Standard 5-field format used in CronJob spec' },
    github: { label: 'GitHub Actions', fields: 5, note: 'Standard 5-field POSIX cron for schedule triggers' },
};

interface Preset {
    label: string;
    expr: string;
    category: string;
}

const PRESETS: Preset[] = [
    { label: 'Every minute', expr: '* * * * *', category: 'Frequent' },
    { label: 'Every 5 minutes', expr: '*/5 * * * *', category: 'Frequent' },
    { label: 'Every 15 minutes', expr: '*/15 * * * *', category: 'Frequent' },
    { label: 'Every 30 minutes', expr: '*/30 * * * *', category: 'Frequent' },
    { label: 'Every hour', expr: '0 * * * *', category: 'Frequent' },
    { label: 'Every day at midnight', expr: '0 0 * * *', category: 'Daily' },
    { label: 'Every day at noon', expr: '0 12 * * *', category: 'Daily' },
    { label: 'Every day at 9 AM', expr: '0 9 * * *', category: 'Daily' },
    { label: 'Every weekday at 9 AM', expr: '0 9 * * 1-5', category: 'Business' },
    { label: 'Every Sunday at noon', expr: '0 12 * * 0', category: 'Weekly' },
    { label: 'Every Monday at 8 AM', expr: '0 8 * * 1', category: 'Weekly' },
    { label: 'First day of month', expr: '0 0 1 * *', category: 'Monthly' },
    { label: '15th of every month', expr: '0 0 15 * *', category: 'Monthly' },
    { label: 'Every quarter (Jan,Apr,Jul,Oct)', expr: '0 0 1 1,4,7,10 *', category: 'Monthly' },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

function createDefaultField(): FieldState {
    return { mode: 'every', specific: [], rangeStart: 0, rangeEnd: 0, step: 1 };
}

function fieldToExpression(field: FieldState, min: number, max: number): string {
    switch (field.mode) {
        case 'every':
            return '*';
        case 'specific':
            return field.specific.length > 0 ? field.specific.sort((a, b) => a - b).join(',') : '*';
        case 'range': {
            const s = Math.max(min, Math.min(max, field.rangeStart));
            const e = Math.max(min, Math.min(max, field.rangeEnd));
            return `${s}-${e}`;
        }
        case 'step':
            return field.step > 0 ? `*/${field.step}` : '*';
        default:
            return '*';
    }
}

function parseFieldFromExpression(expr: string, min: number, max: number): FieldState {
    const f = createDefaultField();
    f.rangeStart = min;
    f.rangeEnd = max;
    f.step = 1;

    if (expr === '*') {
        f.mode = 'every';
    } else if (expr.startsWith('*/')) {
        f.mode = 'step';
        f.step = parseInt(expr.slice(2)) || 1;
    } else if (expr.includes('-') && !expr.includes(',')) {
        f.mode = 'range';
        const [s, e] = expr.split('-').map(Number);
        f.rangeStart = isNaN(s) ? min : s;
        f.rangeEnd = isNaN(e) ? max : e;
    } else if (expr.includes(',') || /^\d+$/.test(expr)) {
        f.mode = 'specific';
        f.specific = expr.split(',').map(Number).filter(n => !isNaN(n));
    } else {
        f.mode = 'every';
    }

    return f;
}

function getHumanReadable(expression: string): string {
    try {
        return cronstrue.toString(expression, { use24HourTimeFormat: false });
    } catch {
        return 'Invalid cron expression';
    }
}

function getNextRuns(expression: string, count: number = 10): Date[] {
    try {
        const interval = CronExpressionParser.parse(expression);
        const dates: Date[] = [];
        for (let i = 0; i < count; i++) {
            dates.push(interval.next().toDate());
        }
        return dates;
    } catch {
        return [];
    }
}

function formatRelativeTime(date: Date, now: Date): string {
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'in less than a minute';
    if (diffMins < 60) return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMins % 60} min`;
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours % 24} hr`;
}

function formatExpressionForDialect(parts: string[], dialect: CronDialect): string {
    const base = parts.join(' ');
    if (dialect === 'aws') {
        // AWS: min hour dom month dow year — add year, replace conflicting day fields with ?
        const p = [...parts];
        if (p[2] !== '*' && p[4] !== '*') {
            p[4] = '?';
        } else if (p[4] !== '*') {
            p[2] = '?';
        }
        return p.join(' ') + ' *';
    }
    return base;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CronBuilderClient({ toolData = { name: 'Cron Builder', type: 'Builder', desc: 'Build and validate cron expressions visually. Supports Unix, AWS EventBridge, Kubernetes, and GitHub Actions. Shows next 10 run times. 100% client-side.' } }: CronBuilderClientProps) {
    const [mode, setMode] = useState<CronMode>('builder');
    const [dialect, setDialect] = useState<CronDialect>('unix');
    const [isCopied, setIsCopied] = useState(false);

    // Builder state
    const [fields, setFields] = useState<Record<string, FieldState>>({
        minute: { ...createDefaultField(), rangeStart: 0, rangeEnd: 59 },
        hour: { ...createDefaultField(), rangeStart: 0, rangeEnd: 23 },
        dayOfMonth: { ...createDefaultField(), rangeStart: 1, rangeEnd: 31 },
        month: { ...createDefaultField(), rangeStart: 1, rangeEnd: 12 },
        dayOfWeek: { ...createDefaultField(), rangeStart: 0, rangeEnd: 6 },
    });

    // Parser state
    const [parserInput, setParserInput] = useState('*/5 * * * *');

    // Derive expression from builder
    const builderExpression = useMemo(() => {
        const parts = FIELD_DEFS.map(def => fieldToExpression(fields[def.key], def.min, def.max));
        return parts.join(' ');
    }, [fields]);

    const activeExpression = mode === 'builder' ? builderExpression : parserInput.trim();
    const dialectExpression = useMemo(() => {
        const parts = activeExpression.split(/\s+/);
        if (parts.length !== 5) return activeExpression;
        return formatExpressionForDialect(parts, dialect);
    }, [activeExpression, dialect]);

    const humanReadable = useMemo(() => getHumanReadable(activeExpression), [activeExpression]);

    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const nextRuns = useMemo(() => getNextRuns(activeExpression, 10), [activeExpression]);

    const updateField = useCallback((key: string, updates: Partial<FieldState>) => {
        setFields(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates },
        }));
    }, []);

    const toggleSpecificValue = useCallback((key: string, value: number) => {
        setFields(prev => {
            const current = prev[key].specific;
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return {
                ...prev,
                [key]: { ...prev[key], specific: next, mode: 'specific' },
            };
        });
    }, []);

    const applyPreset = useCallback((expr: string) => {
        const parts = expr.split(/\s+/);
        if (parts.length !== 5) return;
        const newFields: Record<string, FieldState> = {};
        FIELD_DEFS.forEach((def, i) => {
            newFields[def.key] = parseFieldFromExpression(parts[i], def.min, def.max);
        });
        setFields(newFields);
        setParserInput(expr);
    }, []);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(dialectExpression);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [dialectExpression]);

    const handleReset = useCallback(() => {
        setFields({
            minute: { ...createDefaultField(), rangeStart: 0, rangeEnd: 59 },
            hour: { ...createDefaultField(), rangeStart: 0, rangeEnd: 23 },
            dayOfMonth: { ...createDefaultField(), rangeStart: 1, rangeEnd: 31 },
            month: { ...createDefaultField(), rangeStart: 1, rangeEnd: 12 },
            dayOfWeek: { ...createDefaultField(), rangeStart: 0, rangeEnd: 6 },
        });
    }, []);

    // Render value labels for specific fields
    const getValueLabel = (fieldKey: string, value: number): string => {
        if (fieldKey === 'month') return MONTH_NAMES[value] || String(value);
        if (fieldKey === 'dayOfWeek') return DOW_NAMES[value] || String(value);
        return String(value);
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="w-full flex flex-col pt-16 md:pt-20 min-h-screen bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
                .cron-field-btn { transition: all 0.15s; }
                .cron-field-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
                .cron-chip { transition: all 0.1s; }
                .cron-chip:hover { border-color: var(--color-accent); }
                .preset-btn:hover { background: #0c1a2e !important; border-color: var(--color-accent) !important; color: var(--color-accent) !important; }
            `}} />

            <div className="max-w-content mx-auto w-full px-5 pb-6">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 items-center py-4">
                    {['Tools', '\u203A', 'Builders', '\u203A', 'Cron Builder'].map((t, i, arr) => (
                        <span key={i} className={`text-12 ${i === arr.length - 1 ? 'text-textSecondary' : 'text-textMuted'}`}>{t}</span>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                    <div>
                        <h1 className="text-28 md:text-32 font-bold text-[#f1f5f9] tracking-tight mb-1.5">
                            {toolData.name}
                        </h1>
                        <p className="text-14 text-textSecondary leading-relaxed">{toolData.desc}</p>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex bg-surface rounded-lg p-1 border border-border">
                        {([['builder', 'Visual Builder'], ['parser', 'Expression Parser']] as const).map(([m, label]) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`text-13 font-bold px-4 py-2 rounded-md transition-colors ${mode === m ? 'bg-accent text-black shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── EXPRESSION DISPLAY BAR ─── */}
                <div className="bg-surface border border-border rounded-xl p-4 md:p-5 mb-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-accent" />
                            <span className="text-12 font-bold text-textSecondary uppercase tracking-wider">Expression</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 ${isCopied ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}
                            >
                                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                {isCopied ? 'Copied' : 'Copy'}
                            </button>
                            {mode === 'builder' && (
                                <button onClick={handleReset} className="hov-icon text-11 font-medium bg-surface2 border border-border rounded-md px-2.5 py-1 cursor-pointer transition-all flex items-center gap-1.5 text-textMuted">
                                    <RotateCcw size={12} /> Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* The expression itself */}
                    {mode === 'parser' ? (
                        <input
                            type="text"
                            value={parserInput}
                            onChange={(e) => setParserInput(e.target.value)}
                            placeholder="Enter cron expression (e.g. */5 * * * *)"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-24 md:text-28 font-code text-accent outline-none focus:border-accent transition-colors tracking-wider"
                            spellCheck={false}
                        />
                    ) : (
                        <div className="bg-background border border-border rounded-lg px-4 py-3">
                            <code className="text-24 md:text-28 font-code text-accent tracking-wider">
                                {dialectExpression}
                            </code>
                        </div>
                    )}

                    {/* Human readable */}
                    <div className="mt-3 flex items-start gap-2">
                        <Play size={14} className="text-success mt-0.5 shrink-0" />
                        <p className="text-14 text-textPrimary font-medium">{humanReadable}</p>
                    </div>

                    {/* Dialect note */}
                    <p className="text-11 text-textMuted mt-2">{DIALECT_INFO[dialect].note}</p>
                </div>

                {/* ─── MAIN CONTENT GRID ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

                    {/* LEFT: Builder or Parser */}
                    <div className="flex flex-col gap-4">

                        {/* Dialect Selector */}
                        <div className="bg-surface border border-border rounded-xl p-4">
                            <label className="text-12 font-bold text-textSecondary uppercase tracking-wider mb-3 block">Dialect</label>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(DIALECT_INFO) as CronDialect[]).map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDialect(d)}
                                        className={`text-13 font-medium px-4 py-2 rounded-lg border transition-colors ${dialect === d ? 'bg-accent/10 border-accent text-accent' : 'bg-surface2 border-border text-textSecondary hover:text-textPrimary hover:border-textMuted'}`}
                                    >
                                        {DIALECT_INFO[d].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {mode === 'builder' ? (
                            /* ─── VISUAL BUILDER ─── */
                            <div className="flex flex-col gap-3">
                                {FIELD_DEFS.map((def) => {
                                    const field = fields[def.key];
                                    const Icon = def.icon;
                                    return (
                                        <div key={def.key} className="bg-surface border border-border rounded-xl p-4">
                                            {/* Field Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={16} className="text-accent" />
                                                    <span className="text-14 font-bold text-textPrimary">{def.label}</span>
                                                    <span className="text-11 text-textMuted font-code">({def.min}-{def.max})</span>
                                                </div>
                                                <span className="text-12 font-code text-accent bg-accent/10 px-2 py-0.5 rounded">
                                                    {fieldToExpression(field, def.min, def.max)}
                                                </span>
                                            </div>

                                            {/* Mode Selector */}
                                            <div className="flex gap-1.5 mb-3">
                                                {(['every', 'specific', 'range', 'step'] as FieldMode[]).map((m) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => updateField(def.key, { mode: m })}
                                                        className={`cron-field-btn text-12 font-medium px-3 py-1.5 rounded-md border transition-colors ${field.mode === m ? 'bg-accent/10 border-accent text-accent' : 'bg-surface2 border-border text-textSecondary'}`}
                                                    >
                                                        {m === 'every' ? 'Every' : m === 'specific' ? 'Specific' : m === 'range' ? 'Range' : 'Step'}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Mode-specific UI */}
                                            {field.mode === 'every' && (
                                                <p className="text-13 text-textMuted">Every {def.label.toLowerCase()} (*)</p>
                                            )}

                                            {field.mode === 'specific' && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.from({ length: def.max - def.min + 1 }, (_, i) => def.min + i).map((val) => (
                                                        <button
                                                            key={val}
                                                            onClick={() => toggleSpecificValue(def.key, val)}
                                                            className={`cron-chip text-12 font-code w-10 h-8 rounded-md border flex items-center justify-center cursor-pointer ${field.specific.includes(val)
                                                                ? 'bg-accent/15 border-accent text-accent font-bold'
                                                                : 'bg-surface2 border-border text-textSecondary hover:text-textPrimary'
                                                                }`}
                                                        >
                                                            {getValueLabel(def.key, val)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {field.mode === 'range' && (
                                                <div className="flex items-center gap-3">
                                                    <label className="text-13 text-textSecondary">From</label>
                                                    <input
                                                        type="number"
                                                        min={def.min}
                                                        max={def.max}
                                                        value={field.rangeStart}
                                                        onChange={(e) => updateField(def.key, { rangeStart: parseInt(e.target.value) || def.min })}
                                                        className="bg-background border border-border rounded-lg px-3 py-1.5 w-20 text-14 text-textPrimary font-code outline-none focus:border-accent"
                                                    />
                                                    <label className="text-13 text-textSecondary">to</label>
                                                    <input
                                                        type="number"
                                                        min={def.min}
                                                        max={def.max}
                                                        value={field.rangeEnd}
                                                        onChange={(e) => updateField(def.key, { rangeEnd: parseInt(e.target.value) || def.max })}
                                                        className="bg-background border border-border rounded-lg px-3 py-1.5 w-20 text-14 text-textPrimary font-code outline-none focus:border-accent"
                                                    />
                                                </div>
                                            )}

                                            {field.mode === 'step' && (
                                                <div className="flex items-center gap-3">
                                                    <label className="text-13 text-textSecondary">Every</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={def.max}
                                                        value={field.step}
                                                        onChange={(e) => updateField(def.key, { step: parseInt(e.target.value) || 1 })}
                                                        className="bg-background border border-border rounded-lg px-3 py-1.5 w-20 text-14 text-textPrimary font-code outline-none focus:border-accent"
                                                    />
                                                    <label className="text-13 text-textSecondary">{def.label.toLowerCase()}(s)</label>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* ─── PARSER MODE ─── */
                            <div className="bg-surface border border-border rounded-xl p-5">
                                <h3 className="text-16 font-bold text-textPrimary mb-4">Expression Breakdown</h3>
                                <div className="flex flex-col gap-3">
                                    {activeExpression.split(/\s+/).slice(0, 5).map((part, i) => {
                                        const def = FIELD_DEFS[i];
                                        if (!def) return null;
                                        const Icon = def.icon;
                                        const fieldState = parseFieldFromExpression(part, def.min, def.max);
                                        let description = '';
                                        switch (fieldState.mode) {
                                            case 'every': description = `Every ${def.label.toLowerCase()}`; break;
                                            case 'step': description = `Every ${fieldState.step} ${def.label.toLowerCase()}(s)`; break;
                                            case 'range': description = `${def.label} ${fieldState.rangeStart} through ${fieldState.rangeEnd}`; break;
                                            case 'specific': description = `At ${def.label.toLowerCase()} ${fieldState.specific.map(v => getValueLabel(def.key, v)).join(', ')}`; break;
                                        }
                                        return (
                                            <div key={def.key} className="flex items-center gap-3 py-2 px-3 bg-surface2 rounded-lg border border-border">
                                                <Icon size={16} className="text-accent shrink-0" />
                                                <span className="text-14 font-bold text-textPrimary w-28 shrink-0">{def.label}</span>
                                                <code className="text-14 text-accent font-code bg-accent/10 px-2 py-0.5 rounded">{part}</code>
                                                <ChevronRight size={14} className="text-textMuted shrink-0" />
                                                <span className="text-13 text-textSecondary">{description}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── NEXT 10 RUN TIMES ─── */}
                        <div className="bg-surface border border-border rounded-xl p-4 md:p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-accent" />
                                <span className="text-14 font-bold text-textPrimary">Next 10 Scheduled Runs</span>
                            </div>
                            {nextRuns.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {nextRuns.map((date, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface2 border border-border">
                                            <div className="flex items-center gap-2">
                                                <span className="text-11 font-bold text-textMuted w-5 text-right">{i + 1}.</span>
                                                <span className="text-13 text-textPrimary font-code">
                                                    {date.toLocaleString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </div>
                                            <span className="text-11 text-textSecondary">{formatRelativeTime(date, now)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-13 text-textMuted py-4 text-center">Enter a valid cron expression to see next run times</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR: Presets */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-surface border border-border rounded-xl p-4 sticky top-20">
                            <h3 className="text-14 font-bold text-textPrimary mb-4">Common Presets</h3>
                            <div className="flex flex-col gap-1.5 max-h-[600px] overflow-y-auto scrollbar-none">
                                {['Frequent', 'Daily', 'Business', 'Weekly', 'Monthly'].map(cat => {
                                    const catPresets = PRESETS.filter(p => p.category === cat);
                                    if (catPresets.length === 0) return null;
                                    return (
                                        <div key={cat}>
                                            <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest px-2 py-1 block">{cat}</span>
                                            {catPresets.map((preset) => (
                                                <button
                                                    key={preset.expr}
                                                    onClick={() => { applyPreset(preset.expr); setMode('builder'); }}
                                                    className="preset-btn w-full text-left px-3 py-2.5 rounded-lg border border-transparent text-13 text-textSecondary transition-all flex items-center justify-between group"
                                                >
                                                    <span>{preset.label}</span>
                                                    <code className="text-11 text-textMuted font-code group-hover:text-accent">{preset.expr}</code>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Keyboard Shortcuts */}
                <div className="w-full flex justify-center gap-4 lg:gap-6 py-6 flex-wrap">
                    {[
                        ["Click", "chip", "Toggle value"],
                        ["Type", "expression", "Parse mode"],
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
            <SeoTabs />
        </div>
    );
}

// ─── SEO Content Tabs ────────────────────────────────────────────────────────

function SeoTabs() {
    const [activeTab, setActiveTab] = useState('what-is');

    const tabs = [
        {
            id: 'what-is',
            label: 'What is Cron?',
            content: (
                <div>
                    <h2>What is a Cron Expression?</h2>
                    <p>
                        A cron expression is a string of five (or six) fields that defines a schedule for automated tasks.
                        Originally from Unix systems, cron syntax is now used everywhere: Linux crontab, Kubernetes CronJobs,
                        AWS EventBridge, GitHub Actions, CI/CD pipelines, and more.
                    </p>
                    <h3>The 5 Fields</h3>
                    <p>Each field represents a unit of time:</p>
                    <pre><code>{`┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sun=0)
│ │ │ │ │
* * * * *`}</code></pre>
                    <h3>Special Characters</h3>
                    <ul>
                        <li><code>*</code> — Every value (wildcard)</li>
                        <li><code>*/n</code> — Every n-th value (step)</li>
                        <li><code>a-b</code> — Range from a to b</li>
                        <li><code>a,b,c</code> — Specific values</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'dialects',
            label: 'Cron Dialects',
            content: (
                <div>
                    <h2>Cron Expression Dialects</h2>
                    <h3>Unix / Linux (Standard)</h3>
                    <p>The classic 5-field format used in crontab. Supported on all Unix-like systems.</p>

                    <h3>AWS EventBridge</h3>
                    <p>Uses 6 fields (adds year). Day of month and day of week cannot both be specified — one must use <code>?</code>. Example: <code>0 9 ? * MON-FRI *</code></p>

                    <h3>Kubernetes CronJob</h3>
                    <p>Standard 5-field format defined in the <code>spec.schedule</code> of a CronJob manifest. Timezone support was added in Kubernetes 1.27+.</p>

                    <h3>GitHub Actions</h3>
                    <p>Uses POSIX 5-field cron in <code>on.schedule</code> triggers. All times are UTC. Shortest interval GitHub supports is every 5 minutes.</p>
                </div>
            ),
        },
        {
            id: 'examples',
            label: 'Examples',
            content: (
                <div>
                    <h2>Common Cron Expression Examples</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-2 pr-4 text-textPrimary">Expression</th>
                                <th className="py-2 text-textPrimary">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-textSecondary">
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">* * * * *</td><td>Every minute</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">*/5 * * * *</td><td>Every 5 minutes</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">0 * * * *</td><td>Every hour (at minute 0)</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">0 0 * * *</td><td>Every day at midnight</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">0 9 * * 1-5</td><td>Every weekday at 9:00 AM</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">0 0 1 * *</td><td>First day of every month at midnight</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">0 0 * * 0</td><td>Every Sunday at midnight</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">30 4 1,15 * *</td><td>At 4:30 AM on the 1st and 15th of every month</td></tr>
                            <tr><td className="py-2 pr-4 font-code">0 0 1 1,4,7,10 *</td><td>Quarterly: midnight on Jan 1, Apr 1, Jul 1, Oct 1</td></tr>
                        </tbody>
                    </table>
                </div>
            ),
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions</h2>

                    <h3>What timezone do cron expressions use?</h3>
                    <p>It depends on the platform. Linux crontab uses the system&apos;s local timezone. GitHub Actions always runs in UTC. Kubernetes CronJobs default to the kube-controller-manager timezone (usually UTC) but support <code>timeZone</code> since v1.27.</p>

                    <h3>Can I specify both day of month and day of week?</h3>
                    <p>In standard Unix cron, yes — the job runs when <em>either</em> condition is met (OR logic). In AWS EventBridge, you must use <code>?</code> for one of them.</p>

                    <h3>What&apos;s the shortest cron interval?</h3>
                    <p>Standard cron runs at most every minute (<code>* * * * *</code>). For sub-minute scheduling, you&apos;d need systemd timers or a custom scheduler.</p>

                    <h3>Is my data sent to a server?</h3>
                    <p>No. All parsing, formatting, and next-run calculation happens entirely in your browser using JavaScript libraries.</p>
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
