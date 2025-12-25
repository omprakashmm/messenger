'use client';

import { useState } from 'react';
import { Search, X, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getInitials, generateAvatarColor } from '@/lib/utils';

interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away';
}

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (userId: string) => void;
}

export default function UserSearchModal({ isOpen, onClose, onSelectUser }: UserSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setUsers([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/users?search=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Search users error:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Debounce search
        const timeoutId = setTimeout(() => {
            searchUsers(query);
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    const handleSelectUser = (userId: string) => {
        onSelectUser(userId);
        onClose();
        setSearchQuery('');
        setUsers([]);
        setSearched(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-text-primary">New Chat</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-text-secondary" />
                                    </button>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Search users by name or email..."
                                        autoFocus
                                        className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Results */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                ) : users.length > 0 ? (
                                    <div className="p-2">
                                        {users.map((user) => (
                                            <motion.button
                                                key={user._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={() => handleSelectUser(user._id)}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-surface-hover rounded-xl transition-all group"
                                            >
                                                <div className="relative flex-shrink-0">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.username}
                                                            className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                                                        />
                                                    ) : (
                                                        <div className={cn(
                                                            'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-transparent group-hover:ring-primary/50 transition-all',
                                                            generateAvatarColor(user._id)
                                                        )}>
                                                            {getInitials(user.username)}
                                                        </div>
                                                    )}
                                                    <div className={cn('status-indicator', user.status)} />
                                                </div>

                                                <div className="flex-1 text-left min-w-0">
                                                    <h3 className="font-semibold text-text-primary mb-0.5 truncate">
                                                        {user.username}
                                                    </h3>
                                                    <p className="text-sm text-text-secondary truncate">
                                                        {user.bio || user.email}
                                                    </p>
                                                </div>

                                                <MessageCircle className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : searched ? (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                        <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center mb-4">
                                            <Search className="w-10 h-10 text-text-muted" />
                                        </div>
                                        <h3 className="font-semibold text-text-primary mb-2">No users found</h3>
                                        <p className="text-sm text-text-secondary">
                                            Try searching with a different name or email
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                                            <Search className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-text-primary mb-2">Search for users</h3>
                                        <p className="text-sm text-text-secondary">
                                            Enter a name or email to find people to chat with
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
