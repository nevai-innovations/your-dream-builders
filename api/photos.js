// Public, read-only: the live site's Work section fetches this on load to
// render whatever photos currently exist. No password needed -- this is the
// same information the public site already displays.
import { readManifest } from "./_manifest.js";

export default async function handler(req, res) {
  const photos = await readManifest();
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.status(200).json(photos);
}
