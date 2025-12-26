'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Camera, User, Mail, Phone, Lock, Save, X, Upload, Shield } from 'lucide-react';
import { cn, getInitials, generateAvatarColor } from '@/lib/utils';

export default function ProfilePage({ onClose }: { onClose: () => void }) {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setAvatar(data.avatarUrl);
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username, bio, phone, avatar }),
            });

            if (response.ok) {
                const data = await response.json();
                // Update user in store
                useAuthStore.setState({
                    user: {
                        ...user!,
                        username,
                        bio,
                        avatar,
                    }
                });
                setIsEditing(false);
                onClose();
            }
        } catch (error) {
            console.error('Profile update error:', error);
        }
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
                    <h2 className="text-2xl font-bold gradient-text">Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            {previewAvatar ? (
                                <img
                                    src={previewAvatar}
                                    alt={username}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/50"
                                />
                            ) : (
                                <div className={cn(
                                    'w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-primary/50',
                                    generateAvatarColor(user?.id || '')
                                )}>
                                    {getInitials(username)}
                                </div>
                            )}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {uploading ? (
                                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-text-muted mt-3">Click to change profile photo</p>
                    </div>

                    {/* Profile Info */}
                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-text-primary disabled:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-text-primary opacity-60 outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="+1 (555) 123-4567"
                                    className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-text-primary disabled:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                disabled={!isEditing}
                                placeholder="Tell us about yourself..."
                                rows={3}
                                className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-text-primary disabled:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="glass rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Shield className="w-5 h-5" />
                            <h3 className="font-semibold">Security</h3>
                        </div>
                        <div className="space-y-2 text-sm text-text-secondary">
                            <p>✓ End-to-end encryption enabled</p>
                            <p>✓ Two-factor authentication: <span className="text-yellow-500">Not configured</span></p>
                            <p>✓ Last login: Just now</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-surface border border-border text-text-primary font-semibold py-3 rounded-lg hover:bg-surface-hover transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
