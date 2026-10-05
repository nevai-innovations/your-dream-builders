import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lightbox from "./Lightbox";

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement>(null);

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

  if (count === 0) return null;

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

        <div
          className={`mt-14 grid gap-6 md:mt-20 ${
            count === 1 ? "mx-auto max-w-md" : count === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {clients.map((client, i) => (
            <figure
              key={client.id}
              className="client-reveal group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-charcoal-2 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]"
            >
              <button
                type="button"
                data-cursor-hover
                aria-label={`Enlarge handover photo: ${client.name}`}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-[4/5] overflow-hidden"
              >
                <img
                  src={client.url}
                  alt={`Key handover — ${client.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-charcoal/70 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory backdrop-blur-md">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="text-brand-sky">
                    <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M14 9l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Key Handover
                </span>
              </button>

              <figcaption className="flex flex-1 flex-col p-6 md:p-7">
                {client.quote && (
                  <blockquote className="relative flex-1 font-sans text-[15px] leading-relaxed text-ivory/90">
                    <span aria-hidden className="block font-display text-5xl leading-none text-brand-sky/70">
                      &ldquo;
                    </span>
                    <p className="-mt-3">{client.quote}</p>
                  </blockquote>
                )}
                <div className={client.quote ? "mt-6 border-t border-white/10 pt-5" : ""}>
                  <p className="font-display text-xl font-bold uppercase tracking-tight text-ivory">{client.name}</p>
                  {client.location && <p className="mt-0.5 font-sans text-sm text-ivory-dim">{client.location}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
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
