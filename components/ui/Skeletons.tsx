'use client';

import { motion } from 'framer-motion';

export function ChatListSkeleton() {
    return (
        <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg"
                >
                    {/* Avatar skeleton */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-surface-hover to-surface animate-pulse" />

                    <div className="flex-1 space-y-2">
                        {/* Name skeleton */}
                        <div className="h-4 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-3/4" />
                        {/* Message skeleton */}
                        <div className="h-3 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-1/2" />
                    </div>

                    {/* Time skeleton */}
                    <div className="h-3 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-12" />
                </motion.div>
            ))}
        </div>
    );
}

export function MessageListSkeleton() {
    return (
        <div className="flex-1 p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                    {i % 2 !== 0 && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-surface-hover to-surface animate-pulse" />
                    )}

                    <div className="space-y-2 max-w-md">
                        <div className={`h-16 rounded-2xl bg-gradient-to-r from-surface-hover to-surface animate-pulse ${i % 2 === 0 ? 'w-64' : 'w-48'
                            }`} />
                        <div className="h-3 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-16" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-surface-hover to-surface animate-pulse" />
            </div>

            {/* Name */}
            <div className="h-6 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-48 mx-auto" />

            {/* Bio */}
            <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-full" />
                <div className="h-4 bg-gradient-to-r from-surface-hover to-surface rounded animate-pulse w-3/4" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <div className="h-10 bg-gradient-to-r from-surface-hover to-surface rounded-lg animate-pulse flex-1" />
                <div className="h-10 bg-gradient-to-r from-surface-hover to-surface rounded-lg animate-pulse flex-1" />
            </div>
        </div>
    );
}
