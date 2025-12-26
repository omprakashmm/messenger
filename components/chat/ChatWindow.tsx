'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useChatStore } from '@/lib/store';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Info, ArrowLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatMessageTime, getInitials, generateAvatarColor } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { useNotificationStore } from '@/components/notifications/NotificationContainer';
import ChatOptionsMenu from './ChatOptionsMenu';
import TypingIndicator from './TypingIndicator';
import MessageReactions from './MessageReactions';
import MessageStatus from './MessageStatus';
import DragDropUpload from './DragDropUpload';
import SearchInConversation from './SearchInConversation';

export default function ChatWindow() {
    const { user, socket } = useAuthStore();
    const { currentConversation, messages, addMessage, typingUsers, loadMessages, setCurrentConversation } = useChatStore();
    const { addNotification } = useNotificationStore();
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [typingUsersList, setTypingUsersList] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

                    // Show notification ONLY if from someone else
                    // Check all possible ID combinations
                    const isFromMe =
                        (message.sender._id && message.sender._id === user?.id) ||
                        (message.sender._id && message.sender._id === user?._id) ||
                        (message.sender.id && message.sender.id === user?.id) ||
                        (message.sender.id && message.sender.id === user?._id) ||
                        (message.sender.username === user?.username);

                    if (!isFromMe) {
                        addNotification({
                            title: message.sender.username,
                            message: message.content,
                            avatar: message.sender.avatar,
                        });
                    }
                }
            });

            // Listen for typing indicators
            socket.on('typing:user', ({ userId, conversationId, isTyping, username }) => {
                if (conversationId === currentConversation._id && userId !== user?.id) {
                    setTypingUsersList(prev => {
                        if (isTyping && username && !prev.includes(username)) {
                            return [...prev, username];
                        } else if (!isTyping && username) {
                            return prev.filter(u => u !== username);
                        }
                        return prev;
                    });
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

        // Send to server - no optimistic UI
        socket.emit('message:send', {
            conversationId: currentConversation._id,
            content: messageInput,
            type: 'text',
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socket || !currentConversation) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/messages/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const { url, type } = await response.json();

                // Send message with media
                socket.emit('message:send', {
                    conversationId: currentConversation._id,
                    content: url,
                    type: type,
                });
            }
        } catch (error) {
            console.error('File upload error:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (!currentConversation) return null;

    // Find the other user - check all possible ID combinations
    const otherUser = currentConversation.participants.find((p) => {
        const participantId = p._id || p.id;
        const currentUserId = user?.id || user?._id;
        return participantId?.toString() !== currentUserId?.toString();
    });

    const conversationName = currentConversation.type === 'group'
        ? currentConversation.name
        : otherUser?.username || 'Unknown User';
    const otherUserAvatar = currentConversation.type === 'group'
        ? currentConversation.avatar
        : otherUser?.avatar;

    return (
        <DragDropUpload onFilesSelected={(files) => {
            files.forEach(file => {
                if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                    const fakeEvent = {
                        target: { files: [file] }
                    } as any;
                    handleFileUpload(fakeEvent);
                }
            });
        }}>
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

                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            title="Voice call"
                        >
                            <Phone className="w-5 h-5 text-text-secondary" />
                        </button>
                        <button
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            title="Video call"
                        >
                            <Video className="w-5 h-5 text-text-secondary" />
                        </button>
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            title="Search in conversation"
                        >
                            <Search className="w-5 h-5 text-text-secondary" />
                        </button>
                        <ChatOptionsMenu
                            onViewInfo={() => console.log('View info')}
                            onSearch={() => setShowSearch(true)}
                            onMute={() => console.log('Mute')}
                            onArchive={() => console.log('Archive')}
                            onBlock={() => console.log('Block')}
                            onDelete={() => console.log('Delete')}
                        />
                    </div>
                </div>

                {/* Search Component */}
                {showSearch && (
                    <SearchInConversation
                        messages={messages}
                        onClose={() => setShowSearch(false)}
                        onResultClick={(messageId) => {
                            const element = document.getElementById(`message-${messageId}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                    />
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
                    <AnimatePresence>
                        {messages.map((message, index) => {
                            // Check all possible ID combinations
                            const isSent =
                                (message.sender._id && message.sender._id === user?.id) ||
                                (message.sender._id && message.sender._id === user?._id) ||
                                (message.sender.id && message.sender.id === user?.id) ||
                                (message.sender.id && message.sender.id === user?._id) ||
                                (message.sender.username === user?.username);
                            const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;

                            return (
                                <motion.div
                                    key={message._id}
                                    id={`message-${message._id}`}
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

                                        {/* Render based on message type */}
                                        {message.type === 'image' ? (
                                            <img
                                                src={message.content}
                                                alt="Shared image"
                                                className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(message.content, '_blank')}
                                            />
                                        ) : message.type === 'video' ? (
                                            <video
                                                src={message.content}
                                                controls
                                                className="max-w-sm rounded-lg"
                                            />
                                        ) : message.type === 'audio' ? (
                                            <audio
                                                src={message.content}
                                                controls
                                                className="max-w-sm"
                                            />
                                        ) : message.type === 'file' ? (
                                            <a
                                                href={message.content}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-primary hover:underline"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                <span>Download File</span>
                                            </a>
                                        ) : (
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        )}

                                        {isSent && (
                                            <MessageStatus
                                                status={message.status || 'sent'}
                                                timestamp={message.createdAt}
                                            />
                                        )}
                                        {!isSent && (
                                            <span className="text-xs opacity-70 mt-1 block">
                                                {formatMessageTime(message.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {typingUsersList.length > 0 && (
                            <TypingIndicator username={typingUsersList[0]} />
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-surface border-t border-border p-4">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                        {/* Attach button - more visible */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="p-3 bg-surface-hover hover:bg-primary/20 rounded-full transition-all disabled:opacity-50 flex-shrink-0"
                            title="Attach media or files"
                        >
                            {uploading ? (
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Paperclip className="w-6 h-6 text-primary" />
                            )}
                        </button>

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
                                className="w-full bg-background border border-border rounded-2xl py-3 px-4 pr-12 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none max-h-32"
                            />
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="absolute right-3 bottom-3 p-1 hover:bg-surface-hover rounded-lg transition-colors"
                            >
                                <Smile className="w-5 h-5 text-text-secondary hover:text-primary transition-colors" />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-2 z-50">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} theme={'dark' as any} />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="Send message"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </DragDropUpload>
    );
}
