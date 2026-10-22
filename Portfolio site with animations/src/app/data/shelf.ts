import bookCover1 from "@/assets/about-me-page/book-1.png";
import movieCover1 from "@/assets/about-me-page/movie-1.png";
import movieCover2 from "@/assets/about-me-page/movie-2.png";

// ── Books / Movies / Resources data ───────────────────────────────────────────
// `cover`/`poster`/`art` are optional - entries without one render a titled
// placeholder tile until the real asset is dropped in. Currently-reading books
// carry `reading: true` and are pinned to the front of the Books carousel.

export type BookItem = { title: string; author: string; cover?: string; reading?: boolean };
export type MovieItem = { title: string; year: string; poster?: string };
export type ResourceItem = { title: string; kind: string; art?: string };

export const BOOKS: BookItem[] = [
  // currently reading - pinned first
  { title: "Good Material", author: "Dolly Alderton", reading: true },
  { title: "Gujarat Diaries", author: "Rana Ayyub", reading: true },
  { title: "Design as an Art", author: "Bruno Munari", reading: true },
  // backlist
  { title: "If Tomorrow Comes", author: "Sidney Sheldon", cover: bookCover1 },
  { title: "The Doomsday Conspiracy", author: "Sidney Sheldon" },
  { title: "The Stars Shine Down", author: "Sidney Sheldon" },
  { title: "Nothing Lasts Forever", author: "Sidney Sheldon" },
  { title: "The Best Laid Plans", author: "Sidney Sheldon" },
];
export const MOVIES: MovieItem[] = [
  { title: "Perfect Days", year: "2023", poster: movieCover1 },
  { title: "Little Forest", year: "2018", poster: movieCover2 },
  { title: "Not Without My Daughter", year: "1991" },
  { title: "Grave of the Fireflies", year: "1988" },
];
export const RESOURCES: ResourceItem[] = [
  { title: "Podcast on the Gujarat riots", kind: "Podcast" },
  { title: "An interview from the Linear team", kind: "Interview" },
  { title: "…and your own mistakes", kind: "Ongoing" },
];
