import { Metadata } from 'next';
import HtmlFormatterClient from './components/HtmlFormatterClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('html-formatter')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free HTML Beautifier with Live Preview | apexapps.in`,
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

export default function HtmlFormatterPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <HtmlFormatterClient toolData={{ name: tool.name, type: tool.category, desc: tool.description }} />
            <ToolSeoSection slug="html-formatter" />
        </>
    );
}
