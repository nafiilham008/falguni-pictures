export default function Lightbox({ isOpen, event, theme, onClose }) {
  if (!isOpen || !event) return null;

  const isSport = theme === 'sport';
  const roundedClass = isSport ? 'rounded-none border-4 border-white' : 'rounded-3xl border border-gray-500/50';

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-10 transition-opacity duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button 
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-500 text-5xl z-[110] transition-colors font-sans w-12 h-12 flex items-center justify-center bg-black/30 md:bg-transparent rounded-full"
        onClick={onClose}
      >
        &times;
      </button>

      <div 
        className="w-full h-full max-w-6xl mx-auto flex flex-col pt-20 md:pt-12 relative"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <h2 className={`text-center text-xl md:text-4xl text-white mb-4 md:mb-6 sticky top-0 bg-black/80 md:bg-black/50 py-3 z-10 rounded-xl md:rounded-none ${isSport ? 'font-black uppercase tracking-widest' : 'font-serif italic'}`}>
          {event.title}
        </h2>
        
        {/* Scrollable Container */}
        <div 
          className="flex-1 overflow-y-auto w-full no-scrollbar flex flex-col items-center gap-8 pb-10"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {event.images.map((src, idx) => {
            const isVid = src.toLowerCase().endsWith('.mp4');
            if (isVid) {
              return (
                <video 
                  key={idx}
                  src={src}
                  controls
                  autoPlay={event.images.length === 1}
                  className={`w-full h-auto object-contain max-h-[85vh] shadow-2xl flex-shrink-0 bg-black ${roundedClass}`}
                />
              );
            } else {
              return (
                <img 
                  key={idx}
                  src={src} 
                  className={`w-full h-auto object-contain max-h-[85vh] shadow-2xl flex-shrink-0 ${roundedClass}`}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
