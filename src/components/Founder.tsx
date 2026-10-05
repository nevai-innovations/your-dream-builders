import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { founderImage } from "../data/media";

gsap.registerPlugin(ScrollTrigger);

const AWARDS = ["Mangalam Shreshtakarma Award", "Best Emerging Builder in Kerala"];

export default function Founder() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".founder-reveal", {
        autoAlpha: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="founder" ref={sectionRef} className="relative w-full bg-charcoal-2 py-28 md:py-36">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-[0.85fr_1.15fr]">
        <div className="founder-reveal relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-sky/30 to-brand-deep/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
            {founderImage ? (
              <img
                src={founderImage}
                alt="Aswin Parackal Mohan"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center font-display text-sm uppercase tracking-widest text-ivory-dim">
                Founder photo
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="founder-reveal font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
            Founder &amp; Managing Director
          </p>
          <h2 className="founder-reveal mt-4 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-ivory sm:text-6xl">
            Aswin Parackal
            <br />
            <span className="text-gradient-brand">Mohan</span>
          </h2>

          <p className="founder-reveal mt-8 max-w-xl font-sans text-base leading-relaxed text-ivory-dim md:text-lg">
            Aswin founded Your Dream Builders on a simple promise — every home should be built with the same
            care the family living in it deserves. Under his leadership, the studio has grown into a trusted
            design-and-build partner across Pathanamthitta district, recognized for quality construction and dependable
            delivery.
          </p>

          <div className="founder-reveal mt-10 flex flex-col gap-3">
            {AWARDS.map((award) => (
              <div
                key={award}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-blue font-display text-sm font-bold text-charcoal">
                  &#9733;
                </span>
                <span className="font-sans text-sm font-medium text-ivory md:text-base">{award}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
