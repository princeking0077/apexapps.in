"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
    {
        target: 10,
        suffix: " Tools",
        label: "Everything a dev needs daily",
        duration: 1.5,
    },
    {
        target: 100,
        suffix: "% Free",
        label: "No signup, no limits, no plans",
        duration: 2,
    },
    {
        target: 0,
        suffix: " Bytes Sent",
        label: "All processing runs in your browser",
        duration: 1, // Doesn't need to count up, just display 0
    },
    {
        target: 50,
        suffix: "ms Avg",
        label: "Faster than any server-based tool",
        duration: 2.5,
    },
];

const Counter = ({ target, suffix }: { target: number; suffix: string; duration: number }) => {
    return (
        <div className="text-[32px] md:text-[40px] font-extrabold text-accent font-ui tracking-tight mb-2">
            {target}{suffix}
        </div>
    );
};

export default function UsageStatsBar() {
    return (
        <section className="w-full bg-surface2 py-12 md:py-16 border-y border-border relative z-20">
            <div className="max-w-content mx-auto px-6">

                {/* Mobile: Horizontal scroll, Desktop: Grid */}
                <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-8 md:gap-0 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none hide-scrollbar">

                    {STATS.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`
                flex flex-col flex-none w-[80%] sm:w-[300px] md:w-auto snap-center items-center text-center
                ${index !== STATS.length - 1 ? 'md:border-r md:border-border/60' : ''}
              `}
                        >
                            <Counter target={stat.target} suffix={stat.suffix} duration={stat.duration} />
                            <p className="text-14 md:text-16 font-medium text-textSecondary px-4">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}

                </div>
            </div>

            {/* Optional Custom Scrollbar Hiding Style injection if needed */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </section>
    );
}
