/**
 * Optimistic UI System
 * Instant updates with automatic rollback on failure
 */

'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface OptimisticMessage {
    id: string;
    tempId: string;
    content: string;
    senderId: string;
    conversationId: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'failed';
    attachments?: any[];
    replyTo?: string;
    error?: string;
}

interface OptimisticUpdate<T = any> {
    id: string;
    type: 'message' | 'reaction' | 'delete' | 'edit' | 'read';
    data: T;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
    rollback?: () => void;
}

interface OptimisticUIState {
    updates: Map<string, OptimisticUpdate>;
    messages: Map<string, OptimisticMessage>;

    // Actions
    addOptimisticMessage: (message: Omit<OptimisticMessage, 'tempId' | 'status'>) => string;
    confirmMessage: (tempId: string, serverId: string) => void;
    failMessage: (tempId: string, error: string) => void;
    retryMessage: (tempId: string) => void;
    removeMessage: (tempId: string) => void;

    addOptimisticUpdate: <T>(update: Omit<OptimisticUpdate<T>, 'id' | 'timestamp' | 'status'>) => string;
    confirmUpdate: (updateId: string) => void;
    failUpdate: (updateId: string) => void;
    rollbackUpdate: (updateId: string) => void;

    clearFailed: () => void;
    clearAll: () => void;
}

export const useOptimisticUI = create<OptimisticUIState>((set, get) => ({
    updates: new Map(),
    messages: new Map(),

    addOptimisticMessage: (message) => {
        const tempId = `temp_${uuidv4()}`;
        const optimisticMessage: OptimisticMessage = {
            ...message,
            tempId,
            status: 'sending',
            timestamp: new Date(),
        };

        set((state) => {
            const newMessages = new Map(state.messages);
            newMessages.set(tempId, optimisticMessage);
            return { messages: newMessages };
        });

        return tempId;
    },

    confirmMessage: (tempId, serverId) => {
        set((state) => {
            const newMessages = new Map(state.messages);
            const message = newMessages.get(tempId);

            if (message) {
                newMessages.set(tempId, {
                    ...message,
                    id: serverId,
                    status: 'sent',
                });
            }

            return { messages: newMessages };
        });

        // Remove after a delay
        setTimeout(() => {
            set((state) => {
                const newMessages = new Map(state.messages);
                newMessages.delete(tempId);
                return { messages: newMessages };
            });
        }, 1000);
    },

    failMessage: (tempId, error) => {
        set((state) => {
            const newMessages = new Map(state.messages);
            const message = newMessages.get(tempId);

            if (message) {
                newMessages.set(tempId, {
                    ...message,
                    status: 'failed',
                    error,
                });
            }

            return { messages: newMessages };
        });
    },

    retryMessage: (tempId) => {
        set((state) => {
            const newMessages = new Map(state.messages);
            const message = newMessages.get(tempId);

            if (message) {
                newMessages.set(tempId, {
                    ...message,
                    status: 'sending',
                    error: undefined,
                });
            }

            return { messages: newMessages };
        });
    },

    removeMessage: (tempId) => {
        set((state) => {
            const newMessages = new Map(state.messages);
            newMessages.delete(tempId);
            return { messages: newMessages };
        });
    },

    addOptimisticUpdate: (update) => {
        const id = uuidv4();
        const optimisticUpdate: OptimisticUpdate = {
            ...update,
            id,
            timestamp: Date.now(),
            status: 'pending',
        };

        set((state) => {
            const newUpdates = new Map(state.updates);
            newUpdates.set(id, optimisticUpdate);
            return { updates: newUpdates };
        });

        return id;
    },

    confirmUpdate: (updateId) => {
        set((state) => {
            const newUpdates = new Map(state.updates);
            const update = newUpdates.get(updateId);

            if (update) {
                newUpdates.set(updateId, {
                    ...update,
                    status: 'confirmed',
                });
            }

            return { updates: newUpdates };
        });

        // Remove after confirmation
        setTimeout(() => {
            set((state) => {
                const newUpdates = new Map(state.updates);
                newUpdates.delete(updateId);
                return { updates: newUpdates };
            });
        }, 500);
    },

    failUpdate: (updateId) => {
        set((state) => {
            const newUpdates = new Map(state.updates);
            const update = newUpdates.get(updateId);

            if (update) {
                newUpdates.set(updateId, {
                    ...update,
                    status: 'failed',
                });
            }

            return { updates: newUpdates };
        });
    },

    rollbackUpdate: (updateId) => {
        const { updates } = get();
        const update = updates.get(updateId);

        if (update && update.rollback) {
            update.rollback();
        }

        set((state) => {
            const newUpdates = new Map(state.updates);
            newUpdates.delete(updateId);
            return { updates: newUpdates };
        });
    },

    clearFailed: () => {
        set((state) => {
            const newMessages = new Map(state.messages);
            const newUpdates = new Map(state.updates);

            // Remove failed messages
            Array.from(newMessages.entries()).forEach(([id, message]) => {
                if (message.status === 'failed') {
                    newMessages.delete(id);
                }
            });

            // Remove failed updates
            Array.from(newUpdates.entries()).forEach(([id, update]) => {
                if (update.status === 'failed') {
                    newUpdates.delete(id);
                }
            });

            return { messages: newMessages, updates: newUpdates };
        });
    },

    clearAll: () => {
        set({ messages: new Map(), updates: new Map() });
    },
}));

// Hook to get optimistic messages for a conversation
export function useOptimisticMessages(conversationId: string): OptimisticMessage[] {
    return useOptimisticUI((state) =>
        Array.from(state.messages.values()).filter(
            (msg) => msg.conversationId === conversationId
        )
    );
}

// Hook to check if there are pending updates
export function useHasPendingUpdates(): boolean {
    return useOptimisticUI((state) =>
        Array.from(state.updates.values()).some((update) => update.status === 'pending')
    );
}

// Hook to get failed messages count
export function useFailedMessagesCount(): number {
    return useOptimisticUI((state) =>
        Array.from(state.messages.values()).filter((msg) => msg.status === 'failed').length
    );
}
