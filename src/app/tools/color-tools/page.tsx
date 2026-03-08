import { Metadata } from 'next';
import ColorToolsClient from './components/ColorToolsClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('color-tools')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free HEX RGB HSL WCAG Color Converter | apexapps.in`,
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

export default function ColorToolsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <ColorToolsClient toolData={{ name: tool.name, type: tool.category, desc: tool.description }} />
            <ToolSeoSection slug="color-tools" />
        </>
    );
}
