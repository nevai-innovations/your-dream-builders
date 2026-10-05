import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useWorkPhotos } from "../lib/useWorkPhotos";
import Lightbox from "./Lightbox";

gsap.registerPlugin(ScrollTrigger);

/*
 * 3D fly-through: photos are spaced out along the z-axis inside a sticky,
 * full-screen stage, and scrolling moves the "camera" forward through them.
 * Each photo starts small in the distance, grows as it approaches, and sweeps
 * past the viewer to one side. The page never pins -- the section is simply
 * tall, and the stage is position: sticky inside it.
 */
const SPACING = 650; // px between photos along z
const START = 900; // how far back the first photo sits when the section begins
const FAR = -3800; // photos further away than this are hidden
const FADE_IN = 900; // ...and fade in over this distance
const NEAR = 620; // photos fade out as they reach this (perspective is 1000px)
const SCROLL_PER_PHOTO = 26; // vh of scrolling per photo

// Phones show the photos as a two-column grid of tiles instead of the
// fly-through: each tile swings in from a 3D tilt and flattens as it reaches
// the middle of the screen, scrubbed to the scroll.

// Where each photo flies past: side of the screen and vertical lane.
const LANES = [
  { x: -1, y: -0.3 },
  { x: 1, y: 0.25 },
  { x: -1, y: 0.35 },
  { x: 1, y: -0.35 },
  { x: -1, y: 0.02 },
  { x: 1, y: 0.05 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export default function WorkGallery() {
  const workImages = useWorkPhotos();
  const total = workImages.length;
  const reducedMotion = usePrefersReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tunnelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const hintRef = useRef<HTMLDivElement>(null);

  // Keyed on the photo list: the live CMS photos replace the bundled fallback
  // after load, and the new elements need wiring up.
  const photosKey = workImages.join("\n");

  useEffect(() => {
    const tunnel = tunnelRef.current;
    if (!tunnel || reducedMotion || total === 0) return;

    const cards = gsap.utils.toArray<HTMLElement>(".fly-card", tunnel);
    const shades = cards.map((c) => c.querySelector<HTMLElement>(".fly-shade"));

    const render = (progress: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const travel = (total - 1) * SPACING + START + NEAR;
      // how far off-centre each lane sits, in px at z = 0
      const spreadX = Math.min(w * 0.34, 720);
      const spreadY = h * 0.3;
      const camera = progress * travel;

      cards.forEach((card, i) => {
        const lane = LANES[i % LANES.length];
        const z = -START - i * SPACING + camera;
        const visible = z > FAR && z < NEAR;
        const opacity = visible ? Math.min(clamp01((z - FAR) / FADE_IN), clamp01((NEAR - z) / 260)) : 0;

        card.style.opacity = String(opacity);
        card.style.visibility = visible ? "visible" : "hidden";
        // only the photos close enough to read are clickable
        card.style.pointerEvents = z > -1800 && z < NEAR - 200 ? "auto" : "none";
        // photos stay straight -- facing the viewer, no tilt or roll
        card.style.transform = `translate(-50%, -50%) translate3d(${lane.x * spreadX}px, ${lane.y * spreadY}px, ${z}px)`;

        const shade = shades[i];
        if (shade) shade.style.opacity = String(clamp01(-z / 3200) * 0.75);
      });

      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(progress * 12));
    };

    const trigger = ScrollTrigger.create({
      trigger: tunnel,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(trigger.progress);

    return () => trigger.kill();
  }, [photosKey, total, reducedMotion, isMobile]);

  // Phone tiles: 3D swing-in, scrubbed to scroll.
  const tilesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = tilesRef.current;
    if (!grid || reducedMotion || !isMobile) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".work-tile", grid).forEach((tile, i) => {
        const side = i % 2 === 0 ? 1 : -1; // left column swings one way, right the other
        gsap.fromTo(
          tile,
          { rotationX: 38, rotationY: side * 22, y: 70, z: -160, scale: 0.88, autoAlpha: 0.35, transformPerspective: 900 },
          {
            rotationX: 0,
            rotationY: 0,
            y: 0,
            z: 0,
            scale: 1,
            autoAlpha: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: tile, start: "top bottom", end: "top 45%", scrub: 0.6 },
          },
        );
      });
    }, grid);
    return () => ctx.revert();
  }, [photosKey, reducedMotion, isMobile]);

  return (
    <section id="work" className="relative w-full bg-charcoal-2">
      <div className="relative overflow-x-clip pt-24 md:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-blue/15 blur-[140px]"
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
                Portfolio
              </p>
              <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.88] tracking-tight text-ivory sm:text-7xl md:text-[8.5rem]">
                Selected
                <br />
                <span className="text-gradient-brand">Work</span>
              </h2>
            </div>
            <div className="border-t border-white/10 pt-6 md:pb-3">
              <p className="max-w-sm font-sans text-sm leading-relaxed text-ivory-dim md:text-base">
                We aspire to create homes and spaces that stand the test of time while building relationships
                that last even longer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="mx-auto my-24 flex h-72 max-w-7xl items-center justify-center rounded-3xl border border-white/10 bg-white/5 font-display text-sm uppercase tracking-widest text-ivory-dim">
          Project photos coming soon
        </div>
      ) : reducedMotion ? (
        // reduced motion: a calm, static grid instead of the fly-through
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-16 md:grid-cols-3 md:gap-4 md:px-8">
          {workImages.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Enlarge project ${i + 1}`}
              onClick={() => setLightboxIndex(i)}
              className="aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/10"
            >
              <img src={src} alt={`Your Dream Builders project ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        isMobile ? (
        <div ref={tilesRef} className="relative mx-auto grid grid-cols-2 gap-3 px-4 pb-16 pt-12">
          {workImages.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Enlarge project ${i + 1}`}
              onClick={() => setLightboxIndex(i)}
              // right column sits a little lower for a staggered, less rigid grid
              // (top, not translate -- the 3D animation owns `transform`)
              className={`work-tile relative aspect-[4/5] overflow-hidden rounded-2xl bg-charcoal-3 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/10 will-change-transform ${
                i % 2 === 1 ? "top-10" : ""
              }`}
            >
              <img
                src={src}
                alt={`Your Dream Builders project ${i + 1}`}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        ) : (
        <div ref={tunnelRef} className="relative" style={{ height: `${100 + total * SCROLL_PER_PHOTO}vh` }}>
          <div className="sticky top-0 h-svh overflow-hidden [perspective:1000px]">
            {/* depth glow: a pool of brand light at the vanishing point */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/20 blur-[120px]"
            />

            {/* brand watermark, centred behind the photos as they fly past */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-center font-display font-black uppercase leading-[0.85] tracking-tight text-white/[0.1]"
            >
              <span className="text-[19vw] md:text-[12.5vw]">
                Your Dream
                <br />
                Builders
              </span>
            </div>

            <div className="absolute inset-0 [transform-style:preserve-3d]">
              {workImages.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  data-cursor-hover
                  aria-label={`Enlarge project ${i + 1}`}
                  onClick={() => setLightboxIndex(i)}
                  className="fly-card group absolute left-1/2 top-1/2 aspect-[4/5] w-[72vw] overflow-hidden rounded-2xl bg-charcoal-3 opacity-0 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/15 will-change-transform md:w-[42vw] md:max-w-[780px] md:rounded-3xl"
                >
                  <img
                    src={src}
                    alt={`Your Dream Builders project ${i + 1}`}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* darkens photos in the distance so the nearest ones pop */}
                  <span aria-hidden className="fly-shade pointer-events-none absolute inset-0 bg-charcoal-2" />
                </button>
              ))}
            </div>

            <div
              ref={hintRef}
              className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 font-sans text-[10px] font-semibold uppercase tracking-[0.4em] text-ivory-dim"
            >
              Scroll to fly through
              <span className="h-10 w-px animate-pulse bg-gradient-to-b from-brand-sky to-transparent" />
            </div>
          </div>
        </div>
        )
      )}

      {total > 0 && (
        <div className="relative flex justify-center px-4 pb-24 pt-8 md:pb-32">
          <a
            href="#contact"
            data-cursor-hover
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-sky to-brand-blue px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wide text-charcoal transition-transform hover:scale-105"
          >
            Start your project <span aria-hidden>&rarr;</span>
          </a>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={workImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
