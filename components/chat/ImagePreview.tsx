'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, RotateCw } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
    file: File;
    onSend: () => void;
    onCancel: () => void;
}

export default function ImagePreview({ file, onSend, onCancel }: ImagePreviewProps) {
    const [preview, setPreview] = useState<string>('');
    const [caption, setCaption] = useState('');

    // Generate preview
    useState(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-4xl w-full flex flex-col gap-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between text-white">
                        <h3 className="text-lg font-semibold">Send Image</h3>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Image Preview */}
                    <div className="relative bg-black rounded-lg overflow-hidden max-h-[60vh] flex items-center justify-center">
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-w-full max-h-[60vh] object-contain"
                            />
                        )}
                    </div>

                    {/* Caption Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add a caption..."
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                        <button
                            onClick={onSend}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center gap-2 font-semibold"
                        >
                            <Send className="w-5 h-5" />
                            Send
                        </button>
                    </div>

                    {/* File Info */}
                    <div className="text-white/70 text-sm">
                        <p>{file.name}</p>
                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
