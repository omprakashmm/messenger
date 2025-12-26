'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { create } from 'zustand';

interface Notification {
    id: string;
    title: string;
    message: string;
    avatar?: string;
    timestamp: Date;
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
            ...notification,
            id,
            timestamp: new Date(),
        };

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 5000);

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: notification.avatar || '/logo.png',
                badge: '/logo.png',
            });
        }
    },
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
}));

export default function NotificationContainer() {
    const { notifications, removeNotification } = useNotificationStore();

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        className="glass rounded-xl p-4 shadow-2xl border border-border backdrop-blur-xl"
                    >
                        <div className="flex items-start gap-3">
                            {notification.avatar ? (
                                <img
                                    src={notification.avatar}
                                    alt={notification.title}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-text-primary text-sm">
                                        {notification.title}
                                    </h4>
                                    <button
                                        onClick={() => removeNotification(notification.id)}
                                        className="p-1 hover:bg-surface-hover rounded transition-colors flex-shrink-0"
                                    >
                                        <X className="w-4 h-4 text-text-muted" />
                                    </button>
                                </div>
                                <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-text-muted text-xs mt-1">
                                    {new Date(notification.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
