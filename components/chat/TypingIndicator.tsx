'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
    username?: string;
}

export default function TypingIndicator({ username }: TypingIndicatorProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 px-4 py-2"
            >
                <div className="flex items-center gap-1 bg-surface-hover rounded-full px-3 py-2">
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    {username && (
                        <span className="text-xs text-text-muted ml-2">
                            {username} is typing...
                        </span>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
