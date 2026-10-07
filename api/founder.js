// Founder & Managing Director photo, replaceable from the /update page.
//   GET  -> { url }  public; url is null while the site's built-in photo is used
//   POST -> password-protected:
//           { imageBase64, imageType } replaces the photo
//           { action: "reset" }        goes back to the built-in photo
// The chosen photo's URL lives in the shared site settings.
import { put, del } from "@vercel/blob";
import { readSettings, writeSettings, checkPassword } from "./_manifest.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { founderPhotoUrl } = await readSettings();
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.status(200).json({ url: founderPhotoUrl || null });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!checkPassword(req)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  const body = req.body || {};
  const settings = await readSettings();
  const previous = settings.founderPhotoUrl;

  if (body.action === "reset") {
    await writeSettings({ ...settings, founderPhotoUrl: null });
    if (previous) {
      try {
        await del(previous);
      } catch {
        // Non-fatal -- the site already uses the built-in photo again.
      }
    }
    res.status(200).json({ url: null });
    return;
  }

  const { imageBase64, imageType } = body;
  if (!imageBase64 || !(typeof imageType === "string" && imageType.startsWith("image/"))) {
    res.status(400).json({ error: "Choose an image file" });
    return;
  }

  const ext = imageType.split("/")[1] || "jpg";
  const blob = await put(`founder/${crypto.randomUUID()}.${ext}`, Buffer.from(imageBase64, "base64"), {
    access: "public",
    contentType: imageType,
  });
  await writeSettings({ ...settings, founderPhotoUrl: blob.url });

  // Clean up the photo it replaced so storage doesn't pile up.
  if (previous) {
    try {
      await del(previous);
    } catch {
      // Non-fatal -- the new photo is already live.
    }
  }
  res.status(200).json({ url: blob.url });
}
