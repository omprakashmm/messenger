/**
 * Live Presence System
 * Real-time user presence, typing indicators, and activity status
 */

'use client';

import { create } from 'zustand';
import { debounce } from './performance';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
export type ActivityType = 'typing' | 'recording' | 'uploading' | 'idle';

export interface UserPresence {
    userId: string;
    status: PresenceStatus;
    lastSeen: Date;
    activity?: {
        type: ActivityType;
        conversationId: string;
        timestamp: Date;
    };
    customStatus?: string;
    device?: 'mobile' | 'desktop' | 'web';
}

interface PresenceState {
    presences: Map<string, UserPresence>;
    typingUsers: Map<string, Set<string>>; // conversationId -> Set of userIds

    // Actions
    setPresence: (userId: string, presence: Partial<UserPresence>) => void;
    setStatus: (userId: string, status: PresenceStatus) => void;
    setActivity: (userId: string, conversationId: string, activity: ActivityType | null) => void;
    setCustomStatus: (userId: string, status: string) => void;
    updateLastSeen: (userId: string) => void;

    // Typing indicators
    startTyping: (userId: string, conversationId: string) => void;
    stopTyping: (userId: string, conversationId: string) => void;
    getTypingUsers: (conversationId: string) => string[];

    // Queries
    getUserPresence: (userId: string) => UserPresence | null;
    isUserOnline: (userId: string) => boolean;
    getOnlineUsers: () => string[];

    // Cleanup
    removePresence: (userId: string) => void;
    clearAll: () => void;
}

export const usePresence = create<PresenceState>((set, get) => ({
    presences: new Map(),
    typingUsers: new Map(),

    setPresence: (userId, presence) => {
        set((state) => {
            const newPresences = new Map(state.presences);
            const current = newPresences.get(userId) || {
                userId,
                status: 'offline',
                lastSeen: new Date(),
            };

            newPresences.set(userId, {
                ...current,
                ...presence,
                userId,
            });

            return { presences: newPresences };
        });
    },

    setStatus: (userId, status) => {
        get().setPresence(userId, { status, lastSeen: new Date() });
    },

    setActivity: (userId, conversationId, activity) => {
        get().setPresence(userId, {
            activity: activity
                ? {
                    type: activity,
                    conversationId,
                    timestamp: new Date(),
                }
                : undefined,
        });
    },

    setCustomStatus: (userId, customStatus) => {
        get().setPresence(userId, { customStatus });
    },

    updateLastSeen: (userId) => {
        get().setPresence(userId, { lastSeen: new Date() });
    },

    startTyping: (userId, conversationId) => {
        set((state) => {
            const newTypingUsers = new Map(state.typingUsers);
            const usersTyping = newTypingUsers.get(conversationId) || new Set();
            usersTyping.add(userId);
            newTypingUsers.set(conversationId, usersTyping);
            return { typingUsers: newTypingUsers };
        });

        // Update activity
        get().setActivity(userId, conversationId, 'typing');

        // Auto-stop after 3 seconds
        setTimeout(() => {
            get().stopTyping(userId, conversationId);
        }, 3000);
    },

    stopTyping: (userId, conversationId) => {
        set((state) => {
            const newTypingUsers = new Map(state.typingUsers);
            const usersTyping = newTypingUsers.get(conversationId);

            if (usersTyping) {
                usersTyping.delete(userId);
                if (usersTyping.size === 0) {
                    newTypingUsers.delete(conversationId);
                } else {
                    newTypingUsers.set(conversationId, usersTyping);
                }
            }

            return { typingUsers: newTypingUsers };
        });

        // Clear activity
        get().setActivity(userId, conversationId, null);
    },

    getTypingUsers: (conversationId) => {
        const { typingUsers } = get();
        const users = typingUsers.get(conversationId);
        return users ? Array.from(users) : [];
    },

    getUserPresence: (userId) => {
        return get().presences.get(userId) || null;
    },

    isUserOnline: (userId) => {
        const presence = get().getUserPresence(userId);
        return presence?.status === 'online';
    },

    getOnlineUsers: () => {
        const { presences } = get();
        return Array.from(presences.values())
            .filter((p) => p.status === 'online')
            .map((p) => p.userId);
    },

    removePresence: (userId) => {
        set((state) => {
            const newPresences = new Map(state.presences);
            newPresences.delete(userId);
            return { presences: newPresences };
        });
    },

    clearAll: () => {
        set({ presences: new Map(), typingUsers: new Map() });
    },
}));

// Debounced typing indicator
export const debouncedStartTyping = debounce(
    (userId: string, conversationId: string) => {
        usePresence.getState().startTyping(userId, conversationId);
    },
    300
);

// Hook to get typing users for a conversation
export function useTypingIndicator(conversationId: string, currentUserId: string): string[] {
    return usePresence((state) =>
        state.getTypingUsers(conversationId).filter((id) => id !== currentUserId)
    );
}

// Hook to get user's online status
export function useUserOnlineStatus(userId: string): boolean {
    return usePresence((state) => state.isUserOnline(userId));
}

// Hook to get user's last seen
export function useUserLastSeen(userId: string): Date | null {
    return usePresence((state) => state.getUserPresence(userId)?.lastSeen || null);
}

// Hook to get user's activity
export function useUserActivity(userId: string, conversationId: string): ActivityType | null {
    return usePresence((state) => {
        const presence = state.getUserPresence(userId);
        if (presence?.activity?.conversationId === conversationId) {
            return presence.activity.type;
        }
        return null;
    });
}

// Format last seen time
export function formatLastSeen(lastSeen: Date): string {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return lastSeen.toLocaleDateString();
}
