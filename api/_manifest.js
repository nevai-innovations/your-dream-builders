// Shared helpers for reading/writing the work-gallery manifest -- a single
// JSON blob listing every project photo currently shown on the site. Keeping
// this as one small file is simpler than duplicating Blob lookup logic in
// every route, and lets us control display order in one place.
import { put, list, del } from "@vercel/blob";

const MANIFEST_PATH = "work-manifest.json";
// Happy Clients (key handovers + testimonials) keep their own list alongside.
export const CLIENTS_MANIFEST_PATH = "clients-manifest.json";

// Why versioned files: Vercel Blob's CDN keeps serving the *old* content of an
// overwritten blob for up to ~60s, so changes made in /update (including the
// Happy Clients on/off switch) didn't show on the site straight away. Instead,
// every write creates a new file -- "work-manifest.v1730000000000.json" -- which
// has never been cached, and reads pick the newest version via list() (the
// API, not the CDN, so it's always current). The original un-versioned file
// ("work-manifest.json") counts as version 0, so existing data keeps working.
const baseName = (path) => path.replace(/\.json$/, "");
const versionOf = (pathname, base) => {
  if (pathname === `${base}.json`) return 0;
  const match = pathname.match(/\.v(\d+)\.json$/);
  return match && pathname.startsWith(`${base}.v`) ? Number(match[1]) : -1;
};

async function listVersions(path) {
  const base = baseName(path);
  const { blobs } = await list({ prefix: base });
  return blobs
    .map((blob) => ({ ...blob, version: versionOf(blob.pathname, base) }))
    .filter((blob) => blob.version >= 0)
    .sort((a, b) => b.version - a.version);
}

export async function readManifest(path = MANIFEST_PATH) {
  const [latest] = await listVersions(path);
  if (!latest) return []; // first run, before anything exists yet
  try {
    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function writeManifest(photos, path = MANIFEST_PATH) {
  const version = Date.now();
  const blob = await put(`${baseName(path)}.v${version}.json`, JSON.stringify(photos, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  // Tidy up older versions. Never touch anything newer than this write, in
  // case another save landed at the same moment.
  try {
    const older = (await listVersions(path)).filter((b) => b.version < version);
    if (older.length) await del(older.map((b) => b.url));
  } catch {
    // Non-fatal -- leftovers are ignored by reads and removed on the next save.
  }
  return blob;
}

// Small site-wide switches set from the /update page (e.g. whether the Happy
// Clients section is shown). Stored as one JSON object, like the manifests.
const SETTINGS_PATH = "site-settings.json";
const DEFAULT_SETTINGS = { clientsEnabled: false };

export async function readSettings() {
  const stored = await readManifest(SETTINGS_PATH);
  // readManifest returns [] when the file doesn't exist yet
  return { ...DEFAULT_SETTINGS, ...(Array.isArray(stored) ? {} : stored) };
}

export async function writeSettings(settings) {
  return writeManifest(settings, SETTINGS_PATH);
}

export function checkPassword(req) {
  const expected = process.env.UPDATE_PAGE_PASSWORD;
  const provided = req.headers["x-update-password"];
  return Boolean(expected) && provided === expected;
}
