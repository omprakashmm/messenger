'use client';

import { useState } from 'react';
import { Pin, Bell, BellOff, Archive, ArchiveRestore, MailOpen, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatActionsProps {
    conversationId: string;
    isPinned?: boolean;
    isMuted?: boolean;
    isArchived?: boolean;
    isUnread?: boolean;
    onPin?: () => void;
    onMute?: () => void;
    onArchive?: () => void;
    onMarkUnread?: () => void;
}

export default function ChatActions({
    conversationId,
    isPinned = false,
    isMuted = false,
    isArchived = false,
    isUnread = false,
    onPin,
    onMute,
    onArchive,
    onMarkUnread,
}: ChatActionsProps) {
    const [pinned, setPinned] = useState(isPinned);
    const [muted, setMuted] = useState(isMuted);
    const [archived, setArchived] = useState(isArchived);
    const [unread, setUnread] = useState(isUnread);

    const handlePin = () => {
        setPinned(!pinned);
        onPin?.();
    };

    const handleMute = () => {
        setMuted(!muted);
        onMute?.();
    };

    const handleArchive = () => {
        setArchived(!archived);
        onArchive?.();
    };

    const handleMarkUnread = () => {
        setUnread(!unread);
        onMarkUnread?.();
    };

    return (
        <div className="flex items-center gap-1">
            {/* Pin */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePin}
                className={`p-2 rounded-lg transition-colors ${pinned
                        ? 'text-primary bg-primary/10'
                        : 'text-text-muted hover:bg-surface-hover'
                    }`}
                title={pinned ? 'Unpin chat' : 'Pin chat'}
            >
                <Pin className={`w-4 h-4 ${pinned ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Mute */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMute}
                className={`p-2 rounded-lg transition-colors ${muted
                        ? 'text-orange-500 bg-orange-500/10'
                        : 'text-text-muted hover:bg-surface-hover'
                    }`}
                title={muted ? 'Unmute chat' : 'Mute chat'}
            >
                {muted ? (
                    <BellOff className="w-4 h-4" />
                ) : (
                    <Bell className="w-4 h-4" />
                )}
            </motion.button>

            {/* Archive */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleArchive}
                className={`p-2 rounded-lg transition-colors ${archived
                        ? 'text-blue-500 bg-blue-500/10'
                        : 'text-text-muted hover:bg-surface-hover'
                    }`}
                title={archived ? 'Unarchive chat' : 'Archive chat'}
            >
                {archived ? (
                    <ArchiveRestore className="w-4 h-4" />
                ) : (
                    <Archive className="w-4 h-4" />
                )}
            </motion.button>

            {/* Mark as Unread */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMarkUnread}
                className={`p-2 rounded-lg transition-colors ${unread
                        ? 'text-green-500 bg-green-500/10'
                        : 'text-text-muted hover:bg-surface-hover'
                    }`}
                title={unread ? 'Mark as read' : 'Mark as unread'}
            >
                {unread ? (
                    <MailCheck className="w-4 h-4" />
                ) : (
                    <MailOpen className="w-4 h-4" />
                )}
            </motion.button>
        </div>
    );
}

// Compact version for chat list items
export function ChatActionsBadges({
    isPinned,
    isMuted,
    isArchived,
}: {
    isPinned?: boolean;
    isMuted?: boolean;
    isArchived?: boolean;
}) {
    return (
        <div className="flex items-center gap-1">
            {isPinned && (
                <Pin className="w-3 h-3 text-primary fill-current" />
            )}
            {isMuted && (
                <BellOff className="w-3 h-3 text-orange-500" />
            )}
            {isArchived && (
                <Archive className="w-3 h-3 text-blue-500" />
            )}
        </div>
    );
}
