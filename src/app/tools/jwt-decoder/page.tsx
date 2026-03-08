import { Metadata } from 'next';
import JwtDecoderClient from './components/JwtDecoderClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('jwt-decoder')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free JWT Token Decoder & Debugger | apexapps.in`,
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

export default function JwtDecoderPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <JwtDecoderClient toolData={{ name: tool.name, type: tool.category, desc: tool.description }} />
            <ToolSeoSection slug="jwt-decoder" />
        </>
    );
}
