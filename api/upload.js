// Password-protected: adds a new work-gallery photo, or replaces an existing
// one's image/details. The client sends the image as base64 JSON (not
// multipart) to avoid pulling in a form-parsing dependency for what's a
// handful of small images at a time.
import { put, del } from "@vercel/blob";
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

  const { id, title, category, location, imageBase64, imageType } = req.body || {};

  if (!title || !category || !imageBase64 || !imageType) {
    res.status(400).json({ error: "Missing title, category, or image" });
    return;
  }
  if (category !== "Exterior" && category !== "Interior") {
    res.status(400).json({ error: "Category must be Exterior or Interior" });
    return;
  }

  const ext = imageType.split("/")[1] || "jpg";
  const buffer = Buffer.from(imageBase64, "base64");
  const isReplace = Boolean(id);

  const photos = await readManifest();
  const existing = isReplace ? photos.find((p) => p.id === id) : null;
  if (isReplace && !existing) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }

  const blob = await put(`work/${crypto.randomUUID()}.${ext}`, buffer, {
    access: "public",
    contentType: imageType,
  });

  // Clean up the old image so replacing a photo doesn't leave orphaned
  // storage behind every time.
  if (existing) {
    try {
      await del(existing.url);
    } catch {
      // Non-fatal -- the new photo still needs to go live either way.
    }
  }

  const entry = {
    id: existing ? existing.id : crypto.randomUUID(),
    title,
    category,
    location: location || "",
    url: blob.url,
    order: existing ? existing.order : photos.length,
  };

  const updated = existing
    ? photos.map((p) => (p.id === entry.id ? entry : p))
    : [...photos, entry];

  await writeManifest(updated);
  res.status(200).json({ photos: updated });
}
