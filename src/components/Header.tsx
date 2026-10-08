import { useEffect, useState } from "react";
import { logoImage } from "../data/media";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Founder", href: "#founder" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 z-50 w-full pointer-events-none">
     <div
  className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between px-0 py-4 transition-all duration-500 md:px-0 ${      
      scrolled ? "bg-charcoal/80 backdrop-blur-md shadow-lg shadow-black/20" : ""
        }`}
      >
<a href="#top" className="relative flex items-center gap-2 md:-left-44" data-cursor-hover>          {logoImage ? (
<img src={logoImage} alt="Your Dream Builders" className="h-30 w-auto" />
       ) : (
            <span className="font-display text-2xl font-black uppercase tracking-tight text-gradient-brand">
              Your Dream
            </span>
          )}
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-cursor-hover
              className="rounded-full px-4 py-2 font-sans text-sm font-medium uppercase tracking-wide text-ivory/85 transition-all hover:bg-white/15 hover:text-brand-sky hover:shadow-inner"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle menu"
            data-cursor-hover
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ivory md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 top-0 h-px w-4 bg-current transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 bottom-0 h-px w-4 bg-current transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="pointer-events-auto mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-white/10 bg-charcoal-2/95 p-4 backdrop-blur-md md:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 font-sans text-sm font-medium uppercase tracking-wide text-ivory/80 hover:bg-white/5 hover:text-brand-sky"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 rounded-full bg-gradient-to-r from-brand-sky to-brand-blue px-6 py-3 text-center font-sans text-sm font-semibold text-charcoal"
          >
            Let&rsquo;s Talk
          </a>
        </div>
      )}
    </header>
  );
}
