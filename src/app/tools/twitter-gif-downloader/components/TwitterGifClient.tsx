"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';

const API_ENDPOINT = "/api/twitter-gif";

function isValidTweetUrl(url: string) {
    try {
        const u = new URL(url.trim());
        const hosts = [
            "twitter.com",
            "www.twitter.com",
            "x.com",
            "www.x.com",
            "mobile.twitter.com",
        ];
        return hosts.includes(u.hostname) && /\/status\/\d+/.test(u.pathname);
    } catch {
        return false;
    }
}

export default function TwitterGifClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [convertingIdx, setConvertingIdx] = useState<number | null>(null);
    const [successIdx, setSuccessIdx] = useState<number | null>(null);

    useEffect(() => {
        const revealObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e, i) => {
                    if (e.isIntersecting) {
                        (e.target as HTMLElement).style.transitionDelay = `${(i % 3) * 0.07}s`;
                        e.target.classList.add("visible");
                        revealObs.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.08 }
        );

        document.querySelectorAll(".tw-reveal").forEach((el) => revealObs.observe(el));
        return () => revealObs.disconnect();
    }, [mediaItems]); // Re-run when media items change so results can animate

    const handleDownload = async () => {
        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            setError("Please paste a Twitter or X post URL first.");
            setMediaItems([]);
            return;
        }
        if (!isValidTweetUrl(trimmedUrl)) {
            setError(
                'That doesn\'t look like a valid Twitter or X post URL. Make sure it includes "/status/" in the path. Example: https://x.com/user/status/1234567890'
            );
            setMediaItems([]);
            return;
        }

        setLoading(true);
        setError("");
        setMediaItems([]);

        try {
            const resp = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: trimmedUrl }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.message || "Server error. Please try again.");
            }

            const data = await resp.json();

            if (!data.media || data.media.length === 0) {
                setError(
                    "No downloadable GIFs or media found in this tweet. The post may contain only text, or it may be from a private account."
                );
                return;
            }

            setMediaItems(data.media);
        } catch (err: any) {
            if (err.name === "TypeError" || String(err.message).includes("Failed to fetch")) {
                // Network error — show demo UI in development if intended
                setError("");
                setMediaItems([{ type: "demo", width: 600, height: 338 }]);
            } else {
                setError(err.message || "Something went wrong. Please try again in a moment.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleDownload();
        }
    };

    const convertToGif = async (mp4Url: string, idx: number) => {
        setConvertingIdx(idx);
        try {
            const resp = await fetch("/api/convert-gif", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mp4_url: mp4Url }),
            });
            if (!resp.ok) throw new Error("Conversion failed");
            const blob = await resp.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "twitter-gif-apexapps.gif";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setSuccessIdx(idx);
            setTimeout(() => setSuccessIdx(null), 3000);
        } catch {
            alert("Conversion failed. Please try downloading as MP4.");
        } finally {
            setConvertingIdx(null);
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <main id="main-content">
            <header className="tw-hero" role="banner">
                <div className="tw-container">
                    <nav className="tw-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">ApexApps</Link>
                        <span aria-hidden="true">›</span>
                        <Link href="/tools">Tools</Link>
                        <span aria-hidden="true">›</span>
                        <span aria-current="page">Twitter GIF Downloader</span>
                    </nav>

                    <div className="tw-hero__badge" aria-label="Tool status">
                        Free Online Tool
                    </div>

                    <h1 className="tw-hero__title">
                        Twitter <span>GIF Downloader</span>
                    </h1>

                    <p className="tw-hero__subtitle">
                        Download GIFs from any Twitter or X post instantly. Save as{" "}
                        <strong style={{ color: "var(--txt)" }}>MP4</strong> or convert to
                        animated <strong style={{ color: "var(--txt)" }}>GIF</strong> format
                        — completely free, no sign-up needed.
                    </p>

                    <div className="tw-hero__pills" role="list" aria-label="Tool features">
                        {[
                            "No login required",
                            "100% Free",
                            "MP4 + GIF formats",
                            "Works on mobile",
                            "Public posts only",
                        ].map((text, i) => (
                            <div className="tw-pill" role="listitem" key={i}>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    aria-hidden="true"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {text}
                            </div>
                        ))}
                    </div>

                    {/* TOOL CARD */}
                    <div className="tw-tool-card" role="main">
                        <label htmlFor="tweet-url" className="sr-only">
                            Tweet or X post URL
                        </label>
                        <div className="tw-input-group">
                            <input
                                type="url"
                                id="tweet-url"
                                name="tweet-url"
                                placeholder="Paste Twitter or X post URL… e.g. https://x.com/user/status/..."
                                autoComplete="off"
                                spellCheck="false"
                                aria-label="Twitter or X post URL"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="tw-btn"
                                onClick={handleDownload}
                                disabled={loading}
                                aria-label="Download GIF from this tweet"
                            >
                                {loading ? (
                                    <>
                                        <span className="tw-spinner" aria-hidden="true"></span>{" "}
                                        Fetching…
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            aria-hidden="true"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download GIF
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="tw-tool-hint">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Supports twitter.com and x.com URLs &nbsp;·&nbsp; Public posts only
                        </p>

                        {/* Result area */}
                        <div className="tw-result" aria-live="polite" aria-atomic="true">
                            {loading && (
                                <div className="tw-status-bar" role="status" aria-live="polite">
                                    <span className="tw-spinner" aria-hidden="true"></span>
                                    <span>Analysing tweet and extracting media…</span>
                                </div>
                            )}

                            {error && (
                                <div className="tw-error-box" role="alert" aria-live="assertive">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        aria-hidden="true"
                                        style={{ flexShrink: 0, marginTop: 1 }}
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {mediaItems.length > 0 && !loading && !error && (
                                <>
                                    {mediaItems[0].type === "demo" ? (
                                        <>
                                            <div
                                                style={{
                                                    background: "rgba(245,166,35,0.08)",
                                                    border: "1px solid rgba(245,166,35,0.25)",
                                                    borderRadius: "8px",
                                                    padding: "14px 16px",
                                                    fontSize: "0.83rem",
                                                    color: "var(--yellow)",
                                                    marginBottom: "16px",
                                                }}
                                                role="status"
                                            >
                                                ⚠ Demo mode — Connect your backend API at{" "}
                                                <code
                                                    style={{
                                                        fontFamily: "var(--font-jetbrains-mono)",
                                                        background: "rgba(255,255,255,0.08)",
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    /api/twitter-gif
                                                </code>{" "}
                                                to enable downloads.
                                            </div>
                                            <div className="tw-result-grid" role="list">
                                                <div className="tw-media-card" role="listitem">
                                                    <div
                                                        className="tw-media-card__preview"
                                                        style={{
                                                            background:
                                                                "linear-gradient(135deg,var(--surface2),var(--surface))",
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "2rem" }} aria-hidden="true">
                                                            🎬
                                                        </span>
                                                    </div>
                                                    <div className="tw-media-card__info">
                                                        <span className="tw-media-card__type">GIF/MP4</span>
                                                        <p className="tw-media-card__dim">600 × 338 px</p>
                                                        <div className="tw-media-card__actions">
                                                            <button className="tw-btn" disabled>
                                                                Download MP4
                                                            </button>
                                                            <button className="tw-btn tw-btn--ghost" disabled>
                                                                Convert to GIF
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    marginBottom: "14px",
                                                    fontSize: "0.85rem",
                                                    color: "var(--green)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                                role="status"
                                                aria-live="polite"
                                            >
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    aria-hidden="true"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Found {mediaItems.length} file{mediaItems.length !== 1 ? "s" : ""}{" "}
                                                — choose your download format below
                                            </div>
                                            <div className="tw-result-grid" role="list" aria-label="Downloadable media">
                                                {mediaItems.map((item, i) => (
                                                    <div className="tw-media-card" role="listitem" aria-label={`Media item ${i + 1}`} key={i}>
                                                        <div className="tw-media-card__preview">
                                                            {item.type === "video" || item.type === "gif" ? (
                                                                <video
                                                                    src={item.preview_url || item.mp4_url}
                                                                    autoPlay
                                                                    muted
                                                                    loop
                                                                    playsInline
                                                                    preload="metadata"
                                                                    aria-label="GIF preview"
                                                                ></video>
                                                            ) : (
                                                                <img
                                                                    src={item.url}
                                                                    alt="Media from tweet"
                                                                    loading="lazy"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="tw-media-card__info">
                                                            <span className="tw-media-card__type">
                                                                {item.type === "gif" ? "GIF/MP4" : item.type.toUpperCase()}
                                                            </span>
                                                            <p className="tw-media-card__dim">
                                                                {item.width || "—"} × {item.height || "—"} px
                                                            </p>
                                                            <div className="tw-media-card__actions">
                                                                <a
                                                                    href={item.mp4_url || item.url}
                                                                    download
                                                                    className="tw-btn"
                                                                    aria-label="Download as MP4"
                                                                >
                                                                    <svg
                                                                        width="13"
                                                                        height="13"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2.5"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                        <polyline points="7 10 12 15 17 10" />
                                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                                    </svg>
                                                                    Download MP4
                                                                </a>
                                                                {item.mp4_url && (
                                                                    <button
                                                                        className={`tw-btn ${successIdx === i ? 'tw-btn--green' : 'tw-btn--ghost'}`}
                                                                        onClick={() => convertToGif(item.mp4_url, i)}
                                                                        disabled={convertingIdx === i}
                                                                        aria-label="Convert to GIF and download"
                                                                    >
                                                                        {successIdx === i ? (
                                                                            "✓ Downloaded!"
                                                                        ) : convertingIdx === i ? (
                                                                            "Converting…"
                                                                        ) : (
                                                                            <>
                                                                                <svg
                                                                                    width="13"
                                                                                    height="13"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2.5"
                                                                                    aria-hidden="true"
                                                                                >
                                                                                    <path d="M1 4v6h6" />
                                                                                    <path d="M23 20v-6h-6" />
                                                                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                                                                                </svg>
                                                                                Convert to GIF
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Supported formats */}
                    <div
                        className="tw-formats-bar tw-mt-24"
                        role="list"
                        aria-label="Supported output formats"
                    >
                        <div className="tw-fmt-chip tw-fmt-chip--active" role="listitem">
                            <span className="tw-fmt-dot tw-fmt-dot--blue"></span>MP4
                        </div>
                        <div className="tw-fmt-chip tw-fmt-chip--active" role="listitem">
                            <span className="tw-fmt-dot tw-fmt-dot--green"></span>GIF
                        </div>
                        <div className="tw-fmt-chip" role="listitem">
                            <span className="tw-fmt-dot tw-fmt-dot--yellow"></span>JPEG/JFIF
                        </div>
                        <div className="tw-fmt-chip" role="listitem">
                            <span className="tw-fmt-dot tw-fmt-dot--yellow"></span>PNG
                        </div>
                        <div className="tw-fmt-chip" role="listitem">
                            <span className="tw-fmt-dot tw-fmt-dot--yellow"></span>WebP
                        </div>
                    </div>
                </div>
            </header>

            <div className="tw-container">
                {/* HOW TO USE */}
                <section aria-labelledby="how-to-heading">
                    <div className="tw-reveal">
                        <p className="tw-section-label" aria-hidden="true">
                            Step-by-step guide
                        </p>
                        <h2 className="tw-section-title" id="how-to-heading">
                            How to Download GIFs from Twitter
                        </h2>
                        <p className="tw-section-desc">
                            Follow these four simple steps to save any GIF or animation from
                            Twitter or X to your device in seconds.
                        </p>
                    </div>

                    <div className="tw-steps tw-reveal" role="list">
                        <article className="tw-step" role="listitem">
                            <span className="tw-step__num" aria-hidden="true">
                                01
                            </span>
                            <h3 className="tw-step__title">Find the Tweet</h3>
                            <p className="tw-step__desc">
                                Open Twitter or X and find the tweet that contains the GIF or
                                animation you want to download. GIFs appear as looping videos in
                                your feed.
                            </p>
                        </article>
                        <article className="tw-step" role="listitem">
                            <span className="tw-step__num" aria-hidden="true">
                                02
                            </span>
                            <h3 className="tw-step__title">Copy the URL</h3>
                            <p className="tw-step__desc">
                                Tap the Share icon on the tweet and select{" "}
                                <strong>&quot;Copy link&quot;</strong> — or copy the URL
                                directly from your browser&apos;s address bar. Both twitter.com
                                and x.com URLs work.
                            </p>
                        </article>
                        <article className="tw-step" role="listitem">
                            <span className="tw-step__num" aria-hidden="true">
                                03
                            </span>
                            <h3 className="tw-step__title">Paste &amp; Download</h3>
                            <p className="tw-step__desc">
                                Paste the tweet URL into the input field at the top of this page
                                and click <strong>&quot;Download GIF.&quot;</strong> The tool
                                will instantly fetch the media from Twitter&apos;s servers.
                            </p>
                        </article>
                        <article className="tw-step" role="listitem">
                            <span className="tw-step__num" aria-hidden="true">
                                04
                            </span>
                            <h3 className="tw-step__title">Choose Format</h3>
                            <p className="tw-step__desc">
                                Preview the media with its exact dimensions. Click{" "}
                                <strong>Download MP4</strong> for the original file, or{" "}
                                <strong>Convert to GIF</strong> to save it as a true animated
                                GIF.
                            </p>
                        </article>
                    </div>
                </section>

                {/* FEATURES */}
                <section aria-labelledby="features-heading">
                    <div className="tw-reveal">
                        <p className="tw-section-label" aria-hidden="true">
                            Why use this tool
                        </p>
                        <h2 className="tw-section-title" id="features-heading">
                            Everything You Need to Save Twitter GIFs
                        </h2>
                        <p className="tw-section-desc">
                            The ApexApps Twitter GIF Downloader is built for speed, quality,
                            and simplicity. No bloat, no tricks — just fast, reliable
                            downloads.
                        </p>
                    </div>

                    <div className="tw-features-grid tw-reveal">
                        {[
                            {
                                icon: "⚡",
                                title: "Instant Downloads",
                                desc: "No processing delays or queues. GIFs and videos download in seconds directly from Twitter's CDN at full original quality.",
                            },
                            {
                                icon: "🎯",
                                title: "Original Quality",
                                desc: "We always fetch the highest-resolution version available from Twitter's servers — never recompressed or degraded.",
                            },
                            {
                                icon: "🔄",
                                title: "MP4 ↔ GIF Conversion",
                                desc: "Download as MP4 (Twitter's native format, best quality) or convert back to a true animated .gif file — your choice.",
                            },
                            {
                                icon: "📐",
                                title: "Dimension Preview",
                                desc: "See the exact pixel dimensions (width × height) of every file before you download, so you always know what you're getting.",
                            },
                            {
                                icon: "📱",
                                title: "Mobile Friendly",
                                desc: "Fully optimized for Android and iPhone. Works entirely in your browser — no app installation required.",
                            },
                            {
                                icon: "🔐",
                                title: "No Login Required",
                                desc: "Zero registration, zero accounts, zero tracking. Paste a URL and download. Your privacy is respected — we store nothing.",
                            },
                        ].map((feature, i) => (
                            <article className="tw-feature-card" key={i}>
                                <div className="tw-feature-card__icon" aria-hidden="true">
                                    {feature.icon}
                                </div>
                                <h3 className="tw-feature-card__title">{feature.title}</h3>
                                <p className="tw-feature-card__desc">{feature.desc}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* UNDERSTANDING TWITTER MEDIA */}
                <section aria-labelledby="formats-heading">
                    <div className="tw-reveal">
                        <p className="tw-section-label" aria-hidden="true">
                            Technical explanation
                        </p>
                        <h2 className="tw-section-title" id="formats-heading">
                            Why Twitter GIFs Are Actually MP4 Videos
                        </h2>
                        <p className="tw-section-desc">
                            If you&apos;ve ever wondered why right-clicking a GIF on Twitter
                            doesn&apos;t save it as a .gif file — here&apos;s the full
                            explanation.
                        </p>
                    </div>

                    <div className="tw-reveal tw-mt-24">
                        <p
                            style={{
                                color: "var(--txt2)",
                                lineHeight: 1.85,
                                fontSize: "0.95rem",
                            }}
                        >
                            When you upload a GIF to Twitter or X, the platform{" "}
                            <strong style={{ color: "var(--txt)" }}>
                                automatically converts it to MP4 video format
                            </strong>{" "}
                            behind the scenes. This is not a bug — it&apos;s deliberate
                            optimization. An MP4 file can be{" "}
                            <strong style={{ color: "var(--txt)" }}>
                                up to 10 times smaller
                            </strong>{" "}
                            than the equivalent GIF while offering better color depth and
                            smoother playback at the same visual quality. This is why you
                            cannot simply right-click and save a GIF from Twitter — there is
                            no .gif file on Twitter&apos;s servers. There is only a looping MP4
                            video disguised as a GIF.
                        </p>
                        <p
                            style={{
                                color: "var(--txt2)",
                                lineHeight: 1.85,
                                fontSize: "0.95rem",
                                marginTop: "14px",
                            }}
                        >
                            Our Twitter GIF Downloader extracts this MP4 directly from
                            Twitter&apos;s CDN. You can keep it as MP4 (recommended — best
                            quality, smallest size, works everywhere) or use our built-in
                            converter to transform it back into a true animated .gif file for
                            platforms that specifically require that format.
                        </p>
                    </div>

                    <div className="tw-format-grid tw-reveal">
                        <div className="tw-format-card tw-format-card--accent" role="article">
                            <div>
                                <span className="tw-format-card__tag tw-format-card__tag--mp4">
                                    MP4
                                </span>
                            </div>
                            <h3 className="tw-format-card__title">MP4 — Recommended Format</h3>
                            <p className="tw-format-card__desc">
                                Twitter&apos;s native storage format. Delivers the best quality at
                                the smallest file size.
                            </p>
                            <ul aria-label="MP4 use cases">
                                <li>✓ Share on WhatsApp, Telegram, Discord</li>
                                <li>✓ Best for saving to your device</li>
                                <li>✓ Embed in websites as looping video</li>
                                <li>✓ Up to 10× smaller than GIF</li>
                            </ul>
                        </div>
                        <div className="tw-format-card" role="article">
                            <div>
                                <span className="tw-format-card__tag tw-format-card__tag--gif">
                                    GIF
                                </span>
                            </div>
                            <h3 className="tw-format-card__title">GIF — Converted Format</h3>
                            <p className="tw-format-card__desc">
                                True animated GIF file, converted from MP4. Larger file size
                                but universally supported.
                            </p>
                            <ul aria-label="GIF use cases">
                                <li>✓ Platforms requiring .gif files</li>
                                <li>✓ Reaction image collections</li>
                                <li>✓ Email clients that block video</li>
                                <li>✓ Older CMS or blog platforms</li>
                            </ul>
                        </div>
                    </div>

                    <div className="tw-reveal tw-mt-32">
                        <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "12px" }}>
                            Supported URL Formats
                        </h3>
                        <div className="tw-formats-bar" role="list" aria-label="Supported URL types">
                            <div className="tw-fmt-chip tw-fmt-chip--active" role="listitem">
                                <span className="tw-fmt-dot tw-fmt-dot--blue"></span>
                                twitter.com/…/status/…
                            </div>
                            <div className="tw-fmt-chip tw-fmt-chip--active" role="listitem">
                                <span className="tw-fmt-dot tw-fmt-dot--blue"></span>
                                x.com/…/status/…
                            </div>
                            <div className="tw-fmt-chip tw-fmt-chip--active" role="listitem">
                                <span className="tw-fmt-dot tw-fmt-dot--blue"></span>
                                mobile.twitter.com/…
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section aria-labelledby="faq-heading">
                    <div className="tw-reveal">
                        <p className="tw-section-label" aria-hidden="true">
                            Frequently asked questions
                        </p>
                        <h2 className="tw-section-title" id="faq-heading">
                            Everything You Need to Know
                        </h2>
                        <p className="tw-section-desc">
                            Answers to the most common questions about downloading GIFs from
                            Twitter and X.
                        </p>
                    </div>

                    <div className="tw-faq-list tw-reveal" role="list" aria-label="FAQ list">
                        {[
                            {
                                q: "Why are Twitter GIFs downloaded as MP4?",
                                a: "Twitter automatically converts all uploaded GIFs to MP4 video format to reduce file size by up to 10× while maintaining better quality and smoother playback. When you see an animated GIF playing on Twitter, you are actually watching a looping MP4 video. Our tool extracts this MP4 file from Twitter's CDN. If you need a true .gif file, you can use the built-in conversion option.",
                            },
                            {
                                q: "How do I download a GIF from Twitter on iPhone?",
                                a: (
                                    <>
                                        Open Twitter or X on your iPhone, find the tweet with the GIF, and
                                        tap the <strong>Share button</strong>. Select &quot;Copy
                                        Link.&quot; Then open this page in Safari, paste the URL into the
                                        input field, and tap <strong>Download GIF.</strong> The file will
                                        be saved to your Photos app (for video) or Files app (for GIF
                                        format).
                                    </>
                                ),
                            },
                            {
                                q: "How do I download a GIF from Twitter on Android?",
                                a: (
                                    <>
                                        Open the tweet on the Twitter or X app, tap the{" "}
                                        <strong>three-dot menu (⋯)</strong> or the Share icon, then select
                                        &quot;Copy link to post.&quot; Open this page in Chrome or any
                                        browser, paste the URL, and tap <strong>Download GIF.</strong> The
                                        file will save directly to your phone&apos;s Downloads folder.
                                    </>
                                ),
                            },
                            {
                                q: "Is the ApexApps Twitter GIF Downloader free?",
                                a: "Yes — completely free with no registration, no login, and no download limits. Simply paste any public tweet URL and download. There are no hidden fees, no premium tiers, and no watermarks on downloaded files.",
                            },
                            {
                                q: "Can I download GIFs from private or protected Twitter accounts?",
                                a: (
                                    <>
                                        No. This tool works only with <strong>public tweets and posts.</strong>{" "}
                                        Content from private or protected Twitter/X accounts requires user
                                        authentication, which this tool does not support and will not
                                        attempt to bypass. Always respect content creators&apos; privacy
                                        settings.
                                    </>
                                ),
                            },
                            {
                                q: "What is the difference between MP4 and GIF download?",
                                a: (
                                    <>
                                        <strong>MP4</strong> is Twitter&apos;s native format — it produces smaller
                                        files with better color quality and is compatible with all devices,
                                        messaging apps, and media players. <strong>GIF</strong> is the
                                        traditional animated image format — larger file size, but required by
                                        some older platforms or tools. We recommend MP4 for general use and
                                        GIF only when a specific platform demands it.
                                    </>
                                ),
                            },
                            {
                                q: "Does this tool store or share my data?",
                                a: "No. ApexApps does not store the URLs you submit, the media files fetched, or any personal information. The tool processes your request and returns the download link directly. We do not cache or retain media on our servers.",
                            },
                            {
                                q: "Does the tool work with x.com URLs?",
                                a: (
                                    <>
                                        Yes. The tool fully supports both <strong>twitter.com</strong> and{" "}
                                        <strong>x.com</strong> post URLs, as well as mobile.twitter.com links. Simply
                                        paste any public post URL in the supported formats and the tool will
                                        process it automatically.
                                    </>
                                ),
                            },
                        ].map((faq, i) => (
                            <div
                                className={`tw-faq-item ${openFaq === i ? "open" : ""}`}
                                role="listitem"
                                key={i}
                            >
                                <button
                                    className="tw-faq-q"
                                    onClick={() => toggleFaq(i)}
                                    aria-expanded={openFaq === i}
                                    aria-controls={`faq-${i}`}
                                >
                                    {faq.q}
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        aria-hidden="true"
                                    >
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                                <div className="tw-faq-a" id={`faq-${i}`} role="region">
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
