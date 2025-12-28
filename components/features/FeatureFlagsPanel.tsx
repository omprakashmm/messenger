/**
 * Feature Flags Panel Component
 * Admin panel to toggle and configure features
 */

'use client';

import React, { useState } from 'react';
import { useFeatureFlags, type FeatureFlag } from '@/lib/feature-flags';
import { usePerformanceDashboard, formatBytes, getPerformanceScore } from '@/lib/performance-dashboard';
import { useTrustScore } from '@/lib/trust-score';
import { useSmartFeatures } from '@/lib/smart-features';
import { usePresence } from '@/lib/presence';
import { useThreads } from '@/lib/threads';
import { useOptimisticUI } from '@/lib/optimistic-ui';

export function FeatureFlagsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'features' | 'performance' | 'security'>('features');

    const { flags, toggleFeature, setRolloutPercentage } = useFeatureFlags();
    const { metrics, alerts } = usePerformanceDashboard();
    const performanceScore = getPerformanceScore(metrics);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
                title="Open Feature Flags Panel"
            >
                ⚙️ Features
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold">🚀 Premium Features Control Panel</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('features')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'features'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Features
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'performance'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'security'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Security
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'features' && <FeaturesTab />}
                    {activeTab === 'performance' && <PerformanceTab />}
                    {activeTab === 'security' && <SecurityTab />}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 dark:text-gray-400">
                                Performance Score:
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${performanceScore >= 80
                                                ? 'bg-green-500'
                                                : performanceScore >= 60
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            }`}
                                        style={{ width: `${performanceScore}%` }}
                                    />
                                </div>
                                <span className="font-bold">{performanceScore}/100</span>
                            </div>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            {alerts.length} active alerts
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeaturesTab() {
    const { flags, toggleFeature, setRolloutPercentage } = useFeatureFlags();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(flags).map(([key, config]) => (
                    <div
                        key={key}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </h3>
                                    {config.beta && (
                                        <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                            BETA
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {config.description}
                                </p>
                            </div>
                            <button
                                onClick={() => toggleFeature(key as FeatureFlag)}
                                className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {config.enabled && config.rolloutPercentage !== undefined && (
                            <div className="mt-3">
                                <label className="text-xs text-gray-600 dark:text-gray-400">
                                    Rollout: {config.rolloutPercentage}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={config.rolloutPercentage}
                                    onChange={(e) =>
                                        setRolloutPercentage(key as FeatureFlag, parseInt(e.target.value))
                                    }
                                    className="w-full mt-1"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function PerformanceTab() {
    const { metrics, alerts } = usePerformanceDashboard();

    return (
        <div className="space-y-6">
            {/* Web Vitals */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Web Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].map((metric) => (
                        <div
                            key={metric}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                            <div className="text-sm text-gray-600 dark:text-gray-400">{metric}</div>
                            <div className="text-2xl font-bold mt-1">
                                {metrics[metric as keyof typeof metrics]?.toFixed(0) || '-'}
                                <span className="text-sm text-gray-500 ml-1">ms</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Memory Usage</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span>{formatBytes(metrics.memoryUsage)}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {metrics.memoryPercentage?.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${(metrics.memoryPercentage || 0) > 80
                                        ? 'bg-red-500'
                                        : (metrics.memoryPercentage || 0) > 60
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}
                                style={{ width: `${metrics.memoryPercentage || 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Alerts</h3>
                    <div className="space-y-2">
                        {alerts.slice(0, 5).map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-3 rounded-lg ${alert.type === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">{alert.metric}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {alert.message}
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        {alert.value.toFixed(0)} / {alert.threshold}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SecurityTab() {
    const { scores } = useTrustScore();
    const { securityEvents } = useSmartFeatures();

    return (
        <div className="space-y-6">
            {/* Trust Scores */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Trust Scores</h3>
                <div className="space-y-2">
                    {Array.from(scores.values()).slice(0, 5).map((score) => (
                        <div
                            key={score.userId}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                        >
                            <div>
                                <div className="font-medium">User {score.userId.slice(0, 8)}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                    {score.level} trust
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{score.score}/100</div>
                        </div>
                    ))}
                    {scores.size === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No trust scores yet
                        </div>
                    )}
                </div>
            </div>

            {/* Security Timeline */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Security Timeline</h3>
                <div className="space-y-2">
                    {securityEvents.slice(0, 10).map((event) => (
                        <div
                            key={event.id}
                            className={`p-3 rounded-lg border ${event.severity === 'critical'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    : event.severity === 'warning'
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-medium capitalize">
                                        {event.type.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {event.description}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {securityEvents.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No security events yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
