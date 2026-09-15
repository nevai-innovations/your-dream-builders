import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    n: "01",
    title: "Architectural Design",
    desc: "Thoughtful floor plans and elevations that balance light, space and your family's way of living.",
  },
  {
    n: "02",
    title: "Residential Construction",
    desc: "Full-scale villa and home construction, managed from foundation to handover with quality checks at every stage.",
  },
  {
    n: "03",
    title: "Renovation & Remodeling",
    desc: "Reworking existing homes — structural, cosmetic or complete — without losing what you love about the space.",
  },
  {
    n: "04",
    title: "Interior Design",
    desc: "Custom kitchens, staircases, ceilings and furnishing that carry the design language through every room.",
  },
  {
    n: "05",
    title: "Project Consultancy",
    desc: "Budgeting, permits and material guidance for landowners who want an honest partner before ground-breaking.",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".service-row", {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="relative w-full bg-charcoal py-28 md:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
          What We Do
        </p>
        <h2 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-ivory sm:text-6xl">
          Our Services
        </h2>

        <div className="mt-16 divide-y divide-white/10 border-t border-white/10">
          {SERVICES.map((service) => (
            <div
              key={service.n}
              data-cursor-hover
              className="service-row group grid grid-cols-[auto_1fr] items-start gap-6 py-8 transition-colors hover:bg-white/[0.03] sm:grid-cols-[80px_1fr_auto] sm:items-center md:py-10"
            >
              <span className="font-display text-3xl font-bold text-brand-sky/60 md:text-4xl">
                {service.n}
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-ivory md:text-3xl">
                  {service.title}
                </h3>
                <p className="mt-2 max-w-xl font-sans text-sm text-ivory-dim md:text-base">{service.desc}</p>
              </div>
              <span className="col-span-2 mt-2 font-sans text-sm font-semibold uppercase tracking-wide text-brand-sky opacity-0 transition-opacity group-hover:opacity-100 sm:col-span-1 sm:mt-0">
                Learn More &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
