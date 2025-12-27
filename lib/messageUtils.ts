import { v4 as uuidv4 } from 'uuid';

interface OptimisticMessage {
    _id: string;
    conversationId: string;
    sender: {
        _id: string;
        username: string;
        avatar?: string;
    };
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    status: 'sending' | 'sent' | 'delivered' | 'seen';
    reactions: any[];
    readBy: any[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    isOptimistic?: boolean;
}

export function createOptimisticMessage(
    content: string,
    conversationId: string,
    sender: any,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text'
): OptimisticMessage {
    return {
        _id: `optimistic-${uuidv4()}`,
        conversationId,
        sender: {
            _id: sender._id || sender.id,
            username: sender.username,
            avatar: sender.avatar,
        },
        content,
        type,
        status: 'sending',
        reactions: [],
        readBy: [],
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(),
        isOptimistic: true,
    };
}

export function replaceOptimisticMessage(
    messages: OptimisticMessage[],
    optimisticId: string,
    realMessage: any
): OptimisticMessage[] {
    return messages.map(msg =>
        msg._id === optimisticId ? { ...realMessage, isOptimistic: false } : msg
    );
}

export function removeOptimisticMessage(
    messages: OptimisticMessage[],
    optimisticId: string
): OptimisticMessage[] {
    return messages.filter(msg => msg._id !== optimisticId);
}

// Message Pagination Helper
export interface PaginationState {
    page: number;
    limit: number;
    hasMore: boolean;
    loading: boolean;
}

export function createPaginationState(limit: number = 20): PaginationState {
    return {
        page: 1,
        limit,
        hasMore: true,
        loading: false,
    };
}

export function paginateMessages<T>(
    allMessages: T[],
    page: number,
    limit: number
): { messages: T[]; hasMore: boolean } {
    const start = 0;
    const end = page * limit;
    const messages = allMessages.slice(start, end);
    const hasMore = allMessages.length > end;

    return { messages, hasMore };
}

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

// Draft storage
export const draftStorage = {
    save: (conversationId: string, content: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`draft-${conversationId}`, content);
        }
    },

    get: (conversationId: string): string => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(`draft-${conversationId}`) || '';
        }
        return '';
    },

    clear: (conversationId: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`draft-${conversationId}`);
        }
    },
};

// Date separator helper
export function shouldShowDateSeparator(
    currentMessage: any,
    previousMessage: any | null
): boolean {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);

    return currentDate.toDateString() !== previousDate.toDateString();
}

export function formatDateSeparator(date: Date | string): string {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return messageDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
    }
}
