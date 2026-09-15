// Password-protected: removes a photo from the work gallery entirely.
import { del } from "@vercel/blob";
import { readManifest, writeManifest, checkPassword } from "./_manifest.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!checkPassword(req)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  const { id } = req.body || {};
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  const photos = await readManifest();
  const target = photos.find((p) => p.id === id);
  if (!target) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }

  try {
    await del(target.url);
  } catch {
    // Non-fatal -- still remove it from the manifest either way.
  }

  const updated = photos.filter((p) => p.id !== id);
  await writeManifest(updated);
  res.status(200).json({ photos: updated });
}
