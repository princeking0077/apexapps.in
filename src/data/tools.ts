export type ToolCategory = 'Formatter' | 'Encoder' | 'Converter' | 'Validator' | 'Builder' | 'Downloader';

export interface Tool {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    category: ToolCategory;
    icon: string;
    keywords: string[];
    searchVolume: number;
    isPopular?: boolean;
    isNew?: boolean;
    relatedTools: string[];
    structuredData: object;
}

export const tools: Tool[] = [
    {
        id: 'json-formatter',
        slug: 'json-formatter',
        name: 'JSON Formatter',
        tagline: 'Format, validate & minify JSON instantly',
        description: 'Free online JSON formatter and validator. Beautify, minify, and validate JSON data with syntax highlighting. 100% client-side — your data never leaves your browser.',
        category: 'Formatter',
        icon: '{ }',
        keywords: [
            'json formatter',
            'json beautifier',
            'json validator',
            'format json online',
            'json pretty print',
            'json minifier',
            'json formatter online free',
            'validate json',
            'json formatter india',
            'jsonformatter alternative'
        ],
        searchVolume: 2328000,
        isPopular: true,
        relatedTools: ['html-formatter', 'sql-formatter', 'css-minifier'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'JSON Formatter & Validator',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online JSON formatter, beautifier and validator. Format and validate JSON instantly in your browser.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/json-formatter'
        }
    },
    {
        id: 'base64-encoder',
        slug: 'base64-encoder',
        name: 'Base64 Encoder / Decoder',
        tagline: 'Encode and decode Base64 strings instantly',
        description: 'Free online Base64 encoder and decoder. Encode text, images and files to Base64 or decode Base64 strings back to their original format. URL-safe mode supported.',
        category: 'Encoder',
        icon: '64',
        keywords: [
            'base64 encoder',
            'base64 decoder',
            'base64 encode online',
            'decode base64',
            'base64 encode image',
            'base64 string',
            'base64 encode text',
            'url safe base64',
            'base64 decode online free',
            'base64 to file'
        ],
        searchVolume: 1294000,
        isPopular: true,
        relatedTools: ['jwt-decoder', 'json-formatter'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Base64 Encoder & Decoder',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online Base64 encoder and decoder. Encode or decode Base64 strings, images and files entirely in your browser.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/base64-encoder'
        }
    },
    {
        id: 'css-minifier',
        slug: 'css-minifier',
        name: 'CSS Minifier',
        tagline: 'Minify and beautify CSS online — free',
        description: 'Free online CSS minifier and beautifier. Compress CSS files, remove comments and whitespace, or expand minified CSS into readable code. Powered by clean-css.',
        category: 'Formatter',
        icon: '#',
        keywords: [
            'css minifier',
            'minify css',
            'css beautifier',
            'css formatter',
            'compress css online',
            'minify css online free',
            'css minifier online',
            'css compressor',
            'css cleaner online',
            'optimize css file size'
        ],
        searchVolume: 1191000,
        isPopular: true,
        relatedTools: ['html-formatter', 'json-formatter', 'sql-formatter'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'CSS Minifier & Beautifier',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online CSS minifier and beautifier. Compress stylesheets without server uploads — runs 100% in your browser.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/css-minifier'
        }
    },
    {
        id: 'sql-formatter',
        slug: 'sql-formatter',
        name: 'SQL Formatter',
        tagline: 'Format and beautify SQL queries instantly',
        description: 'Free online SQL formatter for MySQL, PostgreSQL, SQLite and more. Beautify complex queries, indent nested statements and make your SQL human-readable.',
        category: 'Formatter',
        icon: 'DB',
        keywords: [
            'sql formatter',
            'sql beautifier',
            'format sql online',
            'sql pretty print',
            'mysql formatter',
            'postgresql formatter',
            'sql formatter online free',
            'sql query formatter',
            'sql minifier',
            'online sql editor free'
        ],
        searchVolume: 1157000,
        isPopular: true,
        relatedTools: ['json-formatter', 'html-formatter', 'css-minifier'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'SQL Formatter & Beautifier',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online SQL formatter supporting MySQL, PostgreSQL, SQLite. Format complex queries instantly — no server, no signup.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/sql-formatter'
        }
    },
    {
        id: 'jwt-decoder',
        slug: 'jwt-decoder',
        name: 'JWT Decoder',
        tagline: 'Decode and inspect JWT tokens securely',
        description: 'Free online JWT token decoder and debugger. Instantly decode and inspect JWT header, payload and signature. No data sent to any server — 100% client-side.',
        category: 'Encoder',
        icon: '🔑',
        keywords: [
            'jwt decoder',
            'decode jwt',
            'jwt debugger',
            'jwt token decoder',
            'parse jwt token',
            'jwt.io alternative',
            'jwt viewer online',
            'decode jwt payload',
            'jwt token expiry checker',
            'jwt decode without secret'
        ],
        searchVolume: 502000,
        relatedTools: ['base64-encoder', 'json-formatter'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'JWT Token Decoder',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free JWT decoder and debugger. Decode JWT header, payload and verify signature. Unlike jwt.io — fully client-side, zero data exposure.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/jwt-decoder'
        }
    },
    {
        id: 'timestamp-converter',
        slug: 'timestamp-converter',
        name: 'Timestamp Converter',
        tagline: 'Convert Unix timestamps to human dates',
        description: 'Free Unix timestamp converter. Convert epoch timestamps to readable dates, convert dates to Unix time, and view the current timestamp in multiple timezones including IST.',
        category: 'Converter',
        icon: '⏱',
        keywords: [
            'unix timestamp',
            'epoch converter',
            'timestamp to date',
            'unix timestamp converter',
            'convert unix timestamp',
            'epoch to date',
            'current unix time',
            'milliseconds to date',
            'batch timestamp converter',
            'timestamp converter india'
        ],
        searchVolume: 995000,
        relatedTools: ['json-formatter', 'cron-builder'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Unix Timestamp Converter',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online Unix timestamp converter. Convert epoch to date, date to epoch, supports milliseconds, IST timezone and batch conversion.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/timestamp-converter'
        }
    },
    {
        id: 'color-tools',
        slug: 'color-tools',
        name: 'Color Tools',
        tagline: 'Convert HEX, RGB, HSL — pick & contrast',
        description: 'Free online color converter and picker. Convert HEX to RGB, RGB to HSL, check WCAG contrast ratios, generate tints and shades, and build accessible color palettes.',
        category: 'Converter',
        icon: '🎨',
        keywords: [
            'hex to rgb',
            'rgb to hex',
            'color picker online',
            'hex color picker',
            'rgb to hsl',
            'wcag contrast checker',
            'color contrast checker',
            'hex to rgba',
            'tint and shade generator',
            'color palette from image'
        ],
        searchVolume: 2310000,
        isPopular: true,
        relatedTools: ['css-minifier', 'html-formatter'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Color Tools — HEX RGB HSL Converter',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online color tools: HEX to RGB, RGB to HSL converter, WCAG contrast checker, color picker and shade generator.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/color-tools'
        }
    },
    {
        id: 'cron-builder',
        slug: 'cron-builder',
        name: 'Cron Expression Builder',
        tagline: 'Build cron schedules with plain English',
        description: 'Free online cron expression builder and validator. Create cron schedules visually, translate cron syntax to plain English, and test AWS EventBridge, Kubernetes and GitHub Actions cron jobs.',
        category: 'Builder',
        icon: '🕐',
        keywords: [
            'cron expression',
            'cron job syntax',
            'crontab generator',
            'cron every 5 minutes',
            'cron expression builder',
            'cron schedule generator',
            'aws eventbridge cron',
            'kubernetes cronjob syntax',
            'github actions cron',
            'crontab.guru alternative'
        ],
        searchVolume: 602000,
        relatedTools: ['timestamp-converter', 'regex-tester'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Cron Expression Builder & Generator',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free cron expression builder. Create and validate cron schedules for Linux, AWS EventBridge, Kubernetes and GitHub Actions.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/cron-builder'
        }
    },
    {
        id: 'regex-tester',
        slug: 'regex-tester',
        name: 'Regex Tester',
        tagline: 'Test and debug regular expressions live',
        description: 'Free online regex tester with real-time highlighting. Test JavaScript regular expressions, see match groups, get plain English explanations, and debug complex patterns instantly.',
        category: 'Validator',
        icon: '.*',
        keywords: [
            'regex tester',
            'regex test online',
            'online regex',
            'regex checker',
            'regex tester javascript',
            'regex tester for beginners',
            'simple regex tester',
            'explain regex',
            'regex visualizer online',
            'test regex pattern'
        ],
        searchVolume: 475000,
        relatedTools: ['json-formatter', 'cron-builder'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Regex Tester — JavaScript Regex Online',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online regex tester for JavaScript. Real-time highlighting, match groups, plain English explanations and beginner-friendly interface.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/regex-tester'
        }
    },
    {
        id: 'html-formatter',
        slug: 'html-formatter',
        name: 'HTML Formatter',
        tagline: 'Beautify, minify and preview HTML online',
        description: 'Free online HTML formatter and beautifier with live preview. Format messy HTML, minify for production, and preview rendered output side-by-side. HTML email formatter included.',
        category: 'Formatter',
        icon: '</>',
        keywords: [
            'html viewer',
            'html formatter',
            'html beautifier',
            'format html online',
            'html pretty print',
            'html editor online',
            'html minifier',
            'html preview online',
            'html formatter with preview',
            'html email formatter'
        ],
        searchVolume: 1263000,
        relatedTools: ['css-minifier', 'json-formatter', 'sql-formatter'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'HTML Formatter & Beautifier',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: 'Free online HTML formatter with live preview. Format, minify and preview HTML. HTML email formatter included.',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: '1.0',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://apexapps.in/tools/html-formatter'
        }
    },
    {
        id: 'twitter-gif-downloader',
        slug: 'twitter-gif-downloader',
        name: 'Twitter GIF Downloader',
        tagline: 'Save GIFs from Twitter/X as MP4 or GIF Free',
        description: 'Download GIFs from Twitter and X instantly. Save as MP4 or convert to animated GIF format. Free online Twitter GIF downloader — no login required. Works on Android, iPhone, and desktop.',
        category: 'Downloader',
        icon: '⬇️',
        keywords: [
            'twitter gif downloader',
            'download gif from twitter',
            'x gif downloader',
            'save gif from twitter',
            'twitter gif to mp4',
            'download gif from tweet',
            'twitter gif saver'
        ],
        searchVolume: 550000,
        isNew: true,
        relatedTools: [],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Twitter GIF Downloader',
            url: 'https://apexapps.in/twitter-gif-downloader',
            description: 'Free online tool to download GIFs from Twitter and X posts. Save as MP4 or convert to animated GIF format. No login required.',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web Browser',
            browserRequirements: 'Requires JavaScript',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
            },
            author: {
                '@type': 'Organization',
                name: 'ApexApps',
                url: 'https://apexapps.in'
            },
            featureList: [
                'Download GIFs from Twitter and X',
                'Save as MP4 or GIF format',
                'No login required',
                'Free to use',
                'Works on mobile and desktop'
            ]
        }
    }
];

export const getToolBySlug = (slug: string): Tool | undefined =>
    tools.find((tool) => tool.slug === slug);

export const getToolsByCategory = (category: ToolCategory): Tool[] =>
    tools.filter((tool) => tool.category === category);

export const getRelatedTools = (slug: string): Tool[] => {
    const tool = getToolBySlug(slug);
    if (!tool) return [];
    return tool.relatedTools
        .map((relSlug) => getToolBySlug(relSlug))
        .filter((t): t is Tool => t !== undefined);
};
