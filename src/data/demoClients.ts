// SAMPLE DATA for local design review only (see HappyClients.tsx, /?demo-clients).
// Never shown on the live site. Real entries are added from the /update page.
import { workImages } from "./media";

export const DEMO_CLIENTS = [
  {
    id: "demo-1",
    name: "Sample Client — Family Home",
    location: "Sample location, Pathanamthitta",
    quote:
      "SAMPLE TESTIMONIAL — the real client's words will appear here once added from the update page. A typical testimonial runs two or three sentences like this one.",
    url: workImages[0],
    order: 0,
  },
  {
    id: "demo-2",
    name: "Sample Client — Villa",
    location: "Sample location",
    quote: "SAMPLE TESTIMONIAL — a shorter quote, to show how cards line up when lengths differ.",
    url: workImages[3],
    order: 1,
  },
  {
    id: "demo-3",
    name: "Sample Client — Photo Only",
    location: "",
    quote: "",
    url: workImages[8],
    order: 2,
  },
];
