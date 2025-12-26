'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Edit2, Trash2, Reply, Forward, Star } from 'lucide-react';

interface MessageContextMenuProps {
    messageId: string;
    content: string;
    isSent: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onReply?: () => void;
    onCopy?: () => void;
}

export default function MessageContextMenu({
    messageId,
    content,
    isSent,
    position,
    onClose,
    onEdit,
    onDelete,
    onReply,
    onCopy,
}: MessageContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        onCopy?.();
        onClose();
    };

    const menuItems = [
        { icon: Reply, label: 'Reply', onClick: onReply, show: true },
        { icon: Copy, label: 'Copy', onClick: handleCopy, show: true },
        { icon: Forward, label: 'Forward', onClick: () => { }, show: true },
        { icon: Star, label: 'Star', onClick: () => { }, show: true },
        { icon: Edit2, label: 'Edit', onClick: onEdit, show: isSent },
        { icon: Trash2, label: 'Delete', onClick: onDelete, show: true, danger: true },
    ].filter(item => item.show);

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                }}
                className="glass rounded-lg shadow-xl border border-border overflow-hidden z-50 min-w-[180px]"
            >
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            item.onClick?.();
                            onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left ${item.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-text-primary'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}
            </motion.div>
        </AnimatePresence>
    );
}
