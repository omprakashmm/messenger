'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Sun, Lock, Bell, Shield, Palette, Volume2, VolumeX } from 'lucide-react';
import { toggleSound, toggleHaptic, isSoundEnabled, isHapticEnabled } from '@/lib/sounds';

interface SettingsPageProps {
    onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [notifications, setNotifications] = useState(true);
    const [sounds, setSounds] = useState(isSoundEnabled());
    const [haptics, setHaptics] = useState(isHapticEnabled());

    const handleSoundToggle = (enabled: boolean) => {
        setSounds(enabled);
        toggleSound(enabled);
    };

    const handleHapticToggle = (enabled: boolean) => {
        setHaptics(enabled);
        toggleHaptic(enabled);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 glass border-b border-border p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold gradient-text">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Theme */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Palette className="w-5 h-5" />
                            <h3 className="font-semibold">Appearance</h3>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <Moon className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <p className="text-sm font-medium text-text-primary">Dark</p>
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${theme === 'light'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                                <p className="text-sm font-medium text-text-primary">Light</p>
                                <p className="text-xs text-text-muted mt-1">Coming Soon</p>
                            </button>
                        </div>
                    </div>

                    {/* Notifications & Sounds */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Bell className="w-5 h-5" />
                            <h3 className="font-semibold">Notifications & Sounds</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-text-secondary" />
                                    <div>
                                        <p className="text-text-primary font-medium">Push Notifications</p>
                                        <p className="text-xs text-text-muted">Show desktop notifications</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={(e) => setNotifications(e.target.checked)}
                                    className="w-5 h-5 accent-primary"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    {sounds ? (
                                        <Volume2 className="w-5 h-5 text-text-secondary" />
                                    ) : (
                                        <VolumeX className="w-5 h-5 text-text-secondary" />
                                    )}
                                    <div>
                                        <p className="text-text-primary font-medium">Sound Effects</p>
                                        <p className="text-xs text-text-muted">Typing and message sounds</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={sounds}
                                    onChange={(e) => handleSoundToggle(e.target.checked)}
                                    className="w-5 h-5 accent-primary"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 text-text-secondary">📳</div>
                                    <div>
                                        <p className="text-text-primary font-medium">Haptic Feedback</p>
                                        <p className="text-xs text-text-muted">Vibration on mobile devices</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={haptics}
                                    onChange={(e) => handleHapticToggle(e.target.checked)}
                                    className="w-5 h-5 accent-primary"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Shield className="w-5 h-5" />
                            <h3 className="font-semibold">Security & Privacy</h3>
                        </div>
                        <button className="w-full p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-text-secondary" />
                                <div>
                                    <p className="font-medium text-text-primary">Change Password</p>
                                    <p className="text-sm text-text-muted">Update your account password</p>
                                </div>
                            </div>
                        </button>
                        <div className="glass rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-500" />
                                <p className="text-sm font-medium text-text-primary">End-to-End Encryption</p>
                            </div>
                            <p className="text-xs text-text-muted">
                                Your messages are secured with end-to-end encryption. Only you and the recipient can read them.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
