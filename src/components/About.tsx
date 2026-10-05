import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { BUSINESS } from "../data/business";

gsap.registerPlugin(ScrollTrigger);

// All wording below is the client's own "About Us" text, used verbatim.

const PILLARS = [
  {
    title: "Quality That Lasts",
    body: [
      "Quality is not something we compromise on. We believe every material, every measurement, every finishing detail, and every stage of construction matters. Our team works with attention to detail and follows proper construction practices to deliver homes that are strong, durable, functional, and beautiful.",
    ],
  },
  {
    title: "On-Time Delivery",
    body: [
      "We understand that time is valuable. Delays can affect finances, plans, and family commitments. That is why timely completion is one of our core commitments. Through proper planning, coordination, supervision, and responsible execution, we strive to complete every project within the agreed timeline.",
    ],
  },
  {
    title: "Our Clients’ Happiness Comes First",
    body: [
      "For us, the true measure of a successful project is not simply the completion of construction—it is the smile on our client’s face at the time of handover.",
      "We aim to make the entire construction journey comfortable and transparent for our clients, from selecting materials and making design decisions to monitoring progress and completing the final details. Our goal is to build not only a beautiful home, but also a positive experience our clients will remember and recommend.",
    ],
  },
];

const COMMITMENTS: [string, string][] = [
  ["Quality", "in every detail."],
  ["Honesty", "in every decision."],
  ["Timeliness", "in every project."],
  ["Trust", "in every relationship."],
  ["Happiness", "in every handover."],
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // each block reveals as it scrolls in -- the section is long now
      gsap.utils.toArray<HTMLElement>(".about-reveal").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 40,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative w-full bg-charcoal py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        {/* intro */}
        <p className="about-reveal font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
          About Us &mdash; Est. {BUSINESS.established}
        </p>
        <h2 className="about-reveal mt-6 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-ivory sm:text-6xl md:text-7xl">
          Building Dreams.
          <br />
          <span className="text-gradient-brand">Creating Happiness.</span>
          <br />
          Earning Trust.
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <p className="about-reveal font-sans text-lg leading-relaxed text-ivory md:text-xl">
            At Your Dream, we believe that building a home is much more than constructing walls and roofs—it is
            about creating a place where dreams become reality, families grow, and lifelong memories are made.
          </p>
          <div className="about-reveal space-y-5 font-sans text-base leading-relaxed text-ivory-dim">
            <p>
              Since our beginning, our focus has been simple: deliver quality construction, complete projects on
              time, and make every client proud and happy with the home they entrusted us to build.
            </p>
            <p>
              We believe that trust is the foundation of every successful project. From the first discussion and
              design to construction and final handover, we maintain transparency, clear communication, and genuine
              commitment to our clients. We carefully understand their needs, ideas, lifestyle, and budget before
              turning their vision into a thoughtfully designed and well-built space.
            </p>
          </div>
        </div>

        {/* three pillars */}
        <div className="mt-20 grid gap-5 md:mt-28 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="about-reveal flex flex-col rounded-3xl border border-white/10 bg-charcoal-2 p-7 md:p-8"
            >
              <span className="font-display text-4xl font-black text-brand-sky/50">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-ivory md:text-3xl">
                {pillar.title}
              </h3>
              <div className="mt-4 space-y-4 font-sans text-sm leading-relaxed text-ivory-dim md:text-[15px]">
                {pillar.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* vision + commitment */}
        <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-2 md:gap-16">
          <div className="about-reveal">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">Our Vision</p>
            <p className="mt-5 font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight text-ivory md:text-4xl">
              Our vision is to become a trusted and respected name in the construction industry, known for quality,
              reliability, transparency, innovation, and customer satisfaction.
            </p>
            <p className="mt-6 font-sans text-base leading-relaxed text-ivory-dim">
              We aspire to create homes and spaces that stand the test of time while building relationships that last
              even longer.
            </p>
          </div>

          <div className="about-reveal">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
              Our Commitment
            </p>
            <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {COMMITMENTS.map(([word, rest]) => (
                <li key={word} className="flex items-baseline gap-3 py-4">
                  <span className="font-display text-2xl font-black uppercase tracking-tight text-gradient-brand md:text-3xl">
                    {word}
                  </span>
                  <span className="font-sans text-base text-ivory-dim md:text-lg">{rest}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="about-reveal mt-14">
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
