import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// For now we'll import a generic ClientToolWrapper that will handle the state 
// and logic for all tools, since ToolPage is a UI wrapper.
// In a real app we'd have specific components for each tool slug.
import ClientToolProvider from './ClientToolProvider';

const TOOL_DATA: Record<string, { name: string; type: string; desc: string }> = {
    'json-formatter': {
        name: 'JSON Formatter & Validator',
        type: 'JSON Formatter',
        desc: 'Format, validate, and minify JSON with advanced syntax highlighting. 100% free and client-side.'
    },
    'css-minifier': {
        name: 'CSS Minifier & Formatter',
        type: 'CSS Minifier',
        desc: 'Minify and format CSS. Compress stylesheets instantly without server uploads.'
    },
    'base64-encoder': {
        name: 'Base64 Encoder / Decoder',
        type: 'Base64 Tool',
        desc: 'Encode strings and files to Base64 or decode Base64 to text flawlessly.'
    },
    'sql-formatter': {
        name: 'SQL Formatter',
        type: 'SQL Formatter',
        desc: 'Beautify ugly SQL statements with proper indentation and syntax highlighting.'
    },
    'cron-builder': {
        name: 'Cron Expression Builder',
        type: 'Cron Tool',
        desc: 'Generate, parse, and translate cron expressions to human-readable schedules.'
    },
    'regex-tester': {
        name: 'Regex Tester',
        type: 'Regex Validator',
        desc: 'Test and debug Regular Expressions in real-time matching.'
    },
    'color-tools': {
        name: 'Color Converter',
        type: 'Color Converter',
        desc: 'Convert exactly between HEX, RGB, HSL, and CMYK with a visual color picker.'
    },
    'jwt-decoder': {
        name: 'JWT Decoder',
        type: 'JWT Tool',
        desc: 'Decode JSON Web Tokens securely in your browser. Paste secrets safely.'
    },
    'timestamp-converter': {
        name: 'Unix Timestamp Converter',
        type: 'Epoch Converter',
        desc: 'Convert epoch timestamps to human-readable dates and vice versa.'
    },
    'html-formatter': {
        name: 'HTML Formatter',
        type: 'HTML Formatter',
        desc: 'Format, indent, and beautify your raw HTML code instantly.'
    }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const tool = TOOL_DATA[params.slug];

    if (!tool) {
        return { title: 'Tool Not Found' };
    }

    return {
        title: `${tool.name} — Free Online ${tool.type} | apexapps.in`,
        description: `${tool.desc} — 100% free, no signup, runs in your browser.`,
        openGraph: {
            title: `${tool.name} | apexapps.in`,
            description: tool.desc,
            type: 'website',
        }
    };
}

export default function ToolPageRoute({ params }: { params: { slug: string } }) {
    const tool = TOOL_DATA[params.slug];

    if (!tool) {
        notFound();
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": tool.name,
                        "applicationCategory": "DeveloperApplication",
                        "operatingSystem": "Any",
                        "description": tool.desc,
                        "browserRequirements": "Requires JavaScript",
                        "softwareVersion": "1.0",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    })
                }}
            />
            <ClientToolProvider slug={params.slug} toolData={tool} />
        </>
    );
}
