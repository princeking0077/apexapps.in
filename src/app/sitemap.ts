import { MetadataRoute } from 'next';
import { tools } from '@/data/tools';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://apexapps.in';

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
        // Handle special case for twitter-gif-downloader which might be at root
        const isRootTool = tool.slug === 'twitter-gif-downloader';
        const urlStr = isRootTool ? `${baseUrl}/${tool.slug}` : `${baseUrl}/tools/${tool.slug}`;

        sitemapEntries.push({
            url: urlStr,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        });
    });

    return sitemapEntries;
}
