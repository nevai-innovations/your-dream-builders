import { logoImage } from "../data/media";

export default function Footer() {
  return (
    <footer id="footer-contact" className="relative w-full border-t border-white/10 bg-charcoal-2 pb-8 pt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:justify-between">
        <div className="max-w-sm">
          {logoImage ? (
            <img src={logoImage} alt="Your Dream Builders" className="h-14 w-auto" />
          ) : (
            <span className="font-display text-2xl font-black uppercase tracking-tight text-gradient-brand">
              Your Dream Builders
            </span>
          )}
          <p className="mt-4 font-sans text-sm text-ivory-dim">
            Design &bull; Construction &bull; Renovation, based in Kerala — building homes people are proud
            to live in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-brand-sky/80">
              Navigate
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm text-ivory-dim">
              <li><a href="#services" className="hover:text-brand-sky">Services</a></li>
              <li><a href="#work" className="hover:text-brand-sky">Work</a></li>
              <li><a href="#about" className="hover:text-brand-sky">About</a></li>
              <li><a href="#founder" className="hover:text-brand-sky">Founder</a></li>
            </ul>
          </div>

          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-brand-sky/80">
              Contact
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm text-ivory-dim/70">
              <li>[City], Kerala</li>
              <li>[email@yourdreambuilders.in]</li>
              <li>[Phone number]</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-2 border-t border-white/10 px-6 pt-6 font-sans text-xs text-ivory-dim/60 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} Your Dream Builders. All rights reserved.</span>
        <span>Design &middot; Construction &middot; Renovation</span>
      </div>
    </footer>
  );
}
