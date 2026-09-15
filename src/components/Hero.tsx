import { useEffect, useRef } from "react";
import gsap from "gsap";
import { heroVideo } from "../data/media";

export default function Hero() {
  const scope = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-line", { yPercent: 120, duration: 1.1, stagger: 0.08 })
        .from(".hero-sub", { autoAlpha: 0, y: 20, duration: 0.8 }, "-=0.5")
        .from(".hero-cta", { autoAlpha: 0, y: 20, duration: 0.8 }, "-=0.6")
        .from(".hero-vert span", { autoAlpha: 0, x: -10, stagger: 0.05, duration: 0.4 }, "-=0.9");
    }, scope);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = scope.current;
    if (!video || !section) return;

    // Plays once on first load. If it's already finished by the time the hero
    // scrolls back into view, play it again from the start — but if it's still
    // running (e.g. a quick scroll away and back), leave it alone.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && video.ended) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="top"
      ref={scope}
      className="relative flex h-screen w-full flex-col overflow-hidden bg-charcoal"
    >
      {heroVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover [object-position:center_85%]"
          src={heroVideo}
          autoPlay
          muted
          playsInline
        />
      )}

      {/* light scrim — just enough for the headline to stay readable, footage still shows through */}
      <div className="pointer-events-none absolute inset-0 bg-charcoal/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-charcoal/45" />
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(46,156,245,0.18), transparent 45%), radial-gradient(circle at 80% 70%, rgba(20,101,201,0.16), transparent 50%)",
        }}
      />

      <div className="hero-vert absolute left-4 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-1 md:left-8 md:flex">
        {"YOUR DREAM".split("").map((ch, i) => (
          <span key={i} className="font-display text-lg font-bold tracking-widest text-brand-sky/60">
            {ch}
          </span>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pt-24 text-center md:pt-28">
        <p className="hero-sub mb-4 font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
          Design &middot; Construction &middot; Renovation
        </p>

        <h1 className="font-display text-[15vw] font-black uppercase leading-[0.85] tracking-tight text-ivory sm:text-[11vw] md:text-[8.5vw]">
          <span className="block overflow-hidden">
            <span className="hero-line block">WE BUILD</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-line block text-gradient-brand">YOUR DREAM</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-line block">HOME</span>
          </span>
        </h1>

        <p className="hero-sub mt-6 max-w-xl font-sans text-base text-ivory-dim md:text-lg">
          From first sketch to final handover — Your Dream Builders designs, constructs and renovates spaces
          across Kerala that are built to last and made to feel like home.
        </p>

        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            data-cursor-hover
            className="rounded-full border border-brand-blue/40 px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-wide text-ivory transition-all hover:border-brand-blue hover:bg-brand-blue/10"
          >
            Explore Our Work &rarr;
          </a>
          <a
            href="#contact"
            data-cursor-hover
            className="rounded-full bg-gradient-to-r from-brand-sky to-brand-blue px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-wide text-charcoal transition-transform hover:scale-105"
          >
            Start Your Project
          </a>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 pb-6 text-ivory-dim md:pb-8">
        <span className="font-sans text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-brand-sky to-transparent md:h-10" />
      </div>

      {/* Sized and positioned (verified against extracted video frames) to sit directly over
          the watermark baked into the footage, bottom-right of frame, across desktop viewports. */}
      <a
        href="#contact"
        data-cursor-hover
        className="absolute bottom-[10%] right-[3.5%] z-10 hidden min-h-[68px] min-w-[150px] items-center justify-center rounded-full bg-gradient-to-r from-brand-sky to-brand-blue px-8 font-sans text-base font-semibold text-charcoal shadow-lg shadow-black/30 transition-transform hover:scale-105 md:flex"
      >
        Let&rsquo;s Talk
      </a>
    </section>
  );
}
