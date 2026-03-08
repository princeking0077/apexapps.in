"use client";

import { useState, useMemo, useCallback, useRef } from 'react';
import {
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    Zap,
    AlertCircle,
    Replace,
    BookOpen,
    Hash,
    Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RegexTesterClientProps {
    toolData?: {
        name: string;
        type: string;
        desc: string;
    };
}

interface MatchResult {
    index: number;
    value: string;
    groups: Record<string, string | undefined>;
    groupArray: (string | undefined)[];
}

interface CommonPattern {
    label: string;
    pattern: string;
    flags: string;
    testString: string;
    category: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CHEAT_SHEET: { token: string; desc: string; insert: string }[] = [
    { token: '\\d', desc: 'Digit (0-9)', insert: '\\d' },
    { token: '\\D', desc: 'Non-digit', insert: '\\D' },
    { token: '\\w', desc: 'Word char (a-z, 0-9, _)', insert: '\\w' },
    { token: '\\W', desc: 'Non-word char', insert: '\\W' },
    { token: '\\s', desc: 'Whitespace', insert: '\\s' },
    { token: '\\S', desc: 'Non-whitespace', insert: '\\S' },
    { token: '.', desc: 'Any character', insert: '.' },
    { token: '^', desc: 'Start of string/line', insert: '^' },
    { token: '$', desc: 'End of string/line', insert: '$' },
    { token: '\\b', desc: 'Word boundary', insert: '\\b' },
    { token: '*', desc: '0 or more times', insert: '*' },
    { token: '+', desc: '1 or more times', insert: '+' },
    { token: '?', desc: '0 or 1 time', insert: '?' },
    { token: '{n}', desc: 'Exactly n times', insert: '{1}' },
    { token: '{n,m}', desc: 'n to m times', insert: '{1,3}' },
    { token: '(group)', desc: 'Capture group', insert: '()' },
    { token: '(?:group)', desc: 'Non-capture group', insert: '(?:)' },
    { token: '(?<name>)', desc: 'Named group', insert: '(?<name>)' },
    { token: '[abc]', desc: 'Character set', insert: '[]' },
    { token: '[^abc]', desc: 'Negated set', insert: '[^]' },
    { token: 'a|b', desc: 'Alternation (OR)', insert: '|' },
    { token: '(?=...)', desc: 'Positive lookahead', insert: '(?=)' },
    { token: '(?!...)', desc: 'Negative lookahead', insert: '(?!)' },
    { token: '(?<=...)', desc: 'Positive lookbehind', insert: '(?<=)' },
];

const COMMON_PATTERNS: CommonPattern[] = [
    { label: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi', testString: 'Contact us at hello@example.com or support@apexapps.in for help.', category: 'Common' },
    { label: 'URL', pattern: 'https?://[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:/[\\w./?%&=-]*)?', flags: 'gi', testString: 'Visit https://apexapps.in/tools or http://example.com/path?q=1 for more.', category: 'Common' },
    { label: 'Phone (India +91)', pattern: '(?:\\+91[\\s-]?)?[6-9]\\d{9}', flags: 'g', testString: 'Call +91 9876543210 or 8765432109 for support.', category: 'India' },
    { label: 'PAN Card', pattern: '[A-Z]{5}\\d{4}[A-Z]', flags: 'g', testString: 'PAN: ABCDE1234F is valid. ZZZZZ9999Z is another.', category: 'India' },
    { label: 'Aadhaar Number', pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}', flags: 'g', testString: 'Aadhaar: 1234 5678 9012 or 123456789012', category: 'India' },
    { label: 'IP Address (IPv4)', pattern: '\\b(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g', testString: 'Server IPs: 192.168.1.1, 10.0.0.255, 256.1.2.3 (invalid)', category: 'Network' },
    { label: 'HEX Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi', testString: 'Colors: #fff, #00b8ff, #f1f5f9, #zzzzzz (invalid)', category: 'Common' },
    { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g', testString: 'Dates: 2024-01-15, 2023-12-31, 2025-06-01', category: 'Common' },
    { label: 'Date (DD/MM/YYYY)', pattern: '(?:0[1-9]|[12]\\d|3[01])/(?:0[1-9]|1[0-2])/\\d{4}', flags: 'g', testString: 'Dates: 15/01/2024, 31/12/2023, 01/06/2025', category: 'Common' },
    { label: 'Postal Code (India)', pattern: '\\b[1-9]\\d{5}\\b', flags: 'g', testString: 'PIN codes: 110001 (Delhi), 400001 (Mumbai), 560001 (Bangalore)', category: 'India' },
    { label: 'HTML Tags', pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*)?\\/?>', flags: 'g', testString: '<div class="test">Hello</div><br/><img src="x.png" />', category: 'Common' },
    { label: 'Strong Password', pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}', flags: '', testString: 'Weak: hello123\nStrong: Hello@123\nAlso strong: P@ssw0rd!', category: 'Common' },
];

// ─── Match highlight colors (cycling) ────────────────────────────────────────

const MATCH_COLORS = [
    { bg: 'rgba(0,184,255,0.2)', border: 'rgba(0,184,255,0.5)' },
    { bg: 'rgba(0,212,106,0.2)', border: 'rgba(0,212,106,0.5)' },
    { bg: 'rgba(255,179,0,0.2)', border: 'rgba(255,179,0,0.5)' },
    { bg: 'rgba(248,113,113,0.2)', border: 'rgba(248,113,113,0.5)' },
    { bg: 'rgba(168,85,247,0.2)', border: 'rgba(168,85,247,0.5)' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegexTesterClient({ toolData = { name: 'Regex Tester', type: 'Tester', desc: 'Test JavaScript regular expressions with live match highlighting, group extraction, and replace preview. Built-in cheat sheet and common patterns. 100% client-side.' } }: RegexTesterClientProps) {
    const [pattern, setPattern] = useState('');
    const [flagG, setFlagG] = useState(true);
    const [flagI, setFlagI] = useState(false);
    const [flagM, setFlagM] = useState(false);
    const [flagS, setFlagS] = useState(false);
    const [testString, setTestString] = useState('');
    const [replaceMode, setReplaceMode] = useState(false);
    const [replaceString, setReplaceString] = useState('');
    const [cheatOpen, setCheatOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [explainLoading, setExplainLoading] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);

    const patternInputRef = useRef<HTMLInputElement>(null);

    // Build flags string
    const flags = useMemo(() => {
        let f = '';
        if (flagG) f += 'g';
        if (flagI) f += 'i';
        if (flagM) f += 'm';
        if (flagS) f += 's';
        return f;
    }, [flagG, flagI, flagM, flagS]);

    // Build regex and find matches
    const { regex, error, matches } = useMemo(() => {
        if (!pattern) return { regex: null, error: null, matches: [] as MatchResult[] };

        try {
            const r = new RegExp(pattern, flags);
            const results: MatchResult[] = [];

            if (testString) {
                if (flagG) {
                    let m: RegExpExecArray | null;
                    let safety = 0;
                    while ((m = r.exec(testString)) !== null && safety < 10000) {
                        results.push({
                            index: m.index,
                            value: m[0],
                            groups: m.groups ? { ...m.groups } : {},
                            groupArray: [...m].slice(1),
                        });
                        if (m[0].length === 0) r.lastIndex++;
                        safety++;
                    }
                } else {
                    const m = r.exec(testString);
                    if (m) {
                        results.push({
                            index: m.index,
                            value: m[0],
                            groups: m.groups ? { ...m.groups } : {},
                            groupArray: [...m].slice(1),
                        });
                    }
                }
            }

            return { regex: r, error: null, matches: results };
        } catch (e: unknown) {
            return { regex: null, error: e instanceof Error ? e.message : 'Invalid regex', matches: [] as MatchResult[] };
        }
    }, [pattern, flags, testString, flagG]);

    // Build highlighted HTML
    const highlightedHtml = useMemo(() => {
        if (!testString || matches.length === 0) return null;

        const parts: { text: string; isMatch: boolean; matchIndex: number }[] = [];
        let lastEnd = 0;

        matches.forEach((m, i) => {
            if (m.index > lastEnd) {
                parts.push({ text: testString.slice(lastEnd, m.index), isMatch: false, matchIndex: -1 });
            }
            parts.push({ text: m.value, isMatch: true, matchIndex: i });
            lastEnd = m.index + m.value.length;
        });

        if (lastEnd < testString.length) {
            parts.push({ text: testString.slice(lastEnd), isMatch: false, matchIndex: -1 });
        }

        return parts;
    }, [testString, matches]);

    // Replace preview
    const replacePreview = useMemo(() => {
        if (!replaceMode || !regex || !testString) return '';
        try {
            return testString.replace(regex, replaceString);
        } catch {
            return testString;
        }
    }, [replaceMode, regex, testString, replaceString]);

    const handleCopy = useCallback(() => {
        const fullRegex = `/${pattern}/${flags}`;
        navigator.clipboard.writeText(fullRegex);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [pattern, flags]);

    const insertToken = useCallback((token: string) => {
        const input = patternInputRef.current;
        if (!input) {
            setPattern(prev => prev + token);
            return;
        }
        const start = input.selectionStart ?? pattern.length;
        const end = input.selectionEnd ?? pattern.length;
        const newVal = pattern.slice(0, start) + token + pattern.slice(end);
        setPattern(newVal);
        setTimeout(() => {
            input.focus();
            const cursor = start + token.length;
            input.setSelectionRange(cursor, cursor);
        }, 0);
    }, [pattern]);

    const loadPattern = useCallback((cp: CommonPattern) => {
        setPattern(cp.pattern);
        setTestString(cp.testString);
        setFlagG(cp.flags.includes('g'));
        setFlagI(cp.flags.includes('i'));
        setFlagM(cp.flags.includes('m'));
        setFlagS(cp.flags.includes('s'));
        setExplanation(null);
    }, []);

    const handleExplain = useCallback(async () => {
        if (!pattern.trim()) return;
        setExplainLoading(true);
        setExplanation(null);

        try {
            const response = await fetch('/api/explain-regex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pattern, flags }),
            });

            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            setExplanation(data.explanation);
        } catch {
            // Fallback: generate a basic client-side explanation
            setExplanation(generateLocalExplanation(pattern));
        } finally {
            setExplainLoading(false);
        }
    }, [pattern, flags]);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="w-full flex flex-col pt-16 md:pt-20 min-h-screen bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
                .flag-btn { transition: all 0.1s; }
                .regex-highlight { border-radius: 2px; padding: 1px 0; }
                .match-row:hover { background: rgba(0,184,255,0.05) !important; }
                .cheat-item:hover { background: #0c1a2e !important; border-color: var(--color-accent) !important; }
                .pattern-btn:hover { background: #0c1a2e !important; border-color: var(--color-accent) !important; color: var(--color-accent) !important; }
            `}} />

            <div className="max-w-content mx-auto w-full px-5 pb-6">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 items-center py-4">
                    {['Tools', '\u203A', 'Validators', '\u203A', 'Regex Tester'].map((t, i, arr) => (
                        <span key={i} className={`text-12 ${i === arr.length - 1 ? 'text-textSecondary' : 'text-textMuted'}`}>{t}</span>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                    <div>
                        <h1 className="text-28 md:text-32 font-bold text-[#f1f5f9] tracking-tight mb-1.5">{toolData.name}</h1>
                        <p className="text-14 text-textSecondary leading-relaxed">{toolData.desc}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setReplaceMode(!replaceMode)}
                            className={`text-13 font-bold px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${replaceMode ? 'bg-accent/10 border-accent text-accent' : 'bg-surface border-border text-textSecondary hover:text-textPrimary hover:border-textMuted'}`}
                        >
                            <Replace size={14} /> Replace
                        </button>
                    </div>
                </div>

                {/* ─── REGEX INPUT BAR ─── */}
                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-20 text-textMuted font-code">/</span>
                        <input
                            ref={patternInputRef}
                            type="text"
                            value={pattern}
                            onChange={(e) => { setPattern(e.target.value); setExplanation(null); }}
                            placeholder="Enter regex pattern..."
                            className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-4 py-2.5 text-16 font-code text-accent outline-none focus:border-accent transition-colors"
                            spellCheck={false}
                        />
                        <span className="text-20 text-textMuted font-code">/</span>

                        {/* Flag toggles */}
                        <div className="flex gap-1">
                            {([
                                { flag: 'g', label: 'global', state: flagG, setter: setFlagG },
                                { flag: 'i', label: 'case-insensitive', state: flagI, setter: setFlagI },
                                { flag: 'm', label: 'multiline', state: flagM, setter: setFlagM },
                                { flag: 's', label: 'dotAll', state: flagS, setter: setFlagS },
                            ] as const).map(({ flag, label, state, setter }) => (
                                <button
                                    key={flag}
                                    onClick={() => setter(!state)}
                                    title={label}
                                    className={`flag-btn w-9 h-9 rounded-md border text-14 font-code font-bold flex items-center justify-center cursor-pointer ${state ? 'bg-accent/15 border-accent text-accent' : 'bg-surface2 border-border text-textMuted hover:text-textSecondary hover:border-textMuted'}`}
                                >
                                    {flag}
                                </button>
                            ))}
                        </div>

                        {/* Copy */}
                        <button
                            onClick={handleCopy}
                            className={`hov-icon text-11 font-medium bg-surface2 border rounded-md px-2.5 py-2 cursor-pointer transition-all flex items-center gap-1.5 ${isCopied ? 'text-success border-success bg-success/10' : 'text-textMuted border-border'}`}
                        >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-3 flex items-start gap-2 text-error">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span className="text-13 font-code">{error}</span>
                        </div>
                    )}

                    {/* Explain button */}
                    {pattern && (
                        <div className="mt-3 flex items-center gap-3">
                            <button
                                onClick={handleExplain}
                                disabled={explainLoading}
                                className="text-12 font-bold text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-warning/15 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {explainLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                Explain this regex
                            </button>
                            {!error && matches.length > 0 && (
                                <span className="text-12 text-success font-bold">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
                            )}
                            {!error && pattern && matches.length === 0 && testString && (
                                <span className="text-12 text-textMuted">No matches</span>
                            )}
                        </div>
                    )}

                    {/* Explanation callout */}
                    {explanation && (
                        <div className="mt-3 bg-warning/5 border border-warning/20 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Zap size={16} className="text-warning mt-0.5 shrink-0" />
                                <div className="text-13 text-textSecondary leading-relaxed whitespace-pre-wrap">{explanation}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── MAIN GRID ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-4">
                        {/* Test string with highlights */}
                        <div className="bg-surface border border-border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${testString ? 'bg-accent' : 'bg-textMuted'}`} />
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Test String</span>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={testString}
                                    onChange={(e) => setTestString(e.target.value)}
                                    placeholder="Enter test string to match against..."
                                    className="w-full bg-transparent px-4 py-4 text-14 font-code text-textPrimary outline-none resize-none min-h-[160px] leading-relaxed"
                                    spellCheck={false}
                                />
                            </div>

                            {/* Highlighted preview */}
                            {highlightedHtml && highlightedHtml.length > 0 && (
                                <div className="border-t border-border px-4 py-4">
                                    <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono block mb-2">Highlighted Matches</span>
                                    <div className="text-14 font-code text-textPrimary leading-relaxed whitespace-pre-wrap break-all">
                                        {highlightedHtml.map((part, i) => (
                                            part.isMatch ? (
                                                <mark
                                                    key={i}
                                                    className="regex-highlight"
                                                    style={{
                                                        backgroundColor: MATCH_COLORS[part.matchIndex % MATCH_COLORS.length].bg,
                                                        borderBottom: `2px solid ${MATCH_COLORS[part.matchIndex % MATCH_COLORS.length].border}`,
                                                        color: 'inherit',
                                                    }}
                                                >
                                                    {part.text}
                                                </mark>
                                            ) : (
                                                <span key={i}>{part.text}</span>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between px-4 py-1.5 border-t border-border bg-[#080c14]">
                                <span className="text-11 text-textMuted font-mono">{testString.length} chars · {testString.split('\n').length} lines</span>
                                <span className="text-11 text-textMuted">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
                            </div>
                        </div>

                        {/* Replace mode */}
                        {replaceMode && (
                            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Replace size={14} className="text-accent" />
                                        <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Replace With</span>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={replaceString}
                                    onChange={(e) => setReplaceString(e.target.value)}
                                    placeholder="Replacement string (use $1, $2 for groups)..."
                                    className="w-full bg-transparent px-4 py-3 text-14 font-code text-textPrimary outline-none"
                                    spellCheck={false}
                                />
                                {replacePreview && (
                                    <div className="border-t border-border px-4 py-3">
                                        <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono block mb-2">Preview</span>
                                        <div className="text-14 font-code text-success leading-relaxed whitespace-pre-wrap break-all">
                                            {replacePreview}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Match details table */}
                        {matches.length > 0 && (
                            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className="text-accent" />
                                        <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Match Details</span>
                                        <span className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-px font-mono">{matches.length}</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border text-[11px] font-bold text-textMuted uppercase tracking-wider">
                                                <th className="px-4 py-2">#</th>
                                                <th className="px-4 py-2">Match</th>
                                                <th className="px-4 py-2">Position</th>
                                                <th className="px-4 py-2">Length</th>
                                                {matches.some(m => m.groupArray.length > 0) && (
                                                    <th className="px-4 py-2">Groups</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matches.slice(0, 100).map((m, i) => (
                                                <tr key={i} className="match-row border-b border-border last:border-0 transition-colors">
                                                    <td className="px-4 py-2 text-12 text-textMuted font-code">{i + 1}</td>
                                                    <td className="px-4 py-2">
                                                        <code
                                                            className="text-13 font-code px-1.5 py-0.5 rounded"
                                                            style={{
                                                                backgroundColor: MATCH_COLORS[i % MATCH_COLORS.length].bg,
                                                                color: 'var(--color-textPrimary)',
                                                            }}
                                                        >
                                                            {m.value || '(empty)'}
                                                        </code>
                                                    </td>
                                                    <td className="px-4 py-2 text-12 text-textSecondary font-code">{m.index}</td>
                                                    <td className="px-4 py-2 text-12 text-textSecondary font-code">{m.value.length}</td>
                                                    {matches.some(mm => mm.groupArray.length > 0) && (
                                                        <td className="px-4 py-2">
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {m.groupArray.map((g, gi) => (
                                                                    <span key={gi} className="text-11 bg-surface2 border border-border rounded px-1.5 py-0.5 font-code text-textSecondary">
                                                                        ${gi + 1}: {g ?? 'undefined'}
                                                                    </span>
                                                                ))}
                                                                {Object.entries(m.groups).map(([name, val]) => (
                                                                    <span key={name} className="text-11 bg-accent/10 border border-accent/20 rounded px-1.5 py-0.5 font-code text-accent">
                                                                        {name}: {val ?? 'undefined'}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {matches.length > 100 && (
                                        <div className="px-4 py-2 text-12 text-textMuted text-center border-t border-border">
                                            Showing first 100 of {matches.length} matches
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="flex flex-col gap-4">
                        {/* Cheat Sheet */}
                        <div className="bg-surface border border-border rounded-xl overflow-hidden">
                            <button
                                onClick={() => setCheatOpen(!cheatOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface2 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen size={14} className="text-accent" />
                                    <span className="text-13 font-bold text-textPrimary">Cheat Sheet</span>
                                </div>
                                {cheatOpen ? <ChevronDown size={16} className="text-textMuted" /> : <ChevronRight size={16} className="text-textMuted" />}
                            </button>
                            {cheatOpen && (
                                <div className="border-t border-border max-h-[400px] overflow-y-auto scrollbar-none">
                                    {CHEAT_SHEET.map((item) => (
                                        <button
                                            key={item.token}
                                            onClick={() => insertToken(item.insert)}
                                            className="cheat-item w-full text-left flex items-center gap-3 px-4 py-2 border-b border-border last:border-0 transition-colors cursor-pointer"
                                        >
                                            <code className="text-13 font-code text-accent w-20 shrink-0">{item.token}</code>
                                            <span className="text-12 text-textSecondary">{item.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Common Patterns */}
                        <div className="bg-surface border border-border rounded-xl p-4 sticky top-20">
                            <h3 className="text-13 font-bold text-textPrimary mb-3">Common Patterns</h3>
                            <div className="flex flex-col gap-1 max-h-[500px] overflow-y-auto scrollbar-none">
                                {['Common', 'India', 'Network'].map(cat => {
                                    const catPatterns = COMMON_PATTERNS.filter(p => p.category === cat);
                                    if (catPatterns.length === 0) return null;
                                    return (
                                        <div key={cat}>
                                            <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest px-2 py-1 block">{cat}</span>
                                            {catPatterns.map((cp) => (
                                                <button
                                                    key={cp.label}
                                                    onClick={() => loadPattern(cp)}
                                                    className="pattern-btn w-full text-left px-3 py-2 rounded-lg border border-transparent text-13 text-textSecondary transition-all"
                                                >
                                                    {cp.label}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shortcuts */}
                <div className="w-full flex justify-center gap-4 lg:gap-6 py-6 flex-wrap">
                    {[
                        ["Click", "token", "Insert at cursor"],
                        ["Click", "pattern", "Load example"],
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

            {/* SEO Tabs */}
            <SeoTabs />
        </div>
    );
}

// ─── Client-side regex explanation (fallback) ────────────────────────────────

function generateLocalExplanation(pattern: string): string {
    const explanations: string[] = [];
    let i = 0;

    while (i < pattern.length) {
        const remaining = pattern.slice(i);

        // Named groups
        if (remaining.startsWith('(?<')) {
            const end = remaining.indexOf('>');
            if (end > 0) {
                const name = remaining.slice(3, end);
                explanations.push(`(?<${name}>...)  \u2192  Named capture group "${name}"`);
                i += end + 1;
                continue;
            }
        }

        // Lookaheads/lookbehinds
        if (remaining.startsWith('(?=')) { explanations.push('(?=...)  \u2192  Positive lookahead: asserts what follows'); i += 3; continue; }
        if (remaining.startsWith('(?!')) { explanations.push('(?!...)  \u2192  Negative lookahead: asserts what does NOT follow'); i += 3; continue; }
        if (remaining.startsWith('(?<=')) { explanations.push('(?<=...)  \u2192  Positive lookbehind: asserts what precedes'); i += 4; continue; }
        if (remaining.startsWith('(?<!')) { explanations.push('(?<!...)  \u2192  Negative lookbehind: asserts what does NOT precede'); i += 4; continue; }
        if (remaining.startsWith('(?:')) { explanations.push('(?:...)  \u2192  Non-capturing group'); i += 3; continue; }

        // Escaped chars
        if (pattern[i] === '\\' && i + 1 < pattern.length) {
            const next = pattern[i + 1];
            const escMap: Record<string, string> = {
                'd': '\\d  \u2192  Any digit (0-9)',
                'D': '\\D  \u2192  Any non-digit',
                'w': '\\w  \u2192  Any word character (letters, digits, underscore)',
                'W': '\\W  \u2192  Any non-word character',
                's': '\\s  \u2192  Any whitespace (space, tab, newline)',
                'S': '\\S  \u2192  Any non-whitespace',
                'b': '\\b  \u2192  Word boundary',
                'B': '\\B  \u2192  Non-word boundary',
                'n': '\\n  \u2192  Newline',
                't': '\\t  \u2192  Tab',
            };
            if (escMap[next]) {
                explanations.push(escMap[next]);
            } else {
                explanations.push(`\\${next}  \u2192  Literal "${next}"`);
            }
            i += 2;
            continue;
        }

        // Quantifiers
        if (remaining.startsWith('{')) {
            const end = remaining.indexOf('}');
            if (end > 0) {
                const quant = remaining.slice(0, end + 1);
                explanations.push(`${quant}  \u2192  Repeat the previous token ${quant.slice(1, -1)} times`);
                i += end + 1;
                continue;
            }
        }

        // Character classes
        if (pattern[i] === '[') {
            const end = pattern.indexOf(']', i);
            if (end > 0) {
                const cls = pattern.slice(i, end + 1);
                const negated = cls[1] === '^';
                explanations.push(`${cls}  \u2192  ${negated ? 'Any character NOT in' : 'Any character in'} the set`);
                i = end + 1;
                continue;
            }
        }

        // Simple tokens
        const simpleMap: Record<string, string> = {
            '^': '^  \u2192  Start of string (or line in multiline mode)',
            '$': '$  \u2192  End of string (or line in multiline mode)',
            '.': '.  \u2192  Any single character (except newline)',
            '*': '*  \u2192  0 or more of the previous token',
            '+': '+  \u2192  1 or more of the previous token',
            '?': '?  \u2192  0 or 1 of the previous token (optional)',
            '|': '|  \u2192  OR \u2014 match either the left or right side',
            '(': '(  \u2192  Start of capture group',
            ')': ')  \u2192  End of capture group',
        };

        if (simpleMap[pattern[i]]) {
            explanations.push(simpleMap[pattern[i]]);
        } else {
            // Literal character - group consecutive literals
            let literal = '';
            while (i < pattern.length && !'^$.*+?|()[]{}\\'.includes(pattern[i])) {
                literal += pattern[i];
                i++;
            }
            if (literal) {
                explanations.push(`"${literal}"  \u2192  Literal text "${literal}"`);
                continue;
            }
        }

        i++;
    }

    if (explanations.length === 0) return 'Could not parse this regex pattern.';

    return 'Token-by-token breakdown:\n\n' + explanations.map((e, idx) => `${idx + 1}. ${e}`).join('\n');
}

// ─── SEO Tabs ────────────────────────────────────────────────────────────────

function SeoTabs() {
    const [activeTab, setActiveTab] = useState('what-is');

    const tabs = [
        {
            id: 'what-is',
            label: 'What is Regex?',
            content: (
                <div>
                    <h2>What is a Regular Expression?</h2>
                    <p>
                        A regular expression (regex or regexp) is a sequence of characters that defines a search pattern. Regex is used in virtually every programming language for pattern matching, text validation, search-and-replace, and data extraction.
                    </p>
                    <p>
                        Our <strong>Regex Tester</strong> lets you write and test regular expressions against sample text with instant visual feedback. Matches are highlighted in real-time, capture groups are extracted, and you can even preview replacements &mdash; all without leaving your browser.
                    </p>
                    <h3>Key Features</h3>
                    <ul>
                        <li><strong>Live Highlighting:</strong> See matches highlighted in your test string as you type the pattern.</li>
                        <li><strong>Match Details:</strong> View each match&apos;s value, position, length, and captured groups in a detailed table.</li>
                        <li><strong>Replace Mode:</strong> Preview string replacements with group references ($1, $2, etc.).</li>
                        <li><strong>Cheat Sheet:</strong> Quick reference for regex syntax with one-click insertion.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'how-to',
            label: 'How to Use',
            content: (
                <div>
                    <h2>How to Test Regular Expressions</h2>
                    <ol>
                        <li><strong>Enter Pattern:</strong> Type your regex in the pattern field between the <code>/</code> delimiters.</li>
                        <li><strong>Set Flags:</strong> Toggle flags like <code>g</code> (global), <code>i</code> (case-insensitive), <code>m</code> (multiline), and <code>s</code> (dotAll).</li>
                        <li><strong>Add Test String:</strong> Paste or type the text you want to test against.</li>
                        <li><strong>View Results:</strong> Matches are highlighted in real-time. Check the Match Details table for positions and captured groups.</li>
                        <li><strong>Replace (Optional):</strong> Enable Replace mode and enter a replacement pattern. Use <code>$1</code>, <code>$2</code>, etc., for captured groups.</li>
                    </ol>
                    <h3>Tips</h3>
                    <ul>
                        <li>Click items in the <strong>Cheat Sheet</strong> to insert regex tokens at your cursor position.</li>
                        <li>Click a <strong>Common Pattern</strong> to load a pre-built regex with a matching test string.</li>
                        <li>Use the <strong>Explain</strong> button to get a plain-English breakdown of complex patterns.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'examples',
            label: 'Examples',
            content: (
                <div>
                    <h2>Common Regex Examples</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-2 pr-4 text-textPrimary">Pattern</th>
                                <th className="py-2 text-textPrimary">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-textSecondary">
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">\d+</td><td>One or more digits</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">[a-zA-Z]+</td><td>One or more letters</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">\b\w+@\w+\.\w+\b</td><td>Simple email pattern</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">^https?://</td><td>URL starting with http(s)://</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">\d&#123;3&#125;-\d&#123;3&#125;-\d&#123;4&#125;</td><td>Phone number format (123-456-7890)</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code">#[0-9a-fA-F]&#123;6&#125;</td><td>6-digit hex color code</td></tr>
                            <tr><td className="py-2 pr-4 font-code">(?&lt;year&gt;\d&#123;4&#125;)-(?&lt;month&gt;\d&#123;2&#125;)-(?&lt;day&gt;\d&#123;2&#125;)</td><td>Named groups for date parts</td></tr>
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

                    <h3>What regex flavor does this tester use?</h3>
                    <p>It uses JavaScript&apos;s native <code>RegExp</code> engine, which supports ES2018+ features including named groups, lookbehinds, and the <code>s</code> (dotAll) flag.</p>

                    <h3>What do the flags mean?</h3>
                    <ul>
                        <li><code>g</code> (global) &mdash; Find all matches, not just the first</li>
                        <li><code>i</code> (case-insensitive) &mdash; Ignore uppercase/lowercase differences</li>
                        <li><code>m</code> (multiline) &mdash; <code>^</code> and <code>$</code> match line starts/ends, not just string start/end</li>
                        <li><code>s</code> (dotAll) &mdash; <code>.</code> matches newline characters too</li>
                    </ul>

                    <h3>How do I use capture groups in replacements?</h3>
                    <p>Use <code>$1</code>, <code>$2</code>, etc. for numbered groups, and <code>$&lt;name&gt;</code> for named groups. <code>$&amp;</code> refers to the entire match.</p>

                    <h3>Is my data sent to any server?</h3>
                    <p>No. All regex matching runs entirely in your browser using JavaScript&apos;s native <code>RegExp</code>. The optional &quot;Explain&quot; feature attempts an API call but falls back to a client-side explanation if unavailable.</p>
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
