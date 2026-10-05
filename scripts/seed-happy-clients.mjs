// One-time setup: uploads the first key-handover photos (scripts/happy-clients-seed/,
// cropped from the client's Instagram posts) to Vercel Blob and writes the Happy
// Clients list. Does NOT switch the section on -- that stays a decision for the
// /update page. Refuses to run if entries already exist, so it can never
// overwrite handovers added through /update.
//
// Run once:
//   node --env-file=.env.local scripts/seed-happy-clients.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put, list } from "@vercel/blob";

const SEED_DIR = path.join(import.meta.dirname, "happy-clients-seed");
const MANIFEST_PATH = "clients-manifest.json";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN first (run with --env-file=.env.local after `npx vercel env pull`).");
    process.exit(1);
  }

  const { blobs } = await list({ prefix: MANIFEST_PATH, limit: 1 });
  if (blobs.length > 0) {
    const existing = await (await fetch(blobs[0].url, { cache: "no-store" })).json();
    if (Array.isArray(existing) && existing.length > 0) {
      console.error(`Happy Clients already has ${existing.length} entries -- not overwriting. Manage them from /update.`);
      process.exit(1);
    }
  }

  const seed = JSON.parse(await readFile(path.join(SEED_DIR, "clients.json"), "utf8"));
  const manifest = [];

  for (const [i, entry] of seed.entries()) {
    const buffer = await readFile(path.join(SEED_DIR, entry.file));
    const blob = await put(`clients/${crypto.randomUUID()}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });
    manifest.push({
      id: crypto.randomUUID(),
      name: entry.name,
      location: entry.location,
      quote: entry.quote,
      url: blob.url,
      order: i,
    });
    console.log(`Uploaded ${entry.file} -> ${entry.name}`);
  }

  await put(MANIFEST_PATH, JSON.stringify(manifest, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  console.log(`\nSeeded ${manifest.length} handovers. The section stays hidden until switched on in /update.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
