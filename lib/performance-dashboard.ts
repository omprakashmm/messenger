/**
 * Performance Dashboard
 * Real-time performance metrics and monitoring
 */

'use client';

import { create } from 'zustand';
import type { Metric } from './performance';

export interface PerformanceMetrics {
    // Web Vitals
    LCP?: number; // Largest Contentful Paint
    FID?: number; // First Input Delay
    CLS?: number; // Cumulative Layout Shift
    FCP?: number; // First Contentful Paint
    TTFB?: number; // Time to First Byte

    // Custom Metrics
    messageLoadTime?: number;
    conversationLoadTime?: number;
    searchTime?: number;
    uploadTime?: number;

    // Network
    networkSpeed?: 'slow' | 'medium' | 'fast';
    latency?: number;
    bandwidth?: number;

    // Memory
    memoryUsage?: number;
    memoryLimit?: number;
    memoryPercentage?: number;

    // Errors
    errorCount?: number;
    warningCount?: number;

    // User Actions
    messagesPerMinute?: number;
    actionsPerMinute?: number;

    // Timestamps
    lastUpdated: Date;
}

export interface PerformanceAlert {
    id: string;
    type: 'error' | 'warning' | 'info';
    metric: string;
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
}

interface PerformanceDashboardState {
    metrics: PerformanceMetrics;
    alerts: PerformanceAlert[];
    history: Map<string, number[]>; // metric name -> values
    isMonitoring: boolean;

    // Actions
    updateMetric: (metric: keyof PerformanceMetrics, value: number) => void;
    updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
    recordWebVital: (vital: Metric) => void;
    addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
    clearAlerts: () => void;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    getMetricHistory: (metric: string) => number[];
    getAverageMetric: (metric: string) => number;
    reset: () => void;
}

const initialMetrics: PerformanceMetrics = {
    lastUpdated: new Date(),
};

const ALERT_THRESHOLDS = {
    LCP: 2500, // ms
    FID: 100, // ms
    CLS: 0.1,
    FCP: 1800, // ms
    TTFB: 800, // ms
    memoryPercentage: 80, // %
    errorCount: 10,
};

export const usePerformanceDashboard = create<PerformanceDashboardState>((set, get) => ({
    metrics: initialMetrics,
    alerts: [],
    history: new Map(),
    isMonitoring: false,

    updateMetric: (metric, value) => {
        set((state) => {
            // Add to history
            const newHistory = new Map(state.history);
            const history = newHistory.get(metric) || [];
            history.push(value);

            // Keep only last 100 values
            if (history.length > 100) {
                history.shift();
            }

            newHistory.set(metric, history);

            // Check thresholds
            const threshold = ALERT_THRESHOLDS[metric as keyof typeof ALERT_THRESHOLDS];
            if (threshold && value > threshold) {
                const alert: PerformanceAlert = {
                    id: `${metric}_${Date.now()}`,
                    type: 'warning',
                    metric,
                    message: `${metric} exceeded threshold`,
                    value,
                    threshold,
                    timestamp: new Date(),
                };

                return {
                    metrics: {
                        ...state.metrics,
                        [metric]: value,
                        lastUpdated: new Date(),
                    },
                    history: newHistory,
                    alerts: [...state.alerts, alert],
                };
            }

            return {
                metrics: {
                    ...state.metrics,
                    [metric]: value,
                    lastUpdated: new Date(),
                },
                history: newHistory,
            };
        });
    },

    updateMetrics: (metrics) => {
        set((state) => ({
            metrics: {
                ...state.metrics,
                ...metrics,
                lastUpdated: new Date(),
            },
        }));
    },

    recordWebVital: (vital) => {
        const metricMap: Record<string, keyof PerformanceMetrics> = {
            LCP: 'LCP',
            FID: 'FID',
            CLS: 'CLS',
            FCP: 'FCP',
            TTFB: 'TTFB',
        };

        const metricKey = metricMap[vital.name];
        if (metricKey) {
            get().updateMetric(metricKey, vital.value);
        }
    },

    addAlert: (alert) => {
        set((state) => ({
            alerts: [
                ...state.alerts,
                {
                    ...alert,
                    id: `alert_${Date.now()}`,
                    timestamp: new Date(),
                },
            ],
        }));
    },

    clearAlerts: () => {
        set({ alerts: [] });
    },

    startMonitoring: () => {
        set({ isMonitoring: true });

        // Monitor memory usage
        const memoryInterval = setInterval(() => {
            if (typeof performance !== 'undefined' && (performance as any).memory) {
                const memory = (performance as any).memory;
                const percentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

                get().updateMetrics({
                    memoryUsage: memory.usedJSHeapSize,
                    memoryLimit: memory.jsHeapSizeLimit,
                    memoryPercentage: percentage,
                });
            }
        }, 5000);

        // Store interval ID for cleanup
        (window as any).__performanceMonitorInterval = memoryInterval;
    },

    stopMonitoring: () => {
        set({ isMonitoring: false });

        if ((window as any).__performanceMonitorInterval) {
            clearInterval((window as any).__performanceMonitorInterval);
            delete (window as any).__performanceMonitorInterval;
        }
    },

    getMetricHistory: (metric) => {
        return get().history.get(metric) || [];
    },

    getAverageMetric: (metric) => {
        const history = get().getMetricHistory(metric);
        if (history.length === 0) return 0;

        const sum = history.reduce((acc, val) => acc + val, 0);
        return sum / history.length;
    },

    reset: () => {
        set({
            metrics: initialMetrics,
            alerts: [],
            history: new Map(),
        });
    },
}));

// Hook to get specific metric
export function useMetric(metric: keyof PerformanceMetrics): number | undefined {
    return usePerformanceDashboard((state) => state.metrics[metric] as number | undefined);
}

// Hook to get all alerts
export function usePerformanceAlerts(): PerformanceAlert[] {
    return usePerformanceDashboard((state) => state.alerts);
}

// Hook to get critical alerts
export function useCriticalAlerts(): PerformanceAlert[] {
    return usePerformanceDashboard((state) =>
        state.alerts.filter((alert) => alert.type === 'error')
    );
}

// Hook to check if performance is good
export function useIsPerformanceGood(): boolean {
    return usePerformanceDashboard((state) => {
        const { metrics } = state;

        // Check Web Vitals
        if (metrics.LCP && metrics.LCP > ALERT_THRESHOLDS.LCP) return false;
        if (metrics.FID && metrics.FID > ALERT_THRESHOLDS.FID) return false;
        if (metrics.CLS && metrics.CLS > ALERT_THRESHOLDS.CLS) return false;
        if (metrics.memoryPercentage && metrics.memoryPercentage > ALERT_THRESHOLDS.memoryPercentage) return false;

        return true;
    });
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Get performance score (0-100)
export function getPerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // Deduct points for poor metrics
    if (metrics.LCP && metrics.LCP > 2500) score -= 20;
    if (metrics.FID && metrics.FID > 100) score -= 15;
    if (metrics.CLS && metrics.CLS > 0.1) score -= 15;
    if (metrics.FCP && metrics.FCP > 1800) score -= 10;
    if (metrics.TTFB && metrics.TTFB > 800) score -= 10;
    if (metrics.memoryPercentage && metrics.memoryPercentage > 80) score -= 20;
    if (metrics.errorCount && metrics.errorCount > 5) score -= 10;

    return Math.max(0, score);
}
