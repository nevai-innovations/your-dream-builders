import { logoImage } from "../data/media";
import { BUSINESS, whatsappUrl } from "../data/business";

const linkClass = "transition-colors hover:text-brand-sky";

export default function Footer() {
  return (
    <footer id="footer-contact" className="relative w-full border-t border-white/10 bg-charcoal-2 pb-28 pt-16">
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
            YOUR DREAM &mdash; Design &bull; Construction &bull; Renovation.
            <br />
            Building Trust with Quality Work.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href={BUSINESS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${BUSINESS.instagram.handle}`}
              data-cursor-hover
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory transition-colors hover:border-brand-sky/60 hover:text-brand-sky"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
              </svg>
            </a>
            <a
              href={BUSINESS.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              data-cursor-hover
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory transition-colors hover:border-brand-sky/60 hover:text-brand-sky"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-16">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-brand-sky/80">
              Navigate
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm text-ivory-dim">
              <li><a href="#services" className={linkClass}>Services</a></li>
              <li><a href="#work" className={linkClass}>Work</a></li>
              <li><a href="#about" className={linkClass}>About</a></li>
              <li><a href="#founder" className={linkClass}>Founder</a></li>
            </ul>
          </div>

          <div className="max-w-xs">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-brand-sky/80">
              Contact
            </p>
            <ul className="mt-4 space-y-3 font-sans text-sm text-ivory-dim">
              <li>
                <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {BUSINESS.address}
                </a>
              </li>
              <li className="flex flex-col gap-1">
                {BUSINESS.phones.map((phone) => (
                  <a key={phone.tel} href={`tel:${phone.tel}`} className={linkClass}>
                    {phone.display}
                  </a>
                ))}
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className={`${linkClass} break-all`}>
                  {BUSINESS.email}
                </a>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp: {BUSINESS.whatsapp.display}
                </a>
              </li>
              <li className="text-ivory-dim/70">Contact: {BUSINESS.contactPerson}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-2 border-t border-white/10 px-6 pt-6 font-sans text-xs text-ivory-dim/60 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} Your Dream Builders. All rights reserved.</span>
        <span>Serving {BUSINESS.serviceArea} since {BUSINESS.established}</span>
      </div>
    </footer>
  );
}
