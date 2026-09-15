// One-time migration: uploads the project photos currently bundled in
// src/assets/work to Vercel Blob and writes the initial manifest, so the
// update page and public site have real data from the start instead of an
// empty gallery.
//
// Run once, after Blob storage is set up:
//   BLOB_READ_WRITE_TOKEN=<token from Vercel dashboard> node scripts/seed-work-photos.mjs
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const SOURCE_DIR = path.join(import.meta.dirname, "..", "src", "assets", "work");

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN (from Vercel: Storage tab -> your Blob store -> .env.local tab) before running this.");
    process.exit(1);
  }

  const files = (await readdir(SOURCE_DIR))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  const manifest = [];

  for (const [i, file] of files.entries()) {
    const ext = path.extname(file).slice(1).toLowerCase();
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    // Every source photo is currently unlabelled beyond its filename -- default
    // everything to Exterior and rename from the update page afterwards.
    const category = "Exterior";
    const title = `Project ${String(i + 1).padStart(2, "0")}`;

    const buffer = await readFile(path.join(SOURCE_DIR, file));
    const blob = await put(`work/${crypto.randomUUID()}.${ext}`, buffer, {
      access: "public",
      contentType,
    });

    manifest.push({ id: crypto.randomUUID(), title, category, location: "", url: blob.url, order: i });
    console.log(`Uploaded ${file} -> ${blob.url}`);
  }

  const manifestBlob = await put("work-manifest.json", JSON.stringify(manifest, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  console.log(`\nManifest written: ${manifestBlob.url}`);
  console.log(`Seeded ${manifest.length} photos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
