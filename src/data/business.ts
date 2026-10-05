// Real business details, from the client questionnaire ("Inventive Infrastructures
// Interiors" .xlsx). Every section reads from here, so updating a phone number or
// address is a one-line change.

export const BUSINESS = {
  name: "Your Dream Builders",
  established: 2019,
  projectsCompleted: 40,
  serviceArea: "Pathanamthitta District",
  address: "Ranni Perunad, Pathanamthitta, Kerala — near Perunad Arch Bridge",
  mapsUrl: "https://maps.app.goo.gl/5HynJGCkuZcZiUQW6",
  phones: [
    { display: "+91 94964 69314", tel: "+919496469314" },
    { display: "+91 90488 10030", tel: "+919048810030" },
  ],
  email: "yourdreambuilders@hotmail.com",
  contactPerson: "Ambadi Venu, Manager",
  instagram: { handle: "@your_dream_builders", url: "https://www.instagram.com/your_dream_builders/" },
  facebookUrl: "https://www.facebook.com/yourdbuilders",
  whatsapp: {
    number: "919048810030", // international format, no "+", for wa.me links
    display: "+91 90488 10030",
    // Pre-filled text the *visitor* sends when they tap the WhatsApp button.
    message: "Hi YOUR DREAM, I'd like to know more about your design, construction and renovation services.",
  },
} as const;

export const yearsExperience = new Date().getFullYear() - BUSINESS.established;

export const whatsappUrl = `https://wa.me/${BUSINESS.whatsapp.number}?text=${encodeURIComponent(BUSINESS.whatsapp.message)}`;
