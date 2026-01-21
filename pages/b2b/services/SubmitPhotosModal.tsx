import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaCloudUploadAlt, FaUpload } from 'react-icons/fa';

interface SubmitPhotosModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (files: File[]) => void;
}

export default function SubmitPhotosModal({
    isOpen,
    onClose,
    onSubmit
}: SubmitPhotosModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isClosing, setIsClosing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFiles([]);
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleFiles = (newFiles: FileList | null) => {
        if (newFiles) {
            const validFiles = Array.from(newFiles).filter(file =>
                ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
            );
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleSubmit = () => {
        onSubmit(files);
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-200 ${isClosing ? 'scale-95' : 'scale-100'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Submit Photos</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Upload Images</p>

                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${isDragging ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                            <FaCloudUploadAlt className="w-8 h-8 text-yellow-500" />
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            Drag and drop your images here
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                            or <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-yellow-500 hover:text-yellow-600 font-medium hover:underline"
                            >
                                click to browse
                            </button> from your device
                        </p>
                        <p className="text-xs text-gray-400">
                            Supports: JPG, PNG, GIF • Max 10MB per file
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>

                    {/* File Count Preview */}
                    {files.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <div className="text-sm text-gray-600">
                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-yellow-400 text-gray-900 text-sm font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                    >
                        <FaUpload className="w-4 h-4" />
                        Submit {files.length > 0 ? `${files.length} ` : ''}Photos
                    </button>
                </div>
            </div>
        </div>
    );
}
