import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaImage, FaCheck, FaBan, FaChevronLeft, FaChevronRight, FaExpand, FaDownload } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface PhotoGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    photos: string[]; // List of photo URLs
    title?: string;
    onApprove?: () => void;
    onReject?: () => void;
    isLoading?: boolean;
}

export default function PhotoGalleryModal({
    isOpen,
    onClose,
    photos,
    title,
    onApprove,
    onReject,
    isLoading = false
}: PhotoGalleryModalProps) {
    const t = useTranslations('modals.photoGallery');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLightboxOpen(false);
            setCurrentIndex(0);
            setLoadedImages(new Set());
        }
    }, [isOpen]);

    const handleImageLoad = (index: number) => {
        setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
        });
    };

    if (!isOpen) return null;
    const modalTitle = title || t('defaultTitle');

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!lightboxOpen) return;
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') setLightboxOpen(false);
    };

    const handleDownload = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        // Create a temporary link to force download without navigation
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `photo-${currentIndex}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-in fade-in zoom-in duration-200 my-8 flex flex-col max-h-[90vh]">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 end-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                    >
                        <FaTimes />
                    </button>

                    {/* Header Section - Yellow to match QuotationModal */}
                    <div className="bg-[#FCD34D] p-8 pb-10 relative overflow-hidden shrink-0">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="flex items-baseline gap-3 mb-1">
                                    <h2 className="text-2xl font-black text-gray-900">{modalTitle}</h2>
                                    <span className="px-3 py-1 bg-white/40 text-gray-900 text-xs font-bold rounded-full border border-white/20 flex items-center gap-1 backdrop-blur-sm">
                                        <FaImage className="text-gray-900" /> {isLoading ? '...' : photos.length} {t('photosLabel')}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900/70">{t('subtitle')}</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#FCD34D]">
                                <FaImage className="text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 -mt-6 bg-white rounded-t-3xl relative flex-1 overflow-y-auto min-h-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 h-64">
                                <svg className="animate-spin h-10 w-10 text-yellow-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-500 font-medium animate-pulse">{t('loading')}</p>
                            </div>
                        ) : photos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FaImage className="text-gray-300 text-2xl" />
                                </div>
                                <p className="text-gray-400 font-medium">{t('empty')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {photos.map((photoUrl, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm border border-gray-100 flex items-center justify-center"
                                        onClick={() => openLightbox(index)}
                                    >
                                        {!loadedImages.has(index) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
                                            </div>
                                        )}
                                        <Image
                                            src={photoUrl}
                                            alt={t('photoAlt', { index: index + 1 })}
                                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`}
                                            onLoad={() => handleImageLoad(index)}
                                            loading="lazy"
                                            width={400}
                                            height={400}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <FaExpand className="text-white text-xl drop-shadow-md transform scale-90 group-hover:scale-100 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {(onApprove || onReject) && (
                        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
                            <div className="flex justify-end gap-3">
                                {onReject && (
                                    <button
                                        onClick={onReject}
                                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <FaBan /> {t('actions.reject')}
                                    </button>
                                )}
                                {onApprove && (
                                    <button
                                        onClick={onApprove}
                                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                                    >
                                        <FaCheck /> {t('actions.approve')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Overlay */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-200 focus:outline-none" onKeyDown={handleKeyDown} tabIndex={0} autoFocus>
                    {/* Lightbox Toolbar */}
                    <div className="flex items-center justify-between p-4 text-white shrink-0">
                        <span className="font-medium text-white/80">
                            {currentIndex + 1} / {photos.length}
                        </span>
                        <div className="flex gap-4">
                            <button
                                onClick={(e) => handleDownload(e, photos[currentIndex])}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title={t('lightbox.openOriginal')}
                            >
                                <FaDownload />
                            </button>
                            <button
                                onClick={() => setLightboxOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Main Image Area */}
                    <div className="flex-1 relative flex items-center justify-center p-4">
                        <button
                            onClick={prevImage}
                            className="absolute start-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all hover:scale-110"
                        >
                            <FaChevronLeft className="text-xl rtl:rotate-180" />
                        </button>

                        <Image
                            src={photos[currentIndex]}
                            alt={t('lightbox.fullViewAlt', { index: currentIndex + 1 })}
                            className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-lg"
                            width={1200}
                            height={800}
                        />

                        <button
                            onClick={nextImage}
                            className="absolute end-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all hover:scale-110"
                        >
                            <FaChevronRight className="text-xl rtl:rotate-180" />
                        </button>
                    </div>

                    {/* Thumbnails Strip */}
                    <div className="h-20 bg-black/50 p-2 flex justify-center gap-2 overflow-x-auto backdrop-blur-sm shrink-0">
                        {photos.map((photo, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-orange-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <Image src={photo} alt={t('lightbox.thumbnailAlt')} className="w-full h-full object-cover" width={80} height={80} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
