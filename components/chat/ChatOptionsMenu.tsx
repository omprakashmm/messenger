'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Search, Archive, Trash2, Ban, VolumeX, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatOptionsMenuProps {
    onViewInfo?: () => void;
    onSearch?: () => void;
    onMute?: () => void;
    onArchive?: () => void;
    onBlock?: () => void;
    onDelete?: () => void;
}

export default function ChatOptionsMenu({
    onViewInfo,
    onSearch,
    onMute,
    onArchive,
    onBlock,
    onDelete,
}: ChatOptionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const menuItems = [
        { icon: Info, label: 'Contact Info', onClick: onViewInfo },
        { icon: Search, label: 'Search Messages', onClick: onSearch },
        { icon: VolumeX, label: 'Mute Notifications', onClick: onMute },
        { icon: Archive, label: 'Archive Chat', onClick: onArchive },
        { icon: Ban, label: 'Block User', onClick: onBlock, danger: true },
        { icon: Trash2, label: 'Delete Chat', onClick: onDelete, danger: true },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                aria-label="Chat options"
            >
                <MoreVertical className="w-5 h-5 text-text-secondary" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass rounded-lg shadow-xl border border-border overflow-hidden z-50"
                    >
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick?.();
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left ${item.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-text-primary'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
