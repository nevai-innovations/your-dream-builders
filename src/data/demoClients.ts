// Local preview of the real handover entries (see HappyClients.tsx, /?demo-clients),
// read straight from the seed folder that scripts/seed-happy-clients.mjs uploads.
// Only loaded in dev, so none of this ships in the production bundle -- on the live
// site the section reads entries from the /api/clients store instead.
import seed from "../../scripts/happy-clients-seed/clients.json";

const photos = import.meta.glob("../../scripts/happy-clients-seed/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const DEMO_CLIENTS = seed.map((entry, i) => ({
  id: `seed-${i + 1}`,
  name: entry.name,
  location: entry.location,
  quote: entry.quote,
  url: photos[`../../scripts/happy-clients-seed/${entry.file}`],
  order: i,
}));
