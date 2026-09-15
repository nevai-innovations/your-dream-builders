// Drop project photos into src/assets/work/ (any filename, jpg/png/webp) —
// they are auto-discovered and rendered in the work gallery, no manual wiring needed.
const workModules = import.meta.glob("../assets/work/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// Drop the founder's photo into src/assets/founder/ (any filename) — the first one found is used.
const founderModules = import.meta.glob("../assets/founder/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const workImages: string[] = Object.keys(workModules)
  .sort()
  .map((key) => workModules[key]);

export const founderImage: string | undefined = Object.values(founderModules)[0];

// Drop the transparent-background logo (PNG/SVG) into src/assets/logo/ — first file found is used.
const logoModules = import.meta.glob("../assets/logo/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const logoImage: string | undefined = Object.values(logoModules)[0];

// Drop the hero background video into src/assets/video/ (any filename, mp4/webm) — first one found is used.
const heroVideoModules = import.meta.glob("../assets/video/*.{mp4,webm}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const heroVideo: string | undefined = Object.values(heroVideoModules)[0];
