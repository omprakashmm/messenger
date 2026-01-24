/**
 * Message Content Component with Markdown Support
 * Renders message content with formatting support
 */

'use client';

import React from 'react';

interface MessageContentProps {
    content: string;
    className?: string;
}

export default function MessageContent({ content, className = '' }: MessageContentProps) {
    // Simple markdown-like formatting without external dependencies
    const formatContent = (text: string) => {
        // Split by newlines to preserve them
        const lines = text.split('\n');

        return lines.map((line, lineIndex) => {
            const parts: React.ReactNode[] = [];
            let currentIndex = 0;

            // Regex patterns for formatting
            const patterns = [
                { regex: /\*\*(.+?)\*\*/g, type: 'bold' },
                { regex: /\*(.+?)\*/g, type: 'italic' },
                { regex: /`(.+?)`/g, type: 'code' },
                { regex: /(https?:\/\/[^\s]+)/g, type: 'link' },
            ];

            // Find all matches
            const matches: Array<{ start: number; end: number; type: string; content: string; fullMatch: string }> = [];

            patterns.forEach(({ regex, type }) => {
                const regexCopy = new RegExp(regex.source, regex.flags);
                let match;
                while ((match = regexCopy.exec(line)) !== null) {
                    matches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        type,
                        content: match[1] || match[0],
                        fullMatch: match[0],
                    });
                }
            });

            // Sort matches by start position
            matches.sort((a, b) => a.start - b.start);

            // Remove overlapping matches (keep first one)
            const filteredMatches = matches.filter((match, index) => {
                if (index === 0) return true;
                const prevMatch = matches[index - 1];
                return match.start >= prevMatch.end;
            });

            // Build the formatted content
            filteredMatches.forEach((match, index) => {
                // Add text before this match
                if (match.start > currentIndex) {
                    parts.push(line.substring(currentIndex, match.start));
                }

                // Add formatted match
                const key = `${lineIndex}-${index}`;
                switch (match.type) {
                    case 'bold':
                        parts.push(<strong key={key}>{match.content}</strong>);
                        break;
                    case 'italic':
                        parts.push(<em key={key}>{match.content}</em>);
                        break;
                    case 'code':
                        parts.push(
                            <code
                                key={key}
                                className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono"
                            >
                                {match.content}
                            </code>
                        );
                        break;
                    case 'link':
                        parts.push(
                            <a
                                key={key}
                                href={match.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {match.content}
                            </a>
                        );
                        break;
                }

                currentIndex = match.end;
            });

            // Add remaining text
            if (currentIndex < line.length) {
                parts.push(line.substring(currentIndex));
            }

            // If no formatting found, just return the line
            if (parts.length === 0) {
                parts.push(line);
            }

            return (
                <React.Fragment key={lineIndex}>
                    {parts}
                    {lineIndex < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    return (
        <div className={`message-content whitespace-pre-wrap break-words ${className}`}>
            {formatContent(content)}
        </div>
    );
}
