import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Lightbox({ isOpen, event, theme, onClose }) {
  if (!isOpen || !event) return null;

  const isSport = theme === 'sport';
  const roundedClass = isSport ? 'rounded-none border-4 border-white' : 'rounded-3xl border border-gray-500/50';

  return createPortal(
    <>
      {/* ✕ Close Button — sibling of backdrop, direct child of body. 
          This guarantees z-index is evaluated at root level (NOT inside backdrop's stacking context). */}
      <button
        style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 10001 }}
        className="text-white transition-all duration-300 ease-in-out w-14 h-14 flex items-center justify-center bg-black/60 hover:bg-red-600 hover:scale-110 hover:rotate-90 rounded-full border border-white/30 hover:border-red-500 shadow-2xl cursor-pointer"
        onClick={onClose}
        aria-label="Tutup lightbox"
      >
        <X size={28} strokeWidth={2.5} />
      </button>

      {/* Backdrop + content */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        className="bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-10"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full h-full max-w-6xl mx-auto flex flex-col pt-20 md:pt-16 relative"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <h2 className={`text-center text-xl md:text-4xl text-white mb-4 md:mb-6 sticky top-0 bg-black/80 md:bg-black/50 py-3 z-10 rounded-xl md:rounded-none ${isSport ? 'font-black uppercase tracking-widest' : 'font-serif italic'}`}>
            {event.title}
          </h2>

          {/* Scrollable image/video list */}
          <div
            className="flex-1 overflow-y-auto w-full no-scrollbar flex flex-col items-center gap-8 pb-10"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            {event.images.map((src, idx) => {
              const isVid = src.toLowerCase().endsWith('.mp4');
              return isVid ? (
                <video
                  key={idx}
                  src={src}
                  controls
                  autoPlay={event.images.length === 1}
                  className={`w-full h-auto object-contain max-h-[85vh] shadow-2xl flex-shrink-0 bg-black ${roundedClass}`}
                />
              ) : (
                <img
                  key={idx}
                  src={src}
                  alt={event.title}
                  className={`w-full h-auto object-contain max-h-[85vh] shadow-2xl flex-shrink-0 ${roundedClass}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

