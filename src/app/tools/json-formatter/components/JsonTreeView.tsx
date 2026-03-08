/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonNodeProps {
    keyName?: string;
    value: any;
    isLast?: boolean;
    depth?: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({ keyName, value, isLast = true, depth = 0 }) => {
    const [expanded, setExpanded] = useState(depth < 2); // Default expand first two levels

    const getType = (val: any) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'array';
        return typeof val;
    };

    const type = getType(value);

    const renderValue = () => {
        if (type === 'string') return <span className="text-[#98c379]">&quot;{value}&quot;</span>;
        if (type === 'number') return <span className="text-[#d19a66]">{value}</span>;
        if (type === 'boolean') return <span className="text-[#d19a66]">{value ? 'true' : 'false'}</span>;
        if (type === 'null') return <span className="text-[#d19a66]">null</span>;
        return null;
    };

    const pad = <span className="inline-block shrink-0" style={{ width: `${depth * 16}px` }} />;

    if (type === 'object' || type === 'array') {
        const isArray = type === 'array';
        const items = isArray ? value : Object.keys(value);
        const isEmpty = items.length === 0;

        return (
            <div className="font-code text-[14px] leading-[1.6]">
                <div
                    className="flex items-start group cursor-pointer hover:bg-white/5 rounded px-1 -ml-1 transition-colors select-none"
                    onClick={() => !isEmpty && setExpanded(!expanded)}
                >
                    {pad}
                    <div className="w-4 h-5 flex items-center justify-center shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                        {!isEmpty && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </div>
                    {keyName !== undefined && (
                        <>
                            <span className="text-[#e06c75]">&quot;{keyName}&quot;</span>
                            <span className="text-textPrimary mr-1">:</span>
                        </>
                    )}
                    <span className="text-[#e5c07b] font-bold">{isArray ? '[' : '{'}</span>
                    {!expanded && !isEmpty && (
                        <span className="text-textMuted mx-2 italic text-12">
                            {isArray ? `${items.length} items` : `${Object.keys(value).length} keys`}
                        </span>
                    )}
                    {(!expanded || isEmpty) && (
                        <>
                            <span className="text-[#e5c07b] font-bold">{isArray ? ']' : '}'}</span>
                            {!isLast && <span className="text-textPrimary">,</span>}
                        </>
                    )}
                </div>

                {expanded && !isEmpty && (
                    <div>
                        {isArray
                            ? (value as any[]).map((item, idx) => (
                                <JsonNode
                                    key={idx}
                                    value={item}
                                    isLast={idx === items.length - 1}
                                    depth={depth + 1}
                                />
                            ))
                            : Object.entries(value).map(([k, v], idx) => (
                                <JsonNode
                                    key={k}
                                    keyName={k}
                                    value={v}
                                    isLast={idx === items.length - 1}
                                    depth={depth + 1}
                                />
                            ))
                        }
                        <div className="flex items-start px-1 -ml-1">
                            {pad}
                            <div className="w-4 shrink-0" />
                            <span className="text-[#e5c07b] font-bold">{isArray ? ']' : '}'}</span>
                            {!isLast && <span className="text-textPrimary">,</span>}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Primitive Type
    return (
        <div className="flex items-start px-1 -ml-1 font-code text-[14px] leading-[1.6]">
            {pad}
            <div className="w-4 shrink-0" />
            {keyName !== undefined && (
                <>
                    <span className="text-[#e06c75]">&quot;{keyName}&quot;</span>
                    <span className="text-textPrimary mr-1">:</span>
                </>
            )}
            {renderValue()}
            {!isLast && <span className="text-textPrimary">,</span>}
        </div>
    );
};

export default function JsonTreeView({ data }: { data: any }) {
    if (data === undefined) return null;
    return (
        <div className="p-4 overflow-auto w-full h-full bg-[#1e1e1e] custom-scrollbar text-textPrimary">
            <JsonNode value={data} />
        </div>
    );
}
