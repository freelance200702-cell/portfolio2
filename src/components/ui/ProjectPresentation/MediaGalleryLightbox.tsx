import React, { useEffect, useCallback } from 'react';
import type { MediaItem } from '@/types/project';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { MonoLabel } from '@/components/common/Typography';

interface MediaGalleryLightboxProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export const MediaGalleryLightbox: React.FC<MediaGalleryLightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
}) => {
  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    onSelectIndex((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media Lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 select-none pointer-events-auto"
      onClick={onClose}
    >
      {/* Top Controls Header */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-white/10 text-white">
            <Maximize2 className="h-3.5 w-3.5" />
          </div>
          <MonoLabel className="text-[11px] tracking-[0.2em] text-foreground">
            ASSET VIEWER // {String(currentIndex + 1).padStart(2, '0')} OF {String(items.length).padStart(2, '0')}
          </MonoLabel>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-sm border border-white/10 bg-black/60 text-foreground hover:bg-white/10 hover:text-white"
          aria-label="Close Lightbox"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div
        className="relative max-w-5xl max-h-[82vh] w-full flex flex-col items-center justify-center pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {currentItem.type === 'video' ? (
          <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 bg-black shadow-2xl">
            <video
              src={currentItem.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="relative max-w-full max-h-[72vh] rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-[#07070d]">
            <img
              src={currentItem.url}
              alt={currentItem.caption || 'Project visual asset'}
              className="w-full h-auto max-h-[72vh] object-contain"
            />
          </div>
        )}

        {/* Asset Caption */}
        {currentItem.caption && (
          <div className="mt-4 px-4 py-2 rounded-sm bg-black/80 border border-white/[0.08] backdrop-blur-md max-w-2xl text-center">
            <p className="text-xs sm:text-sm text-foreground/80 font-mono leading-relaxed">
              {currentItem.caption}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-sm border border-white/10 bg-black/60 text-foreground/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md z-10 pointer-events-auto"
            aria-label="Previous asset"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-sm border border-white/10 bg-black/60 text-foreground/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md z-10 pointer-events-auto"
            aria-label="Next asset"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
};
