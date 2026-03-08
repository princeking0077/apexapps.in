"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Copy,
    Check,
    ShieldCheck,
    AlertTriangle,
    Clock,
    TimerOff,
    ShieldAlert,
    KeyRound,
    Lock,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JwtDecoderClientProps {
    toolData?: { name: string; type: string; desc: string };
}

interface DecodedJwt {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
    headerRaw: string;
    payloadRaw: string;
}

// ─── Claim Descriptions ─────────────────────────────────────────────────────

const CLAIM_DESCRIPTIONS: Record<string, string> = {
    iss: 'Issuer — who created and signed this token',
    sub: 'Subject — the user or entity this token identifies',
    aud: 'Audience — intended recipient(s) of the token',
    exp: 'Expiration Time — when this token becomes invalid',
    nbf: 'Not Before — token is not valid before this time',
    iat: 'Issued At — when this token was created',
    jti: 'JWT ID — unique identifier for this token',
    name: 'Full Name — user\'s display name',
    email: 'Email — user\'s email address',
    email_verified: 'Email Verified — whether the email has been verified',
    picture: 'Picture — URL of the user\'s profile image',
    given_name: 'Given Name — user\'s first name',
    family_name: 'Family Name — user\'s last name',
    locale: 'Locale — user\'s language/region preference',
    nonce: 'Nonce — value used to prevent replay attacks',
    at_hash: 'Access Token Hash — hash of the access token',
    azp: 'Authorized Party — the party to which the token was issued',
    scope: 'Scope — permissions granted by this token',
    roles: 'Roles — user\'s assigned roles',
    permissions: 'Permissions — specific permissions granted',
    typ: 'Token Type — type of token (e.g. Bearer)',
    sid: 'Session ID — unique session identifier',
    auth_time: 'Authentication Time — when the user last authenticated',
    acr: 'Authentication Context Class — level of authentication assurance',
    amr: 'Authentication Methods — methods used to authenticate',
    org_id: 'Organization ID — the organization this token belongs to',
    tenant: 'Tenant — multi-tenant identifier',
};

const ALGORITHM_DESCRIPTIONS: Record<string, string> = {
    HS256: 'HMAC using SHA-256 (symmetric)',
    HS384: 'HMAC using SHA-384 (symmetric)',
    HS512: 'HMAC using SHA-512 (symmetric)',
    RS256: 'RSASSA-PKCS1-v1_5 using SHA-256 (asymmetric)',
    RS384: 'RSASSA-PKCS1-v1_5 using SHA-384 (asymmetric)',
    RS512: 'RSASSA-PKCS1-v1_5 using SHA-512 (asymmetric)',
    ES256: 'ECDSA using P-256 and SHA-256 (asymmetric)',
    ES384: 'ECDSA using P-384 and SHA-384 (asymmetric)',
    ES512: 'ECDSA using P-521 and SHA-512 (asymmetric)',
    PS256: 'RSASSA-PSS using SHA-256 (asymmetric)',
    PS384: 'RSASSA-PSS using SHA-384 (asymmetric)',
    PS512: 'RSASSA-PSS using SHA-512 (asymmetric)',
    EdDSA: 'Edwards-curve Digital Signature (asymmetric)',
    none: 'No digital signature (UNSECURED)',
};

// ─── Color scheme for JWT parts ──────────────────────────────────────────────

const COLORS = {
    header: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', text: '#f87171', dot: '#f87171' },
    payload: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: '#a855f7', dot: '#a855f7' },
    signature: { bg: 'rgba(0,184,255,0.08)', border: 'rgba(0,184,255,0.25)', text: '#00b8ff', dot: '#00b8ff' },
};

// ─── Example JWT ─────────────────────────────────────────────────────────────

const EXAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iLCJ1c2VyIl0sImlhdCI6MTcxNjIzOTAyMiwiZXhwIjoxODE2MjQyNjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function base64UrlDecode(str: string): string {
    // Restore Base64 padding and chars
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    return atob(base64);
}

function decodeJwt(token: string): DecodedJwt | null {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    try {
        const headerRaw = base64UrlDecode(parts[0]);
        const payloadRaw = base64UrlDecode(parts[1]);
        const header = JSON.parse(headerRaw);
        const payload = JSON.parse(payloadRaw);
        return {
            header,
            payload,
            signature: parts[2],
            headerRaw,
            payloadRaw,
        };
    } catch {
        return null;
    }
}

function formatTimestamp(ts: number): string {
    try {
        return new Date(ts * 1000).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    } catch {
        return String(ts);
    }
}

function formatDuration(ms: number): string {
    const abs = Math.abs(ms);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
}

function isTimestamp(key: string, value: unknown): boolean {
    return (key === 'exp' || key === 'iat' || key === 'nbf' || key === 'auth_time') && typeof value === 'number';
}

// ─── HMAC Verification ──────────────────────────────────────────────────────

async function verifyHS256(token: string, secret: string): Promise<boolean> {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const data = encoder.encode(`${parts[0]}.${parts[1]}`);
    const sig = await crypto.subtle.sign('HMAC', key, data);
    const sigArray = new Uint8Array(sig);

    // Convert to base64url
    let binary = '';
    sigArray.forEach(b => binary += String.fromCharCode(b));
    const computed = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return computed === parts[2];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JwtDecoderClient({ toolData = { name: 'JWT Decoder', type: 'Decoder', desc: 'Decode and debug JSON Web Tokens in your browser. Inspect header, payload, claims, and verify HS256 signatures. 100% client-side.' } }: JwtDecoderClientProps) {
    const [input, setInput] = useState('');
    const [secret, setSecret] = useState('');
    const [showVerify, setShowVerify] = useState(false);
    const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    // Live countdown
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const decoded = useMemo(() => decodeJwt(input), [input]);

    const expiryStatus = useMemo(() => {
        if (!decoded) return null;
        const exp = decoded.payload.exp;
        if (typeof exp !== 'number') return { type: 'none' as const };
        const expiresMs = exp * 1000;
        const diff = expiresMs - now;
        if (diff > 0) return { type: 'valid' as const, remaining: diff, expiresAt: formatTimestamp(exp) };
        return { type: 'expired' as const, ago: Math.abs(diff), expiredAt: formatTimestamp(exp) };
    }, [decoded, now]);

    const copy = useCallback((text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    }, []);

    const handleVerify = useCallback(async () => {
        if (!input.trim() || !secret.trim() || !decoded) return;
        const alg = decoded.header.alg;
        if (alg !== 'HS256') {
            setVerifyResult(null);
            return;
        }
        setVerifying(true);
        try {
            const result = await verifyHS256(input, secret);
            setVerifyResult(result);
        } catch {
            setVerifyResult(false);
        } finally {
            setVerifying(false);
        }
    }, [input, secret, decoded]);

    // Color-coded token display
    const tokenParts = useMemo(() => {
        const parts = input.trim().split('.');
        if (parts.length !== 3) return null;
        return { header: parts[0], payload: parts[1], signature: parts[2] };
    }, [input]);

    const renderClaimValue = (key: string, value: unknown): React.ReactNode => {
        if (isTimestamp(key, value)) {
            return (
                <div className="flex flex-col">
                    <span className="text-textPrimary font-code">{String(value)}</span>
                    <span className="text-11 text-textMuted">{formatTimestamp(value as number)}</span>
                </div>
            );
        }
        if (typeof value === 'object' && value !== null) {
            return <code className="text-textPrimary font-code text-12">{JSON.stringify(value, null, 2)}</code>;
        }
        if (typeof value === 'boolean') {
            return <span className={`font-code font-bold ${value ? 'text-success' : 'text-error'}`}>{String(value)}</span>;
        }
        return <span className="text-textPrimary font-code">{String(value)}</span>;
    };

    return (
        <div className="w-full flex flex-col pt-16 md:pt-20 min-h-screen bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hov-icon:hover { background: #162030 !important; color: var(--color-accent) !important; }
                .jwt-header-part { color: #f87171; }
                .jwt-payload-part { color: #a855f7; }
                .jwt-signature-part { color: #00b8ff; }
            `}} />

            <div className="max-w-content mx-auto w-full px-5 pb-6">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 items-center py-4">
                    {['Tools', '\u203A', 'Encoders', '\u203A', 'JWT Decoder'].map((t, i, arr) => (
                        <span key={i} className={`text-12 ${i === arr.length - 1 ? 'text-textSecondary' : 'text-textMuted'}`}>{t}</span>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                    <div>
                        <h1 className="text-28 md:text-32 font-bold text-[#f1f5f9] tracking-tight mb-1.5">{toolData.name}</h1>
                        <p className="text-14 text-textSecondary leading-relaxed">{toolData.desc}</p>
                    </div>
                    <button
                        onClick={() => { setInput(EXAMPLE_JWT); setVerifyResult(null); }}
                        className="hov-icon text-12 font-medium bg-surface2 border border-border rounded-md px-3 py-1.5 text-textMuted transition-all cursor-pointer"
                    >
                        Load Example
                    </button>
                </div>

                {/* ─── TOKEN INPUT ─── */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${input ? 'bg-accent' : 'bg-textMuted'}`} />
                            <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono">Paste JWT Token</span>
                        </div>
                        <button
                            onClick={() => { setInput(''); setVerifyResult(null); }}
                            className="hov-icon text-11 text-textMuted bg-surface2 border border-border rounded-md px-2 py-1 cursor-pointer transition-all"
                        >
                            Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setVerifyResult(null); }}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0..."
                        className="w-full bg-transparent px-4 py-4 text-14 font-code text-textPrimary outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-textMuted/40"
                        spellCheck={false}
                    />

                    {/* Color-coded token preview */}
                    {tokenParts && (
                        <div className="border-t border-border px-4 py-3 overflow-x-auto">
                            <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase font-mono block mb-2">Color-coded</span>
                            <div className="text-13 font-code break-all leading-relaxed">
                                <span className="jwt-header-part">{tokenParts.header}</span>
                                <span className="text-textMuted">.</span>
                                <span className="jwt-payload-part">{tokenParts.payload}</span>
                                <span className="text-textMuted">.</span>
                                <span className="jwt-signature-part">{tokenParts.signature}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── EXPIRY BANNER ─── */}
                {expiryStatus && (
                    <div className={`rounded-xl px-4 py-3 mb-4 flex items-center gap-3 border ${expiryStatus.type === 'valid' ? 'bg-success/8 border-success/20' :
                        expiryStatus.type === 'expired' ? 'bg-error/8 border-error/20' :
                            'bg-warning/8 border-warning/20'
                        }`}>
                        {expiryStatus.type === 'valid' && (
                            <>
                                <Clock size={18} className="text-success shrink-0" />
                                <div>
                                    <span className="text-14 font-bold text-success">Token expires in {formatDuration(expiryStatus.remaining)}</span>
                                    <span className="text-12 text-success/70 ml-2">({expiryStatus.expiresAt})</span>
                                </div>
                            </>
                        )}
                        {expiryStatus.type === 'expired' && (
                            <>
                                <TimerOff size={18} className="text-error shrink-0" />
                                <div>
                                    <span className="text-14 font-bold text-error">This token EXPIRED {formatDuration(expiryStatus.ago)} ago</span>
                                    <span className="text-12 text-error/70 ml-2">({expiryStatus.expiredAt})</span>
                                </div>
                            </>
                        )}
                        {expiryStatus.type === 'none' && (
                            <>
                                <AlertTriangle size={18} className="text-warning shrink-0" />
                                <span className="text-14 font-bold text-warning">No expiration set — this token never expires</span>
                            </>
                        )}
                    </div>
                )}

                {/* Error */}
                {input.trim() && !decoded && (
                    <div className="bg-error/8 border border-error/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                        <ShieldAlert size={18} className="text-error shrink-0" />
                        <span className="text-14 text-error font-medium">Invalid JWT — token must have 3 Base64URL-encoded parts separated by dots.</span>
                    </div>
                )}

                {/* ─── DECODED SECTIONS ─── */}
                {decoded && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* HEADER */}
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.header.border, backgroundColor: COLORS.header.bg }}>
                            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.header.border }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.header.dot }} />
                                    <span className="text-13 font-bold" style={{ color: COLORS.header.text }}>HEADER</span>
                                </div>
                                <button
                                    onClick={() => copy(JSON.stringify(decoded.header, null, 2), 'header')}
                                    className={`text-11 font-medium rounded-md px-2 py-1 flex items-center gap-1 transition-all cursor-pointer border ${copiedKey === 'header' ? 'text-success border-success/30 bg-success/10' : 'border-transparent hover:bg-white/5'}`}
                                    style={{ color: copiedKey === 'header' ? undefined : COLORS.header.text }}
                                >
                                    {copiedKey === 'header' ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedKey === 'header' ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <div className="px-4 py-3">
                                {Object.entries(decoded.header).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                                        <code className="text-13 font-code font-bold text-textPrimary w-16 shrink-0">{key}</code>
                                        <div className="flex-1">
                                            <span className="text-14 font-code text-textPrimary">{String(value)}</span>
                                            {key === 'alg' && ALGORITHM_DESCRIPTIONS[String(value)] && (
                                                <p className="text-11 text-textMuted mt-0.5">{ALGORITHM_DESCRIPTIONS[String(value)]}</p>
                                            )}
                                            {key === 'typ' && <p className="text-11 text-textMuted mt-0.5">Token Type</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIGNATURE */}
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.signature.border, backgroundColor: COLORS.signature.bg }}>
                            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.signature.border }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.signature.dot }} />
                                    <span className="text-13 font-bold" style={{ color: COLORS.signature.text }}>SIGNATURE</span>
                                </div>
                                <button
                                    onClick={() => setShowVerify(!showVerify)}
                                    className={`text-11 font-medium rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-all cursor-pointer border ${showVerify ? 'bg-accent/10 border-accent/30 text-accent' : 'border-transparent hover:bg-white/5'}`}
                                    style={{ color: showVerify ? undefined : COLORS.signature.text }}
                                >
                                    <KeyRound size={12} /> Verify
                                </button>
                            </div>
                            <div className="px-4 py-3">
                                <code className="text-12 font-code text-textSecondary break-all">{decoded.signature}</code>
                                <p className="text-11 text-textMuted mt-2">
                                    Algorithm: <span className="text-textSecondary font-bold">{String(decoded.header.alg || 'unknown')}</span>
                                </p>
                                <p className="text-11 text-textMuted mt-1">
                                    Signature verification requires the secret key or public key. Without it, only the payload data can be read.
                                </p>

                                {/* Verify panel */}
                                {showVerify && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        {decoded.header.alg === 'HS256' ? (
                                            <>
                                                <label className="text-11 font-bold text-textMuted uppercase tracking-wider mb-2 block">HMAC Secret Key</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="password"
                                                        value={secret}
                                                        onChange={(e) => { setSecret(e.target.value); setVerifyResult(null); }}
                                                        placeholder="Enter your secret key..."
                                                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-13 font-code text-textPrimary outline-none focus:border-accent"
                                                    />
                                                    <button
                                                        onClick={handleVerify}
                                                        disabled={!secret.trim() || verifying}
                                                        className="px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-lg text-12 font-bold hover:bg-accent/20 transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                                        Verify
                                                    </button>
                                                </div>
                                                {verifyResult !== null && (
                                                    <div className={`mt-2 flex items-center gap-2 text-13 font-bold ${verifyResult ? 'text-success' : 'text-error'}`}>
                                                        {verifyResult ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                        {verifyResult ? 'Signature is valid!' : 'Signature verification failed — wrong secret key.'}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-12 text-textMuted">
                                                Browser-based verification is currently supported for <strong>HS256</strong> tokens only.
                                                This token uses <strong>{String(decoded.header.alg)}</strong> which requires a public key.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PAYLOAD — full width */}
                        <div className="col-span-1 lg:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: COLORS.payload.border, backgroundColor: COLORS.payload.bg }}>
                            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.payload.border }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.payload.dot }} />
                                    <span className="text-13 font-bold" style={{ color: COLORS.payload.text }}>PAYLOAD</span>
                                    <span className="text-11 bg-white/5 rounded px-1.5 py-px font-code" style={{ color: COLORS.payload.text }}>
                                        {Object.keys(decoded.payload).length} claims
                                    </span>
                                </div>
                                <button
                                    onClick={() => copy(JSON.stringify(decoded.payload, null, 2), 'payload')}
                                    className={`text-11 font-medium rounded-md px-2 py-1 flex items-center gap-1 transition-all cursor-pointer border ${copiedKey === 'payload' ? 'text-success border-success/30 bg-success/10' : 'border-transparent hover:bg-white/5'}`}
                                    style={{ color: copiedKey === 'payload' ? undefined : COLORS.payload.text }}
                                >
                                    {copiedKey === 'payload' ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedKey === 'payload' ? 'Copied' : 'Copy JSON'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[11px] font-bold text-textMuted uppercase tracking-wider" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>
                                            <th className="px-4 py-2 border-b" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>Claim</th>
                                            <th className="px-4 py-2 border-b" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>Value</th>
                                            <th className="px-4 py-2 border-b hidden md:table-cell" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(decoded.payload).map(([key, value]) => (
                                            <tr key={key} className="border-b last:border-0" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                                                <td className="px-4 py-2.5 align-top">
                                                    <code className="text-13 font-code font-bold" style={{ color: COLORS.payload.text }}>{key}</code>
                                                </td>
                                                <td className="px-4 py-2.5 align-top text-14">
                                                    {typeof value === 'object' && value !== null ? (
                                                        <pre className="text-12 font-code text-textPrimary whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                                    ) : (
                                                        renderClaimValue(key, value)
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 align-top hidden md:table-cell">
                                                    <span className="text-12 text-textMuted">
                                                        {CLAIM_DESCRIPTIONS[key] || 'Custom claim'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SECURITY NOTICE ─── */}
                <div className="bg-success/5 border border-success/15 rounded-xl px-5 py-4 mt-2 mb-6">
                    <div className="flex items-start gap-3">
                        <Lock size={20} className="text-success mt-0.5 shrink-0" />
                        <div>
                            <p className="text-14 font-bold text-success mb-1">100% Client-Side Decoding</p>
                            <p className="text-13 text-textSecondary leading-relaxed">
                                All decoding happens in your browser. Your JWT is never sent to our servers.
                                You can verify this by opening Browser DevTools &rarr; Network tab &mdash; you&apos;ll see zero outgoing requests while using this tool.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shortcuts */}
                <div className="w-full flex justify-center gap-4 lg:gap-6 py-4 flex-wrap">
                    {[
                        ["Paste", "token", "Auto-decode"],
                        ["Click", "section", "Copy JSON"],
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

// ─── SEO Tabs ────────────────────────────────────────────────────────────────

function SeoTabs() {
    const [activeTab, setActiveTab] = useState('what-is');

    const tabs = [
        {
            id: 'what-is',
            label: 'What is JWT?',
            content: (
                <div>
                    <h2>What is a JSON Web Token (JWT)?</h2>
                    <p>
                        A JSON Web Token (JWT, pronounced &quot;jot&quot;) is a compact, URL-safe token format used for securely transmitting information between parties. JWTs are widely used for authentication, authorization, and information exchange in modern web applications.
                    </p>
                    <h3>JWT Structure</h3>
                    <p>A JWT consists of three Base64URL-encoded parts separated by dots:</p>
                    <ol>
                        <li><strong style={{ color: '#f87171' }}>Header</strong> — Contains the token type (JWT) and the signing algorithm (e.g., HS256, RS256).</li>
                        <li><strong style={{ color: '#a855f7' }}>Payload</strong> — Contains claims: statements about the user and additional metadata. Standard claims include <code>sub</code> (subject), <code>iat</code> (issued at), and <code>exp</code> (expiration).</li>
                        <li><strong style={{ color: '#00b8ff' }}>Signature</strong> — Created by signing the header and payload with a secret key. Used to verify the token hasn&apos;t been tampered with.</li>
                    </ol>
                    <h3>Important Security Note</h3>
                    <p>
                        JWTs are <strong>encoded, not encrypted</strong>. Anyone can decode the header and payload — the signature only proves the token hasn&apos;t been modified. Never put secrets (passwords, API keys) in a JWT payload.
                    </p>
                </div>
            ),
        },
        {
            id: 'vs-jwtio',
            label: 'vs jwt.io',
            content: (
                <div>
                    <h2>apexapps.in JWT Decoder vs jwt.io</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-2 pr-4 text-textPrimary">Feature</th>
                                <th className="py-2 pr-4 text-textPrimary">apexapps.in</th>
                                <th className="py-2 text-textPrimary">jwt.io</th>
                            </tr>
                        </thead>
                        <tbody className="text-textSecondary">
                            <tr className="border-b border-border">
                                <td className="py-2 pr-4 font-medium">Client-side only</td>
                                <td className="py-2 pr-4 text-success font-bold">Yes — verified zero requests</td>
                                <td className="py-2">Loads external scripts (Auth0)</td>
                            </tr>
                            <tr className="border-b border-border">
                                <td className="py-2 pr-4 font-medium">Ads / trackers</td>
                                <td className="py-2 pr-4 text-success font-bold">None</td>
                                <td className="py-2">Third-party analytics present</td>
                            </tr>
                            <tr className="border-b border-border">
                                <td className="py-2 pr-4 font-medium">Claim descriptions</td>
                                <td className="py-2 pr-4 text-success font-bold">Built-in for 25+ claims</td>
                                <td className="py-2">Limited</td>
                            </tr>
                            <tr className="border-b border-border">
                                <td className="py-2 pr-4 font-medium">Live expiry countdown</td>
                                <td className="py-2 pr-4 text-success font-bold">Real-time with auto-refresh</td>
                                <td className="py-2">Static timestamp only</td>
                            </tr>
                            <tr className="border-b border-border">
                                <td className="py-2 pr-4 font-medium">Signature verification</td>
                                <td className="py-2 pr-4">HS256 (browser WebCrypto)</td>
                                <td className="py-2">HS256 + RS256</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium">Dark mode</td>
                                <td className="py-2 pr-4 text-success font-bold">Native dark UI</td>
                                <td className="py-2">Light only</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mt-4">
                        Our JWT decoder is designed with a <strong>privacy-first</strong> approach. Your production tokens with sensitive user data, session identifiers, and internal claim structures are never sent to any server. Open your browser&apos;s DevTools Network tab to verify.
                    </p>
                </div>
            ),
        },
        {
            id: 'claims',
            label: 'JWT Claims Reference',
            content: (
                <div>
                    <h2>Standard JWT Claims (RFC 7519)</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-2 pr-4 text-textPrimary">Claim</th>
                                <th className="py-2 pr-4 text-textPrimary">Full Name</th>
                                <th className="py-2 text-textPrimary">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-textSecondary">
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code font-bold">iss</td><td className="py-2 pr-4">Issuer</td><td className="py-2">Identifies who issued the JWT</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code font-bold">sub</td><td className="py-2 pr-4">Subject</td><td className="py-2">Identifies the subject (usually user ID)</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code font-bold">aud</td><td className="py-2 pr-4">Audience</td><td className="py-2">Intended recipients of the token</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code font-bold">exp</td><td className="py-2 pr-4">Expiration</td><td className="py-2">Unix timestamp after which the token is invalid</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code font-bold">nbf</td><td className="py-2 pr-4">Not Before</td><td className="py-2">Token is not valid before this timestamp</td></tr>
                            <tr className="border-b border-border"><td className="py-2 pr-4 font-code font-bold">iat</td><td className="py-2 pr-4">Issued At</td><td className="py-2">Timestamp when the token was created</td></tr>
                            <tr><td className="py-2 pr-4 font-code font-bold">jti</td><td className="py-2 pr-4">JWT ID</td><td className="py-2">Unique identifier to prevent token reuse</td></tr>
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

                    <h3>Can anyone read my JWT payload?</h3>
                    <p>Yes. JWTs are Base64URL-encoded, not encrypted. Anyone with the token can decode and read the payload. The signature only prevents <em>modification</em>, not <em>reading</em>. Never put sensitive data like passwords or API keys in a JWT.</p>

                    <h3>Why can&apos;t I verify RS256 signatures in the browser?</h3>
                    <p>RS256 uses asymmetric cryptography with a public/private key pair. While the WebCrypto API supports RSA, you&apos;d need to import the public key in JWK or PEM format. We currently support HS256 (symmetric HMAC) verification where you just need the shared secret.</p>

                    <h3>What does the expiry countdown show?</h3>
                    <p>It reads the <code>exp</code> claim, converts it from a Unix timestamp to a date, and calculates the time remaining (or time since expiration). The countdown updates every second.</p>

                    <h3>Is my JWT sent to any server?</h3>
                    <p>No. All decoding is done with <code>atob()</code> and <code>JSON.parse()</code> in your browser. Signature verification uses the <code>WebCrypto API</code> built into your browser. Open DevTools &rarr; Network tab to verify — zero requests are made.</p>
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
