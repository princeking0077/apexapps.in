import { Metadata } from 'next';
import CssMinifierClient from './components/CssMinifierClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('css-minifier')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free Online CSS Minifier & Beautifier | apexapps.in`,
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

export default function CssMinifierPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <CssMinifierClient />
            <ToolSeoSection slug="css-minifier" />
        </>
    );
}
