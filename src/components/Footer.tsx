import type { ReactNode } from "react";
import { logoImage } from "../data/media";
import { BUSINESS, whatsappUrl } from "../data/business";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Founder", href: "#founder" },
  { label: "Contact", href: "#contact" },
];

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function ContactCard({
  icon,
  label,
  href,
  external,
  children,
  note,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  children: ReactNode;
  note?: string;
}) {
  const body = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky/20 to-brand-deep/20 text-brand-sky ring-1 ring-brand-sky/25 transition-colors group-hover:from-brand-sky group-hover:to-brand-blue group-hover:text-charcoal">
        {icon}
      </span>
      <span className="mt-5 block font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sky/80">
        {label}
      </span>
      <span className="mt-2 block font-sans text-[15px] leading-relaxed text-ivory">{children}</span>
      {note && <span className="mt-2 block font-sans text-xs text-ivory-dim">{note}</span>}
    </>
  );
  const className =
    "group relative flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-sky/40 hover:bg-white/[0.06] md:p-7";
  return href ? (
    <a
      href={href}
      data-cursor-hover
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function Footer() {
  return (
    <footer id="footer-contact" className="relative w-full overflow-hidden border-t border-white/10 bg-charcoal-2">
      {/* soft brand glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-brand-blue/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-24 h-[360px] w-[360px] rounded-full bg-brand-deep/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 md:pt-28">
        {/* statement + navigation */}
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            {logoImage && <img src={logoImage} alt="Your Dream Builders" className="h-14 w-auto" />}
            <h2 className="mt-8 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-ivory sm:text-6xl md:text-7xl">
              Building Trust
              <br />
              <span className="text-gradient-brand">with Quality Work.</span>
            </h2>
            <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-ivory-dim">
              Your Dream &mdash; Design &bull; Construction &bull; Renovation
            </p>
            <div className="mt-7 flex gap-3">
              <a
                href={BUSINESS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${BUSINESS.instagram.handle}`}
                data-cursor-hover
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory transition-colors hover:border-brand-sky/60 hover:text-brand-sky"
              >
                <svg {...iconProps} width={18} height={18}>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
              <a
                href={BUSINESS.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                data-cursor-hover
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory transition-colors hover:border-brand-sky/60 hover:text-brand-sky"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="md:justify-self-end">
            <nav aria-label="Footer" className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
              {NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-cursor-hover
                  className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-ivory/85 transition-colors hover:border-brand-sky/50 hover:text-brand-sky"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              href="#top"
              data-cursor-hover
              className="mt-6 inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-ivory-dim transition-colors hover:text-brand-sky md:float-right"
            >
              Back to top
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">&uarr;</span>
            </a>
          </div>
        </div>

        {/* contact cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-[1fr_0.9fr_1.3fr_1.2fr]">
          <ContactCard
            label="Call us"
            note={`Contact: ${BUSINESS.contactPerson}`}
            icon={
              <svg {...iconProps}>
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              </svg>
            }
          >
            {BUSINESS.phones.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className="block transition-colors hover:text-brand-sky">
                {phone.display}
              </a>
            ))}
          </ContactCard>

          <ContactCard
            label="WhatsApp"
            href={whatsappUrl}
            external
            note="Tap to start a chat"
            icon={
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
                <path d="M16.04 3C8.86 3 3.03 8.83 3.03 16c0 2.3.6 4.54 1.74 6.52L3 29l6.65-1.74A12.96 12.96 0 0 0 16.04 29C23.2 29 29.03 23.17 29.03 16S23.2 3 16.04 3Zm0 23.64c-2 0-3.95-.54-5.66-1.55l-.4-.24-3.95 1.03 1.05-3.85-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.87 4.77-10.64 10.64-10.64 5.86 0 10.63 4.77 10.63 10.64 0 5.86-4.77 10.64-10.63 10.64Z" />
              </svg>
            }
          >
            {BUSINESS.whatsapp.display}
          </ContactCard>

          <ContactCard
            label="Email"
            href={`mailto:${BUSINESS.email}`}
            icon={
              <svg {...iconProps}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            }
          >
            <span className="[overflow-wrap:anywhere]">{BUSINESS.email}</span>
          </ContactCard>

          <ContactCard
            label="Visit us"
            href={BUSINESS.mapsUrl}
            external
            note="Open in Google Maps"
            icon={
              <svg {...iconProps}>
                <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            }
          >
            {BUSINESS.address}
          </ContactCard>
        </div>

        {/* bottom bar */}
        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-6 font-sans text-xs text-ivory-dim/70 sm:flex-row sm:items-center sm:justify-between md:mt-20">
          <span>&copy; {new Date().getFullYear()} Your Dream Builders. All rights reserved.</span>
          <span>Since {BUSINESS.established}</span>
        </div>
      </div>

      {/* giant wordmark across the bottom edge */}
      <div
        aria-hidden
        // extra space on phones keeps the bottom bar clear of the floating WhatsApp button
        className="pointer-events-none relative mt-20 select-none whitespace-nowrap text-center font-display text-[17vw] font-black uppercase leading-[0.72] tracking-tight md:mt-10"
      >
        <span className="bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-transparent">
          Your Dream
        </span>
      </div>
    </footer>
  );
}
