'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchInConversationProps {
    messages: any[];
    onClose: () => void;
    onResultClick: (messageId: string) => void;
}

export default function SearchInConversation({ messages, onClose, onResultClick }: SearchInConversationProps) {
    const [query, setQuery] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter messages based on search query
    const results = messages.filter(msg =>
        msg.content.toLowerCase().includes(query.toLowerCase())
    );

    const handleNext = () => {
        if (currentIndex < results.length - 1) {
            setCurrentIndex(currentIndex + 1);
            onResultClick(results[currentIndex + 1]._id);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            onResultClick(results[currentIndex - 1]._id);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 glass border-b border-border p-4 z-10"
            >
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setCurrentIndex(0);
                            }}
                            placeholder="Search in conversation..."
                            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            autoFocus
                        />
                    </div>

                    {query && results.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-muted">
                                {currentIndex + 1} of {results.length}
                            </span>
                            <button
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                            >
                                <ChevronUp className="w-4 h-4 text-text-secondary" />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === results.length - 1}
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                            >
                                <ChevronDown className="w-4 h-4 text-text-secondary" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-text-secondary" />
                    </button>
                </div>

                {query && results.length === 0 && (
                    <p className="text-sm text-text-muted mt-2">No messages found</p>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
