// Happy Clients: key-handover photos with optional testimonials.
//   GET  -> { enabled, clients }. The public site only gets entries while the
//           section is enabled; with the admin password, always the full list.
//   POST -> password-protected add / edit / delete / enable-disable, from /update
// One route handles all of it to keep the number of serverless functions low.
import { put, del } from "@vercel/blob";
import {
  readManifest,
  writeManifest,
  readSettings,
  writeSettings,
  checkPassword,
  CLIENTS_MANIFEST_PATH,
} from "./_manifest.js";

const LIMITS = { name: 80, location: 80, quote: 600 };

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { clientsEnabled } = await readSettings();
    const isAdmin = checkPassword(req);
    // While disabled, the public gets nothing -- hidden entries stay private.
    const clients = clientsEnabled || isAdmin ? await readManifest(CLIENTS_MANIFEST_PATH) : [];
    res.setHeader("Cache-Control", isAdmin ? "no-store" : "public, max-age=0, must-revalidate");
    res.status(200).json({ enabled: clientsEnabled, clients });
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

  if (body.action === "setEnabled") {
    const settings = await readSettings();
    const updatedSettings = { ...settings, clientsEnabled: Boolean(body.enabled) };
    await writeSettings(updatedSettings);
    const clients = await readManifest(CLIENTS_MANIFEST_PATH);
    res.status(200).json({ enabled: updatedSettings.clientsEnabled, clients });
    return;
  }

  const [clients, { clientsEnabled }] = await Promise.all([readManifest(CLIENTS_MANIFEST_PATH), readSettings()]);
  const existing = body.id ? clients.find((c) => c.id === body.id) : null;
  if (body.id && !existing) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  if (body.action === "delete") {
    try {
      await del(existing.url);
    } catch {
      // Non-fatal -- still remove it from the list either way.
    }
    const updated = clients.filter((c) => c.id !== existing.id);
    await writeManifest(updated, CLIENTS_MANIFEST_PATH);
    res.status(200).json({ enabled: clientsEnabled, clients: updated });
    return;
  }

  const name = clean(body.name, LIMITS.name);
  const location = clean(body.location, LIMITS.location);
  const quote = clean(body.quote, LIMITS.quote);
  const { imageBase64, imageType } = body;

  if (!name) {
    res.status(400).json({ error: "Add the client's name" });
    return;
  }
  if (!existing && !imageBase64) {
    res.status(400).json({ error: "Choose a handover photo" });
    return;
  }
  if (imageBase64 && !(typeof imageType === "string" && imageType.startsWith("image/"))) {
    res.status(400).json({ error: "The file must be an image" });
    return;
  }

  let url = existing?.url;
  if (imageBase64) {
    const ext = imageType.split("/")[1] || "jpg";
    const blob = await put(`clients/${crypto.randomUUID()}.${ext}`, Buffer.from(imageBase64, "base64"), {
      access: "public",
      contentType: imageType,
    });
    // Clean up the old photo so replacing one doesn't leave orphaned storage.
    if (existing) {
      try {
        await del(existing.url);
      } catch {
        // Non-fatal -- the new photo still needs to go live either way.
      }
    }
    url = blob.url;
  }

  const entry = {
    id: existing ? existing.id : crypto.randomUUID(),
    name,
    location,
    quote,
    url,
    order: existing ? existing.order : clients.length,
  };
  const updated = existing ? clients.map((c) => (c.id === entry.id ? entry : c)) : [...clients, entry];

  await writeManifest(updated, CLIENTS_MANIFEST_PATH);
  res.status(200).json({ enabled: clientsEnabled, clients: updated });
}
