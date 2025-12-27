'use client';

import { Lock, Shield, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EncryptionIndicatorProps {
    isEncrypted?: boolean;
    variant?: 'inline' | 'banner' | 'badge';
}

export default function EncryptionIndicator({
    isEncrypted = true,
    variant = 'banner'
}: EncryptionIndicatorProps) {
    const [showDetails, setShowDetails] = useState(false);

    if (variant === 'badge') {
        return (
            <div className="flex items-center gap-1 text-xs text-green-500">
                <Lock className="w-3 h-3" />
                <span>E2EE</span>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-2 text-xs text-text-muted">
                <Lock className="w-3 h-3 text-green-500" />
                <span>End-to-end encrypted</span>
            </div>
        );
    }

    // Banner variant (default)
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-green-500" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-green-500" />
                        <h4 className="text-sm font-semibold text-green-500">
                            End-to-End Encrypted
                        </h4>
                    </div>

                    <p className="text-xs text-text-muted mb-2">
                        Messages are secured with end-to-end encryption. Only you and the recipient can read them.
                    </p>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs text-green-500 hover:underline flex items-center gap-1"
                    >
                        <Key className="w-3 h-3" />
                        {showDetails ? 'Hide' : 'View'} security details
                    </button>

                    {showDetails && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-surface rounded-lg space-y-2"
                        >
                            <div className="text-xs">
                                <span className="text-text-muted">Encryption Protocol:</span>
                                <span className="ml-2 text-text-primary font-mono">AES-256-GCM</span>
                            </div>
                            <div className="text-xs">
                                <span className="text-text-muted">Key Exchange:</span>
                                <span className="ml-2 text-text-primary font-mono">X25519</span>
                            </div>
                            <div className="text-xs">
                                <span className="text-text-muted">Safety Number:</span>
                                <span className="ml-2 text-text-primary font-mono text-[10px]">
                                    {generateSafetyNumber()}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Generate a fake safety number for demo
function generateSafetyNumber(): string {
    const segments = [];
    for (let i = 0; i < 6; i++) {
        segments.push(Math.floor(Math.random() * 100000).toString().padStart(5, '0'));
    }
    return segments.join(' ');
}

// Compact version for chat header
export function EncryptionBadge() {
    return (
        <div
            className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full cursor-pointer hover:bg-green-500/20 transition-colors"
            title="This chat is end-to-end encrypted"
        >
            <Lock className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500 font-medium">Encrypted</span>
        </div>
    );
}
