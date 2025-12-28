/**
 * Trust Score & Key Verification System
 * Security scoring and encryption key verification
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

export interface SecurityKey {
    publicKey: string;
    fingerprint: string;
    algorithm: 'RSA' | 'Ed25519';
    createdAt: Date;
    lastUsed: Date;
}

export interface TrustScore {
    userId: string;
    score: number; // 0-100
    level: 'untrusted' | 'low' | 'medium' | 'high' | 'verified';
    factors: {
        keyVerified: boolean;
        messagesExchanged: number;
        accountAge: number; // days
        mutualContacts: number;
        reportedIssues: number;
        encryptionConsistent: boolean;
    };
    lastUpdated: Date;
}

export interface KeyVerification {
    userId: string;
    fingerprint: string;
    verifiedAt: Date;
    verifiedBy: string;
    method: 'qr' | 'manual' | 'auto';
    trusted: boolean;
}

interface TrustScoreState {
    scores: Map<string, TrustScore>;
    keys: Map<string, SecurityKey>;
    verifications: Map<string, KeyVerification>;

    // Actions
    calculateTrustScore: (userId: string) => number;
    updateTrustScore: (userId: string, factors: Partial<TrustScore['factors']>) => void;
    getTrustScore: (userId: string) => TrustScore | null;
    getTrustLevel: (userId: string) => TrustScore['level'];

    // Key management
    addKey: (userId: string, key: Omit<SecurityKey, 'createdAt' | 'lastUsed'>) => void;
    getKey: (userId: string) => SecurityKey | null;
    verifyKey: (userId: string, fingerprint: string, method: KeyVerification['method']) => boolean;
    isKeyVerified: (userId: string) => boolean;

    // Verification
    addVerification: (verification: Omit<KeyVerification, 'verifiedAt'>) => void;
    getVerification: (userId: string) => KeyVerification | null;
    revokeVerification: (userId: string) => void;

    clearAll: () => void;
}

// Calculate trust level from score
function getTrustLevelFromScore(score: number): TrustScore['level'] {
    if (score >= 90) return 'verified';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'untrusted';
}

// Generate key fingerprint
export function generateFingerprint(publicKey: string): string {
    const hash = CryptoJS.SHA256(publicKey);
    return hash.toString(CryptoJS.enc.Hex).substring(0, 40);
}

export const useTrustScore = create<TrustScoreState>()(
    persist(
        (set, get) => ({
            scores: new Map(),
            keys: new Map(),
            verifications: new Map(),

            calculateTrustScore: (userId) => {
                const score = get().scores.get(userId);
                if (!score) return 0;

                const { factors } = score;
                let totalScore = 0;

                // Key verified (30 points)
                if (factors.keyVerified) totalScore += 30;

                // Messages exchanged (20 points max)
                totalScore += Math.min(20, factors.messagesExchanged / 10);

                // Account age (15 points max)
                totalScore += Math.min(15, factors.accountAge / 10);

                // Mutual contacts (15 points max)
                totalScore += Math.min(15, factors.mutualContacts * 3);

                // Encryption consistent (15 points)
                if (factors.encryptionConsistent) totalScore += 15;

                // Deduct for reported issues
                totalScore -= factors.reportedIssues * 10;

                // Bonus for verification
                const verification = get().verifications.get(userId);
                if (verification && verification.trusted) totalScore += 5;

                return Math.max(0, Math.min(100, totalScore));
            },

            updateTrustScore: (userId, factors) => {
                set((state) => {
                    const newScores = new Map(state.scores);
                    const current = newScores.get(userId) || {
                        userId,
                        score: 0,
                        level: 'untrusted' as const,
                        factors: {
                            keyVerified: false,
                            messagesExchanged: 0,
                            accountAge: 0,
                            mutualContacts: 0,
                            reportedIssues: 0,
                            encryptionConsistent: true,
                        },
                        lastUpdated: new Date(),
                    };

                    const updatedFactors = { ...current.factors, ...factors };
                    const score = get().calculateTrustScore(userId);

                    newScores.set(userId, {
                        ...current,
                        factors: updatedFactors,
                        score,
                        level: getTrustLevelFromScore(score),
                        lastUpdated: new Date(),
                    });

                    return { scores: newScores };
                });
            },

            getTrustScore: (userId) => {
                return get().scores.get(userId) || null;
            },

            getTrustLevel: (userId) => {
                const score = get().getTrustScore(userId);
                return score?.level || 'untrusted';
            },

            addKey: (userId, key) => {
                set((state) => {
                    const newKeys = new Map(state.keys);
                    newKeys.set(userId, {
                        ...key,
                        createdAt: new Date(),
                        lastUsed: new Date(),
                    });
                    return { keys: newKeys };
                });
            },

            getKey: (userId) => {
                return get().keys.get(userId) || null;
            },

            verifyKey: (userId, fingerprint, method) => {
                const key = get().getKey(userId);
                if (!key) return false;

                const isValid = key.fingerprint === fingerprint;

                if (isValid) {
                    // Add verification
                    get().addVerification({
                        userId,
                        fingerprint,
                        verifiedBy: 'current_user', // Should be actual current user ID
                        method,
                        trusted: true,
                    });

                    // Update trust score
                    get().updateTrustScore(userId, { keyVerified: true });
                }

                return isValid;
            },

            isKeyVerified: (userId) => {
                const verification = get().verifications.get(userId);
                return verification?.trusted || false;
            },

            addVerification: (verification) => {
                set((state) => {
                    const newVerifications = new Map(state.verifications);
                    newVerifications.set(verification.userId, {
                        ...verification,
                        verifiedAt: new Date(),
                    });
                    return { verifications: newVerifications };
                });
            },

            getVerification: (userId) => {
                return get().verifications.get(userId) || null;
            },

            revokeVerification: (userId) => {
                set((state) => {
                    const newVerifications = new Map(state.verifications);
                    newVerifications.delete(userId);
                    return { verifications: newVerifications };
                });

                // Update trust score
                get().updateTrustScore(userId, { keyVerified: false });
            },

            clearAll: () => {
                set({
                    scores: new Map(),
                    keys: new Map(),
                    verifications: new Map(),
                });
            },
        }),
        {
            name: 'trust-score-storage',
        }
    )
);

// Hook to get trust score for a user
export function useUserTrustScore(userId: string): TrustScore | null {
    return useTrustScore((state) => state.getTrustScore(userId));
}

// Hook to get trust level
export function useUserTrustLevel(userId: string): TrustScore['level'] {
    return useTrustScore((state) => state.getTrustLevel(userId));
}

// Hook to check if key is verified
export function useIsKeyVerified(userId: string): boolean {
    return useTrustScore((state) => state.isKeyVerified(userId));
}

// Get trust score color
export function getTrustScoreColor(level: TrustScore['level']): string {
    switch (level) {
        case 'verified':
            return 'text-green-500';
        case 'high':
            return 'text-blue-500';
        case 'medium':
            return 'text-yellow-500';
        case 'low':
            return 'text-orange-500';
        case 'untrusted':
            return 'text-red-500';
    }
}

// Get trust score icon
export function getTrustScoreIcon(level: TrustScore['level']): string {
    switch (level) {
        case 'verified':
            return '✓';
        case 'high':
            return '🔒';
        case 'medium':
            return '🔓';
        case 'low':
            return '⚠️';
        case 'untrusted':
            return '❌';
    }
}
