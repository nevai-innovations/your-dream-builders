import { useEffect } from "react";

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        aria-label="Close"
        data-cursor-hover
        onClick={onClose}
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-ivory transition-colors hover:bg-white/10"
      >
        &times;
      </button>

      <button
        aria-label="Previous photo"
        data-cursor-hover
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index - 1 + images.length) % images.length);
        }}
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-ivory transition-colors hover:bg-white/10 md:left-6"
      >
        &larr;
      </button>

      <img
        src={images[index]}
        alt={`Project photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl shadow-black/50"
      />

      <button
        aria-label="Next photo"
        data-cursor-hover
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % images.length);
        }}
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-ivory transition-colors hover:bg-white/10 md:right-6"
      >
        &rarr;
      </button>

      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-xs uppercase tracking-[0.3em] text-ivory-dim">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}
