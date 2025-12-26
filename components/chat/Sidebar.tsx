'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useChatStore } from '@/lib/store';
import { Search, Plus, Settings, LogOut, MessageCircle, Users, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatMessageTime, getInitials, generateAvatarColor } from '@/lib/utils';
import UserSearchModal from './UserSearchModal';
import ProfilePage from '../profile/ProfilePage';
import SettingsPage from '../settings/SettingsPage';

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const { conversations, setCurrentConversation, currentConversation, fetchConversations, createDirectConversation, loadMessages } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleSelectUser = async (userId: string) => {
        const conversation = await createDirectConversation(userId);
        if (conversation) {
            setCurrentConversation(conversation);
            await loadMessages(conversation._id);
        }
    };

    const filteredConversations = conversations.filter((conv) => {
        // Show only conversations with messages (contacts)
        if (!conv.lastMessage) return false;

        // Filter by search query
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            conv.name?.toLowerCase().includes(searchLower) ||
            conv.participants.some((p) => p.username.toLowerCase().includes(searchLower))
        );
    });

    const getConversationName = (conv: any) => {
        if (conv.type === 'group') return conv.name;
        const otherUser = conv.participants.find((p: any) => p._id !== user?.id);
        return otherUser?.username || 'Unknown';
    };

    const getConversationAvatar = (conv: any) => {
        if (conv.type === 'group') return conv.avatar;
        const otherUser = conv.participants.find((p: any) => p._id !== user?.id);
        return otherUser?.avatar;
    };

    const getConversationStatus = (conv: any) => {
        if (conv.type === 'group') return null;
        const otherUser = conv.participants.find((p: any) => p._id !== user?.id);
        return otherUser?.status;
    };

    return (
        <div className="w-80 bg-surface border-r border-border flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setShowProfile(true)}
                        className="flex items-center gap-3 hover:bg-surface-hover rounded-lg p-2 -m-2 transition-colors"
                    >
                        <div className="relative">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
                                    generateAvatarColor(user?.id || '')
                                )}>
                                    {getInitials(user?.username || '')}
                                </div>
                            )}
                            <div className="status-indicator online" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-text-primary">{user?.username}</h2>
                            <p className="text-xs text-text-muted">Online</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5 text-text-secondary" />
                        </button>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                    {filteredConversations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full p-8 text-center"
                        >
                            <MessageCircle className="w-16 h-16 text-text-muted mb-4" />
                            <p className="text-text-secondary">No conversations yet</p>
                            <p className="text-sm text-text-muted mt-2">
                                Start a new chat to get started
                            </p>
                        </motion.div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isActive = currentConversation?._id === conv._id;
                            const name = getConversationName(conv);
                            const avatar = getConversationAvatar(conv);
                            const status = getConversationStatus(conv);

                            return (
                                <motion.button
                                    key={conv._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onClick={() => setCurrentConversation(conv)}
                                    className={cn(
                                        'w-full p-4 flex items-start gap-3 hover:bg-surface-hover transition-colors border-l-4',
                                        isActive
                                            ? 'bg-surface-hover border-primary'
                                            : 'border-transparent'
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt={name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={cn(
                                                'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
                                                generateAvatarColor(conv._id)
                                            )}>
                                                {conv.type === 'group' ? (
                                                    <Users className="w-6 h-6" />
                                                ) : (
                                                    getInitials(name)
                                                )}
                                            </div>
                                        )}
                                        {status && (
                                            <div className={cn('status-indicator', status)} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-text-primary truncate">
                                                {name}
                                            </h3>
                                            {conv.lastMessageAt && (
                                                <span className="text-xs text-text-muted">
                                                    {formatMessageTime(conv.lastMessageAt)}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className="text-sm text-text-secondary truncate">
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={() => setShowUserSearch(true)}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Chat
                </button>
            </div>

            {/* User Search Modal */}
            <UserSearchModal
                isOpen={showUserSearch}
                onClose={() => setShowUserSearch(false)}
                onSelectUser={handleSelectUser}
            />

            {/* Profile Page Modal */}
            {showProfile && (
                <ProfilePage onClose={() => setShowProfile(false)} />
            )}

            {/* Settings Page Modal */}
            {showSettings && (
                <SettingsPage onClose={() => setShowSettings(false)} />
            )}
        </div>
    );
}
