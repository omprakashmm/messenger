'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';

interface DragDropUploadProps {
    onFilesSelected: (files: File[]) => void;
    children: React.ReactNode;
}

export default function DragDropUpload({ onFilesSelected, children }: DragDropUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            onFilesSelected(files);
        }
    }, [onFilesSelected]);

    return (
        <div
            onDrag={handleDrag}
            onDragStart={handleDrag}
            onDragEnd={handleDrag}
            onDragOver={handleDrag}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDrop={handleDrop}
            className="relative w-full h-full"
        >
            {children}

            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-primary rounded-lg"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
                            </motion.div>
                            <p className="text-xl font-semibold text-primary">
                                Drop files here to upload
                            </p>
                            <p className="text-sm text-text-muted mt-2">
                                Images, videos, documents
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
