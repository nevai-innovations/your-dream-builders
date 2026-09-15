import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 60, suffix: "+", label: "Projects Delivered" },
  { value: 8, suffix: "+", label: "Years Experience" },
  { value: 50, suffix: "+", label: "Happy Clients" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counters = gsap.utils.toArray<HTMLSpanElement>(".stat-value");
      counters.forEach((el) => {
        const target = Number(el.dataset.target);
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = Math.round(counter.val).toString();
          },
        });
      });

      gsap.from(".stat-item", {
        autoAlpha: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-gradient-to-br from-brand-navy via-brand-deep to-brand-blue py-24"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-item">
            <div className="font-display text-6xl font-black text-white md:text-7xl">
              <span className="stat-value" data-target={stat.value}>
                0
              </span>
              {stat.suffix}
            </div>
            <p className="mt-2 font-sans text-sm font-medium uppercase tracking-[0.25em] text-white/75">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
