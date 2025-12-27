'use client';

import { motion } from 'framer-motion';

interface DateSeparatorProps {
    date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center my-6"
        >
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 py-1 text-xs font-medium text-text-muted bg-background rounded-full border border-border">
                        {date}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
