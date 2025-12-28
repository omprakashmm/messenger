/**
 * Message Threads System
 * Reply to specific messages with nested conversations
 */

'use client';

import { create } from 'zustand';

export interface ThreadMessage {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    attachments?: any[];
}

export interface MessageThread {
    id: string; // Parent message ID
    parentMessage: ThreadMessage;
    replies: ThreadMessage[];
    conversationId: string;
    participantIds: string[];
    lastReplyAt: Date;
    unreadCount: number;
}

interface ThreadsState {
    threads: Map<string, MessageThread>;
    activeThread: string | null;

    // Actions
    createThread: (parentMessage: ThreadMessage, conversationId: string) => void;
    addReply: (threadId: string, reply: ThreadMessage) => void;
    getThread: (threadId: string) => MessageThread | null;
    getThreadsByConversation: (conversationId: string) => MessageThread[];
    setActiveThread: (threadId: string | null) => void;
    markThreadAsRead: (threadId: string) => void;
    deleteThread: (threadId: string) => void;
    clearAll: () => void;
}

export const useThreads = create<ThreadsState>((set, get) => ({
    threads: new Map(),
    activeThread: null,

    createThread: (parentMessage, conversationId) => {
        set((state) => {
            const newThreads = new Map(state.threads);

            // Check if thread already exists
            if (newThreads.has(parentMessage.id)) {
                return state;
            }

            const thread: MessageThread = {
                id: parentMessage.id,
                parentMessage,
                replies: [],
                conversationId,
                participantIds: [parentMessage.senderId],
                lastReplyAt: parentMessage.timestamp,
                unreadCount: 0,
            };

            newThreads.set(parentMessage.id, thread);
            return { threads: newThreads };
        });
    },

    addReply: (threadId, reply) => {
        set((state) => {
            const newThreads = new Map(state.threads);
            const thread = newThreads.get(threadId);

            if (!thread) {
                console.warn(`Thread ${threadId} not found`);
                return state;
            }

            // Add reply
            const updatedThread: MessageThread = {
                ...thread,
                replies: [...thread.replies, reply],
                lastReplyAt: reply.timestamp,
                participantIds: Array.from(
                    new Set([...thread.participantIds, reply.senderId])
                ),
                unreadCount: thread.unreadCount + 1,
            };

            newThreads.set(threadId, updatedThread);
            return { threads: newThreads };
        });
    },

    getThread: (threadId) => {
        return get().threads.get(threadId) || null;
    },

    getThreadsByConversation: (conversationId) => {
        const { threads } = get();
        return Array.from(threads.values())
            .filter((thread) => thread.conversationId === conversationId)
            .sort((a, b) => b.lastReplyAt.getTime() - a.lastReplyAt.getTime());
    },

    setActiveThread: (threadId) => {
        set({ activeThread: threadId });
    },

    markThreadAsRead: (threadId) => {
        set((state) => {
            const newThreads = new Map(state.threads);
            const thread = newThreads.get(threadId);

            if (thread) {
                newThreads.set(threadId, {
                    ...thread,
                    unreadCount: 0,
                });
            }

            return { threads: newThreads };
        });
    },

    deleteThread: (threadId) => {
        set((state) => {
            const newThreads = new Map(state.threads);
            newThreads.delete(threadId);
            return { threads: newThreads };
        });
    },

    clearAll: () => {
        set({ threads: new Map(), activeThread: null });
    },
}));

// Hook to get thread by ID
export function useThread(threadId: string | null): MessageThread | null {
    return useThreads((state) => (threadId ? state.getThread(threadId) : null));
}

// Hook to get threads for a conversation
export function useConversationThreads(conversationId: string): MessageThread[] {
    return useThreads((state) => state.getThreadsByConversation(conversationId));
}

// Hook to get total unread thread count
export function useUnreadThreadCount(conversationId?: string): number {
    return useThreads((state) => {
        const threads = conversationId
            ? state.getThreadsByConversation(conversationId)
            : Array.from(state.threads.values());

        return threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
    });
}

// Hook to check if a message has a thread
export function useHasThread(messageId: string): boolean {
    return useThreads((state) => state.threads.has(messageId));
}

// Hook to get reply count for a message
export function useReplyCount(messageId: string): number {
    return useThreads((state) => {
        const thread = state.threads.get(messageId);
        return thread ? thread.replies.length : 0;
    });
}
