// Shared helpers for reading/writing the work-gallery manifest -- a single
// JSON blob listing every project photo currently shown on the site. Keeping
// this as one small file is simpler than duplicating Blob lookup logic in
// every route, and lets us control display order in one place.
import { put, list } from "@vercel/blob";

const MANIFEST_PATH = "work-manifest.json";

export async function readManifest() {
  // list() (not a guessed URL) is the reliable way to find the manifest's
  // current blob -- avoids hardcoding the store's base URL, and returns
  // an empty result cleanly on first run, before anything exists yet.
  const { blobs } = await list({ prefix: MANIFEST_PATH, limit: 1 });
  if (blobs.length === 0) return [];
  try {
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function writeManifest(photos) {
  return put(MANIFEST_PATH, JSON.stringify(photos, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export function checkPassword(req) {
  const expected = process.env.UPDATE_PAGE_PASSWORD;
  const provided = req.headers["x-update-password"];
  return Boolean(expected) && provided === expected;
}
