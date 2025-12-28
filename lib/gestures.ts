/**
 * Gesture-Driven Actions System
 * Swipe, long-press, and drag gestures for messages
 */

'use client';

import { create } from 'zustand';

export type GestureType = 'swipe-left' | 'swipe-right' | 'long-press' | 'drag' | 'double-tap';
export type GestureAction = 'reply' | 'delete' | 'forward' | 'react' | 'pin' | 'copy' | 'select';

export interface GestureConfig {
    type: GestureType;
    action: GestureAction;
    threshold?: number; // pixels or ms
    enabled: boolean;
}

interface GestureState {
    configs: Map<GestureType, GestureConfig>;
    activeGesture: {
        type: GestureType | null;
        messageId: string | null;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
    };

    // Actions
    setGestureConfig: (type: GestureType, config: Partial<GestureConfig>) => void;
    startGesture: (type: GestureType, messageId: string, x: number, y: number) => void;
    updateGesture: (x: number, y: number) => void;
    endGesture: () => GestureAction | null;
    cancelGesture: () => void;
    getGestureProgress: () => number;
}

const defaultConfigs: Map<GestureType, GestureConfig> = new Map([
    ['swipe-left', { type: 'swipe-left', action: 'delete', threshold: 100, enabled: true }],
    ['swipe-right', { type: 'swipe-right', action: 'reply', threshold: 100, enabled: true }],
    ['long-press', { type: 'long-press', action: 'select', threshold: 500, enabled: true }],
    ['drag', { type: 'drag', action: 'forward', threshold: 150, enabled: true }],
    ['double-tap', { type: 'double-tap', action: 'react', threshold: 300, enabled: true }],
]);

export const useGestures = create<GestureState>((set, get) => ({
    configs: defaultConfigs,
    activeGesture: {
        type: null,
        messageId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    },

    setGestureConfig: (type, config) => {
        set((state) => {
            const newConfigs = new Map(state.configs);
            const current = newConfigs.get(type);
            if (current) {
                newConfigs.set(type, { ...current, ...config });
            }
            return { configs: newConfigs };
        });
    },

    startGesture: (type, messageId, x, y) => {
        set({
            activeGesture: {
                type,
                messageId,
                startX: x,
                startY: y,
                currentX: x,
                currentY: y,
            },
        });
    },

    updateGesture: (x, y) => {
        set((state) => ({
            activeGesture: {
                ...state.activeGesture,
                currentX: x,
                currentY: y,
            },
        }));
    },

    endGesture: () => {
        const { activeGesture, configs } = get();
        if (!activeGesture.type) return null;

        const config = configs.get(activeGesture.type);
        if (!config || !config.enabled) return null;

        const deltaX = activeGesture.currentX - activeGesture.startX;
        const deltaY = activeGesture.currentY - activeGesture.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        let action: GestureAction | null = null;

        // Check if gesture threshold is met
        if (config.threshold && distance >= config.threshold) {
            action = config.action;
        }

        set({
            activeGesture: {
                type: null,
                messageId: null,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
            },
        });

        return action;
    },

    cancelGesture: () => {
        set({
            activeGesture: {
                type: null,
                messageId: null,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
            },
        });
    },

    getGestureProgress: () => {
        const { activeGesture, configs } = get();
        if (!activeGesture.type) return 0;

        const config = configs.get(activeGesture.type);
        if (!config || !config.threshold) return 0;

        const deltaX = activeGesture.currentX - activeGesture.startX;
        const deltaY = activeGesture.currentY - activeGesture.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        return Math.min(1, distance / config.threshold);
    },
}));

// Hook to use gesture handlers
export function useGestureHandlers(messageId: string) {
    const { startGesture, updateGesture, endGesture, cancelGesture } = useGestures();

    return {
        onTouchStart: (e: React.TouchEvent) => {
            const touch = e.touches[0];
            startGesture('swipe-right', messageId, touch.clientX, touch.clientY);
        },
        onTouchMove: (e: React.TouchEvent) => {
            const touch = e.touches[0];
            updateGesture(touch.clientX, touch.clientY);
        },
        onTouchEnd: () => {
            const action = endGesture();
            return action;
        },
        onTouchCancel: () => {
            cancelGesture();
        },
    };
}
