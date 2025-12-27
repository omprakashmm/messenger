'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, CornerDownLeft, Command } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatSettingsProps {
    onSendSoundChange?: (enabled: boolean) => void;
    onEnterToSendChange?: (enabled: boolean) => void;
}

export default function ChatSettings({
    onSendSoundChange,
    onEnterToSendChange
}: ChatSettingsProps) {
    const [sendSound, setSendSound] = useState(true);
    const [enterToSend, setEnterToSend] = useState(true);

    // Load from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSendSound = localStorage.getItem('sendSound');
            const savedEnterToSend = localStorage.getItem('enterToSend');

            if (savedSendSound !== null) {
                setSendSound(savedSendSound === 'true');
            }
            if (savedEnterToSend !== null) {
                setEnterToSend(savedEnterToSend === 'true');
            }
        }
    }, []);

    const handleSendSoundToggle = () => {
        const newValue = !sendSound;
        setSendSound(newValue);
        localStorage.setItem('sendSound', String(newValue));
        onSendSoundChange?.(newValue);
    };

    const handleEnterToSendToggle = () => {
        const newValue = !enterToSend;
        setEnterToSend(newValue);
        localStorage.setItem('enterToSend', String(newValue));
        onEnterToSendChange?.(newValue);
    };

    return (
        <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Chat Settings</h3>

            {/* Send Sound Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {sendSound ? (
                        <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                        <VolumeX className="w-5 h-5 text-text-muted" />
                    )}
                    <div>
                        <p className="text-sm font-medium text-text-primary">Send Sound</p>
                        <p className="text-xs text-text-muted">Play sound when sending messages</p>
                    </div>
                </div>

                <button
                    onClick={handleSendSoundToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${sendSound ? 'bg-primary' : 'bg-surface-hover'
                        }`}
                >
                    <motion.div
                        animate={{ x: sendSound ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                </button>
            </div>

            {/* Enter to Send Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CornerDownLeft className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">Enter to Send</p>
                        <p className="text-xs text-text-muted">
                            {enterToSend ? 'Press Enter to send' : 'Press Ctrl+Enter to send'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleEnterToSendToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${enterToSend ? 'bg-primary' : 'bg-surface-hover'
                        }`}
                >
                    <motion.div
                        animate={{ x: enterToSend ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                </button>
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="pt-3 border-t border-border">
                <p className="text-xs text-text-muted flex items-center gap-2">
                    <Command className="w-3 h-3" />
                    Tip: {enterToSend ? 'Use Shift+Enter for new line' : 'Use Enter for new line'}
                </p>
            </div>
        </div>
    );
}

// Compact toggle for quick access
export function QuickToggle({
    icon: Icon,
    label,
    enabled,
    onToggle
}: {
    icon: any;
    label: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${enabled
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-hover text-text-muted hover:bg-surface'
                }`}
        >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
        </button>
    );
}

// Hook for using chat settings
export function useChatSettings() {
    const [sendSound, setSendSound] = useState(true);
    const [enterToSend, setEnterToSend] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSendSound = localStorage.getItem('sendSound');
            const savedEnterToSend = localStorage.getItem('enterToSend');

            if (savedSendSound !== null) setSendSound(savedSendSound === 'true');
            if (savedEnterToSend !== null) setEnterToSend(savedEnterToSend === 'true');
        }
    }, []);

    return { sendSound, enterToSend };
}
