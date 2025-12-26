'use client';

import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
    status: 'sending' | 'sent' | 'delivered' | 'seen';
    timestamp: Date | string;
}

export default function MessageStatus({ status, timestamp }: MessageStatusProps) {
    const formatTime = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
            <span>{formatTime(timestamp)}</span>

            {status === 'sending' && (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}

            {status === 'sent' && (
                <Check className="w-4 h-4" />
            )}

            {status === 'delivered' && (
                <CheckCheck className="w-4 h-4" />
            )}

            {status === 'seen' && (
                <CheckCheck className="w-4 h-4 text-blue-500" />
            )}
        </div>
    );
}
