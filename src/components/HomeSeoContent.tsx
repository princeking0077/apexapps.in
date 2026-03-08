export default function HomeSeoContent() {
    return (
        <section className="w-full py-24 bg-surface2/30 border-t border-border/50 text-textSecondary overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 space-y-20">

                {/* Section 1: Introduction & Mission */}
                <div className="space-y-6">
                    <h2 className="text-[32px] md:text-[40px] font-extrabold text-textPrimary tracking-tight">
                        The Essential Developer Toolkit
                    </h2>
                    <div className="space-y-4 text-16 md:text-18 leading-relaxed">
                        <p>
                            Modern software development is complex enough without having to constantly battle poorly formatted data,
                            inscrutable configuration strings, or cryptic tokens. At <strong>ApexApps.in</strong>, our mission is to provide
                            software engineers, web developers, and system administrators with a comprehensive, frictionless suite
                            of absolutely free developer tools. From untangling massive JSON payloads to decoding secure JWT authentication
                            headers, we supply the utilities you need to maintain your daily development velocity.
                        </p>
                        <p>
                            Unlike the multitude of online formatting utilities that bombard you with pop-up advertisements,
                            throttle your usage behind premium subscription paywalls, or secretly harvest the proprietary code you
                            paste into their editors, our toolkit is engineered with a radically different philosophy.
                            We believe that developer tooling should be instantly accessible, aggressively fast, and uncompromising
                            when it comes to data privacy.
                        </p>
                    </div>
                </div>

                {/* Section 2: Technical Architecture & Privacy */}
                <div className="space-y-6">
                    <h2 className="text-[28px] md:text-[36px] font-bold text-textPrimary tracking-tight">
                        Why Client-Side Execution is Critical
                    </h2>
                    <div className="space-y-4 text-16 leading-relaxed">
                        <p>
                            Data security is the most significant hurdle when utilizing online development wrappers.
                            Every single day, well-intentioned developers accidentally leak staging database credentials,
                            proprietary algorithms, or active user API keys by pasting JSON objects or SQL queries into
                            unverified, server-side formatting websites.
                        </p>
                        <p>
                            ApexApps eliminates this vulnerability entirely through strict <strong>Client-Side Execution</strong>.
                            When you utilize our core utilities—whether it is the CSS Minifier, the Base64 Converter,
                            or the SQL Formatter—your data never actually leaves your computer. We do not transmit your
                            code to a backend server for computation, nor do we employ logging middleware. Instead,
                            we leverage the immense horsepower of your computer's local JavaScript V8 engine (the exact
                            same technology that powers Google Chrome and Node.js) to parse and format your code directly
                            within your active browser tab.
                        </p>
                        <p>
                            This architecture guarantees zero network latency. A 5-megabyte minified JSON file that might
                            take 15 seconds to upload, process, and download on a traditional formatting website is
                            beautified here in mere milliseconds.
                        </p>
                    </div>
                </div>

                {/* Section 3: Core Competencies */}
                <div className="space-y-6">
                    <h2 className="text-[28px] md:text-[36px] font-bold text-textPrimary tracking-tight">
                        Solving Real Engineering Roadblocks
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="bg-surface border border-border/50 p-6 rounded-2xl hover:border-accent/30 transition-colors">
                            <h3 className="text-18 font-bold text-textPrimary mb-3">Data Serialization</h3>
                            <p className="text-15 leading-relaxed">
                                Seamlessly format and validate your markup and object notation. Our <strong>JSON Formatter</strong> and <strong>HTML Formatter</strong> utilize robust tree-parsing algorithms to indent nested loops cleanly, while instantly flagging structural syntax errors so you don't break production builds.
                            </p>
                        </div>
                        <div className="bg-surface border border-border/50 p-6 rounded-2xl hover:border-accent/30 transition-colors">
                            <h3 className="text-18 font-bold text-textPrimary mb-3">Security & Cryptography</h3>
                            <p className="text-15 leading-relaxed">
                                Handle OAuth workflows securely. The <strong>JWT Decoder</strong> tears down three-part token architecture locally to verify claims and validate expiration timestamps without risking token interception.
                            </p>
                        </div>
                        <div className="bg-surface border border-border/50 p-6 rounded-2xl hover:border-accent/30 transition-colors">
                            <h3 className="text-18 font-bold text-textPrimary mb-3">Frontend Optimization</h3>
                            <p className="text-15 leading-relaxed">
                                Compress your stylesheets with the <strong>CSS Minifier</strong> to drastically improve your Time to First Byte (TTFB). Convert massive image assets directly into inline strings using the <strong>Base64 Encoder</strong> to minimize costly HTTP network requests.
                            </p>
                        </div>
                        <div className="bg-surface border border-border/50 p-6 rounded-2xl hover:border-accent/30 transition-colors">
                            <h3 className="text-18 font-bold text-textPrimary mb-3">Infrastructure Automation</h3>
                            <p className="text-15 leading-relaxed">
                                Stop guessing what `0 0 * * *` means. Our Visual <strong>Cron Builder</strong> translates archaic UNIX scheduling syntax into plain English, while the <strong>Timestamp Converter</strong> manages the complex translation between raw Linux epoch seconds and localized human timezones.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 4: Global FAQ for the Homepage */}
                <div className="space-y-8 pt-8 border-t border-border/40">
                    <h2 className="text-[28px] md:text-[36px] font-bold text-textPrimary tracking-tight text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-surface/30 p-6 rounded-2xl border border-border/30">
                            <h3 className="text-18 font-bold text-textPrimary mb-2">Are these tools really 100% free?</h3>
                            <p className="text-15 leading-relaxed">
                                Yes. Every single utility on apexapps.in is completely unbound by paywalls.
                                We sustain server hosting costs cleanly through unobtrusive, contextual Google AdSense advertisements.
                                There are no premium subscription tiers, no "freemium" daily limits, and you will never be asked to input a credit card.
                            </p>
                        </div>
                        <div className="bg-surface/30 p-6 rounded-2xl border border-border/30">
                            <h3 className="text-18 font-bold text-textPrimary mb-2">How can I be certain my code isn't being logged?</h3>
                            <p className="text-15 leading-relaxed">
                                We encourage skeptical engineering. Simply open your browser's Developer Tools (F12 on Chrome),
                                navigate to the Network tab, and execute a code formatting action on any of our tools.
                                You will observe that zero HTTP POST requests are fired. The entire data transformation happens via JavaScript encapsulated within the DOM.
                            </p>
                        </div>
                        <div className="bg-surface/30 p-6 rounded-2xl border border-border/30">
                            <h3 className="text-18 font-bold text-textPrimary mb-2">Can these tools handle massive payload files?</h3>
                            <p className="text-15 leading-relaxed">
                                Yes. Because we utilize highly optimized frontend rendering engines (such as the Monaco Editor core that powers VS Code),
                                the tools are remarkably resilient. You can effortlessly paste multi-megabyte JSON arrays or 50,000-line minified CSS files
                                into the editors without freezing your active Chrome tab.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
