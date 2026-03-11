import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Extract tweet ID from any Twitter/X URL
function extractTweetId(url: string): string | null {
    const match = url.match(/(?:twitter\.com|x\.com|mobile\.twitter\.com)\/(?:\w+)\/status\/(\d+)/i);
    return match?.[1] || null;
}

// Run yt-dlp and get JSON metadata about the tweet
// Returns null if no video found, throws for real errors
async function getYtDlpInfo(tweetUrl: string): Promise<any | null> {
    try {
        const { stdout, stderr } = await execAsync(
            `yt-dlp --dump-json --no-playlist --no-warnings "${tweetUrl}"`,
            { timeout: 30000 }
        );
        const out = stdout.trim();
        if (!out) return null;
        return JSON.parse(out);
    } catch (e: any) {
        // exec throws on non-zero exit. Check stderr for "No video" messages
        const errMsg = (e.stderr || e.message || '').toLowerCase();
        if (errMsg.includes('no video') || errMsg.includes('not found') || errMsg.includes('does not exist') || errMsg.includes('parseint')) {
            return null; // treat as no media
        }
        throw e; // real unexpected error
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ message: 'URL is required' }, { status: 400 });
        }

        const tweetId = extractTweetId(url.trim());
        if (!tweetId) {
            return NextResponse.json({ message: 'Invalid Twitter or X URL. Make sure it contains /status/ in the path.' }, { status: 400 });
        }

        const tweetUrl = `https://x.com/i/status/${tweetId}`;

        let info: any;
        try {
            info = await getYtDlpInfo(tweetUrl);
        } catch (e: any) {
            // yt-dlp failed - tweet has no video or is private
            return NextResponse.json({
                media: [],
                message: 'No downloadable media found in this tweet. It may contain only text, or be from a private account.'
            }, { status: 200 });
        }

        const media: any[] = [];

        if (info && info.formats && info.formats.length > 0) {
            // Get all MP4 formats sorted by bitrate (highest first)
            const mp4Formats = (info.formats as any[])
                .filter(f => f.ext === 'mp4' && f.url)
                .sort((a, b) => (b.tbr || b.vbr || 0) - (a.tbr || a.vbr || 0));

            if (mp4Formats.length > 0) {
                const best = mp4Formats[0];
                media.push({
                    type: 'video',
                    width: best.width || info.width || 640,
                    height: best.height || info.height || 360,
                    preview_url: best.url,
                    url: best.url,
                    mp4_url: best.url,
                    variants: mp4Formats.slice(0, 3).map((f: any) => ({
                        url: f.url,
                        width: f.width || 0,
                        height: f.height || 0,
                        bitrate: f.tbr || f.vbr || 0
                    }))
                });
            }
        } else if (info && info.url) {
            // Single URL (common for GIFs)
            media.push({
                type: 'gif',
                width: info.width || 600,
                height: info.height || 338,
                preview_url: info.url,
                url: info.url,
                mp4_url: info.url,
                variants: []
            });
        }

        return NextResponse.json({ media });

    } catch (error: any) {
        console.error('Twitter GIF API Error:', error);
        return NextResponse.json({ message: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
