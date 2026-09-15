import { useMemo, useState } from "react";
import { useWorkPhotos } from "../lib/useWorkPhotos";
import Lightbox from "./Lightbox";

const TILTS = [-6, 4, -3, 7, -5, 2, -8, 5];

function splitIntoColumns<T>(items: T[], columns: number) {
  const cols: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => cols[i % columns].push(item));
  return cols;
}

export default function WorkGallery() {
  const workImages = useWorkPhotos();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasImages = workImages.length > 0;
  const columnCount = 3;

  // Each column holds [globalIndex, src] pairs so a click can open the right photo in the lightbox.
  const columns = useMemo(() => {
    const withIndex = workImages.map((src, i) => [i, src] as const);
    return hasImages
      ? splitIntoColumns(withIndex, columnCount)
      : Array.from({ length: columnCount }, () => Array.from({ length: 3 }, (_, i) => [i, null] as const));
  }, [workImages, hasImages]);

  return (
    <section
      id="work"
      className="relative w-full overflow-hidden bg-gradient-to-b from-brand-navy via-charcoal-2 to-charcoal-2 py-24 md:py-32"
    >
      {/* giant backdrop wordmark, noozi-style */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[26vw] font-black uppercase leading-none text-white/[0.04]"
      >
        WORK
      </div>

      <div className="relative mx-auto mb-14 flex max-w-3xl flex-col items-center px-6 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
          Portfolio
        </p>
        <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] tracking-tight text-ivory sm:text-7xl md:text-8xl">
          Our <span className="text-gradient-brand">Work</span>
        </h2>
        <p className="mt-6 max-w-xl font-sans text-ivory-dim">
          Villas, renovations and interiors delivered across Kerala. Tap any photo to take a closer look.
        </p>
      </div>

      {/* auto-scrolling columns of tilted, clickable project photos */}
      <div className="relative flex h-[75vh] gap-4 px-4 md:h-[85vh] md:gap-6 md:px-8">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="relative h-full flex-1 overflow-hidden">
            <div
              className={`flex flex-col gap-8 py-4 md:gap-10 ${
                colIndex % 2 === 0 ? "animate-marquee-up" : "animate-marquee-down"
              }`}
            >
              {[...col, ...col].map(([globalIndex, src], i) => {
                const tilt = TILTS[(colIndex * 3 + i) % TILTS.length];
                return (
                  <button
                    key={`${colIndex}-${i}`}
                    type="button"
                    data-cursor-hover
                    disabled={!hasImages}
                    onClick={() => setActiveIndex(globalIndex)}
                    className="group block shrink-0 origin-center transition-transform duration-300 hover:z-10 hover:!rotate-0 hover:scale-105"
                    style={{ transform: `rotate(${tilt}deg)` }}
                  >
                    {hasImages ? (
                      <img
                        src={src as string}
                        alt="Your Dream Builders project"
                        loading="lazy"
                        className="h-64 w-56 rounded-2xl object-cover shadow-xl shadow-black/40 ring-1 ring-white/10 md:h-80 md:w-64"
                      />
                    ) : (
                      <div className="flex h-64 w-56 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-sm uppercase tracking-widest text-ivory-dim shadow-xl shadow-black/40 md:h-80 md:w-64">
                        Project photo
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-charcoal-2 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-navy/60 to-transparent" />

        <a
          href="#contact"
          data-cursor-hover
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-charcoal/80 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wide text-ivory shadow-2xl shadow-black/50 ring-1 ring-white/15 backdrop-blur-md transition-all hover:ring-brand-sky/60"
        >
          Check Out Our Work &rarr;
        </a>
      </div>

      {!hasImages && (
        <p className="relative mx-auto mt-10 max-w-md px-6 text-center font-sans text-xs text-ivory-dim/70">
          Drop project photos into <code className="text-brand-sky">src/assets/work/</code> and they’ll
          appear here automatically, scrolling and clickable.
        </p>
      )}

      {hasImages && activeIndex !== null && (
        <Lightbox
          images={workImages}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </section>
  );
}
