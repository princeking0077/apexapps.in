"use client";

import { useState, useCallback, useMemo } from 'react';
import { format } from 'sql-formatter';
import ToolPage from '@/components/ToolPage';
import { AlertCircle, Database, GitMerge, Layers, Table2 } from 'lucide-react';

type Dialect = 'mysql' | 'postgresql' | 'sqlite' | 'transactsql' | 'plsql';
type KeywordCase = 'upper' | 'lower' | 'preserve';
type IndentStyle = '2' | '4' | 'tab';
type CommaPosition = 'trailing' | 'leading';

const DIALECT_OPTIONS: { value: Dialect; label: string }[] = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'transactsql', label: 'SQL Server' },
    { value: 'plsql', label: 'Oracle' },
];

const KEYWORD_CASE_OPTIONS: { value: KeywordCase; label: string }[] = [
    { value: 'upper', label: 'UPPERCASE' },
    { value: 'lower', label: 'lowercase' },
    { value: 'preserve', label: 'Preserve' },
];

interface SqlFormatterClientProps {
    toolData?: {
        name: string;
        type: string;
        desc: string;
    };
}

function analyzeQuery(sql: string) {
    if (!sql.trim()) return null;

    const upper = sql.toUpperCase();

    // Count JOINs (LEFT JOIN, RIGHT JOIN, INNER JOIN, OUTER JOIN, CROSS JOIN, JOIN)
    const joinMatches = upper.match(/\b(LEFT\s+|RIGHT\s+|INNER\s+|OUTER\s+|FULL\s+|CROSS\s+|NATURAL\s+)*JOIN\b/g);
    const joinCount = joinMatches ? joinMatches.length : 0;

    // Count subqueries — count opening parens followed by SELECT
    const subqueryMatches = upper.match(/\(\s*SELECT\b/g);
    const subqueryCount = subqueryMatches ? subqueryMatches.length : 0;

    // Extract table names from FROM and JOIN clauses
    const tables = new Set<string>();

    // Match FROM table patterns (handling schema.table, aliases, etc.)
    const fromRegex = /\bFROM\s+([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)?)/gi;
    let match;
    while ((match = fromRegex.exec(sql)) !== null) {
        const tableName = match[1].split('.').pop()!;
        if (!isReservedWord(tableName)) tables.add(tableName.toLowerCase());
    }

    // Match JOIN table patterns
    const joinRegex = /\bJOIN\s+([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)?)/gi;
    while ((match = joinRegex.exec(sql)) !== null) {
        const tableName = match[1].split('.').pop()!;
        if (!isReservedWord(tableName)) tables.add(tableName.toLowerCase());
    }

    // Match INSERT INTO, UPDATE, DELETE FROM
    const dmlRegex = /\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)?)/gi;
    while ((match = dmlRegex.exec(sql)) !== null) {
        const tableName = match[1].split('.').pop()!;
        if (!isReservedWord(tableName)) tables.add(tableName.toLowerCase());
    }

    return {
        joinCount,
        subqueryCount,
        tableCount: tables.size,
    };
}

function isReservedWord(word: string): boolean {
    const reserved = new Set([
        'select', 'from', 'where', 'join', 'inner', 'left', 'right', 'outer',
        'full', 'cross', 'on', 'and', 'or', 'not', 'in', 'exists', 'between',
        'like', 'is', 'null', 'as', 'order', 'by', 'group', 'having', 'limit',
        'offset', 'union', 'all', 'insert', 'into', 'values', 'update', 'set',
        'delete', 'create', 'table', 'alter', 'drop', 'index', 'view', 'with',
        'case', 'when', 'then', 'else', 'end', 'distinct', 'top', 'fetch',
        'natural', 'using', 'lateral', 'each', 'row', 'trigger', 'function',
    ]);
    return reserved.has(word.toLowerCase());
}

const EXAMPLE_SQL = `SELECT u.id, u.name, u.email, o.order_id, o.total_amount, p.product_name
FROM users u
INNER JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE u.created_at > '2024-01-01'
AND o.status IN (SELECT status FROM valid_statuses WHERE active = 1)
AND o.total_amount > (SELECT AVG(total_amount) FROM orders WHERE created_at > '2024-01-01')
GROUP BY u.id, u.name, u.email, o.order_id, o.total_amount, p.product_name
ORDER BY o.total_amount DESC
LIMIT 50;`;

export default function SqlFormatterClient({ toolData = { name: 'SQL Formatter', type: 'Formatter', desc: 'Format and beautify SQL queries for MySQL, PostgreSQL, SQLite, SQL Server, and Oracle. Includes query analyzer. 100% client-side.' } }: SqlFormatterClientProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'Format' | 'Minify'>('Format');

    // Format options
    const [dialect, setDialect] = useState<Dialect>('mysql');
    const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper');
    const [indentStyle, setIndentStyle] = useState<IndentStyle>('2');
    const [commaPosition, setCommaPosition] = useState<CommaPosition>('trailing');

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const processSQL = useCallback(() => {
        if (!input.trim()) {
            setOutput('');
            setErrorMsg(null);
            return;
        }

        try {
            setErrorMsg(null);

            if (mode === 'Minify') {
                // Minify: collapse to single line, normalize whitespace
                const minified = input
                    .replace(/--.*$/gm, '')           // remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '')  // remove block comments
                    .replace(/\s+/g, ' ')              // collapse whitespace
                    .replace(/\s*([,;()=<>!])\s*/g, '$1') // remove space around operators
                    .replace(/\(\s+/g, '(')
                    .replace(/\s+\)/g, ')')
                    .trim();
                setOutput(minified);
            } else {
                const tabWidth = indentStyle === 'tab' ? 2 : parseInt(indentStyle);
                let formatted = format(input, {
                    language: dialect,
                    keywordCase: keywordCase,
                    useTabs: indentStyle === 'tab',
                    tabWidth,
                    linesBetweenQueries: 2,
                    indentStyle: 'standard',
                });

                // Post-process for leading comma style
                if (commaPosition === 'leading') {
                    formatted = formatted.replace(/,\n(\s+)/g, '\n$1, ');
                }
                setOutput(formatted);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'An error occurred while processing SQL.';
            setErrorMsg(message);
        }
    }, [input, mode, dialect, keywordCase, indentStyle, commaPosition]);

    const queryAnalysis = useMemo(() => analyzeQuery(input), [input]);

    const errorBanner = errorMsg ? (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 text-error shrink-0" />
            <div>
                <h4 className="font-bold text-14 text-error mb-1">SQL Parse Error</h4>
                <p className="text-13 text-error/90 font-code whitespace-pre-wrap">{errorMsg}</p>
            </div>
        </div>
    ) : null;

    const renderStats = (
        <div className="flex items-center gap-3 flex-wrap">
            {queryAnalysis && (
                <>
                    <span className="flex items-center gap-1.5 text-11 text-textSecondary">
                        <Table2 size={12} className="text-accent" />
                        {queryAnalysis.tableCount} {queryAnalysis.tableCount === 1 ? 'table' : 'tables'}
                    </span>
                    <span className="text-textMuted">|</span>
                    <span className="flex items-center gap-1.5 text-11 text-textSecondary">
                        <GitMerge size={12} className="text-accent" />
                        {queryAnalysis.joinCount} {queryAnalysis.joinCount === 1 ? 'JOIN' : 'JOINs'}
                    </span>
                    <span className="text-textMuted">|</span>
                    <span className="flex items-center gap-1.5 text-11 text-textSecondary">
                        <Layers size={12} className="text-accent" />
                        {queryAnalysis.subqueryCount} {queryAnalysis.subqueryCount === 1 ? 'subquery' : 'subqueries'}
                    </span>
                </>
            )}
        </div>
    );

    const queryAnalysisBanner = queryAnalysis && (queryAnalysis.joinCount > 0 || queryAnalysis.subqueryCount > 0 || queryAnalysis.tableCount > 1) ? (
        <div className="bg-accent/5 border border-accent/15 rounded-lg px-4 py-3 flex items-center gap-3">
            <Database size={18} className="text-accent shrink-0" />
            <p className="text-13 text-textSecondary">
                This query has{' '}
                <span className="text-accent font-bold">{queryAnalysis.joinCount} {queryAnalysis.joinCount === 1 ? 'JOIN' : 'JOINs'}</span>,{' '}
                <span className="text-accent font-bold">{queryAnalysis.subqueryCount} {queryAnalysis.subqueryCount === 1 ? 'subquery' : 'subqueries'}</span>,{' '}
                and touches{' '}
                <span className="text-accent font-bold">{queryAnalysis.tableCount} {queryAnalysis.tableCount === 1 ? 'table' : 'tables'}</span>
            </p>
        </div>
    ) : null;

    const getOptionsPanel = () => (
        <>
            {/* Mode Toggle */}
            <div className="flex flex-col gap-2 col-span-full mb-2">
                <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Mode</label>
                <div className="flex bg-background rounded-lg p-1 border border-border w-full max-w-sm">
                    {(['Format', 'Minify'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 text-14 font-bold py-2 rounded-md transition-colors ${mode === m ? 'bg-accent text-black shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {mode === 'Format' ? (
                <>
                    {/* Dialect */}
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Dialect</label>
                        <select
                            value={dialect}
                            onChange={(e) => setDialect(e.target.value as Dialect)}
                            className="bg-background border border-border rounded-lg px-3 py-2 text-14 text-textPrimary outline-none focus:border-accent transition-colors cursor-pointer"
                        >
                            {DIALECT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Keyword Case */}
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Keyword Case</label>
                        <div className="flex bg-background rounded-lg p-1 border border-border">
                            {KEYWORD_CASE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setKeywordCase(opt.value)}
                                    className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${keywordCase === opt.value ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Indentation */}
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Indentation</label>
                        <div className="flex bg-background rounded-lg p-1 border border-border">
                            {([{ value: '2', label: '2 Spaces' }, { value: '4', label: '4 Spaces' }, { value: 'tab', label: 'Tab' }] as const).map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setIndentStyle(opt.value as IndentStyle)}
                                    className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${indentStyle === opt.value ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comma Position */}
                    <div className="flex flex-col gap-2">
                        <label className="text-12 font-bold text-textSecondary uppercase tracking-wider">Comma Position</label>
                        <div className="flex bg-background rounded-lg p-1 border border-border">
                            {([{ value: 'trailing', label: 'End of line' }, { value: 'leading', label: 'Start of line' }] as const).map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setCommaPosition(opt.value as CommaPosition)}
                                    className={`flex-1 text-12 font-medium py-1.5 rounded-md transition-colors ${commaPosition === opt.value ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="col-span-full">
                    <p className="text-13 text-textSecondary">
                        Minify mode removes all comments, collapses whitespace, and compresses your SQL into a single line.
                    </p>
                </div>
            )}

            <div className="flex flex-col justify-end">
                <button
                    onClick={processSQL}
                    className="w-full py-2.5 bg-surface border border-border hover:border-textSecondary text-textPrimary rounded-lg text-14 font-medium transition-colors"
                >
                    {mode === 'Format' ? 'Format SQL' : 'Minify SQL'}
                </button>
            </div>
        </>
    );

    const tabs = [
        {
            id: 'what-is',
            label: 'What is SQL Formatting?',
            content: (
                <div>
                    <h2>Online SQL Formatter & Beautifier</h2>
                    <p>
                        SQL (Structured Query Language) is the standard language for managing and querying relational databases. Complex queries with multiple JOINs, subqueries, and nested conditions can quickly become unreadable when written on a single line or with inconsistent formatting.
                    </p>
                    <p>
                        Our <strong>SQL Formatter</strong> parses your query and rewrites it with consistent indentation, keyword casing, and line breaks. It supports five major SQL dialects and runs entirely in your browser using the industry-standard <code>sql-formatter</code> library.
                    </p>
                    <h3>Why use our SQL Formatter?</h3>
                    <ul>
                        <li><strong>Multi-Dialect Support:</strong> Format queries for MySQL, PostgreSQL, SQLite, SQL Server (T-SQL), and Oracle (PL/SQL) with dialect-aware parsing.</li>
                        <li><strong>Query Analyzer:</strong> Instantly see how many tables, JOINs, and subqueries your query contains to gauge complexity at a glance.</li>
                        <li><strong>100% Client-Side:</strong> Your SQL never leaves your browser. Paste production queries with sensitive data without worry.</li>
                        <li><strong>Minify Mode:</strong> Compress SQL for embedding in code, configuration files, or API payloads.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'how-to',
            label: 'How to Format SQL',
            content: (
                <div>
                    <h2>How to Beautify Your SQL Queries</h2>
                    <ol>
                        <li><strong>Paste Your SQL:</strong> Enter your query directly into the left panel, or drag and drop a <code>.sql</code> file.</li>
                        <li><strong>Choose Your Dialect:</strong> Open the Options panel and select the database engine your query targets (MySQL, PostgreSQL, SQLite, SQL Server, or Oracle).</li>
                        <li><strong>Configure Formatting:</strong>
                            <ul>
                                <li><strong>Keyword Case:</strong> Choose UPPERCASE, lowercase, or Preserve to control how SQL keywords appear.</li>
                                <li><strong>Indentation:</strong> Pick 2 spaces, 4 spaces, or tabs for nesting.</li>
                                <li><strong>Comma Position:</strong> Place commas at the end of lines (standard) or at the start of lines (SQL style guide preference).</li>
                            </ul>
                        </li>
                        <li><strong>Format:</strong> Click the Convert button or press <code>Ctrl + Enter</code>. Your beautifully formatted SQL appears on the right.</li>
                        <li><strong>Analyze:</strong> Check the query analysis banner above the editor to understand your query&apos;s complexity.</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'examples',
            label: 'Examples',
            content: (
                <div>
                    <h2>SQL Formatting Examples</h2>
                    <h3>Before: Unformatted SQL</h3>
                    <pre><code>{`SELECT u.id,u.name,u.email,o.order_id,o.total FROM users u INNER JOIN orders o ON u.id=o.user_id LEFT JOIN products p ON o.product_id=p.id WHERE u.active=1 AND o.created_at>'2024-01-01' ORDER BY o.total DESC LIMIT 100;`}</code></pre>

                    <h3>After: Formatted (UPPERCASE, 2 Spaces)</h3>
                    <pre><code>{`SELECT
  u.id,
  u.name,
  u.email,
  o.order_id,
  o.total
FROM
  users u
  INNER JOIN orders o ON u.id = o.user_id
  LEFT JOIN products p ON o.product_id = p.id
WHERE
  u.active = 1
  AND o.created_at > '2024-01-01'
ORDER BY
  o.total DESC
LIMIT
  100;`}</code></pre>

                    <h3>After: Minified</h3>
                    <pre><code>{`SELECT u.id,u.name,u.email,o.order_id,o.total FROM users u INNER JOIN orders o ON u.id=o.user_id LEFT JOIN products p ON o.product_id=p.id WHERE u.active=1 AND o.created_at>'2024-01-01' ORDER BY o.total DESC LIMIT 100;`}</code></pre>
                </div>
            )
        },
        {
            id: 'faq',
            label: 'FAQ',
            content: (
                <div>
                    <h2>Frequently Asked Questions</h2>

                    <h3>Does formatting change my query&apos;s behavior?</h3>
                    <p>No. SQL formatting only changes whitespace and keyword casing. The logical structure and execution plan of your query remain identical.</p>

                    <h3>Which SQL dialect should I choose?</h3>
                    <p>Choose the database engine you&apos;re writing for. Each dialect has slightly different syntax rules. For example, SQL Server uses <code>TOP</code> instead of <code>LIMIT</code>, and Oracle uses <code>ROWNUM</code>. Selecting the right dialect ensures proper formatting of vendor-specific syntax.</p>

                    <h3>What does the query analyzer count?</h3>
                    <p>The analyzer detects <strong>tables</strong> referenced in FROM, JOIN, INSERT, UPDATE, and DELETE clauses. It counts <strong>JOINs</strong> of all types (INNER, LEFT, RIGHT, FULL, CROSS). <strong>Subqueries</strong> are detected by finding <code>(SELECT ...)</code> patterns.</p>

                    <h3>Can I format multiple queries at once?</h3>
                    <p>Yes! Separate your queries with semicolons. The formatter will process each statement and add blank lines between them for readability.</p>

                    <h3>Is my SQL sent to any server?</h3>
                    <p>Never. All processing runs in your browser using JavaScript. Your queries, including any sensitive table names or data, never leave your machine.</p>
                </div>
            )
        }
    ];

    return (
        <ToolPage
            toolName="SQL Formatter"
            toolType="SQL Formatter"
            toolDescription={toolData.desc}
            inputLanguage="sql"
            outputLanguage="sql"
            input={input}
            output={output}
            setInput={setInput}
            onConvert={processSQL}
            onSwap={() => { setInput(output); setOutput(''); }}
            isReversible={true}
            optionsPanel={getOptionsPanel()}
            tabs={tabs}
            errorBanner={errorBanner}
            topBanner={queryAnalysisBanner}
            customStats={renderStats}
            onExample={() => setInput(EXAMPLE_SQL)}
            breadcrumbs={['Tools', '\u203A', 'Formatters', '\u203A', 'SQL Formatter']}
        />
    );
}
