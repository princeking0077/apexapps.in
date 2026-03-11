import { NextResponse } from 'next/server';

const BEARER_TOKEN = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

async function getGuestToken() {
    const res = await fetch('https://api.twitter.com/1.1/guest/activate.json', {
        method: 'POST',
        headers: { 'Authorization': BEARER_TOKEN }
    });
    if (!res.ok) throw new Error('Failed to fetch guest token');
    const data = await res.json();
    return data.guest_token;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Extract Tweet ID from URL (handles both twitter.com/x.com)
        const match = url.match(/(?:twitter\.com|x\.com|[a-z0-9]+\.twitter\.com)\/(?:[a-zA-Z0-9_]+)\/status\/(\d+)/i);
        if (!match || !match[1]) {
            return NextResponse.json({ error: 'Invalid Twitter or X URL' }, { status: 400 });
        }
        const tweetId = match[1];

        // Authorize with Twitter as a guest
        const guestToken = await getGuestToken();

        const tweetRes = await fetch(`https://api.twitter.com/1.1/statuses/show/${tweetId}.json?tweet_mode=extended`, {
            headers: {
                'Authorization': BEARER_TOKEN,
                'x-guest-token': guestToken
            }
        });

        if (!tweetRes.ok) {
            return NextResponse.json({
                error: 'Failed to fetch tweet. The account might be private or the post was deleted.'
            }, { status: tweetRes.status });
        }

        const tweetData = await tweetRes.json();

        // Locate media from the tweet entity
        const mediaItems = tweetData.extended_entities?.media || [];

        const extractedMedia = mediaItems
            .filter((m: any) => m.type === 'video' || m.type === 'animated_gif')
            .map((vid: any) => {
                const variants = vid.video_info?.variants || [];
                // Sort by highest bitrate to give the best quality MP4
                const mp4s = variants
                    .filter((v: any) => v.content_type === 'video/mp4')
                    .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

                return {
                    type: vid.type,
                    width: vid.sizes?.large?.w || 600,
                    height: vid.sizes?.large?.h || 338,
                    preview_url: vid.media_url_https,
                    url: vid.media_url_https,
                    mp4_url: mp4s.length > 0 ? mp4s[0].url : null
                };
            });

        return NextResponse.json({ media: extractedMedia });
    } catch (error: any) {
        console.error("Twitter GIF Downloader Error:", error);
        return NextResponse.json({ error: 'Failed to process the request. Try again later.' }, { status: 500 });
    }
}
