import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lightbox from "./Lightbox";

gsap.registerPlugin(ScrollTrigger);

const SPEED = 70; // px per second the photos travel from right to left
const CARD_GAP = 40; // px between neighbouring cards
const CARD_RATIO = 0.72; // height / width -- landscape, since handover photos are group shots

interface Client {
  id: string;
  name: string;
  location: string;
  quote: string;
  url: string;
  order: number;
}

/**
 * Key handovers and client testimonials, managed from the /update page.
 * Renders nothing unless the section is enabled there and at least one real
 * entry exists -- no placeholder testimonials, ever.
 */
export default function HappyClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [frontIndex, setFrontIndex] = useState(0); // client currently passing the centre
  const [cardW, setCardW] = useState(400);
  const [viewW, setViewW] = useState(1440);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Local preview only: /?demo-clients shows sample entries so the design can be
    // reviewed before any real handovers exist. import.meta.env.DEV is false in
    // production builds, so this branch is removed from the live site entirely.
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("demo-clients")) {
      import("../data/demoClients").then((m) => !cancelled && setClients(m.DEMO_CLIENTS));
      return () => {
        cancelled = true;
      };
    }
    fetch("/api/clients")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { enabled: boolean; clients: Client[] }) => {
        // shown only when switched on in the /update portal (and entries exist)
        if (!cancelled && data.enabled && Array.isArray(data.clients)) {
          setClients([...data.clients].sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {
        // API unavailable (e.g. plain `vite dev`) -- the section simply stays hidden
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = clients.length;

  useEffect(() => {
    if (count === 0 || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".client-reveal", {
        autoAlpha: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    }, sectionRef);
    // the section appearing pushes everything below it down
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [count]);

  // Card size follows the screen width.
  useEffect(() => {
    const update = () => {
      setViewW(window.innerWidth);
      setCardW(window.innerWidth < 768 ? 250 : 400);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // A continuous stream: enough cards (repeating entries if needed) to span
  // the screen plus one card off each edge, so a card is always entering on
  // the right while another leaves on the left.
  const spacing = cardW + CARD_GAP;
  // Whole copies of the list only, so the same client never appears twice in a row.
  const minSlots = Math.ceil(viewW / spacing) + 3;
  const slots = count === 0 ? 0 : count * Math.ceil(minSlots / count);
  const stream = Array.from({ length: slots }, (_, i) => clients[i % count]);
  const loop = slots * spacing; // one full cycle of the stream, in px

  // Photos travel in a straight line from the right edge to the left edge.
  // Each one swings in depth as it goes -- angled in on the right, flat and
  // forward at the centre, angled away on the left -- for the 3D feel.
  // Pauses on hover, while off screen, and for reduced-motion users.
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || slots === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".stream-card"));
    const shades = cards.map((c) => c.querySelector<HTMLElement>(".stream-shade"));
    const half = viewW / 2;
    let onScreen = false;
    let offset = 0;
    let last = performance.now();
    let lastCentre = -1;
    let raf = 0;

    const observer = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    observer.observe(stage);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (onScreen && !hoveredRef.current && !reduced) offset = (offset + SPEED * dt) % loop;

      let centre = 0;
      let nearest = Infinity;
      cards.forEach((card, i) => {
        // x relative to the screen centre, wrapped so cards re-enter on the right
        let x = i * spacing - offset;
        x = ((((x + loop / 2) % loop) + loop) % loop) - loop / 2;
        const p = Math.max(-1.4, Math.min(1.4, x / half)); // -1 left edge, 0 centre, 1 right edge
        card.style.transform =
          `translate(-50%, -50%) translateX(${x}px) translateZ(${-Math.abs(p) * 260}px) ` +
          `rotateY(${-p * 38}deg)`;
        const shade = shades[i];
        if (shade) shade.style.opacity = String(Math.min(0.7, Math.abs(p) * 0.55));
        card.style.zIndex = String(100 - Math.round(Math.abs(p) * 50));
        if (Math.abs(x) < nearest) {
          nearest = Math.abs(x);
          centre = i;
        }
      });

      const centreClient = centre % count;
      if (centreClient !== lastCentre) {
        lastCentre = centreClient;
        setFrontIndex(centreClient);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [slots, spacing, loop, viewW, count]);

  if (count === 0) return null;

  const featured = clients[frontIndex] ?? clients[0];

  return (
    <section id="clients" ref={sectionRef} className="relative w-full overflow-hidden bg-charcoal py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-20 h-[480px] w-[480px] rounded-full bg-brand-blue/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="client-reveal max-w-3xl">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
            Key Handovers
          </p>
          <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.88] tracking-tight text-ivory sm:text-7xl md:text-8xl">
            Happy <span className="text-gradient-brand">Clients</span>
          </h2>
          <p className="mt-6 max-w-xl font-sans text-ivory-dim md:text-lg">
            The best moment of every project &mdash; handing over the keys to a family&rsquo;s new home.
          </p>
        </div>

      </div>

      {/* handover photos streaming right to left, with 3D depth */}
      <div
        ref={stageRef}
        className="client-reveal relative mt-14 select-none md:mt-20"
        style={{ height: cardW * CARD_RATIO + 80, perspective: 1600 }}
        onPointerEnter={(e) => e.pointerType === "mouse" && (hoveredRef.current = true)}
        onPointerLeave={() => (hoveredRef.current = false)}
      >
        <div
          ref={trackRef}
          className="absolute inset-0 [transform-style:preserve-3d]"
        >
          {stream.map((client, i) => (
            <button
              key={`${client.id}-${i}`}
              type="button"
              data-cursor-hover
              aria-label={`Enlarge handover photo: ${client.name}`}
              onClick={() => setLightboxIndex(i % count)}
              className="stream-card group absolute left-1/2 top-1/2 overflow-hidden rounded-3xl bg-charcoal-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 will-change-transform"
              style={{
                width: cardW,
                height: cardW * CARD_RATIO,
                // start off-screen right; the animation loop positions them
                transform: `translate(-50%, -50%) translateX(${viewW}px)`,
              }}
            >
              <img
                src={client.url}
                alt={`Key handover — ${client.name}`}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent px-4 pb-4 pt-12 text-left">
                <span className="block font-display text-lg font-bold uppercase leading-tight tracking-tight text-ivory md:text-xl">
                  {client.name}
                </span>
                {client.location && (
                  <span className="mt-0.5 block font-sans text-[11px] text-ivory-dim">{client.location}</span>
                )}
              </span>
              {/* darkens cards as they angle away towards the screen edges */}
              <span aria-hidden className="stream-shade pointer-events-none absolute inset-0 bg-charcoal" />
            </button>
          ))}
        </div>
      </div>

      {/* testimonial of whichever client is passing the centre */}
      <div
        className={`relative mx-auto mt-10 max-w-2xl px-6 text-center md:mt-14 ${
          // only reserve room for quotes once at least one entry has one
          clients.some((c) => c.quote) ? "min-h-[11rem]" : "min-h-[4rem]"
        }`}
      >
        <div key={featured.id} className="animate-[client-fade_0.6s_ease-out]">
          {featured.quote && (
            <blockquote className="font-sans text-base leading-relaxed text-ivory/90 md:text-lg">
              <span aria-hidden className="block font-display text-6xl leading-none text-brand-sky/70">
                &ldquo;
              </span>
              <p className="-mt-4">{featured.quote}</p>
            </blockquote>
          )}
          <p className="mt-5 font-display text-xl font-bold uppercase tracking-tight text-ivory">{featured.name}</p>
          {featured.location && <p className="font-sans text-sm text-ivory-dim">{featured.location}</p>}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={clients.map((c) => c.url)}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
