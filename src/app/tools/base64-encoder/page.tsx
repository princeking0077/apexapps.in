import { Metadata } from 'next';
import Base64EncoderClient from './components/Base64EncoderClient';
import ToolSeoSection from '@/components/ToolSeoSection';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('base64-encoder')!;

export const metadata: Metadata = {
    title: `${tool.name} — Free Base64 Encode & Decode Online | apexapps.in`,
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

export default function Base64EncoderPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tool.structuredData) }} />
            <Base64EncoderClient />
            <ToolSeoSection slug="base64-encoder" />
        </>
    );
}
