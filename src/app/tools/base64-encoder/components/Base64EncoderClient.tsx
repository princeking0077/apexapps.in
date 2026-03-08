"use client";

import { useState, useEffect, useCallback } from 'react';
import ToolPage from '@/components/ToolPage';
import { AlertCircle, Image as ImageIcon, FileText, Upload as UploadIcon, Copy, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface Base64EncoderClientProps {
    toolData?: {
        name: string;
        type: string;
        desc: string;
    };
}

export default function Base64EncoderClient({ toolData = { name: 'Base64 Encoder', type: 'Encoder', desc: 'Encode and decode Base64 strings, images, and files instantly in your browser. Supports URL-safe Base64, Unicode, and file downloads. 100% client-side.' } }: Base64EncoderClientProps) {
    // Top Tabs State
    const [activeTab, setActiveTab] = useState<'text' | 'image' | 'file'>('text');

    // Text Tab State
    const [textInput, setTextInput] = useState('');
    const [textOutput, setTextOutput] = useState('');
    const [textMode, setTextMode] = useState<'encode' | 'decode'>('encode');
    const [urlSafe, setUrlSafe] = useState(false);

    // File/Image Tab State
    const [fileUrlPreview, setFileUrlPreview] = useState<string | null>(null);
    const [fileBase64, setFileBase64] = useState<string>('');
    const [fileMime, setFileMime] = useState<string>('');
    const [fileInfo, setFileInfo] = useState<{ name: string, size: number } | null>(null);

    // Global Error State
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Auto-detect Base64 string on paste (Text Tab)
    useEffect(() => {
        if (activeTab !== 'text' || !textInput.trim()) return;

        // Roughly check if it looks like a base64 string
        // Exclude very short strings which could just be regular text
        const isBase64Pattern = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(textInput.trim());
        const isUrlSafeBase64Pattern = /^([A-Za-z0-9-_]{4})*([A-Za-z0-9-_]{3}=|[A-Za-z0-9-_]{2}==)?$/.test(textInput.trim());

        if (textInput.length > 16 && (isBase64Pattern || isUrlSafeBase64Pattern)) {
            // It strongly looks like base64, suggest decode mode if not already there
            if (textMode !== 'decode') {
                // We don't force switch to not annoy users, but we could auto-switch
                // For now, let's auto-switch on large obvious pastes
                setTextMode('decode');
                if (isUrlSafeBase64Pattern && !isBase64Pattern) {
                    setUrlSafe(true);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textInput, activeTab]);

    // Encode / Decode Text Logic
    const processText = useCallback(() => {
        if (!textInput.trim()) {
            setTextOutput('');
            setErrorMsg(null);
            return;
        }

        try {
            setErrorMsg(null);
            if (textMode === 'encode') {
                // Encode: Text -> Base64
                // Use TextEncoder to handle Unicode properly instead of just btoa()
                const encoder = new TextEncoder();
                const bytes = encoder.encode(textInput);
                const binString = String.fromCodePoint(...bytes);
                let encoded = btoa(binString);

                if (urlSafe) {
                    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                }
                setTextOutput(encoded);
            } else {
                // Decode: Base64 -> Text
                let inputToDecode = textInput.trim();

                // If it's URL safe, convert it back to standard for atob()
                if (urlSafe || inputToDecode.includes('-') || inputToDecode.includes('_')) {
                    inputToDecode = inputToDecode.replace(/-/g, '+').replace(/_/g, '/');
                    // Add padding if missing
                    while (inputToDecode.length % 4) {
                        inputToDecode += '=';
                    }
                }

                const binString = atob(inputToDecode);
                const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
                const decoder = new TextDecoder('utf-8');
                const decoded = decoder.decode(bytes);
                setTextOutput(decoded);
            }
        } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
            setTextOutput('');
            setErrorMsg('Invalid Base64 string for decoding.');
        }
    }, [textInput, textMode, urlSafe]);

    // Handle File / Image Uploads
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg(null);
        setFileInfo({ name: file.name, size: file.size });
        setFileMime(file.type);

        // For images, generate a preview URL
        if (activeTab === 'image' && !file.type.startsWith('image/')) {
            setErrorMsg('Please upload a valid image file.');
            setFileBase64('');
            setFileUrlPreview(null);
            return;
        }

        if (activeTab === 'image') {
            const url = URL.createObjectURL(file);
            setFileUrlPreview(url);
        } else {
            setFileUrlPreview(null); // No preview for raw files
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            // result is a data URL formatted as 'data:[<mediatype>][;base64],<data>'
            // Extract just the base64 part
            const base64Content = result.split(',')[1];
            setFileBase64(base64Content);
        };
        reader.onerror = () => {
            setErrorMsg('Failed to read file.');
        };
        reader.readAsDataURL(file);
    };

    const handleClearFile = () => {
        if (fileUrlPreview) URL.revokeObjectURL(fileUrlPreview);
        setFileBase64('');
        setFileUrlPreview(null);
        setFileInfo(null);
        setFileMime('');
        setErrorMsg(null);
        // Reset file input value is tricky in React without ref, but okay for drag-drop
    };

    // Derived variables for UI
    const dataUri = `data:${fileMime || 'application/octet-stream'};base64,${fileBase64}`;
    const cssUrlFormat = `url('data:${fileMime || 'image/png'};base64,${fileBase64}')`;
    const htmlImgFormat = `<img src="data:${fileMime || 'image/png'};base64,${fileBase64}" alt="${fileInfo?.name || 'base64 image'}" />`;

    const getOptionsPanel = () => {
        if (activeTab !== 'text') return null;

        return (
            <>
                <div className="flex flex-col gap-2 col-span-full mb-2">
                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Operation Mode</label>
                    <div className="flex bg-background rounded-lg p-1 border border-border w-full max-w-sm">
                        {(['encode', 'decode'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setTextMode(m); }}
                                className={`flex-1 text-14 font-bold py-2 rounded-md transition-colors capitalize ${textMode === m ? 'bg-accent text-black shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                            >
                                {m} Base64
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Settings</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-14 text-textPrimary">
                            <input
                                type="checkbox"
                                checked={urlSafe}
                                onChange={(e) => setUrlSafe(e.target.checked)}
                                className="accent-accent w-4 h-4 cursor-pointer"
                            />
                            URL-Safe Base64 (-_)
                        </label>
                    </div>
                </div>

                <div className="flex flex-col justify-end">
                    <button
                        onClick={processText}
                        className="w-full py-2.5 bg-surface border border-border hover:border-textSecondary text-textPrimary rounded-lg text-14 font-medium transition-colors"
                    >
                        {textMode === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
                    </button>
                </div>
            </>
        );
    };

    const errorBanner = errorMsg ? (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 text-error shrink-0" />
            <p className="text-13 text-error/90 font-medium">{errorMsg}</p>
        </div>
    ) : null;

    // The entire content rendered inside the ToolPage 'customOutputComponent' area for non-text modes
    const renderNonTextTabs = () => {
        if (activeTab === 'text') return null;

        const isImage = activeTab === 'image';

        return (
            <div className="flex flex-col gap-6 w-full h-full max-w-4xl mx-auto p-4 md:p-8">
                {/* Upload Area */}
                <div className="relative group">
                    <input
                        type="file"
                        accept={isImage ? "image/*" : "*/*"}
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full border-2 border-dashed ${fileBase64 ? 'border-success/50 bg-success/5' : 'border-border group-hover:border-accent group-hover:bg-accent/5'} rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all`}>
                        {fileBase64 ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
                                    <Check className="text-success" size={24} />
                                </div>
                                <h3 className="text-18 font-bold text-textPrimary">{fileInfo?.name} Processed</h3>
                                <p className="text-14 text-textSecondary">{(fileInfo!.size / 1024).toFixed(2)} KB • {fileMime}</p>
                                <button onClick={(e) => { e.preventDefault(); handleClearFile(); }} className="mt-4 text-13 text-error hover:underline relative z-20">Clear and upload another</button>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {isImage ? <ImageIcon className="text-textSecondary group-hover:text-accent" size={28} /> : <FileText className="text-textSecondary group-hover:text-accent" size={28} />}
                                </div>
                                <h3 className="text-18 font-bold text-textPrimary mb-2">
                                    Drop your {isImage ? 'image' : 'file'} here
                                </h3>
                                <p className="text-14 text-textSecondary max-w-sm">
                                    or click anywhere in this box to browse. Files are processed entirely in your browser.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Output Area */}
                {fileBase64 && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        {isImage && fileUrlPreview && (
                            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center">
                                <span className="text-12 font-bold text-textSecondary uppercase tracking-wider self-start mb-4">Image Preview</span>
                                <div className="max-w-full max-h-[300px] overflow-hidden rounded-lg bg-background flex flex-center">
                                    <img src={fileUrlPreview} alt="Preview" className="max-w-full max-h-[300px] object-contain" />
                                </div>
                            </div>
                        )}

                        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-12 font-bold text-textSecondary uppercase tracking-wider">Base64 Output</span>
                                <span className="text-12 text-textMuted font-code">{fileBase64.length.toLocaleString()} chars</span>
                            </div>

                            <textarea
                                readOnly
                                value={fileBase64}
                                className="w-full h-32 bg-background border border-border rounded-lg p-3 font-code text-13 text-textPrimary custom-scrollbar focus:outline-none focus:border-accent transition-colors resize-y"
                            />

                            <div className="flex flex-wrap gap-3 mt-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(fileBase64)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-textPrimary rounded-lg text-14 font-medium transition-colors"
                                >
                                    <Copy size={16} /> Raw Base64
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(dataUri)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-textPrimary rounded-lg text-14 font-medium transition-colors"
                                >
                                    <Copy size={16} /> Base64 Data URI
                                </button>
                                {isImage && (
                                    <>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(cssUrlFormat)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-textPrimary rounded-lg text-14 font-medium transition-colors"
                                        >
                                            <Code size={16} /> CSS url()
                                        </button>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(htmlImgFormat)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-textPrimary rounded-lg text-14 font-medium transition-colors"
                                        >
                                            <Code size={16} /> HTML &lt;img&gt;
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // SEO Copy
    const tabsData = [
        {
            id: 'what-is',
            label: 'What is Base64 Encoding?',
            content: (
                <div>
                    <h2>The Ultimate Online Base64 Encoder & Decoder</h2>
                    <p>
                        Base64 encoding is a widely used method to convert binary data (like images, documents, or raw application data) into an ASCII text format.
                        This ensures that the data remains intact without modification during transport across platforms and protocols that only support text, such as HTTP, SMTP or within JSON payloads.
                    </p>
                    <p>
                        Our **free Base64 tool** provides lightning-fast encoding and decoding securely entirely inside your web browser.
                        Unlike other tools, we do not upload your text or files to a server—protecting your privacy and sensitive information.
                    </p>
                    <h3>URL-Safe Base64 Processing</h3>
                    <p>
                        Standard Base64 contains the characters <code>+</code> and <code>/</code>, which have special meanings in URLs and file systems.
                        Our tool supports **URL-Safe Base64 Encoding** (RFC 4648), which replaces the <code>+</code> with <code>-</code> (minus) and <code>/</code> with <code>_</code> (underscore), while optionally removing the <code>=</code> padding at the end.
                    </p>
                </div>
            )
        },
        {
            id: 'how-to',
            label: 'How to Use',
            content: (
                <div>
                    <h2>How to Encode/Decode Texts & Files</h2>
                    <p>We designed our Base64 utility to handle text, images, and raw files dynamically.</p>
                    <h3>1. Text Strings</h3>
                    <ol>
                        <li>Select the <strong>Text Tab</strong>.</li>
                        <li>Choose your Operation Mode: <strong>Encode</strong> (text-to-base64) or <strong>Decode</strong> (base64-to-text).</li>
                        <li>Paste your text string. <em>(Note: We auto-detect Base64 strings and will gracefully suggest decoding if detected.)</em></li>
                        <li>Toggle <strong>URL-Safe</strong> if you plan to pass this string inside a URL parameter.</li>
                        <li>Click Convert or hit <code>Ctrl + Enter</code>.</li>
                    </ol>
                    <h3>2. Image & File Uploads</h3>
                    <ol>
                        <li>Select the <strong>Image</strong> or <strong>File</strong> tab.</li>
                        <li>Drag and drop your file into the designated upload area.</li>
                        <li>The file is parsed locally via HTML5 FileReaders.</li>
                        <li>Copy the generated code using the quick-actions buttons—we even format it specifically for <strong>CSS `url()`</strong> and <strong>HTML `&lt;img&gt;` src</strong> attributes to save you time!</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions about Base64</h2>

                    <h3>Is Base64 encoding a form of encryption?</h3>
                    <p><strong>No.</strong> Base64 is merely an encoding scheme. It translates data into a different format for transport, but it provides zero security or encryption. Anyone with a Base64 decoder can easily read the original data. Never use Base64 to secure passwords or sensitive secrets.</p>

                    <h3>Does Base64 encoding increase file size?</h3>
                    <p>Yes, encoding binary data into Base64 size increases the payload size by approximately <strong>33%</strong>. This is because Base64 uses 4 ASCII characters to represent every 3 bytes of binary data. Therefore, while embedding Base64 images in CSS saves HTTP requests, it should be reserved for small icons to avoid bloating your stylesheet.</p>

                    <p>What happens to my files when I upload them here?</p>
                    <p>Absolutely nothing leaves your computer. Our tool uses the <code>FileReader API</code> to transform your images or text documents directly inside your web browser&apos;s memory. This makes our site fundamentally more secure than traditional web tools.</p>

                    <h3>How does your tool handle Unicode and emojis?</h3>
                    <p>Unlike basic JavaScript <code>btoa()</code> functions that crash on Unicode characters, our tool uses <code>TextEncoder</code> and <code>TextDecoder</code> buffers to properly serialize and deserialize UTF-8 text, ensuring emojis and foreign languages are flawlessly maintained to spec.</p>
                </div>
            )
        }
    ];

    const Check = ({ size = 24, className }: { size?: number | string, className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
    );

    // Custom Top Navigation for Tabs
    const customHeader = (
        <div className="flex bg-[#131a27] border-b border-border/60 w-full overflow-x-auto custom-scrollbar flex-none">
            {(['text', 'image', 'file'] as const).map(tab => (
                <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setErrorMsg(null); }}
                    className={`flex items-center gap-2 px-6 py-4 font-bold text-14 uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-accent' : 'text-textSecondary hover:text-textPrimary bg-surface/30'}`}
                >
                    {tab === 'text' && <FileText size={18} />}
                    {tab === 'image' && <ImageIcon size={18} />}
                    {tab === 'file' && <UploadIcon size={18} />}
                    {tab}
                    {activeTab === tab && (
                        <motion.div layoutId="base64-active-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_10px_rgba(0,176,255,0.8)]" />
                    )}
                </button>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full">
            {customHeader}

            {activeTab === 'text' ? (
                <ToolPage
                    toolName="Base64 Encoder & Decoder"
                    toolType="Base64 Converter"
                    toolDescription={toolData.desc}
                    inputLanguage="plaintext"
                    outputLanguage="plaintext"
                    input={textInput}
                    output={textOutput}
                    setInput={setTextInput}
                    onConvert={processText}
                    onSwap={() => { setTextInput(textOutput); setTextOutput(''); setTextMode(m => m === 'encode' ? 'decode' : 'encode'); }}
                    isReversible={true}
                    optionsPanel={getOptionsPanel()}
                    tabs={tabsData}
                    errorBanner={errorBanner}
                    customStats={
                        <div className="flex items-center gap-4">
                            <span>{new Blob([textInput]).size} B in</span>
                            <span className="opacity-50">•</span>
                            <span>{new Blob([textOutput]).size} B out</span>
                        </div>
                    }
                />
            ) : (
                <div className="flex-1 overflow-y-auto bg-background custom-scrollbar relative">
                    {/* Reusing ToolPage logic for tabs at the bottom, but custom main body */}
                    <div className="min-h-[60vh]">
                        {errorBanner && (
                            <div className="max-w-4xl mx-auto px-4 pt-6">{errorBanner}</div>
                        )}
                        {renderNonTextTabs()}
                    </div>

                    {/* Render the unified SEO Tabs */}
                    <div className="w-full bg-surface border-t border-border mt-12 pb-24">
                        <div className="max-w-content mx-auto px-6 pt-12">
                            <h2 className="text-24 font-bold text-textPrimary mb-8 font-ui">Learn More</h2>
                            <div className="grid md:grid-cols-12 gap-8">
                                <div className="md:col-span-3 flex flex-col gap-2 relative">
                                    <div className="sticky top-24 flex flex-col gap-2">
                                        {tabsData.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => { }}
                                                className={`text-left px-4 py-3 rounded-lg text-14 font-medium transition-all cursor-default text-accent bg-accent/10`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-9 bg-background border border-border rounded-xl p-8 lg:p-12 mb-12 shadow-sm min-h-[400px]">
                                    <div className="prose prose-invert prose-blue max-w-none">
                                        {/* Since it's outside ToolPage layout for non-text modes, just rendering all content stacked to avoid complexity */}
                                        {tabsData.map(t => (
                                            <div key={t.id} className="mb-12 border-b border-border/50 pb-8 last:border-0">{t.content}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
