import Link from 'next/link';
import { ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export interface ToolCardProps {
    name: string;
    slug: string;
    description: string;
    category: string;
    icon: ReactNode;
    isNew?: boolean;
    isPopular?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Formatter: { bg: 'rgba(0,184,255,0.08)', text: '#00b8ff', dot: '#00b8ff' },
    Encoder: { bg: 'rgba(168,85,247,0.08)', text: '#a855f7', dot: '#a855f7' },
    Converter: { bg: 'rgba(0,212,106,0.08)', text: '#00d46a', dot: '#00d46a' },
    Validator: { bg: 'rgba(255,179,0,0.08)', text: '#FFB300', dot: '#FFB300' },
    Builder: { bg: 'rgba(248,113,113,0.08)', text: '#f87171', dot: '#f87171' },
};

export default function ToolCard({ name, slug, description, category, icon, isNew, isPopular }: ToolCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Formatter;

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <Link href={`/tools/${slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl w-full">
            <motion.div
                whileHover="hover"
                onMouseMove={handleMouseMove}
                className="group relative h-full flex flex-col rounded-2xl border border-border/80 p-6 transition-all duration-300 shadow-sm overflow-hidden cursor-pointer"
                style={{ background: 'var(--color-surface)' }}
            >
                {/* Spotlight hover glow */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${colors.bg.replace('0.08', '0.15')}, transparent 70%)`,
                    }}
                />

                {/* Hover border ring */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{ boxShadow: `inset 0 0 0 1px ${colors.dot}35, 0 0 24px ${colors.dot}15` }}
                />

                {/* Top row: icon + badges */}
                <div className="relative z-10 flex items-start justify-between mb-5">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110"
                        style={{
                            background: colors.bg,
                            borderColor: `${colors.dot}30`,
                            color: colors.dot,
                        }}
                    >
                        {icon}
                    </div>
                    <div className="flex gap-1.5">
                        {isPopular && (
                            <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold text-warning border border-warning/20 uppercase tracking-wider">
                                🔥 Popular
                            </span>
                        )}
                        {isNew && (
                            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success border border-success/20 uppercase tracking-wider">
                                ✨ New
                            </span>
                        )}
                    </div>
                </div>

                {/* Name */}
                <h3 className="relative z-10 mb-2 text-16 font-bold text-textPrimary group-hover:text-white transition-colors duration-200 leading-tight">
                    {name}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-13 text-textSecondary line-clamp-2 flex-grow leading-relaxed mb-5">
                    {description}
                </p>

                {/* Footer: category + arrow */}
                <div className="relative z-10 mt-auto flex items-center justify-between">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border"
                        style={{ background: colors.bg, color: colors.text, borderColor: `${colors.dot}25` }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                        {category}
                    </span>
                    <span
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        style={{ background: colors.bg, color: colors.dot }}
                    >
                        <ArrowUpRight size={14} />
                    </span>
                </div>
            </motion.div>
        </Link>
    );
}
