/**
 * Premium Loading Skeleton Components
 * Beautiful loading states for better UX
 */

'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-lg',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
}

// Message Skeleton
export function MessageSkeleton() {
    return (
        <div className="flex gap-3 p-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
                <Skeleton width="30%" height={16} />
                <Skeleton width="80%" height={20} />
                <Skeleton width="60%" height={20} />
            </div>
        </div>
    );
}

// Conversation Skeleton
export function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="15%" height={12} />
                </div>
                <Skeleton width="70%" height={14} />
            </div>
        </div>
    );
}

// Chat Header Skeleton
export function ChatHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="space-y-2">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={12} />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={36} height={36} />
            </div>
        </div>
    );
}

// Chat List Skeleton
export function ChatListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <ConversationSkeleton key={i} />
            ))}
        </div>
    );
}

// Message List Skeleton
export function MessageListSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="space-y-4 p-4">
            {Array.from({ length: count }).map((_, i) => (
                <MessageSkeleton key={i} />
            ))}
        </div>
    );
}

// Full Page Skeleton
export function FullPageSkeleton() {
    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Skeleton width="60%" height={24} />
                </div>
                <ChatListSkeleton count={8} />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <ChatHeaderSkeleton />
                <div className="flex-1 overflow-hidden">
                    <MessageListSkeleton count={6} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Skeleton height={48} className="rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Shimmer effect component
export function Shimmer() {
    return (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    );
}

// Card Skeleton
export function CardSkeleton() {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <Skeleton width="60%" height={20} />
            <Skeleton width="100%" height={100} variant="rounded" />
            <div className="flex justify-between">
                <Skeleton width="30%" height={16} />
                <Skeleton width="20%" height={16} />
            </div>
        </div>
    );
}

// Grid Skeleton
export function GridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
    return (
        <div className={`grid grid-cols-${columns} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton height={16} />
                </td>
            ))}
        </tr>
    );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <table className="w-full">
            <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    {Array.from({ length: columns }).map((_, i) => (
                        <th key={i} className="p-4 text-left">
                            <Skeleton width="80%" height={16} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={columns} />
                ))}
            </tbody>
        </table>
    );
}
