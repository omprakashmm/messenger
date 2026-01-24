/**
 * Forward Message Modal
 * Allows forwarding messages to other conversations
 */

'use client';

import React, { useState } from 'react';
import { X, Search, Send, Check } from 'lucide-react';
import { useChatStore, useAuthStore } from '@/lib/store';

interface ForwardMessageModalProps {
    message: {
        _id: string;
        content: string;
        type: string;
        fileUrl?: string;
        fileName?: string;
    };
    onClose: () => void;
    onForward: (conversationIds: string[]) => void;
}

export default function ForwardMessageModal({ message, onClose, onForward }: ForwardMessageModalProps) {
    const { conversations } = useChatStore();
    const { user } = useAuthStore();
    const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv => {
        const otherUser = conv.participants.find(p => p._id !== user?.id && p._id !== user?._id);
        return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const toggleConversation = (convId: string) => {
        setSelectedConversations(prev =>
            prev.includes(convId)
                ? prev.filter(id => id !== convId)
                : [...prev, convId]
        );
    };

    const handleForward = () => {
        if (selectedConversations.length > 0) {
            onForward(selectedConversations);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-surface rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Forward Message</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message Preview */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Forwarding:
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                        {message.type === 'image' && message.fileUrl ? (
                            <div className="flex items-center gap-2">
                                <img
                                    src={message.fileUrl}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <span className="text-sm">📷 Photo</span>
                            </div>
                        ) : message.type === 'file' && message.fileName ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📄</span>
                                <span className="text-sm">{message.fileName}</span>
                            </div>
                        ) : (
                            <p className="text-sm line-clamp-2">{message.content}</p>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No conversations found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredConversations.map((conv) => {
                                const otherUser = conv.participants.find(
                                    p => p._id !== user?.id && p._id !== user?._id
                                );
                                const isSelected = selectedConversations.includes(conv._id);

                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => toggleConversation(conv._id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isSelected
                                            ? 'bg-primary/10 border-2 border-primary'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {otherUser?.avatar ? (
                                                <img
                                                    src={otherUser.avatar}
                                                    alt={otherUser.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                                                    {otherUser?.username[0].toUpperCase()}
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">
                                                {otherUser?.username || 'Unknown User'}
                                            </div>
                                            {otherUser?.bio && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {otherUser.bio}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedConversations.length} selected
                    </div>
                    <button
                        onClick={handleForward}
                        disabled={selectedConversations.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        Forward
                    </button>
                </div>
            </div>
        </div>
    );
}
