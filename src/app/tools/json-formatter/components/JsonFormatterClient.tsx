/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { jsonrepair } from 'jsonrepair';
import ToolPage from '@/components/ToolPage';
import JsonTreeView from './JsonTreeView';
import { AlertCircle, Wand2 } from 'lucide-react';

interface JsonFormatterClientProps {
    toolData?: {
        name: string;
        type: string;
        desc: string;
    };
}

export default function JsonFormatterClient({ toolData = { name: 'JSON Formatter', type: 'Formatter', desc: 'Format, validate, and beautify JSON data instantly in your browser. Supports minification, tree view, auto-fix, and sorting. 100% client-side.' } }: JsonFormatterClientProps) {
    // Core Tool State
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [parsedData, setParsedData] = useState<any>(undefined);

    // Options State
    const [indentOption, setIndentOption] = useState<number | 'tab'>(2);
    const [sortKeys, setSortKeys] = useState(false);
    const [escapeUnicode, setEscapeUnicode] = useState(false);
    const [viewMode, setViewMode] = useState<'Code' | 'Tree' | 'Raw'>('Code');

    // Error State
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errorPos, setErrorPos] = useState<{ line: number; col: number } | null>(null);

    // Editor Refs for squiggly lines
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    // Sorting logic (recursive)
    const sortObjectKeys = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sortObjectKeys);

        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = sortObjectKeys(obj[key]);
                return acc;
            }, {} as any);
    };

    // Unicode Escaping logic
    const escapeUnicodeString = (str: string) => {
        return str.replace(/[\u007F-\uFFFF]/g, function (chr) {
            return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substring(-4);
        });
    };

    const processJson = useCallback((action: 'format' | 'minify') => {
        if (!input.trim()) {
            setOutput('');
            setParsedData(undefined);
            setErrorMsg(null);
            setErrorPos(null);
            return;
        }

        try {
            // 1. Parsing
            const parsed = JSON.parse(input);
            let processed = parsed;

            // 2. Clear Errs
            setErrorMsg(null);
            setErrorPos(null);

            // 3. Option: Sort Keys
            if (sortKeys) {
                processed = sortObjectKeys(processed);
            }

            // Save parsed data for Tree View
            setParsedData(processed);

            // 4. Stringify
            const space = action === 'minify' ? 0 : indentOption === 'tab' ? '\t' : indentOption;
            let result = JSON.stringify(processed, null, space as any);

            // 5. Option: Escape Unicode
            if (escapeUnicode) {
                result = escapeUnicodeString(result);
            }

            setOutput(result);

            // Auto-switch to Tree view if it was selected but data was invalid before
            if (viewMode === 'Tree' && parsedData === undefined) {
                // just ensures it renders
            }

        } catch (e: any) {
            // Handle JSON Parse Error
            const msg = e.message;
            setErrorMsg(`Invalid JSON: ${msg}`);

            // Attempt to extract line and column from standard V8 JSON error
            // format: "Unexpected token } in JSON at position 124" 
            // or "Unexpected string in JSON at position 50"
            // or "JSON.parse: expected property name or '}' at line 3 column 2 of the JSON data" (Firefox)

            const posMatch = msg.match(/position (\d+)/);
            if (posMatch && posMatch[1]) {
                const charIdx = parseInt(posMatch[1], 10);
                const upToError = input.substring(0, charIdx);
                const lines = upToError.split('\n');
                setErrorPos({
                    line: lines.length,
                    col: lines[lines.length - 1].length + 1
                });
            } else {
                setErrorPos(null); // Fallback
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, indentOption, sortKeys, escapeUnicode, viewMode, parsedData]);

    // Handle Monaco Markers (Red Squiggly)
    useEffect(() => {
        if (!monacoRef.current || !editorRef.current) return;
        const monaco = monacoRef.current;
        const editor = editorRef.current;
        const model = editor.getModel();

        if (errorPos && errorMsg) {
            monaco.editor.setModelMarkers(model, "json-validator", [
                {
                    startLineNumber: errorPos.line,
                    startColumn: Math.max(1, errorPos.col - 1),
                    endLineNumber: errorPos.line,
                    endColumn: errorPos.col + 1,
                    message: errorMsg,
                    severity: monaco.MarkerSeverity.Error,
                }
            ]);
        } else {
            monaco.editor.setModelMarkers(model, "json-validator", []);
        }
    }, [errorPos, errorMsg]);

    const handleAutoFix = () => {
        try {
            const repaired = jsonrepair(input);
            setInput(repaired);
            setErrorMsg(null);
            setErrorPos(null);
            // Let the natural React cycle or user hit format again
        } catch (e: any) {
            setErrorMsg(`Auto-fix failed: ${e.message}. Manual repair needed.`);
        }
    };

    const handleMountInput = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    // SEO Content Tabs
    const tabs = [
        {
            id: 'what-is',
            label: 'What is JSON Formatting?',
            content: (
                <div>
                    <h2>The Ultimate Free Online JSON Formatter & Validator</h2>
                    <p>
                        Welcome to the most secure, privacy-first <strong>online JSON formatter and validator</strong>.
                        Whether you are a developer debugging API responses, or a data analyst organizing complex payloads,
                        our tool helps you instantly format, minify, and validate JSON data right in your browser.
                    </p>
                    <p>
                        JSON (JavaScript Object Notation) is a lightweight, human-readable data-interchange format. However,
                        machine-generated JSON is often minified into a single, unreadable line of code to save space. Our
                        <strong>free JSON beautifier</strong> takes that raw data and adds proper indentation, line breaks,
                        and syntax highlighting, making it incredibly easy to inspect and debug.
                    </p>
                    <h3>100% Client-Side Processing for Maximum Security</h3>
                    <p>
                        When dealing with sensitive data like API keys, JWT tokens, or proprietary database exports, privacy is critical.
                        Unlike many other online JSON tools that transmit your data to backend servers, causing potential security breaches,
                        our <strong>JSON parser</strong> utilizes advanced browser technologies (like Web Workers and local string manipulation)
                        to format your code entirely on your own machine.
                    </p>
                    <p>
                        <strong>Your data never leaves your browser.</strong> You can even turn off your internet connection, and our tool will still function flawlessly!
                    </p>
                    <h3>Key Features of Our JSON Editor</h3>
                    <ul>
                        <li><strong>Syntax Highlighting & Validation:</strong> Pinpoint exact line numbers and columns where your JSON is broken. We catch missing commas, unescaped characters, and invalid types.</li>
                        <li><strong>Auto-Fix Engine:</strong> Our intelligent repair tool automatically fixes common syntax errors like trailing commas, missing quotes, single quotes, and concatenated strings.</li>
                        <li><strong>Interactive Tree View:</strong> Visualize deeply nested JSON structures using a collapsible tree diagram. Perfect for exploring massive objects and arrays.</li>
                        <li><strong>JSON Minifier:</strong> Instantly compress your JSON payloads to reduce file size before sending over the network or storing in a database.</li>
                        <li><strong>Alphabetical Key Sorting:</strong> Sort your JSON object keys alphabetically (recursively) for easier visual comparison and version control diffs.</li>
                        <li><strong>Monaco Editor Integration:</strong> Powered by the same editor that runs Visual Studio Code, giving you desktop-grade performance, searching, and keyboard shortcuts.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'how-to',
            label: 'How to Formatter JSON',
            content: (
                <div>
                    <h2>How to Format and Verify JSON Data</h2>
                    <p>Using our JSON tool is incredibly simple and highly efficient. Follow these steps to beautify or minify your code:</p>
                    <ol>
                        <li><strong>Input Data:</strong> Paste your raw, minified, or broken JSON string into the <strong>Input</strong> panel on the left. Alternatively, you can click the upload icon or drag-and-drop a <code>.json</code> file directly into the editor.</li>
                        <li><strong>Select Indentation:</strong> Under &apos;Tool Options&apos;, choose your preferred formatting style: 2 Spaces (standard), 4 Spaces, or Tabs.</li>
                        <li><strong>Format:</strong> Click the large blue <strong>Convert</strong> button located between the editors. You can also use the <code>Ctrl + Enter</code> keyboard shortcut.</li>
                        <li><strong>Validate &amp; Fix:</strong> If your JSON is invalid, a red error banner will appear indicating the exact position of the syntax error. The editor will underline the issue in red. Click <strong>Auto-Fix</strong> to let our system attempt an automatic repair.</li>
                        <li><strong>Export:</strong> Once beautifully formatted in the <strong>Output</strong> pane, click &apos;Copy&apos; to copy it to your clipboard, or hit the download icon to save it locally as an exported text file.</li>
                    </ol>
                    <h3>Using the Minifier</h3>
                    <p>If you need to compress JSON for production deployment, simply click the <strong>Minify JSON</strong> button in the options panel. This will strip all unnecessary whitespace, comments, and line breaks, producing the smallest possible byte size.</p>
                </div>
            )
        },
        {
            id: 'examples',
            label: 'Examples',
            content: (
                <div>
                    <h2>JSON Formatting Examples</h2>
                    <p>Here are examples demonstrating how our tool transforms raw data.</p>
                    <h3>Before: Minified JSON Input</h3>
                    <pre><code>{`{"status":"success","data":{"id":101,"user":{"name":"John Doe","roles":["admin","editor"],"isActive":true},"metadata":"tags-to-be-sorted"},"timestamp":1689241029}`}</code></pre>

                    <h3>After: Formatted & Beautified (2 Spaces)</h3>
                    <pre><code>{`{
  "status": "success",
  "data": {
    "id": 101,
    "user": {
      "name": "John Doe",
      "roles": [
        "admin",
        "editor"
      ],
      "isActive": true
    },
    "metadata": "tags-to-be-sorted"
  },
  "timestamp": 1689241029
}`}</code></pre>
                    <h3>Common Errors Fixed by Auto-Fix</h3>
                    <p>Our tool can magically repair slightly broken JSON files that typically cause standard <code>JSON.parse()</code> methods to crash:</p>
                    <ul>
                        <li><strong>Trailing Commas:</strong> <code>{`{"name": "John",}`}</code> becomes <code>{`{"name": "John"}`}</code></li>
                        <li><strong>Single Quotes:</strong> <code>{`{'name': 'John'}`}</code> becomes <code>{`{"name": "John"}`}</code></li>
                        <li><strong>Unquoted Keys:</strong> <code>{`{name: "John"}`}</code> becomes <code>{`{"name": "John"}`}</code></li>
                        <li><strong>Comments:</strong> Strips JavaScript-style <code>{`//`}</code> and <code>{`/* */`}</code> comments from the payload.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions about JSON</h2>

                    <h3>Is this JSON beautifier completely secure?</h3>
                    <p><strong>Yes, 100%.</strong> Our tool processes all JSON formatting, minification, and validation exclusively within your local web browser. We do not use backend servers to parse data, meaning your sensitive API keys, user data, or corporate secrets remain completely private and secure.</p>

                    <h3>How does the JSON Auto-fix engine work?</h3>
                    <p>When you input invalid JSON, our system utilizes a robust repair algorithm. The Auto-fix engine scans for common JSON syntax errors—such as trailing commas, missing quotes, single quotes instead of double quotes, and even concatenated strings—and attempts to automatically rebuild the structure so it adheres strictly to the RFC 8259 JSON specification.</p>

                    <h3>What does &quot;Escape Unicode&quot; do in the options?</h3>
                    <p>When the &quot;Escape Unicode&quot; setting is enabled, all non-ASCII characters (such as emojis or accented foreign letters) are safely converted into their hexadecimal Unicode escape sequence (e.g., <code>\\u00e9</code>). This feature is essential when passing JSON payloads to legacy backend systems or specific encodings that require strict ASCII formatting to prevent data corruption.</p>

                    <h3>Can I process large JSON files?</h3>
                    <p>Yes. Because the processing is done client-side and relies on the highly optimized Monaco Editor, you can comfortably format and explore multi-megabyte JSON files. The interactive <strong>Tree View</strong> mode is specifically designed to help navigate massive, deeply nested API responses without crashing your browser.</p>

                    <h3>What is the difference between JSON and JavaScript Objects?</h3>
                    <p>While JSON is derived from JavaScript, it is a strict text format. In JSON, all keys must be enclosed in double quotes, functions are not allowed, and it cannot contain trailing commas. Standard JavaScript objects are much more flexible, allowing unquoted keys and methods. Our <strong>JSON Validator</strong> enforces strict JSON rules while our <strong>Auto-Fix</strong> tool bridges the gap by converting loosely written JavaScript structures into rigid JSON text.</p>
                </div>
            )
        }
    ];

    const getOptionsPanel = () => (
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
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Features</label>
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-14 text-textPrimary">
                        <input
                            type="checkbox"
                            checked={sortKeys}
                            onChange={(e) => setSortKeys(e.target.checked)}
                            className="accent-accent w-4 h-4 cursor-pointer"
                        />
                        Sort Keys (A-Z)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-14 text-textPrimary">
                        <input
                            type="checkbox"
                            checked={escapeUnicode}
                            onChange={(e) => setEscapeUnicode(e.target.checked)}
                            className="accent-accent w-4 h-4 cursor-pointer"
                        />
                        Escape Unicode
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">View Mode</label>
                <div className="flex bg-background rounded-lg p-1 border border-border">
                    {['Code', 'Tree', 'Raw'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${viewMode === mode ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col justify-end">
                <button
                    onClick={() => processJson('minify')}
                    className="w-full py-2.5 bg-surface border border-border hover:border-textSecondary text-textPrimary rounded-lg text-14 font-medium transition-colors"
                >
                    Minify JSON
                </button>
            </div>
        </>
    );

    const errorBanner = errorMsg ? (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3 text-error">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                    <h4 className="font-bold text-14 mb-1">Syntax Error</h4>
                    <p className="text-13 opacity-90 font-code">{errorMsg}</p>
                </div>
            </div>
            <button
                onClick={handleAutoFix}
                className="flex items-center gap-2 px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error rounded-md text-12 font-bold transition-colors shrink-0"
            >
                <Wand2 size={14} /> Auto-Fix
            </button>
        </div>
    ) : null;

    const originalSize = new Blob([input]).size;
    const formattedSize = new Blob([output]).size;
    const keysCount = parsedData ? Object.keys(parsedData).length : 0; // naive top-level count

    // Quick recursive depth checker
    const getDepth = (obj: any): number => {
        if (obj === null || typeof obj !== 'object') return 0;
        let depth = 0;
        for (const key in obj) {
            depth = Math.max(depth, getDepth((obj as any)[key]));
        }
        return depth + 1;
    };
    const depthCount = parsedData ? getDepth(parsedData) : 0;

    const renderStats = (
        <div className="flex items-center gap-4 flex-wrap">
            <span>{originalSize > 1024 ? (originalSize / 1024).toFixed(2) + ' KB' : originalSize + ' B'} original</span>
            <span className="opacity-50">•</span>
            <span>{formattedSize > 1024 ? (formattedSize / 1024).toFixed(2) + ' KB' : formattedSize + ' B'} out</span>
            {parsedData && (
                <>
                    <span className="opacity-50">•</span>
                    <span>{keysCount} top keys</span>
                    <span className="opacity-50">•</span>
                    <span>Depth {depthCount}</span>
                </>
            )}
        </div>
    );

    return (
        <ToolPage
            toolName="JSON Formatter & Validator"
            toolType="JSON Formatter"
            toolDescription={toolData.desc}
            inputLanguage="json"
            outputLanguage={viewMode === 'Raw' ? 'plaintext' : 'json'}
            input={input}
            output={output}
            setInput={setInput}
            onConvert={() => processJson('format')}
            onSwap={() => { setInput(output); setOutput(''); }}
            isReversible={true}
            optionsPanel={getOptionsPanel()}
            tabs={tabs}
            onMountInput={handleMountInput}
            errorBanner={errorBanner}
            customStats={renderStats}
            customOutputComponent={
                viewMode === 'Tree' ? (
                    parsedData !== undefined ? <JsonTreeView data={parsedData} /> : <div className="p-6 text-textMuted text-14 flex items-center justify-center h-full">Format valid JSON to view tree structure.</div>
                ) : undefined
            }
        />
    );
}
