'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, useChatStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { motion } from 'framer-motion';

export default function ChatPage() {
    const { isAuthenticated, user, socket } = useAuthStore();
    const { currentConversation } = useChatStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/');
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, router]);

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Chat Window */}
            {currentConversation ? (
                <ChatWindow />
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <svg
                                className="w-16 h-16 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">
                            Welcome to Messenger, {user?.username}!
                        </h2>
                        <p className="text-text-secondary">
                            Select a conversation to start messaging
                        </p>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
