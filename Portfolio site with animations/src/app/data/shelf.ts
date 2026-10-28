import movieCover1 from "@/assets/about-me-page/movie-1.png";
import movieCover2 from "@/assets/about-me-page/movie-2.png";
import goodMaterial from "@/assets/about-me/books/good material.jpg";
import gujaratFiles from "@/assets/about-me/books/gfiles.jpg";
import designAsArt from "@/assets/about-me/books/bruno.jpg";
import ifTomorrowComes from "@/assets/about-me/books/if tomorrow comes.png";
import starsShineDown from "@/assets/about-me/books/stars shine down.jpg";
import nothingLastsForever from "@/assets/about-me/books/nothing lasts forever.jpg";
import doomsday from "@/assets/about-me/books/doomsday.jpg";
import bestLaidPlans from "@/assets/about-me/books/best laid plans.jpg";
import taxiDriver from "@/assets/about-me/Movies/taxidriver.webp";
import joyland from "@/assets/about-me/Movies/joyland.avif";
import notWithoutMyDaughter from "@/assets/about-me/Movies/not without my daughter.jpg";
import intoTheWild from "@/assets/about-me/Movies/intothewild.jpeg";
import chef from "@/assets/about-me/Movies/chef.jpeg";
import graveOfTheFireflies from "@/assets/about-me/Movies/gof.jpg";
import eighteenX2 from "@/assets/about-me/Movies/18x2.jpeg";
import ytGodhra from "@/assets/about-me/random/yt-k2ehJIv3AMo.jpg";
import ytKatieDill from "@/assets/about-me/random/yt-GLvFTMtw4Jk.jpg";
import ytDesignNeverSame from "@/assets/about-me/random/yt-na1OyJ3E7Kc.jpg";
import meaghanChoi from "@/assets/about-me/random/meaghan-choi.jpg";
import coreyMoenWords from "@/assets/about-me/random/corey-moen-words.jpg";
import rasagy from "@/assets/about-me/random/rasagy.jpg";

// ── Books / Cinema / Random data ───────────────────────────────────────────
// `cover`/`poster`/`art` are optional - entries without one render a titled
// placeholder tile until the real asset is dropped in. Currently-reading books
// carry `reading: true` and are pinned to the front of the Books carousel.

export type BookItem = { title: string; author: string; cover?: string; reading?: boolean };
export type MovieItem = { title: string; year: string; poster?: string };
export type ResourceItem = { title: string; kind: string; url: string; art?: string };

export const BOOKS: BookItem[] = [
  // currently reading - pinned first
  { title: "Good Material", author: "Dolly Alderton", cover: goodMaterial, reading: true },
  { title: "Gujarat Files", author: "Rana Ayyub", cover: gujaratFiles, reading: true },
  { title: "Design as Art", author: "Bruno Munari", cover: designAsArt, reading: true },
  // backlist
  { title: "If Tomorrow Comes", author: "Sidney Sheldon", cover: ifTomorrowComes },
  { title: "The Doomsday Conspiracy", author: "Sidney Sheldon", cover: doomsday },
  { title: "The Stars Shine Down", author: "Sidney Sheldon", cover: starsShineDown },
  { title: "Nothing Lasts Forever", author: "Sidney Sheldon", cover: nothingLastsForever },
  { title: "The Best Laid Plans", author: "Sidney Sheldon", cover: bestLaidPlans },
];
export const MOVIES: MovieItem[] = [
  { title: "Perfect Days", year: "2023", poster: movieCover1 },
  { title: "Little Forest", year: "2018", poster: movieCover2 },
  { title: "Taxi Driver", year: "1976", poster: taxiDriver },
  { title: "Joyland", year: "2022", poster: joyland },
  { title: "Not Without My Daughter", year: "1991", poster: notWithoutMyDaughter },
  { title: "Into the Wild", year: "2007", poster: intoTheWild },
  { title: "Chef", year: "2014", poster: chef },
  { title: "Grave of the Fireflies", year: "1988", poster: graveOfTheFireflies },
  { title: "18×2 Beyond Youthful Days", year: "2024", poster: eighteenX2 },
];
export const RESOURCES: ResourceItem[] = [
  { title: "The Forgotten 59 of Godhra", kind: "Podcast", url: "https://www.youtube.com/live/k2ehJIv3AMo", art: ytGodhra },
  { title: "How to scale intent, quality, and artistry with AI | Katie Dill (Stripe)", kind: "Talk", url: "https://youtu.be/GLvFTMtw4Jk", art: ytKatieDill },
  { title: "Design will never be the same", kind: "Video", url: "https://youtu.be/na1OyJ3E7Kc", art: ytDesignNeverSame },
  { title: "The case for shameless hope with Meaghan Choi", kind: "Article", url: "https://www.aidesignfieldguide.com/articles/meaghan-choi", art: meaghanChoi },
  { title: "Words by Corey Moen", kind: "Essay", url: "https://www.coreymoen.com/words", art: coreyMoenWords },
  { title: "Rasagy Sharma - his blogs are so fun to read", kind: "Blog", url: "https://rasagy.in/", art: rasagy },
];
