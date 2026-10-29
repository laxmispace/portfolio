// Where each personal photo (src/assets/about-photos/<n>.<k>.jpg) was taken - shown with
// a little hand-drawn arrow on the home page's "Beyond pixels" photos and in the About
// drawer's photo strip. Leave a photo out (or "") and it shows no label.
export const PHOTO_PLACES: Record<string, string> = {
  "1.1": "trying oil pastels",
  "1.3": "sketching at Kochi Biennale",
  "1.4": "sketching at Kochi Biennale",
  "1.5": "sketching at Kochi Biennale",
  "2.1": "print class at Chitrakala Parishath",
  "3.1": "Kodai",
  "3.2": "wfc @ Vietnam",
  "3.3": "hotpot @ Vietnam",
  "4.1": "Ladies Who Ship, HSR",
  "4.2": "ETH India, Blr",
  "4.3": "ETH India, Blr",
  "4.4": "Build with Flora, HSR",
  "4.5": "c0mpiled x Magicball x Razorpay Hackathon",
  "4.6": "Shipped: India builds with Figma",
  "4.7": "Rive Ambassador Happy Hours",
  "4.8": "Demo Nights, Canvs, Blr",
  "5.1": "Berry bowl",
  "6.2": "my mini library",
};

// The About drawer's scrapbook row, in order - mostly hackathons and community nights -
// with each photo's natural size so the row lays them out (uncropped) before they load.
export const ABOUT_SCRAPBOOK: { id: string; w: number; h: number }[] = [
  { id: "4.6", w: 1200, h: 675 }, // Shipped: India builds with Figma
  { id: "4.2", w: 675, h: 1200 }, // ETH India
  { id: "4.4", w: 1200, h: 769 }, // Build with Flora
  { id: "4.5", w: 900, h: 1200 }, // c0mpiled hackathon
  { id: "4.7", w: 1200, h: 800 }, // Rive Ambassador Happy Hours
  { id: "1.3", w: 900, h: 1200 }, // sketching at Kochi Biennale
  { id: "4.1", w: 1200, h: 569 }, // Ladies Who Ship
  { id: "4.3", w: 1200, h: 675 }, // ETH India
  { id: "4.8", w: 1200, h: 901 }, // Demo Nights
];
