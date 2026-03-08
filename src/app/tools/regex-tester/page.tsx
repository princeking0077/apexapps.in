import { Metadata } from 'next';
import RegexTesterClient from './components/RegexTesterClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('regex-tester')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free Online JavaScript Regex Tester | apexapps.in`,
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

export default function RegexTesterPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <RegexTesterClient toolData={{ name: tool.name, type: tool.category, desc: tool.description }} />
            <ToolSeoSection slug="regex-tester" />
        </>
    );
}
