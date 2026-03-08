import { Metadata } from 'next';
import JsonFormatterClient from './components/JsonFormatterClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('json-formatter')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free Online JSON Beautifier & Validator | apexapps.in`,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
        title: `${tool.name} | apexapps.in`,
        description: tool.description,
        type: 'website',
        url: `https://apexapps.in/tools/${tool.slug}`,
    },
    alternates: { canonical: `https://apexapps.in/tools/${tool.slug}` },
};

export default function JsonFormatterPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <JsonFormatterClient />
            <ToolSeoSection slug="json-formatter" />
        </>
    );
}
