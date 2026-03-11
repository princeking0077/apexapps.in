import { Metadata } from 'next';
import TwitterGifClient from './components/TwitterGifClient';
import { getToolBySlug } from '@/data/tools';
import './styles.css';

const tool = getToolBySlug('twitter-gif-downloader')!;

export const metadata: Metadata = {
    title: `Twitter GIF Downloader — Save GIFs from Twitter/X Free | ApexApps`,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
        title: `Twitter GIF Downloader — Save GIFs from Twitter/X Free | ApexApps`,
        description: tool.description,
        type: 'website',
        url: `https://apexapps.in/twitter-gif-downloader`,
        siteName: 'ApexApps',
        images: [
            {
                url: 'https://apexapps.in/og/twitter-gif-downloader.png',
                width: 1200,
                height: 630,
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Twitter GIF Downloader — Free Online Tool | ApexApps`,
        description: `Download GIFs from Twitter/X instantly. Save as MP4 or GIF. Free, no signup.`,
        images: ['https://apexapps.in/og/twitter-gif-downloader.png'],
    },
    alternates: { canonical: `https://apexapps.in/twitter-gif-downloader` },
};

export default function TwitterGifDownloaderPage() {
    return (
        <div className="twitter-gif-container">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "Why are Twitter GIFs downloaded as MP4?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Twitter automatically converts all uploaded GIFs to MP4 video format to reduce file size by up to 10x while maintaining better quality. Our tool extracts this MP4 and optionally converts it back to an animated GIF."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How do I download a GIF from Twitter on iPhone?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Open the tweet on Twitter or X, tap Share and copy the link. Then visit this page, paste the URL, and tap Download. The file saves to your Photos or Files app."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How do I download a GIF from Twitter on Android?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Open the tweet, tap the share or three-dot menu and copy the tweet link. Paste it into this tool and tap Download. The file saves directly to your phone's storage."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is the Twitter GIF Downloader free?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, completely free with no registration, no login, and no download limits. Simply paste a tweet URL and download."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What URLs does the tool support?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "The tool supports all public post URLs from twitter.com and x.com, including mobile.twitter.com links."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Can I download GIFs from private Twitter accounts?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "No. This tool only works with public tweets. Private or protected account content requires user authentication which this tool does not support."
                            }
                        }
                    ]
                })
            }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "HowTo",
                    "name": "How to Download a GIF from Twitter",
                    "description": "Step-by-step guide to downloading GIFs from Twitter or X using ApexApps.",
                    "step": [
                        { "@type": "HowToStep", "position": 1, "name": "Find the tweet", "text": "Open Twitter or X and locate the tweet containing the GIF you want to download." },
                        { "@type": "HowToStep", "position": 2, "name": "Copy the URL", "text": "Click the Share button on the tweet and select Copy Link, or copy the URL from your browser." },
                        { "@type": "HowToStep", "position": 3, "name": "Paste and download", "text": "Paste the tweet URL into the input field on this page and click Download GIF." },
                        { "@type": "HowToStep", "position": 4, "name": "Choose format", "text": "Select MP4 (original quality) or click Convert to GIF for an animated GIF file." }
                    ]
                })
            }} />

            <TwitterGifClient />
        </div>
    );
}
