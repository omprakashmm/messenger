import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMessageTime(date: Date | string): string {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm');
    }

    if (isYesterday(messageDate)) {
        return 'Yesterday';
    }

    return format(messageDate, 'MMM d');
}

export function formatLastSeen(date: Date | string): string {
    const lastSeenDate = new Date(date);
    return formatDistanceToNow(lastSeenDate, { addSuffix: true });
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function generateAvatarColor(id: string): string {
    const colors = [
        'bg-gradient-to-br from-purple-500 to-pink-500',
        'bg-gradient-to-br from-blue-500 to-cyan-500',
        'bg-gradient-to-br from-green-500 to-emerald-500',
        'bg-gradient-to-br from-orange-500 to-red-500',
        'bg-gradient-to-br from-indigo-500 to-purple-500',
        'bg-gradient-to-br from-pink-500 to-rose-500',
    ];

    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}
