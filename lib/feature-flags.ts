/**
 * Feature Flags System
 * Enables/disables features dynamically with A/B testing support
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Feature flag definitions
export type FeatureFlag =
    | 'optimistic_ui'
    | 'trust_score'
    | 'message_threads'
    | 'smart_reminders'
    | 'conversation_summarization'
    | 'live_presence'
    | 'gesture_actions'
    | 'security_timeline'
    | 'performance_dashboard'
    | 'ai_features'
    | 'offline_mode'
    | 'voice_messages'
    | 'video_calls';

interface FeatureFlagConfig {
    enabled: boolean;
    rolloutPercentage?: number; // 0-100
    allowedUsers?: string[]; // User IDs
    description?: string;
    beta?: boolean;
}

interface FeatureFlagsState {
    flags: Record<FeatureFlag, FeatureFlagConfig>;
    userId: string | null;

    // Actions
    setUserId: (userId: string) => void;
    isFeatureEnabled: (flag: FeatureFlag) => boolean;
    enableFeature: (flag: FeatureFlag) => void;
    disableFeature: (flag: FeatureFlag) => void;
    toggleFeature: (flag: FeatureFlag) => void;
    setRolloutPercentage: (flag: FeatureFlag, percentage: number) => void;
    addAllowedUser: (flag: FeatureFlag, userId: string) => void;
    removeAllowedUser: (flag: FeatureFlag, userId: string) => void;
    resetToDefaults: () => void;
}

// Default feature flags configuration
const defaultFlags: Record<FeatureFlag, FeatureFlagConfig> = {
    optimistic_ui: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Instant UI updates before server confirmation',
    },
    trust_score: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Security trust score and key verification',
    },
    message_threads: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Reply to specific messages with threads',
    },
    smart_reminders: {
        enabled: true,
        rolloutPercentage: 80,
        description: 'AI-powered message reminders',
        beta: true,
    },
    conversation_summarization: {
        enabled: true,
        rolloutPercentage: 80,
        description: 'AI-powered conversation summaries',
        beta: true,
    },
    live_presence: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Real-time presence and typing indicators',
    },
    gesture_actions: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Swipe and gesture-based actions',
    },
    security_timeline: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Security event timeline and audit log',
    },
    performance_dashboard: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Real-time performance metrics',
    },
    ai_features: {
        enabled: true,
        rolloutPercentage: 70,
        description: 'All AI-powered features',
        beta: true,
    },
    offline_mode: {
        enabled: true,
        rolloutPercentage: 90,
        description: 'Offline message support',
    },
    voice_messages: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Voice message recording and playback',
    },
    video_calls: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Video calling support',
    },
};

// Hash function for consistent rollout
function hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
}

export const useFeatureFlags = create<FeatureFlagsState>()(
    persist(
        (set, get) => ({
            flags: defaultFlags,
            userId: null,

            setUserId: (userId: string) => set({ userId }),

            isFeatureEnabled: (flag: FeatureFlag): boolean => {
                const { flags, userId } = get();
                const config = flags[flag];

                if (!config) return false;
                if (!config.enabled) return false;

                // Check if user is in allowed list
                if (config.allowedUsers && config.allowedUsers.length > 0) {
                    return userId ? config.allowedUsers.includes(userId) : false;
                }

                // Check rollout percentage
                if (config.rolloutPercentage !== undefined && userId) {
                    const userHash = hashUserId(userId);
                    return userHash < config.rolloutPercentage;
                }

                return config.enabled;
            },

            enableFeature: (flag: FeatureFlag) =>
                set((state) => ({
                    flags: {
                        ...state.flags,
                        [flag]: { ...state.flags[flag], enabled: true },
                    },
                })),

            disableFeature: (flag: FeatureFlag) =>
                set((state) => ({
                    flags: {
                        ...state.flags,
                        [flag]: { ...state.flags[flag], enabled: false },
                    },
                })),

            toggleFeature: (flag: FeatureFlag) =>
                set((state) => ({
                    flags: {
                        ...state.flags,
                        [flag]: {
                            ...state.flags[flag],
                            enabled: !state.flags[flag].enabled,
                        },
                    },
                })),

            setRolloutPercentage: (flag: FeatureFlag, percentage: number) =>
                set((state) => ({
                    flags: {
                        ...state.flags,
                        [flag]: {
                            ...state.flags[flag],
                            rolloutPercentage: Math.max(0, Math.min(100, percentage)),
                        },
                    },
                })),

            addAllowedUser: (flag: FeatureFlag, userId: string) =>
                set((state) => {
                    const currentUsers = state.flags[flag].allowedUsers || [];
                    return {
                        flags: {
                            ...state.flags,
                            [flag]: {
                                ...state.flags[flag],
                                allowedUsers: [...currentUsers, userId],
                            },
                        },
                    };
                }),

            removeAllowedUser: (flag: FeatureFlag, userId: string) =>
                set((state) => {
                    const currentUsers = state.flags[flag].allowedUsers || [];
                    return {
                        flags: {
                            ...state.flags,
                            [flag]: {
                                ...state.flags[flag],
                                allowedUsers: currentUsers.filter((id) => id !== userId),
                            },
                        },
                    };
                }),

            resetToDefaults: () => set({ flags: defaultFlags }),
        }),
        {
            name: 'feature-flags-storage',
        }
    )
);

// Hook for easy feature checking
export function useFeature(flag: FeatureFlag): boolean {
    return useFeatureFlags((state) => state.isFeatureEnabled(flag));
}

// Get all enabled features
export function useEnabledFeatures(): FeatureFlag[] {
    const { flags, isFeatureEnabled } = useFeatureFlags();
    return Object.keys(flags).filter((flag) =>
        isFeatureEnabled(flag as FeatureFlag)
    ) as FeatureFlag[];
}
