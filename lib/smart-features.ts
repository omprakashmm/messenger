/**
 * Smart Reminders & Conversation Summarization
 * AI-powered features for better messaging experience
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============= SMART REMINDERS =============

export interface SmartReminder {
    id: string;
    messageId: string;
    conversationId: string;
    content: string;
    detectedKeywords: string[];
    reminderTime: Date;
    status: 'pending' | 'snoozed' | 'completed' | 'dismissed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    notifiedAt?: Date;
}

// Keywords that trigger reminders
const REMINDER_KEYWORDS = [
    'remind', 'reminder', 'don\'t forget', 'remember',
    'tomorrow', 'later', 'next week', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'meeting', 'call', 'deadline', 'due', 'appointment'
];

// Extract reminder from message content
export function detectReminder(content: string): {
    hasReminder: boolean;
    keywords: string[];
    suggestedTime?: Date;
} {
    const lowerContent = content.toLowerCase();
    const foundKeywords = REMINDER_KEYWORDS.filter(keyword =>
        lowerContent.includes(keyword)
    );

    if (foundKeywords.length === 0) {
        return { hasReminder: false, keywords: [] };
    }

    // Simple time detection
    let suggestedTime: Date | undefined;
    const now = new Date();

    if (lowerContent.includes('tomorrow')) {
        suggestedTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (lowerContent.includes('next week')) {
        suggestedTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (lowerContent.includes('later')) {
        suggestedTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours
    }

    return {
        hasReminder: true,
        keywords: foundKeywords,
        suggestedTime,
    };
}

// ============= CONVERSATION SUMMARIZATION =============

export interface ConversationSummary {
    id: string;
    conversationId: string;
    summary: string;
    keyPoints: string[];
    participants: string[];
    messageCount: number;
    timeRange: {
        start: Date;
        end: Date;
    };
    topics: string[];
    createdAt: Date;
}

// Generate simple summary (can be enhanced with AI)
export function generateSummary(messages: any[]): ConversationSummary | null {
    if (messages.length === 0) return null;

    const participants = Array.from(new Set(messages.map(m => m.senderId)));
    const timeRange = {
        start: new Date(messages[0].timestamp),
        end: new Date(messages[messages.length - 1].timestamp),
    };

    // Extract key points (messages with questions or important keywords)
    const keyPoints = messages
        .filter(m =>
            m.content.includes('?') ||
            m.content.toLowerCase().includes('important') ||
            m.content.toLowerCase().includes('urgent')
        )
        .slice(0, 5)
        .map(m => m.content);

    // Simple topic extraction (most common words)
    const words = messages
        .map(m => m.content.toLowerCase().split(/\s+/))
        .flat()
        .filter(w => w.length > 4); // Filter short words

    const wordCount = new Map<string, number>();
    words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    const topics = Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

    const summary = `Conversation with ${participants.length} participants. ${messages.length} messages exchanged. Main topics: ${topics.join(', ')}.`;

    return {
        id: `summary_${Date.now()}`,
        conversationId: messages[0].conversationId,
        summary,
        keyPoints,
        participants,
        messageCount: messages.length,
        timeRange,
        topics,
        createdAt: new Date(),
    };
}

// ============= SECURITY TIMELINE =============

export interface SecurityEvent {
    id: string;
    type: 'key_change' | 'verification' | 'encryption_error' | 'suspicious_activity' | 'login' | 'logout';
    userId: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: Date;
    metadata?: Record<string, any>;
}

// ============= ZUSTAND STORES =============

interface SmartFeaturesState {
    // Reminders
    reminders: Map<string, SmartReminder>;
    addReminder: (reminder: Omit<SmartReminder, 'id' | 'createdAt' | 'status'>) => string;
    updateReminder: (id: string, updates: Partial<SmartReminder>) => void;
    snoozeReminder: (id: string, duration: number) => void;
    completeReminder: (id: string) => void;
    dismissReminder: (id: string) => void;
    getPendingReminders: () => SmartReminder[];

    // Summaries
    summaries: Map<string, ConversationSummary>;
    addSummary: (summary: ConversationSummary) => void;
    getSummary: (conversationId: string) => ConversationSummary | null;
    generateAndStoreSummary: (conversationId: string, messages: any[]) => void;

    // Security Timeline
    securityEvents: SecurityEvent[];
    addSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
    getSecurityEvents: (userId?: string) => SecurityEvent[];
    getCriticalEvents: () => SecurityEvent[];

    clearAll: () => void;
}

export const useSmartFeatures = create<SmartFeaturesState>()(
    persist(
        (set, get) => ({
            reminders: new Map(),
            summaries: new Map(),
            securityEvents: [],

            // Reminders
            addReminder: (reminder) => {
                const id = `reminder_${Date.now()}`;
                set((state) => {
                    const newReminders = new Map(state.reminders);
                    newReminders.set(id, {
                        ...reminder,
                        id,
                        createdAt: new Date(),
                        status: 'pending',
                    });
                    return { reminders: newReminders };
                });
                return id;
            },

            updateReminder: (id, updates) => {
                set((state) => {
                    const newReminders = new Map(state.reminders);
                    const reminder = newReminders.get(id);
                    if (reminder) {
                        newReminders.set(id, { ...reminder, ...updates });
                    }
                    return { reminders: newReminders };
                });
            },

            snoozeReminder: (id, duration) => {
                const reminder = get().reminders.get(id);
                if (reminder) {
                    const newTime = new Date(Date.now() + duration);
                    get().updateReminder(id, {
                        reminderTime: newTime,
                        status: 'snoozed',
                    });
                }
            },

            completeReminder: (id) => {
                get().updateReminder(id, {
                    status: 'completed',
                    notifiedAt: new Date(),
                });
            },

            dismissReminder: (id) => {
                get().updateReminder(id, { status: 'dismissed' });
            },

            getPendingReminders: () => {
                const { reminders } = get();
                const now = new Date();
                return Array.from(reminders.values())
                    .filter(r => r.status === 'pending' && r.reminderTime <= now)
                    .sort((a, b) => a.reminderTime.getTime() - b.reminderTime.getTime());
            },

            // Summaries
            addSummary: (summary) => {
                set((state) => {
                    const newSummaries = new Map(state.summaries);
                    newSummaries.set(summary.conversationId, summary);
                    return { summaries: newSummaries };
                });
            },

            getSummary: (conversationId) => {
                return get().summaries.get(conversationId) || null;
            },

            generateAndStoreSummary: (conversationId, messages) => {
                const summary = generateSummary(messages);
                if (summary) {
                    get().addSummary(summary);
                }
            },

            // Security Timeline
            addSecurityEvent: (event) => {
                set((state) => ({
                    securityEvents: [
                        ...state.securityEvents,
                        {
                            ...event,
                            id: `event_${Date.now()}`,
                            timestamp: new Date(),
                        },
                    ].slice(-100), // Keep last 100 events
                }));
            },

            getSecurityEvents: (userId) => {
                const { securityEvents } = get();
                if (userId) {
                    return securityEvents.filter(e => e.userId === userId);
                }
                return securityEvents;
            },

            getCriticalEvents: () => {
                return get().securityEvents.filter(e => e.severity === 'critical');
            },

            clearAll: () => {
                set({
                    reminders: new Map(),
                    summaries: new Map(),
                    securityEvents: [],
                });
            },
        }),
        {
            name: 'smart-features-storage',
        }
    )
);

// Hooks
export function usePendingReminders(): SmartReminder[] {
    return useSmartFeatures((state) => state.getPendingReminders());
}

export function useConversationSummary(conversationId: string): ConversationSummary | null {
    return useSmartFeatures((state) => state.getSummary(conversationId));
}

export function useSecurityTimeline(userId?: string): SecurityEvent[] {
    return useSmartFeatures((state) => state.getSecurityEvents(userId));
}

export function useCriticalSecurityEvents(): SecurityEvent[] {
    return useSmartFeatures((state) => state.getCriticalEvents());
}
