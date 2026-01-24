/**
 * Pinned Messages Component
 * Shows pinned messages at the top of chat
 */

'use client';

import React from 'react';
import { Pin, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        username: string;
        avatar?: string;
    };
    createdAt: Date;
    isPinned?: boolean;
}

interface PinnedMessagesProps {
    messages: Message[];
    onUnpin: (messageId: string) => void;
    onJumpTo: (messageId: string) => void;
}

export default function PinnedMessages({ messages, onUnpin, onJumpTo }: PinnedMessagesProps) {
    const pinnedMessages = messages.filter(m => m.isPinned);

    if (pinnedMessages.length === 0) {
        return null;
    }

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                    <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Pinned Messages ({pinnedMessages.length}/3)
                    </span>
                </div>

                <div className="space-y-2">
                    {pinnedMessages.map((message) => (
                        <div
                            key={message._id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                            onClick={() => onJumpTo(message._id)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {message.sender.username}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                    {message.content}
                                </p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUnpin(message._id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title="Unpin message"
                            >
                                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
