export default function CTA() {
  return (
    <section id="contact" className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden bg-charcoal">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(46,156,245,0.16), transparent 55%)",
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky/80">
          Let&rsquo;s Talk
        </p>
        <h2 className="mt-4 font-display text-5xl font-black uppercase leading-[0.92] tracking-tight text-ivory sm:text-6xl md:text-7xl">
          Let&rsquo;s Build <span className="text-gradient-brand">Your Dream</span>
        </h2>
        <p className="mt-6 max-w-xl font-sans text-ivory-dim md:text-lg">
          Whether it&rsquo;s a new home, a full renovation, or an interior refresh — tell us about your
          project and we&rsquo;ll help you plan it right, end to end.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#footer-contact"
            data-cursor-hover
            className="rounded-full bg-charcoal-3 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wide text-ivory transition-transform hover:scale-105"
          >
            Start a Project
          </a>
          <a
            href="#work"
            data-cursor-hover
            className="rounded-full bg-gradient-to-r from-brand-sky to-brand-blue px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wide text-charcoal transition-transform hover:scale-105"
          >
            View Our Work &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
