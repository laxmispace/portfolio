import { useState, useEffect, useRef } from "react";

const books = [
  {
    title: "If Tomorrow Comes",
    author: "Sidney Sheldon",
    cover:
      "https://images.unsplash.com/photo-1619164025189-5c01101dfa46?w=300&h=420&fit=crop",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    cover:
      "https://images.unsplash.com/photo-1529521818954-c76995518833?w=300&h=420&fit=crop",
  },
  {
    title: "Yellow Crescent",
    author: "Amol Srivastava",
    cover:
      "https://images.unsplash.com/photo-1716892001657-722e6e14ae29?w=300&h=420&fit=crop",
  },
  {
    title: "Crimson Pages",
    author: "Brett Jordan",
    cover:
      "https://images.unsplash.com/photo-1613643708215-e3a0b5e5cd8e?w=300&h=420&fit=crop",
  },
  {
    title: "Dark Passage",
    author: "Brett Jordan",
    cover:
      "https://images.unsplash.com/photo-1600704569899-8b06559404ca?w=300&h=420&fit=crop",
  },
  {
    title: "Red Chronicles",
    author: "Tim Alex",
    cover:
      "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=300&h=420&fit=crop",
  },
];

const movies = [
  {
    title: "Perfect Days",
    year: "2023",
    poster:
      "https://images.unsplash.com/photo-1619164816991-22d393238d8f?w=300&h=420&fit=crop",
  },
  {
    title: "Cinema Classics",
    year: "2022",
    poster:
      "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=300&h=420&fit=crop",
  },
  {
    title: "Triple Feature",
    year: "2021",
    poster:
      "https://images.unsplash.com/photo-1572188863110-46d457c9234d?w=300&h=420&fit=crop",
  },
  {
    title: "VHS Memories",
    year: "2020",
    poster:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=420&fit=crop",
  },
  {
    title: "City Lights",
    year: "2019",
    poster:
      "https://images.unsplash.com/photo-1701275998609-119e2c09f443?w=300&h=420&fit=crop",
  },
];

// ---- Books carousel -------------------------------------------------
function BooksPanel({ activeIdx, direction }: { activeIdx: number; direction: "next" | "prev" | null }) {
  const total = books.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  // Each book slot gets a stable position class based on its role
  type Slot = "left" | "center" | "right" | "hidden-left" | "hidden-right";

  function slotStyle(slot: Slot): React.CSSProperties {
    switch (slot) {
      case "center":
        return {
          transform: "translateX(-50%) translateY(-50%) rotate(0deg) scale(1)",
          opacity: 1,
          zIndex: 10,
          left: "50%",
          top: "calc(50% - 10px)",
        };
      case "left":
        return {
          transform: "translateX(-50%) translateY(-50%) rotate(-15deg) scale(0.65)",
          opacity: 0.3,
          zIndex: 5,
          left: "calc(50% - 86px)",
          top: "calc(50% + 19px)",
        };
      case "right":
        return {
          transform: "translateX(-50%) translateY(-50%) rotate(15deg) scale(0.65)",
          opacity: 0.3,
          zIndex: 5,
          left: "calc(50% + 86px)",
          top: "calc(50% + 19px)",
        };
      case "hidden-left":
        return {
          transform: "translateX(-50%) translateY(-50%) rotate(-25deg) scale(0.4)",
          opacity: 0,
          zIndex: 1,
          left: "calc(50% - 160px)",
          top: "calc(50% + 40px)",
        };
      case "hidden-right":
        return {
          transform: "translateX(-50%) translateY(-50%) rotate(25deg) scale(0.4)",
          opacity: 0,
          zIndex: 1,
          left: "calc(50% + 160px)",
          top: "calc(50% + 40px)",
        };
    }
  }

  return (
    <div
      className="absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden"
      style={{ width: 154, height: 188, background: "#e8bfc7" }}
    >
      {/* We render prev, active, next plus two hidden slots for smooth entry/exit */}
      {[prevIdx, activeIdx, nextIdx].map((idx, i) => {
        const slot: Slot = i === 0 ? "left" : i === 1 ? "center" : "right";
        const book = books[idx];
        return (
          <div
            key={idx}
            className="absolute w-[80px] h-[120px] rounded-[1.4px] overflow-hidden"
            style={{
              transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: "2.78px 2.78px 1.39px rgba(56,20,28,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
              ...slotStyle(slot),
            }}
          >
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover pointer-events-none"
            />
            {/* book spine shadow */}
            <div
              className="absolute top-0 h-full w-[2px] blur-[1.4px]"
              style={{ left: "2.97px", background: "rgba(35,30,30,0.3)" }}
            />
          </div>
        );
      })}
      {/* counter */}
      <div className="absolute bottom-[9px] left-[64px] flex items-center gap-[4px]">
        <span
          className="text-[10px] tracking-[0.1px] leading-none"
          style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, color: "#735933" }}
        >
          {activeIdx + 1}
        </span>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#735933" fillOpacity="0.3" />
        </svg>
        <span
          className="text-[10px] tracking-[0.1px] leading-none"
          style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, color: "rgba(115,89,51,0.5)" }}
        >
          {total}
        </span>
      </div>
    </div>
  );
}

// ---- Movies carousel ------------------------------------------------
type MovieSlot = "left" | "center" | "right";

function MovieImage({
  src,
  alt,
  slot,
}: {
  src: string;
  alt: string;
  slot: MovieSlot;
}) {
  function styleForSlot(s: MovieSlot): React.CSSProperties {
    switch (s) {
      case "center":
        return {
          width: 90,
          height: 120,
          left: "50%",
          top: "calc(50% - 10px)",
          transform: "translateX(-50%) translateY(-50%) scale(1)",
          opacity: 1,
          zIndex: 10,
        };
      case "right":
        return {
          width: 60,
          height: 80,
          left: "calc(50% + 87px)",
          top: "calc(50% + 10px)",
          transform: "translateX(-50%) translateY(-50%) scale(1)",
          opacity: 0.3,
          zIndex: 5,
        };
      case "left":
        return {
          width: 60,
          height: 80,
          left: "calc(50% - 87px)",
          top: "calc(50% - 30px)",
          transform: "translateX(-50%) translateY(-50%) scale(1)",
          opacity: 0.3,
          zIndex: 5,
        };
    }
  }

  return (
    <div
      className="absolute rounded-[2px] overflow-hidden"
      style={{
        transition: "all 0.55s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "2px 2px 2px rgba(0,0,0,0.25)",
        ...styleForSlot(slot),
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}

function MoviesPanel({ activeIdx }: { activeIdx: number }) {
  const total = movies.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div
      className="absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden"
      style={{ width: 154, height: 188, background: "#e8d4bf" }}
    >
      <MovieImage
        key={`left-${prevIdx}`}
        src={movies[prevIdx].poster}
        alt={movies[prevIdx].title}
        slot="left"
      />
      <MovieImage
        key={`center-${activeIdx}`}
        src={movies[activeIdx].poster}
        alt={movies[activeIdx].title}
        slot="center"
      />
      <MovieImage
        key={`right-${nextIdx}`}
        src={movies[nextIdx].poster}
        alt={movies[nextIdx].title}
        slot="right"
      />
      {/* counter */}
      <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
        <span
          className="text-[10px] tracking-[0.1px] leading-none"
          style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, color: "#735933" }}
        >
          {activeIdx + 1}
        </span>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#735933" fillOpacity="0.3" />
        </svg>
        <span
          className="text-[10px] tracking-[0.1px] leading-none"
          style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, color: "rgba(115,89,51,0.5)" }}
        >
          {total}
        </span>
      </div>
    </div>
  );
}

// ---- Arrow button ---------------------------------------------------
function ArrowBtn({
  dir,
  onClick,
  fill,
}: {
  dir: "next" | "prev";
  onClick: () => void;
  fill: string;
}) {
  const nextPath =
    "M9.2751 5.99991L18.0002 11.2981V12.6742L9.2751 17.9999V16.2522L15.5054 12.6605L5.0002 13.0871V11.0779L15.4919 11.4907L9.2751 7.85771V5.99991Z";
  const prevPath =
    "M13.7253 5.99991L5.0002 11.2981V12.6742L13.7253 17.9999V16.2522L7.49501 12.6605L18.0002 13.0871V11.0779L7.5085 11.4907L13.7253 7.85771V5.99991Z";
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 size-[24px] cursor-pointer"
      aria-label={dir === "next" ? "Next" : "Previous"}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="absolute inset-0 size-full"
      >
        <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.5" />
        <path d={dir === "next" ? nextPath : prevPath} fill={fill} />
      </svg>
    </button>
  );
}

// ---- Main card ------------------------------------------------------
export default function BooksAndMoviesCard() {
  const [tab, setTab] = useState<"books" | "movies">("books");
  const [bookIdx, setBookIdx] = useState(0);
  const [movieIdx, setMovieIdx] = useState(0);
  const [bookDir, setBookDir] = useState<"next" | "prev" | null>(null);

  const isBooks = tab === "books";

  const bg = isBooks ? "#ebc7ce" : "#e3d9ce";
  const arrowFill = isBooks ? "#D07C8D" : "#C67D39";

  const currentBook = books[bookIdx];
  const currentMovie = movies[movieIdx];

  function nextItem() {
    if (isBooks) {
      setBookDir("next");
      setBookIdx((i) => (i + 1) % books.length);
    } else {
      setMovieIdx((i) => (i + 1) % movies.length);
    }
  }

  function prevItem() {
    if (isBooks) {
      setBookDir("prev");
      setBookIdx((i) => (i - 1 + books.length) % books.length);
    } else {
      setMovieIdx((i) => (i - 1 + movies.length) % movies.length);
    }
  }

  const title = isBooks ? currentBook.title : currentMovie.title;
  const subtitle = isBooks ? currentBook.author.toUpperCase() : currentMovie.year;

  return (
    <div
      className="overflow-hidden relative rounded-2xl"
      style={{ width: 376, height: 188, background: bg, transition: "background 0.4s ease" }}
    >
      {/* Left visual panel */}
      {isBooks ? (
        <BooksPanel activeIdx={bookIdx} direction={bookDir} />
      ) : (
        <MoviesPanel activeIdx={movieIdx} />
      )}

      {/* Right info panel */}
      <div
        className="absolute flex flex-col justify-between"
        style={{ left: 170, top: 16, width: 206, height: 156 }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-4 text-[12px] tracking-[-0.24px] text-[#212012]">
          <button
            onClick={() => setTab("books")}
            className="cursor-pointer relative shrink-0"
            style={{
              fontFamily: "'Libre Caslon Condensed'",
              fontWeight: isBooks ? 500 : 500,
              fontStyle: isBooks ? "italic" : "normal",
              textDecoration: isBooks ? "underline" : "none",
              textDecorationStyle: "solid",
              background: "none",
              border: "none",
              padding: 0,
              color: "#212012",
            }}
          >
            Books
          </button>
          <button
            onClick={() => setTab("movies")}
            className="cursor-pointer relative shrink-0"
            style={{
              fontFamily: "'Libre Caslon Condensed'",
              fontWeight: !isBooks ? 500 : 500,
              fontStyle: !isBooks ? "italic" : "normal",
              textDecoration: !isBooks ? "underline" : "none",
              textDecorationStyle: "solid",
              background: "none",
              border: "none",
              padding: 0,
              color: "#212012",
            }}
          >
            Movies
          </button>
        </div>

        {/* Title + arrow */}
        <div className="flex items-start gap-1">
          <div className="flex flex-col gap-1 flex-1" style={{ width: 178 }}>
            <p
              className="text-[16px] leading-[20px] text-[#212012]"
              style={{ fontFamily: "'Libre Caslon Condensed'", fontWeight: 600 }}
            >
              {title}
            </p>
            <p
              className="text-[12px] leading-[16px] uppercase"
              style={{ fontFamily: "'Inclusive Sans'", fontWeight: 400, color: "rgba(33,32,18,0.5)" }}
            >
              {subtitle}
            </p>
          </div>
          <ArrowBtn dir="next" onClick={nextItem} fill={arrowFill} />
        </div>
      </div>
    </div>
  );
}
