import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The client's own service list, exactly as it appears in their Instagram posts.
const SERVICES = [
  "Architectural Design",
  "Land Development",
  "Project Management",
  "Technical Advice",
  "Residential Building",
  "Commercial Building",
  "Building Renovation",
  "Structural",
  "Interior",
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

        <div className="mt-16 grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <div
              key={service}
              className="service-row flex items-center gap-6 border-b border-white/10 py-7 transition-colors hover:bg-white/[0.03] sm:px-2 md:py-9"
            >
              <span className="font-display text-3xl font-bold text-brand-sky/60 md:text-4xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-ivory md:text-3xl">
                {service}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
