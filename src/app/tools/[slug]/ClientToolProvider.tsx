"use client";

import { useState } from 'react';
import ToolPage from '@/components/ToolPage';

interface ClientToolProviderProps {
    slug: string;
    toolData: {
        name: string;
        type: string;
        desc: string;
    };
}

export default function ClientToolProvider({ slug, toolData }: ClientToolProviderProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    // This is a naive generic handler.
    // In a real implementation we would conditionally call specific logic
    // depending on the tool slug.
    const handleConvert = () => {
        try {
            if (slug === 'json-formatter') {
                const parsed = JSON.parse(input);
                setOutput(JSON.stringify(parsed, null, 2));
            } else {
                setOutput(`Logic for ${slug} is not implemented yet.\nInput received:\n${input}`);
            }
        } catch (e) {
            setOutput(`Error processing ${toolData.name}:\n${(e as Error).message}`);
        }
    };

    const handleSwap = () => {
        setInput(output);
        setOutput('');
    };

    // SEO Content mapped by slug
    const getTabs = () => {
        return [
            {
                id: 'what-is',
                label: `What is ${toolData.type}?`,
                content: (
                    <div>
                        <h2>About {toolData.name}</h2>
                        <p>{toolData.desc}</p>
                        <p>Our tools are completely free, execute entirely within your browser via JavaScript, and ensure zero data is ever uploaded to a server.</p>
                    </div>
                )
            },
            {
                id: 'how-to',
                label: 'How to Use',
                content: (
                    <div>
                        <h2>How to use the {toolData.type}</h2>
                        <ol>
                            <li>Paste your code or text into the <strong>Input</strong> editor on the left.</li>
                            <li>Configure any necessary tool options (if available).</li>
                            <li>Click the large <strong>Convert</strong> button (or press Ctrl+Enter).</li>
                            <li>Copy or download your formatted results from the <strong>Output</strong> editor.</li>
                        </ol>
                    </div>
                )
            }
        ];
    };

    return (
        <ToolPage
            toolName={toolData.name}
            toolType={toolData.type}
            toolDescription={toolData.desc}
            inputLanguage={slug.includes('json') ? 'json' : slug.includes('css') ? 'css' : slug.includes('sql') ? 'sql' : slug.includes('html') ? 'html' : 'plaintext'}
            outputLanguage={slug.includes('json') ? 'json' : slug.includes('css') ? 'css' : slug.includes('sql') ? 'sql' : slug.includes('html') ? 'html' : 'plaintext'}
            input={input}
            output={output}
            setInput={setInput}
            onConvert={handleConvert}
            onSwap={handleSwap}
            isReversible={true}
            tabs={getTabs()}
        />
    );
}
