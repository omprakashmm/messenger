'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useChatStore } from '@/lib/store';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatMessageTime, getInitials, generateAvatarColor } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { useNotificationStore } from '@/components/notifications/NotificationContainer';

export default function ChatWindow() {
    const { user, socket } = useAuthStore();
    const { currentConversation, messages, addMessage, typingUsers, loadMessages, setCurrentConversation } = useChatStore();
    const { addNotification } = useNotificationStore();
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversation) {
            loadMessages(currentConversation._id);
        }
    }, [currentConversation?._id]);

    useEffect(() => {
        if (socket && currentConversation) {
            socket.emit('join:conversation', currentConversation._id);

            // Listen for new messages
            socket.on('message:new', (message) => {
                if (message.conversationId === currentConversation._id) {
                    addMessage(message);

                    // Show notification ONLY if from someone else (not me)
                    if (message.sender._id !== user?.id && message.sender.id !== user?.id) {
                        addNotification({
                            title: message.sender.username,
                            message: message.content,
                            avatar: message.sender.avatar,
                        });
                    }
                }
            });

            // Listen for typing indicators
            socket.on('typing:user', ({ userId, conversationId, isTyping }) => {
                if (conversationId === currentConversation._id && userId !== user?.id) {
                    // Handle typing indicator
                }
            });

            return () => {
                socket.emit('leave:conversation', currentConversation._id);
                socket.off('message:new');
                socket.off('typing:user');
            };
        }
    }, [socket, currentConversation, user, addMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!isTyping && socket && currentConversation) {
            setIsTyping(true);
            socket.emit('typing:start', currentConversation._id);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket && currentConversation) {
                socket.emit('typing:stop', currentConversation._id);
            }
        }, 1000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !socket || !currentConversation) return;

        const tempId = Date.now().toString();
        const messageContent = messageInput;

        // Optimistic UI - Add message immediately
        const optimisticMessage = {
            _id: tempId,
            conversationId: currentConversation._id,
            sender: {
                _id: user?.id || '',
                id: user?.id || '',
                username: user?.username || '',
                avatar: user?.avatar,
            },
            content: messageContent,
            type: 'text',
            createdAt: new Date().toISOString(),
            status: 'sending',
        };
        addMessage(optimisticMessage as any);

        // Send to server
        socket.emit('message:send', {
            conversationId: currentConversation._id,
            content: messageContent,
            type: 'text',
            tempId,
        });

        setMessageInput('');
        setShowEmojiPicker(false);

        if (isTyping) {
            setIsTyping(false);
            socket.emit('typing:stop', currentConversation._id);
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        setMessageInput((prev) => prev + emojiData.emoji);
    };

    if (!currentConversation) return null;

    const otherUser = currentConversation.participants.find((p) => p._id !== user?.id);
    const conversationName = currentConversation.type === 'group'
        ? currentConversation.name
        : otherUser?.username || 'Unknown';
    const otherUserAvatar = currentConversation.type === 'group'
        ? currentConversation.avatar
        : otherUser?.avatar;

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="h-16 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                        onClick={() => setCurrentConversation(null)}
                        className="md:hidden p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-secondary" />
                    </button>

                    <div className="relative">
                        {otherUserAvatar ? (
                            <img
                                src={otherUserAvatar}
                                alt={conversationName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
                                generateAvatarColor(otherUser?._id || currentConversation._id)
                            )}>
                                {getInitials(conversationName || '')}
                            </div>
                        )}
                        {otherUser?.status && (
                            <div className={cn('status-indicator', otherUser.status)} />
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-text-primary">{conversationName}</h2>
                        <p className="text-xs text-text-muted">
                            {otherUser?.status === 'online' ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
                        <Phone className="w-5 h-5 text-text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
                        <Video className="w-5 h-5 text-text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
                        <Info className="w-5 h-5 text-text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
                <AnimatePresence>
                    {messages.map((message, index) => {
                        const isSent = message.sender._id === user?.id || message.sender.id === user?.id;
                        const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;

                        return (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn('flex gap-2', isSent ? 'justify-end' : 'justify-start')}
                            >
                                {!isSent && showAvatar && (
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                                        generateAvatarColor(message.sender._id)
                                    )}>
                                        {getInitials(message.sender.username)}
                                    </div>
                                )}
                                {!isSent && !showAvatar && <div className="w-8" />}

                                <div className={cn('message-bubble', isSent ? 'sent' : 'received')}>
                                    {!isSent && showAvatar && (
                                        <p className="text-xs font-semibold mb-1 text-primary">
                                            {message.sender.username}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                        <span className="text-xs opacity-70">
                                            {formatMessageTime(message.createdAt)}
                                        </span>
                                        {isSent && (
                                            <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-surface border-t border-border p-4">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={messageInput}
                            onChange={(e) => {
                                setMessageInput(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full bg-background border border-border rounded-lg py-3 px-4 pr-20 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none max-h-32"
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            >
                                <Smile className="w-5 h-5 text-text-secondary" />
                            </button>
                            <button
                                type="button"
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            >
                                <Paperclip className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>

                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2">
                                <EmojiPicker onEmojiClick={handleEmojiClick} theme={'dark' as any} />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
