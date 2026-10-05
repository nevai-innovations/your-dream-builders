import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BUSINESS } from "../data/business";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-reveal", {
        autoAlpha: 0,
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative w-full bg-charcoal py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <p className="about-reveal font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
          Est. {BUSINESS.established} &mdash; Your Dream Builders
        </p>
        <p className="about-reveal mt-2 font-sans text-xs uppercase tracking-[0.3em] text-ivory-dim">
          Design &bull; Construction &bull; Renovation
        </p>

        <h2 className="about-reveal mt-8 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-ivory sm:text-6xl md:text-7xl">
          Building partner
          <br />
          for <span className="text-gradient-brand">homes &amp; spaces</span>
          <br />
          that last
        </h2>

        <p className="about-reveal mt-10 max-w-2xl font-sans text-base leading-relaxed text-ivory-dim md:text-lg">
          For Your Dream Builders, construction meets craftsmanship to turn ideas into places people love to
          live in. Based in Ranni Perunad, Pathanamthitta, we specialize in end-to-end design, construction and renovation for
          homeowners who want quality they can see and trust they can rely on. We work with families,
          landowners and ambitious homeowners who want a building partner that treats every project like it
          were our own. Our focus is simple: build spaces that are structurally sound, beautifully finished,
          and delivered the way we promised.
        </p>

        <div className="about-reveal mt-10">
          <a
            href="#work"
            data-cursor-hover
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-sky to-brand-blue px-7 py-3 font-sans text-sm font-semibold text-charcoal transition-transform hover:scale-105"
          >
            Check Out Our Work
            <span aria-hidden>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
