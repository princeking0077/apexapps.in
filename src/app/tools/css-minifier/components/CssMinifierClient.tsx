/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from 'react';
import CleanCSS from '@/lib/clean-css-bundle.js';
import prettier from 'prettier/standalone';
import postcssPlugin from 'prettier/plugins/postcss';
import ToolPage from '@/components/ToolPage';
import { AlertCircle } from 'lucide-react';
import { getToolBySlug } from '@/data/tools';

const tool = getToolBySlug('css-minifier')!;

export default function CssMinifierClient() {
    // Core State
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'Minify' | 'Beautify'>('Minify');

    // Options: Minify
    const [removeComments, setRemoveComments] = useState(true);
    const [mergeMediaQueries, setMergeMediaQueries] = useState(true);
    const [optLevel, setOptLevel] = useState<1 | 2>(1);

    // Options: Beautify
    const [indentOption, setIndentOption] = useState<number | 'tab'>(2);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const processCss = useCallback(async () => {
        if (!input.trim()) {
            setOutput('');
            setErrorMsg(null);
            return;
        }

        try {
            setErrorMsg(null);

            if (mode === 'Minify') {
                // Run CleanCSS
                const cleanCssOptions = {
                    level: {
                        1: {
                            all: optLevel >= 1,
                        },
                        2: {
                            all: optLevel === 2,
                            mergeMedia: mergeMediaQueries,
                        }
                    },
                    format: 'keep-breaks' // Start with a safe default if needed, but normally minify strips everything
                };

                // Dynamic overrides
                if (!removeComments) {
                    (cleanCssOptions as any).format = 'keep-breaks'; // CleanCSS options are tricky, we'll configure via format
                } else {
                    (cleanCssOptions as any).format = false; // full minify
                }

                const minifier = new CleanCSS(cleanCssOptions);
                const result = minifier.minify(input);

                if (result.errors && result.errors.length > 0) {
                    throw new Error(result.errors.join('\\n'));
                }

                setOutput(result.styles);
            } else {
                // Run Prettier CSS
                const formatted = await prettier.format(input, {
                    parser: 'css',
                    plugins: [postcssPlugin],
                    useTabs: indentOption === 'tab',
                    tabWidth: typeof indentOption === 'number' ? indentOption : 2,
                    singleQuote: true,
                });
                setOutput(formatted);
            }
        } catch (e: any) {
            setErrorMsg(e.message || 'An error occurred during CSS processing.');
        }
    }, [input, mode, removeComments, mergeMediaQueries, optLevel, indentOption]);

    const errorBanner = errorMsg ? (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 text-error shrink-0" />
            <div>
                <h4 className="font-bold text-14 text-error mb-1">CSS Parse Error</h4>
                <p className="text-13 text-error/90 font-code whitespace-pre-wrap">{errorMsg}</p>
            </div>
        </div>
    ) : null;

    const originalSize = new Blob([input]).size;
    const formattedSize = new Blob([output]).size;
    const savings = originalSize > 0 && output ? ((originalSize - formattedSize) / originalSize) * 100 : 0;
    const isReduction = savings > 0;

    const renderStats = (
        <div className="flex items-center gap-4 flex-wrap">
            <span>{originalSize > 1024 ? (originalSize / 1024).toFixed(2) + ' KB' : originalSize + ' B'} original</span>
            <span className="opacity-50">•</span>
            <span>{formattedSize > 1024 ? (formattedSize / 1024).toFixed(2) + ' KB' : formattedSize + ' B'} out</span>

            {mode === 'Minify' && isReduction && (
                <>
                    <span className="opacity-50">•</span>
                    <span className="text-success font-bold">Reduced by {savings.toFixed(1)}%</span>
                </>
            )}
        </div>
    );

    const getOptionsPanel = () => (
        <>
            <div className="flex flex-col gap-2 col-span-full mb-2">
                <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Operation Mode</label>
                <div className="flex bg-background rounded-lg p-1 border border-border w-full max-w-sm">
                    {(['Minify', 'Beautify'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); }}
                            className={`flex-1 text-14 font-bold py-2 rounded-md transition-colors ${mode === m ? 'bg-accent text-black shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {mode === 'Minify' ? (
                <>
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Features</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-14 text-textPrimary">
                                <input
                                    type="checkbox"
                                    checked={removeComments}
                                    onChange={(e) => setRemoveComments(e.target.checked)}
                                    className="accent-accent w-4 h-4 cursor-pointer"
                                />
                                Remove Comments
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-14 text-textPrimary">
                                <input
                                    type="checkbox"
                                    checked={mergeMediaQueries}
                                    onChange={(e) => setMergeMediaQueries(e.target.checked)}
                                    className="accent-accent w-4 h-4 cursor-pointer"
                                />
                                Merge Media Queries
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Optimization Level</label>
                        <div className="flex bg-background rounded-lg p-1 border border-border">
                            <button
                                onClick={() => setOptLevel(1)}
                                className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${optLevel === 1 ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                            >
                                1 - Safe
                            </button>
                            <button
                                onClick={() => setOptLevel(2)}
                                className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${optLevel === 2 ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                            >
                                2 - Aggressive
                            </button>
                        </div >
                    </div >
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Indentation</label>
                        <div className="flex bg-background rounded-lg p-1 border border-border">
                            {[2, 4, 'tab'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setIndentOption(opt as any)}
                                    className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${indentOption === opt ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                >
                                    {opt === 'tab' ? 'Tabs' : `${opt} Spaces`}
                                </button>
                            ))}
                        </div>
                    </div >
                </>
            )
            }

            <div className="flex flex-col justify-end">
                <button
                    onClick={processCss}
                    className="w-full py-2.5 bg-surface border border-border hover:border-textSecondary text-textPrimary rounded-lg text-14 font-medium transition-colors"
                >
                    {mode === 'Minify' ? 'Minify CSS' : 'Beautify CSS'}
                </button>
            </div>
        </>
    );

    const tabs = [
        {
            id: 'what-is',
            label: 'What is CSS Minification?',
            content: (
                <div>
                    <h2>Online CSS Minifier & Formatter</h2>
                    <p>
                        CSS (Cascading Style Sheets) is the language used to style web pages. During development, CSS is heavily formatted with spaces, newlines, and comments to be human-readable. However, shipping all this extra whitespace and meta-information to production slows down your website load times and wastes bandwidth.
                    </p>
                    <p>
                        Our <strong>CSS Minifier</strong> strips out all unnecessary characters without changing the functionality of the stylesheets. It utilizes the industry-standard <code>clean-css</code> algorithm running entirely within your browser to instantly compress your code.
                    </p>
                    <h3>Why use our CSS Tool?</h3>
                    <ul>
                        <li><strong>Lightning Fast, 100% Client-Side:</strong> No data is sent to a server. Processing multi-megabyte CSS files happens instantly on your own machine.</li>
                        <li><strong>Two-Way Processing:</strong> You can completely minify your CSS to save bandwidth, or you can switch to <strong>Beautify</strong> mode to un-minify unreadable production CSS back into clean, heavily-indented code for debugging.</li>
                        <li><strong>Advanced Optimizations:</strong> &quot;Aggressive&quot; level minification merges duplicate selectors, reorders properties, and safely merges media queries to squeeze out every byte of savings.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'how-to',
            label: 'How to Minify CSS',
            content: (
                <div>
                    <h2>How to Compress Your CSS</h2>
                    <ol>
                        <li><strong>Select Mode:</strong> At the top of the &apos;Tool Options&apos; panel, choose between <strong>Minify</strong> (for production) or <strong>Beautify</strong> (for development).</li>
                        <li><strong>Input Data:</strong> Paste your CSS directly into the left panel. Alternatively, drag and drop your <code>.css</code> file over the input area.</li>
                        <li><strong>Configure Options:</strong>
                            <ul>
                                <li><strong>Remove Comments:</strong> (Default) Strips out <code>{`/* */`}</code> blocks saving massive amounts of space.</li>
                                <li><strong>Optimization Level 1:</strong> Safe, standard minification. Removes whitespace and comments.</li>
                                <li><strong>Optimization Level 2:</strong> Aggressive. Performs structural optimizations. Use carefully if your CSS relies on specific highly coupled cascade orderings.</li>
                            </ul>
                        </li>
                        <li><strong>Execute:</strong> Click the Convert button (or hit <code>Ctrl + Enter</code>) and your minimized payload will generate on the right.</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'examples',
            label: 'Examples',
            content: (
                <div>
                    <h2>CSS Optimization Examples</h2>
                    <p>Notice how our minifier strips out comments, merges the multiple selectors, and condenses everything to exactly what the browser needs.</p>
                    <h3>Before: Unoptimized CSS</h3>
                    <pre><code className="language-css">{`/* Global App Styles */
.card-container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
}

/* User Avatar */
.card-container {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
    .card-container {
      padding: 12px;
    }
}

@media (max-width: 768px) {
    .text-sm {
        font-size: 14px;
    }
}`}</code></pre>

                    <h3>After: Minified (Aggressive Mode Level 2)</h3>
                    <pre><code>{`.card-container{background-color:#fff;border-radius:8px;padding:16px;margin-bottom:24px;box-shadow:0 4px 6px rgba(0,0,0,.1)}@media (max-width:768px){.card-container{padding:12px}.text-sm{font-size:14px}}`}</code></pre>
                    <p>By merging the duplicated <code>.card-container</code> selectors and the overlapping <code>@media</code> queries, the code shrinks significantly resulting in a smaller network footprint.</p>
                </div>
            )
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions about CSS Minification</h2>

                    <h3>Will minifying CSS change how my website looks?</h3>
                    <p>No. Minification only strips characters that the browser ignores anyway (whitespace, newlines, comments, the last semicolon in a block). The visual cascade and layout rules are completely preserved.</p>

                    <h3>What is Level 2 (Aggressive) Optimization?</h3>
                    <p>Level 2 optimization looks beyond just removing spaces. It attempts to restructure your CSS for efficiency. This involves combining duplicate selectors, merging properties (e.g., turning <code>margin-top: 10px; margin-right: 10px;</code> into <code>margin: 10px 10px 0 0;</code>), and grouping identical media queries.</p>

                    <h3>How do I reverse CSS Minification?</h3>
                    <p>If you lose your original source code and are stuck with a massive single-line <code>style.min.css</code> file, you can paste it into our tool and switch the top toggle to <strong>Beautify</strong> mode. This will parse the single line and intelligently add back standard indentation and multi-line formatting so it becomes readable and editable again.</p>

                    <h3>Why does the output say it &quot;Saved 0 bytes&quot;?</h3>
                    <p>If your input CSS is already completely minified by a build tool (like Webpack, Vite, or PostCSS), our minifier won&apos;t find any additional whitespace or comments to remove.</p>
                </div>
            )
        }
    ];

    return (
        <ToolPage
            toolName={tool.name}
            toolType={tool.category}
            toolDescription={tool.description}
            inputLanguage="css"
            outputLanguage="css"
            input={input}
            output={output}
            setInput={setInput}
            onConvert={processCss}
            onSwap={() => { setInput(output); setOutput(''); }}
            isReversible={true}
            optionsPanel={getOptionsPanel()}
            tabs={tabs}
            errorBanner={errorBanner}
            customStats={renderStats}
        />
    );
}
