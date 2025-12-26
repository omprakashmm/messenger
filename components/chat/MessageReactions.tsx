'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';

interface MessageReactionsProps {
    messageId: string;
    reactions: { userId: string; emoji: string }[];
    onReact: (emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function MessageReactions({ messageId, reactions, onReact }: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, { emoji }) => {
        acc[emoji] = (acc[emoji] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="relative">
            {/* Existing reactions */}
            {Object.keys(groupedReactions).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(groupedReactions).map(([emoji, count]) => (
                        <button
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-surface-hover rounded-full text-xs hover:bg-surface transition-colors"
                        >
                            <span>{emoji}</span>
                            <span className="text-text-muted">{count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Add reaction button */}
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="absolute -top-6 right-0 p-1 bg-surface-hover rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
                title="React to message"
            >
                <Smile className="w-4 h-4 text-text-secondary" />
            </button>

            {/* Quick reaction picker */}
            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute -top-12 right-0 flex gap-1 bg-surface border border-border rounded-full px-2 py-1 shadow-lg z-10"
                    >
                        {QUICK_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    onReact(emoji);
                                    setShowPicker(false);
                                }}
                                className="text-xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
