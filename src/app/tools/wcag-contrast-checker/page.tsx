import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'WCAG Contrast Checker — Free Online Accessibility Tool | apexapps.in',
    description: 'Check WCAG 2.1 contrast ratios for text and background colors. See AA/AAA pass/fail results with color suggestions.',
    openGraph: {
        title: 'WCAG Contrast Checker | apexapps.in',
        description: 'Check WCAG 2.1 contrast ratios for text and background colors.',
        type: 'website',
    }
};

export default function WcagContrastCheckerPage() {
    redirect('/tools/color-tools#contrast');
}
