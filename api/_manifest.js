// Shared helpers for reading/writing the work-gallery manifest -- a single
// JSON blob listing every project photo currently shown on the site. Keeping
// this as one small file is simpler than duplicating Blob lookup logic in
// every route, and lets us control display order in one place.
import { put, list } from "@vercel/blob";

const MANIFEST_PATH = "work-manifest.json";
// Happy Clients (key handovers + testimonials) keep their own list alongside.
export const CLIENTS_MANIFEST_PATH = "clients-manifest.json";

export async function readManifest(path = MANIFEST_PATH) {
  // list() (not a guessed URL) is the reliable way to find the manifest's
  // current blob -- avoids hardcoding the store's base URL, and returns
  // an empty result cleanly on first run, before anything exists yet.
  const { blobs } = await list({ prefix: path, limit: 1 });
  if (blobs.length === 0) return [];
  try {
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function writeManifest(photos, path = MANIFEST_PATH) {
  return put(path, JSON.stringify(photos, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
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
