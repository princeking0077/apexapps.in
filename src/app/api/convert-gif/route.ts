import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // Note: Converting MP4 to GIF requires FFMPEG on the server.
    // In a serverless/Edge environment, this process is either disabled 
    // or requires an external API service like CloudConvert.
    // We explicitly fail here to let the frontend know conversion is disabled.
    return NextResponse.json({ error: 'GIF conversion is temporarily disabled due to high server load. Please download as MP4.' }, { status: 501 });
}
