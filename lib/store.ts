import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away';
}

interface Message {
    _id: string;
    conversationId: string;
    sender: {
        _id: string;
        username: string;
        avatar?: string;
    };
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    reactions: { userId: string; emoji: string }[];
    readBy: { userId: string; readAt: Date }[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    replyTo?: Message;
}

interface Conversation {
    _id: string;
    type: 'direct' | 'group';
    participants: User[];
    name?: string;
    avatar?: string;
    lastMessage?: Message;
    lastMessageAt?: Date;
}

interface AuthState {
    user: User | null;
    token: string | null;
    socket: Socket | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    typingUsers: Map<string, string[]>;
    setCurrentConversation: (conversation: Conversation | null) => void;
    addMessage: (message: Message) => void;
    updateMessage: (messageId: string, updates: Partial<Message>) => void;
    setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    socket: null,
    isAuthenticated: false,

    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);

            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
            });

            get().connectSocket();
        } catch (error: any) {
            throw error;
        }
    },

    register: async (username: string, email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);

            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
            });

            get().connectSocket();
        } catch (error: any) {
            throw error;
        }
    },

    logout: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
        }
        localStorage.removeItem('token');
        set({
            user: null,
            token: null,
            socket: null,
            isAuthenticated: false,
        });
    },

    connectSocket: () => {
        const { token } = get();
        if (!token) return;

        const socket = io(API_URL, {
            auth: { token },
        });

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },
}));

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    typingUsers: new Map(),

    setCurrentConversation: (conversation: Conversation | null) => {
        set({ currentConversation: conversation, messages: [] });
    },

    addMessage: (message: Message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    updateMessage: (messageId: string, updates: Partial<Message>) => {
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg._id === messageId ? { ...msg, ...updates } : msg
            ),
        }));
    },

    setTyping: (conversationId: string, userId: string, isTyping: boolean) => {
        set((state) => {
            const typingUsers = new Map(state.typingUsers);
            const users = typingUsers.get(conversationId) || [];

            if (isTyping) {
                if (!users.includes(userId)) {
                    typingUsers.set(conversationId, [...users, userId]);
                }
            } else {
                typingUsers.set(
                    conversationId,
                    users.filter((id) => id !== userId)
                );
            }

            return { typingUsers };
        });
    },
}));
