import { Metadata } from 'next';
import TimestampConverterClient from './components/TimestampConverterClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('timestamp-converter')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free Unix Epoch to Date Converter | apexapps.in`,
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

export default function TimestampConverterPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <TimestampConverterClient toolData={{ name: tool.name, type: tool.category, desc: tool.description }} />
            <ToolSeoSection slug="timestamp-converter" />
        </>
    );
}
