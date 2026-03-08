import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://apexapps.in';

    // Hardcoded list of all tools we've built
    const tools = [
        'css-minifier',
        'base64-encoder',
        'sql-formatter',
        'cron-builder',
        'regex-tester',
        'color-tools',
        'jwt-decoder',
        'timestamp-converter',
        'html-formatter',
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // Add all tools to the sitemap dynamically
    tools.forEach((tool) => {
        sitemapEntries.push({
            url: `${baseUrl}/tools/${tool}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        });
    });

    return sitemapEntries;
}
