import { useEffect, useState } from "react";
import { workImages } from "../data/media";

interface CmsPhoto {
  id: string;
  url: string;
  order: number;
}

/**
 * Prefers photos managed live through /update (Vercel Blob + the CMS API) so
 * the site owner can add/replace/remove work photos without a redeploy.
 * Falls back to the bundled src/assets/work/ images when the API route isn't
 * available -- e.g. a plain `vite dev` without `vercel dev`, or before the
 * CMS has been seeded with its first photo.
 */
export function useWorkPhotos(): string[] {
  const [cmsImages, setCmsImages] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/photos", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data: CmsPhoto[]) => {
          if (cancelled || !Array.isArray(data) || data.length === 0) return;
          const next = [...data].sort((a, b) => a.order - b.order).map((p) => p.url);
          // only re-render when the list actually changed
          setCmsImages((prev) => (prev && prev.join("\n") === next.join("\n") ? prev : next));
        })
        .catch(() => {
          // no CMS available (or nothing uploaded yet) -- keep the static fallback
        });
    };
    load();

    // Pick up changes made in /update when the visitor comes back to this tab,
    // without a manual refresh. (Not polling: every check costs a Blob request.)
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return cmsImages ?? workImages;
}
