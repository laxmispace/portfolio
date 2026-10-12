import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { X, Volume2, Linkedin, Mail, FileText } from "lucide-react";
import { useIsMobile } from "@/app/useIsMobile";
import { useSpotifyPlayer } from "@/app/useSpotifyPlayer";
import { AI_PROJECTS } from "./AiProjectsPage";
import vinylDisc from "../../assets/vinyl-player/vinyl-disc.png";
import vinylRing from "../../assets/vinyl-player/vinyl-ring.png";
import gridBg from "../../assets/about-me-page/grid.png";
import envelopeStack from "../../assets/about-me-page/envelope-stack.png";
import myPhoto1 from "../../assets/about-me-page/my-photo-1.png";
import myPhoto2 from "../../assets/about-me-page/my-photo-2.png";
import bookCover1 from "../../assets/about-me-page/book-1.png";
import movieCover1 from "../../assets/about-me-page/movie-1.png";
import movieCover2 from "../../assets/about-me-page/movie-2.png";
import stackPhoto1 from "../../assets/stack images /optimized/20260425_203032 1.jpg";
import stackPhoto2 from "../../assets/stack images /optimized/20260613_184245(0) 1.jpg";
import stackPhoto3 from "../../assets/stack images /optimized/20260525_163747 1.jpg";
import stackPhoto4 from "../../assets/stack images /optimized/20260803_120329 1.jpg";

// ── Personal photo stack ─────────────────────────────────────────────────────────
// Scattered-polaroid stack, click (or click the envelope collage) to spread all
// of them across the drawer with a small caption under each.

const PERSONAL_PHOTOS = [
  { src: stackPhoto1, caption: "pages from my sketchbook", rotate: -13.08 },
  { src: stackPhoto2, caption: "a doodle that turned into a memory", rotate: 3.45 },
  { src: stackPhoto3, caption: "caught mid-thought", rotate: 12.38 },
  { src: stackPhoto4, caption: "the corner where I keep my books", rotate: 13.63 },
];

const STACK_OFFSETS = [
  { x: -9.5, y: 43 },
  { x: 25.3, y: 33 },
  { x: 60, y: 21.5 },
  { x: 25.8, y: 64.5 },
];

const SPREAD_LAYOUT = [
  { left: "16%", top: "20%", rotate: -8 },
  { left: "60%", top: "14%", rotate: 6 },
  { left: "14%", top: "58%", rotate: 5 },
  { left: "58%", top: "56%", rotate: -6 },
];

const FRAME_SVG_PATH =
  "M43.5181 9.84109C43.9092 7.8828 42.6395 5.97837 40.6819 5.58737L40.6785 5.58668L41.2891 2.80422C41.3156 2.8107 41.3423 2.81689 41.3692 2.82282L41.4398 2.83764C43.3974 3.22862 45.3014 1.95812 45.6925 -0.000153129L48.4773 0.611583C48.0493 2.56213 49.2828 4.49019 51.2327 4.91808C53.1826 5.34596 55.1102 4.11157 55.5382 2.16103L58.186 2.74207C57.758 4.69261 58.9916 6.62068 60.9415 7.04857C62.8914 7.47645 64.8189 6.24206 65.247 4.29152L67.8948 4.87256C67.4668 6.8231 68.7003 8.75117 70.6502 9.17906C72.6001 9.60694 74.5277 8.37255 74.9557 6.42201L77.6035 7.00305C77.1755 8.95359 78.4091 10.8817 80.359 11.3095C82.3089 11.7374 84.2364 10.503 84.6645 8.5525L87.3789 9.14815C87.3681 9.19337 87.358 9.23898 87.3489 9.28495C86.9578 11.2432 88.2275 13.1477 90.185 13.5387C92.1425 13.9296 94.0466 12.6591 94.4377 10.7009L94.4385 10.6973L97.2195 11.3076C97.2087 11.3528 97.1987 11.3984 97.1895 11.4444C96.7984 13.4027 98.0681 15.3071 100.026 15.6981C101.983 16.0891 103.887 14.8186 104.278 12.8603L104.279 12.8567L107.06 13.467C107.053 13.4961 107.046 13.5254 107.04 13.5548L107.03 13.6038C106.639 15.5621 107.909 17.4665 109.866 17.8575C111.824 18.2485 113.728 16.978 114.119 15.0197L114.12 15.0162L116.834 15.6118C116.406 17.5624 117.64 19.4904 119.59 19.9183C121.54 20.3462 123.467 19.1118 123.895 17.1613L126.543 17.7423C126.115 19.6929 127.348 21.6209 129.298 22.0488C131.248 22.4767 133.176 21.2423 133.604 19.2918L136.252 19.8728C135.824 21.8233 137.057 23.7514 139.007 24.1793C140.957 24.6072 142.885 23.3728 143.313 21.4223L145.96 22.0033C145.532 23.9538 146.766 25.8819 148.716 26.3098C150.666 26.7377 152.593 25.5033 153.021 23.5527L155.669 24.1338C155.241 26.0843 156.475 28.0124 158.425 28.4403C160.375 28.8682 162.302 27.6338 162.73 25.6832L165.444 26.2789C165.434 26.3241 165.424 26.3697 165.414 26.4157C165.023 28.374 166.293 30.2784 168.251 30.6694C170.208 31.0604 172.112 29.7899 172.503 27.8316L172.504 27.828L175.285 28.4383C175.274 28.4835 175.264 28.5291 175.255 28.5751C174.864 30.5334 176.134 32.4378 178.091 32.8288C180.049 33.2198 181.953 31.9493 182.344 29.991L182.345 29.9875L185.128 30.5983C185.118 30.6435 185.107 30.6891 185.098 30.7351C184.716 32.6488 185.92 34.5111 187.802 34.9598L187.191 37.7445C185.264 37.4079 183.411 38.6696 183.026 40.5987C182.649 42.4828 183.81 44.317 185.642 44.8015L185.031 47.5889C183.104 47.2522 181.251 48.5139 180.865 50.443C180.489 52.3272 181.65 54.1614 183.482 54.6459L182.886 57.3639C180.936 56.936 179.008 58.1704 178.58 60.121C178.152 62.0715 179.386 63.9996 181.336 64.4275L180.754 67.0763C178.804 66.6484 176.877 67.8828 176.449 69.8334C176.021 71.7839 177.254 73.712 179.204 74.1398L178.623 76.7887C176.673 76.3608 174.746 77.5952 174.318 79.5457C173.889 81.4963 175.123 83.4243 177.073 83.8522L176.492 86.5011C174.542 86.0732 172.614 87.3076 172.186 89.2581C171.758 91.2086 172.992 93.1367 174.942 93.5646L174.36 96.2134C172.411 95.7855 170.483 97.0199 170.055 98.9705C169.627 100.921 170.86 102.849 172.81 103.277L172.214 105.995C170.287 105.658 168.434 106.92 168.049 108.849C167.672 110.733 168.833 112.568 170.665 113.052L170.054 115.839C168.127 115.503 166.274 116.765 165.888 118.694C165.512 120.578 166.673 122.412 168.505 122.897L167.893 125.684C165.967 125.347 164.114 126.609 163.728 128.538C163.352 130.422 164.513 132.256 166.345 132.741L165.748 135.459C163.798 135.031 161.871 136.265 161.443 138.216C161.015 140.166 162.248 142.095 164.198 142.522L163.617 145.171C161.667 144.743 159.74 145.978 159.312 147.928C158.884 149.879 160.117 151.807 162.067 152.235L161.486 154.884C159.536 154.456 157.608 155.69 157.18 157.641C156.752 159.591 157.986 161.519 159.936 161.947L159.355 164.596C157.405 164.168 155.477 165.403 155.049 167.353C154.621 169.304 155.855 171.232 157.804 171.66L157.223 174.308C155.273 173.881 153.346 175.115 152.918 177.065C152.49 179.016 153.723 180.944 155.673 181.372L155.092 184.021C153.142 183.593 151.215 184.827 150.786 186.778C150.358 188.728 151.592 190.656 153.542 191.084L152.961 193.733C151.011 193.305 149.083 194.54 148.655 196.49C148.227 198.441 149.461 200.369 151.411 200.797L150.829 203.446C148.879 203.018 146.952 204.252 146.524 206.203C146.096 208.153 147.329 210.081 149.279 210.509L148.698 213.158C146.748 212.73 144.821 213.964 144.393 215.915C143.965 217.866 145.198 219.794 147.148 220.221L146.514 223.111L146.44 223.095C144.483 222.704 142.579 223.975 142.188 225.933L139.406 225.323C139.417 225.279 139.427 225.234 139.436 225.189C139.827 223.231 138.557 221.327 136.6 220.936C134.642 220.545 132.738 221.815 132.347 223.773L129.566 223.164C129.576 223.12 129.586 223.075 129.595 223.03C129.986 221.072 128.717 219.167 126.759 218.776C124.801 218.385 122.897 219.656 122.506 221.614L119.785 221.017C119.806 220.945 119.824 220.872 119.84 220.798C120.268 218.848 119.035 216.92 117.085 216.492C115.135 216.064 113.207 217.298 112.779 219.249C112.768 219.301 112.758 219.353 112.749 219.405L112.737 219.471L110.076 218.887C110.097 218.815 110.115 218.742 110.131 218.668C110.559 216.717 109.326 214.789 107.376 214.361C105.426 213.933 103.499 215.168 103.07 217.118C103.054 217.192 103.04 217.266 103.029 217.34L100.368 216.757C100.388 216.685 100.406 216.611 100.423 216.537C100.851 214.587 99.6171 212.659 97.6672 212.231C95.7173 211.803 93.7898 213.037 93.3617 214.988C93.3455 215.062 93.3315 215.136 93.32 215.21L90.6588 214.626C90.6793 214.554 90.6976 214.481 90.7139 214.407C91.1419 212.456 89.9084 210.528 87.9585 210.1C86.0086 209.672 84.081 210.907 83.653 212.857C83.6441 212.898 83.6358 212.939 83.6282 212.979C83.622 213.013 83.6165 213.046 83.6112 213.08L80.95 212.496C80.9706 212.424 80.9889 212.35 81.0052 212.276C81.4332 210.326 80.1996 208.398 78.2497 207.97C76.2998 207.542 74.3723 208.776 73.9442 210.727C73.928 210.801 73.914 210.875 73.9025 210.949L71.1814 210.352C71.192 210.308 71.2018 210.263 71.2108 210.218C71.6021 208.26 70.3322 206.355 68.3746 205.964C66.4171 205.573 64.513 206.844 64.1219 208.802L61.3408 208.192C61.3514 208.148 61.3612 208.104 61.3701 208.059C61.7615 206.1 60.4915 204.196 58.534 203.805C56.5765 203.414 54.6724 204.684 54.2813 206.643L51.5001 206.033C51.5107 205.989 51.5205 205.944 51.5295 205.899C51.9208 203.941 50.6509 202.036 48.6934 201.645C46.7358 201.254 44.8318 202.525 44.4407 204.483L41.7194 203.887C41.74 203.815 41.7583 203.742 41.7745 203.667C42.2026 201.717 40.969 199.789 39.0191 199.361C37.0692 198.933 35.1417 200.168 34.7136 202.118C34.6974 202.192 34.6834 202.266 34.6719 202.34L32.0107 201.756C32.0312 201.684 32.0495 201.611 32.0658 201.537C32.4938 199.586 31.2602 197.658 29.3103 197.231C27.3604 196.803 25.4329 198.037 25.0049 199.988C24.9886 200.062 24.9746 200.136 24.9631 200.21L22.3019 199.626C22.3225 199.554 22.3408 199.481 22.357 199.407C22.7851 197.456 21.5515 195.528 19.6016 195.1C17.6517 194.672 15.7242 195.907 15.2961 197.857C15.2799 197.931 15.2659 198.005 15.2544 198.079L12.5932 197.495C12.6137 197.423 12.632 197.35 12.6483 197.276C13.0763 195.325 11.8427 193.397 9.89284 192.97C7.94295 192.542 6.0154 193.776 5.58737 195.727C5.57111 195.801 5.55711 195.875 5.54562 195.949L2.82451 195.352C2.83512 195.307 2.84492 195.263 2.85389 195.218C3.24521 193.26 1.97529 191.355 0.0177511 190.964L-1.18857e-06 190.961L0.635127 188.066C2.58502 188.494 4.51257 187.26 4.94059 185.309C5.36862 183.359 4.13505 181.431 2.18515 181.003L2.76641 178.354C4.71631 178.782 6.64385 177.547 7.07188 175.597C7.49991 173.646 6.26633 171.718 4.31644 171.29L4.8977 168.642C6.84759 169.069 8.77514 167.835 9.20317 165.884C9.63119 163.934 8.39762 162.006 6.44772 161.578L7.02898 158.929C8.97888 159.357 10.9064 158.123 11.3345 156.172C11.7625 154.222 10.5289 152.293 8.57901 151.866L9.16027 149.217C11.1102 149.645 13.0377 148.41 13.4657 146.46C13.8938 144.509 12.6602 142.581 10.7103 142.153L11.2916 139.504C13.2414 139.932 15.169 138.698 15.597 136.747C16.025 134.797 14.7915 132.869 12.8416 132.441L13.4228 129.792C15.3727 130.22 17.3003 128.985 17.7283 127.035C18.1563 125.084 16.9228 123.156 14.9729 122.728L15.5541 120.08C17.504 120.508 19.4316 119.273 19.8596 117.323C20.2876 115.372 19.054 113.444 17.1041 113.016L17.6854 110.367C19.6353 110.795 21.5628 109.561 21.9909 107.61C22.4189 105.66 21.1853 103.732 19.2354 103.304L19.8313 100.588C19.8764 100.599 19.9221 100.609 19.9679 100.618C21.9255 101.009 23.8295 99.7387 24.2206 97.7804C24.6118 95.8222 23.3421 93.9177 21.3845 93.5267L21.381 93.526L21.9916 90.7439C22.0366 90.7547 22.0823 90.7647 22.1282 90.7739C24.0857 91.1649 25.9898 89.8944 26.3809 87.9361C26.772 85.9778 25.5023 84.0733 23.5448 83.6824L23.5413 83.6817L24.1518 80.8995C24.1969 80.9103 24.2426 80.9203 24.2884 80.9295C26.246 81.3205 28.15 80.05 28.5411 78.0917C28.9323 76.1334 27.6625 74.229 25.705 73.838L25.7015 73.8373L26.2974 71.1218C28.2473 71.5497 30.1749 70.3153 30.6029 68.3647C31.0309 66.4142 29.7974 64.4861 27.8475 64.0582L28.4287 61.4094C30.3786 61.8373 32.3062 60.6029 32.7342 58.6523C33.1622 56.7018 31.9286 54.7737 29.9788 54.3459L30.56 51.697C32.5099 52.1249 34.4375 50.8905 34.8655 48.94C35.2935 46.9894 34.0599 45.0614 32.11 44.6335L32.6913 41.9846C34.6412 42.4125 36.5687 41.1781 36.9968 39.2276C37.4248 37.2771 36.1912 35.349 34.2413 34.9211L34.8226 32.2723C36.7725 32.7002 38.7 31.4658 39.1281 29.5152C39.5561 27.5647 38.3225 25.6366 36.3726 25.2087L36.9685 22.4933C37.0135 22.5041 37.0592 22.5141 37.1051 22.5233C39.0626 22.9142 40.9667 21.6437 41.3578 19.6855C41.7489 17.7272 40.4792 15.8227 38.5217 15.4317L38.5182 15.431L39.1287 12.6489C39.1738 12.6597 39.2195 12.6697 39.2654 12.6789C41.2229 13.0699 43.127 11.7994 43.5181 9.84109Z";

function PhotoStack({ isMobile, onOpen }: { isMobile: boolean; onOpen: () => void }) {
  const m = isMobile;
  const size = m ? 220 : 300;
  return (
    <button
      onClick={onOpen}
      aria-label="Open photo stack"
      style={{ position: "relative", width: size, height: size * 1.2, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
    >
      <svg
        viewBox="0 0 188 226"
        style={{ position: "absolute", left: "50%", top: "50%", width: "78%", height: "78%", transform: "translate(-50%, -55%) rotate(-4deg)", opacity: 0.9 }}
      >
        <path d={FRAME_SVG_PATH} fill="#FBFBFB" />
      </svg>
      {PERSONAL_PHOTOS.map((photo, i) => (
        <div
          key={photo.src}
          style={{
            position: "absolute",
            left: `calc(50% + ${(STACK_OFFSETS[i].x / 360) * size}px)`,
            top: `calc(50% + ${(STACK_OFFSETS[i].y / 432) * size * 1.2 - size * 0.18}px)`,
            width: size * 0.42, height: size * 0.42 * 1.33,
            transform: `translate(-50%, -50%) rotate(${photo.rotate}deg)`,
            backgroundColor: "#fbfbfb", borderRadius: 2, padding: "5%",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
          }}
        >
          <img src={photo.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      ))}
    </button>
  );
}

function PhotoGallery({ isMobile, open, onClose }: { isMobile: boolean; open: boolean; onClose: () => void }) {
  const m = isMobile;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="photo-gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, zIndex: 15, backgroundColor: "rgba(33,32,18,0.78)", backdropFilter: "blur(3px)", overflow: "hidden" }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute", top: m ? 14 : 20, right: m ? 14 : 20, zIndex: 2,
              width: m ? 32 : 36, height: m ? 32 : 36, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={15} color="#fdfbf6" />
          </button>

          {PERSONAL_PHOTOS.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, scale: 0.5, left: "50%", top: "50%", rotate: 0 }}
              animate={{ opacity: 1, scale: 1, left: SPREAD_LAYOUT[i].left, top: SPREAD_LAYOUT[i].top, rotate: SPREAD_LAYOUT[i].rotate }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "absolute", width: m ? 130 : 170, transform: "translate(-50%, -50%)" }}
            >
              <div style={{ backgroundColor: "#fbfbfb", borderRadius: 3, padding: "6% 6% 14%", boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
                <img src={photo.src} alt="" style={{ width: "100%", height: m ? 150 : 200, objectFit: "cover", display: "block" }} />
              </div>
              <p className="font-jakarta" style={{ fontSize: m ? 10 : 11, color: "#fdfbf6", textAlign: "center", marginTop: 8, opacity: 0.85 }}>
                {photo.caption}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Work experience data ───────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    period: "May 2024 – Present",
    role: "Product Designer",
    company: "Canvs Club · ICICI Bank",
    location: "Remote",
    bullets: [
      "Owned end-to-end product design across ICICI Bank's digital ecosystem — UCJ, CSP, RIB, Global App and iMobile — designing 100+ flows across live, in-development, and net-new design environments.",
      "Independently drove the Services platform and led design for Credit Cards and Forex Cards, turning complex banking journeys into clean, accessible experiences.",
      "Partnered closely with developers and cross-functional teams to ship quality work at speed in a fully remote, fast-paced environment, while reworking and scaling the design system independently.",
      "Mentored junior designers and led peer design reviews, raising craft and consistency across the team.",
    ],
    skills: ["Product Design", "Design Systems", "Cross-Platform", "Accessibility"],
    recommendation: { name: "Debprotim Roy", title: "CEO" },
  },
  {
    period: "May 2022 – Nov 2022",
    role: "Lead UI-UX Designer",
    company: "Space No. 10",
    location: "Bangalore",
    bullets: [
      "Led UX/UI design for client projects: redesigned Prakriya Hospital's website for improved user experience and revenue, designed an award-winning prototype for the JeevaRaksha emergency response app, and built Space No. 10's website and brand assets from concept to prototype.",
      "Optimised booking systems, created marketing materials, and established brand identities for client projects.",
      "Collaborated with cross-functional teams including marketing, developers, product managers, and executives through brainstorming sessions and design critiques.",
    ],
    skills: ["UI Design", "User Research", "Prototyping"],
  },
  {
    period: "2021 – Now",
    role: "Freelance UI-UX Designer",
    company: "Self-employed",
    location: "Bangalore",
    bullets: [
      "Addressed user and client challenges through comprehensive research, competitor analysis, and user interviews.",
      "Conceptualised information architectures, crafted user flows, and translated them into visually compelling web and mobile interfaces — websites, dashboards, web apps, and mobile apps.",
      "Developed style guides and design systems to streamline collaboration between design and development.",
    ],
    skills: ["UI Design", "Interaction Design", "Problem Solving"],
  },
];

// ── Books / Movies recommendation data ─────────────────────────────────────────
// Real covers only — add more entries (with a cover image) and the carousel
// and counter pick them up automatically.

type BookItem = { title: string; author: string; cover: string };
type MovieItem = { title: string; year: string; poster: string };

const BOOKS: BookItem[] = [{ title: "If Tomorrow Comes", author: "Sidney Sheldon", cover: bookCover1 }];
const MOVIES: MovieItem[] = [
  { title: "Perfect Days", year: "2023", poster: movieCover1 },
  { title: "Little Forest", year: "2018", poster: movieCover2 },
];

// ── BooksAndMoviesCard ───────────────────────────────────────────────────────────
// Ported from the provided reference component: a single card with a Books/Movies
// tab switch, a 3-slot sliding cover carousel (prev/active/next), and one forward
// arrow that wraps around at the end.

type BookSlot = "left" | "center" | "right";

function bookSlotStyle(slot: BookSlot): React.CSSProperties {
  switch (slot) {
    case "center":
      return { transform: "translateX(-50%) translateY(-50%) rotate(0deg) scale(1)", opacity: 1, zIndex: 10, left: "50%", top: "calc(50% - 10px)" };
    case "left":
      return { transform: "translateX(-50%) translateY(-50%) rotate(-8deg) scale(0.78)", opacity: 0.35, zIndex: 5, left: "calc(50% - 70px)", top: "calc(50% + 12px)" };
    case "right":
      return { transform: "translateX(-50%) translateY(-50%) rotate(8deg) scale(0.78)", opacity: 0.35, zIndex: 5, left: "calc(50% + 70px)", top: "calc(50% + 12px)" };
  }
}

function BooksPanel({ activeIdx }: { activeIdx: number }) {
  const total = BOOKS.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: "#e8bfc7" }}>
      {[prevIdx, activeIdx, nextIdx].map((idx, i) => {
        const slot: BookSlot = i === 0 ? "left" : i === 1 ? "center" : "right";
        const book = BOOKS[idx];
        return (
          <div
            key={idx}
            style={{
              position: "absolute", width: 80, height: 120, borderRadius: 1.4, overflow: "hidden",
              transition: "transform 0.4s cubic-bezier(0.25,0.1,0.25,1), opacity 0.4s cubic-bezier(0.25,0.1,0.25,1)",
              boxShadow: "2.78px 2.78px 1.39px rgba(56,20,28,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
              ...bookSlotStyle(slot),
            }}
          >
            <img src={book.cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: "2.97px", height: "100%", width: 2, filter: "blur(1.4px)", backgroundColor: "rgba(35,30,30,0.3)" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-jakarta font-medium" style={{ fontSize: 10, lineHeight: 1, color: "#735933" }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(115,89,51,0.3)" }} />
        <span className="font-jakarta font-medium" style={{ fontSize: 10, lineHeight: 1, color: "rgba(115,89,51,0.5)" }}>{total}</span>
      </div>
    </div>
  );
}

function movieSlotStyle(slot: BookSlot): React.CSSProperties {
  switch (slot) {
    case "center":
      return { width: 90, height: 120, left: "50%", top: "calc(50% - 10px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 1, zIndex: 10 };
    case "right":
      return { width: 60, height: 80, left: "calc(50% + 82px)", top: "calc(50% + 6px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 0.35, zIndex: 5 };
    case "left":
      return { width: 60, height: 80, left: "calc(50% - 82px)", top: "calc(50% - 18px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 0.35, zIndex: 5 };
  }
}

// Each slot remounts on index change (its key includes the item's own index),
// so a plain CSS transition can't animate it — GSAP gives it a subtle fade+settle
// entrance instead.
function MovieImage({ src, alt, slot }: { src: string; alt: string; slot: BookSlot }) {
  const elRef = useRef<HTMLDivElement>(null);
  const { transform: _transform, opacity: targetOpacity, ...rest } = movieSlotStyle(slot);

  useEffect(() => {
    if (!elRef.current) return;
    // GSAP owns the transform (xPercent/yPercent recenter the anchor point,
    // matching the translate(-50%,-50%) the CSS version used) so its scale
    // tween doesn't clobber the centering.
    gsap.set(elRef.current, { xPercent: -50, yPercent: -50 });
    gsap.fromTo(elRef.current, { opacity: 0, scale: 0.94 }, { opacity: targetOpacity, scale: 1, duration: 0.35, ease: "power2.out" });
  }, [targetOpacity]);

  return (
    <div ref={elRef} style={{ position: "absolute", borderRadius: 2, overflow: "hidden", boxShadow: "2px 2px 2px rgba(0,0,0,0.25)", ...rest }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
    </div>
  );
}

function MoviesPanel({ activeIdx }: { activeIdx: number }) {
  const total = MOVIES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: "#e8d4bf" }}>
      <MovieImage key={`left-${prevIdx}`} src={MOVIES[prevIdx].poster} alt={MOVIES[prevIdx].title} slot="left" />
      <MovieImage key={`center-${activeIdx}`} src={MOVIES[activeIdx].poster} alt={MOVIES[activeIdx].title} slot="center" />
      <MovieImage key={`right-${nextIdx}`} src={MOVIES[nextIdx].poster} alt={MOVIES[nextIdx].title} slot="right" />
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-jakarta font-medium" style={{ fontSize: 10, lineHeight: 1, color: "#735933" }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(115,89,51,0.3)" }} />
        <span className="font-jakarta font-medium" style={{ fontSize: 10, lineHeight: 1, color: "rgba(115,89,51,0.5)" }}>{total}</span>
      </div>
    </div>
  );
}

function NextArrowButton({ onClick, fill }: { onClick: () => void; fill: string }) {
  const nextPath = "M9.2751 5.99991L18.0002 11.2981V12.6742L9.2751 17.9999V16.2522L15.5054 12.6605L5.0002 13.0871V11.0779L15.4919 11.4907L9.2751 7.85771V5.99991Z";
  return (
    <button onClick={onClick} aria-label="Next" style={{ position: "relative", flexShrink: 0, width: 24, height: 24, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.5" />
        <path d={nextPath} fill={fill} />
      </svg>
    </button>
  );
}

function BooksAndMoviesCard({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  const [tab, setTab] = useState<"books" | "movies">("books");
  const [bookIdx, setBookIdx] = useState(0);
  const [movieIdx, setMovieIdx] = useState(0);
  const isBooks = tab === "books";
  const textRef = useRef<HTMLDivElement>(null);

  const bg = isBooks ? "#ebc7ce" : "#e3d9ce";
  const arrowFill = isBooks ? "#D07C8D" : "#C67D39";
  const currentBook = BOOKS[bookIdx];
  const currentMovie = MOVIES[movieIdx];

  function nextItem() {
    if (isBooks) setBookIdx((i) => (i + 1) % BOOKS.length);
    else setMovieIdx((i) => (i + 1) % MOVIES.length);
  }

  const title = isBooks ? currentBook.title : currentMovie.title;
  const subtitle = isBooks ? currentBook.author.toUpperCase() : currentMovie.year;

  // Subtle GSAP crossfade whenever the displayed title/subtitle changes.
  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(textRef.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [title, subtitle]);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height: 188, backgroundColor: bg, transition: "background 0.4s ease" }}>
      {isBooks ? <BooksPanel activeIdx={bookIdx} /> : <MoviesPanel activeIdx={movieIdx} />}

      <div style={{ position: "absolute", left: 170, top: 16, right: m ? 12 : 16, height: 156, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setTab("books")}
            className="font-caslon"
            style={{ fontSize: 12, letterSpacing: "-0.02em", fontStyle: isBooks ? "italic" : "normal", textDecoration: isBooks ? "underline" : "none", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#212012" }}
          >
            Books
          </button>
          <button
            onClick={() => setTab("movies")}
            className="font-caslon"
            style={{ fontSize: 12, letterSpacing: "-0.02em", fontStyle: !isBooks ? "italic" : "normal", textDecoration: !isBooks ? "underline" : "none", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#212012" }}
          >
            Movies
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div ref={textRef} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
            <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: "#212012" }}>{title}</p>
            <p className="font-jakarta uppercase" style={{ fontSize: 12, lineHeight: "16px", color: "rgba(33,32,18,0.5)" }}>{subtitle}</p>
          </div>
          <NextArrowButton onClick={nextItem} fill={arrowFill} />
        </div>
      </div>
    </div>
  );
}

// ── MusicPlayerCard ──────────────────────────────────────────────────────────────
// Connected to the real Spotify account authorized in this browser — shows
// whatever is actually playing and controls that real playback (play/pause,
// seek). Spotify's control endpoints require Premium and an active device.

const RING_PATHS = {
  outer: "M150 75C150 116.421 116.421 150 75 150C33.5786 150 0 116.421 0 75C0 33.5786 33.5786 0 75 0C116.421 0 150 33.5786 150 75ZM19.6211 75C19.6211 105.585 44.4151 130.379 75 130.379C105.585 130.379 130.379 105.585 130.379 75C130.379 44.4151 105.585 19.6211 75 19.6211C44.4151 19.6211 19.6211 44.4151 19.6211 75Z",
  middle: "M118 59C118 91.5848 91.5848 118 59 118C26.4152 118 0 91.5848 0 59C0 26.4152 26.4152 0 59 0C91.5848 0 118 26.4152 118 59ZM19.1959 59C19.1959 80.9832 37.0168 98.8041 59 98.8041C80.9832 98.8041 98.8041 80.9832 98.8041 59C98.8041 37.0168 80.9832 19.1959 59 19.1959C37.0168 19.1959 19.1959 37.0168 19.1959 59Z",
  inner: "M88 44C88 68.3005 68.3005 88 44 88C19.6995 88 0 68.3005 0 44C0 19.6995 19.6995 0 44 0C68.3005 0 88 19.6995 88 44ZM2.10301 44C2.10301 67.1391 20.8609 85.897 44 85.897C67.1391 85.897 85.897 67.1391 85.897 44C85.897 20.8609 67.1391 2.10301 44 2.10301C20.8609 2.10301 2.10301 20.8609 2.10301 44Z",
};

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function MusicPlayerCard({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  const { status, track, errorMessage, connect, disconnect, togglePlay, seek } = useSpotifyPlayer();
  const artSrc = track?.albumArt || vinylDisc;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
    seek(ratio * track.durationMs);
  };

  const notPlayingState = (
    <div style={{ textAlign: "center", padding: m ? "8px 20px" : 0 }}>
      {status === "no-playback" ? (
        <>
          <p className="font-jakarta" style={{ fontSize: 13, color: "#625e37" }}>Nothing playing right now</p>
          <p className="font-jakarta" style={{ fontSize: 11, color: "rgba(33,32,18,0.5)", marginTop: 4 }}>Start a track on Spotify, then check back</p>
          <button onClick={disconnect} className="font-jakarta" style={{ fontSize: 10, color: "rgba(33,32,18,0.4)", background: "none", border: "none", cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>
            disconnect spotify
          </button>
        </>
      ) : status === "connecting" ? (
        <p className="font-jakarta" style={{ fontSize: 13, color: "#625e37" }}>Connecting…</p>
      ) : (
        <>
          <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", marginBottom: 12 }}>
            {status === "error" ? errorMessage : "See what I'm actually listening to"}
          </p>
          <button
            onClick={connect}
            className="font-jakarta font-medium"
            style={{ fontSize: 13, color: "#fff", backgroundColor: "#1db954", border: "none", borderRadius: 20, padding: "10px 20px", cursor: "pointer" }}
          >
            Connect Spotify
          </button>
        </>
      )}
    </div>
  );

  if (m) {
    // Mobile: slim horizontal bar, album art peeking from the left edge.
    return (
      <div style={{ position: "relative", width: "100%", height: 120, borderRadius: 16, overflow: "hidden", backgroundColor: "#e3d9ce", border: "1px solid #d1c0ae" }}>
        {status === "connected" && track ? (
          <>
            <div style={{ position: "absolute", width: 160, height: 160, left: -81, top: "calc(50% - 80px)" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <img src={artSrc} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", boxShadow: "0px 1.5px 1.5px rgba(0,0,0,0.2)" }} />
                <svg viewBox="0 0 150 150" style={{ position: "absolute", left: "35%", top: "35%", width: "30%", height: "30%" }}>
                  <path d={RING_PATHS.outer} fill="#9799A5" />
                </svg>
                <svg viewBox="0 0 118 118" style={{ position: "absolute", left: "36.2%", top: "36.2%", width: "27.6%", height: "27.6%" }}>
                  <path d={RING_PATHS.middle} fill="#CAC4C8" stroke="#ABA7AB" strokeWidth="2" />
                </svg>
                <svg viewBox="0 0 88 88" style={{ position: "absolute", left: "39.7%", top: "39.7%", width: "20.6%", height: "20.6%" }}>
                  <path d={RING_PATHS.inner} fill="white" />
                </svg>
                <img src={vinylRing} alt="" style={{ position: "absolute", left: "37.1%", top: "37.1%", width: "25.7%", height: "25.7%" }} />
              </motion.div>
            </div>

            <div style={{ position: "absolute", left: 103, right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-jakarta" style={{ fontSize: 10, lineHeight: "12px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#625e37", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </p>
                  <p className="font-caslon not-italic" style={{ fontSize: 14, lineHeight: "18px", letterSpacing: "-0.02em", fontWeight: 600, color: "#212012", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.name}
                  </p>
                </div>
                <button
                  onClick={togglePlay}
                  aria-label={track.isPlaying ? "Pause" : "Play"}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(98,94,55,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {track.isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="4" y="3" width="3" height="10" rx="1" fill="#625E37" />
                      <rect x="9" y="3" width="3" height="10" rx="1" fill="#625E37" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 3L13 8L5 13V3Z" fill="#625E37" />
                    </svg>
                  )}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div onClick={handleSeek} style={{ position: "relative", height: 6, display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: "#c3be6f", borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: "#c67d39", width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%` }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="font-jakarta" style={{ fontSize: 8, lineHeight: "10px", color: "#625e37" }}>
                    {formatTime(track.progressMs)} / {formatTime(track.durationMs)}
                  </p>
                  <Volume2 size={16} color="#625e37" />
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="font-jakarta" style={{ position: "absolute", bottom: 4, left: 103, fontSize: 9, color: "#c67d39" }}>{errorMessage}</p>
            )}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notPlayingState}
          </div>
        )}
      </div>
    );
  }

  // Desktop: vinyl peeking from the top, spins continuously.
  return (
    <div
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        backgroundColor: "#e3d9ce", border: "1px solid #d1c0ae",
        height: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div style={{ position: "absolute", top: -180, left: "50%", transform: "translateX(-50%)", width: 400, height: 400 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <img src={artSrc} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", boxShadow: "0px 4px 4px rgba(0,0,0,0.2)" }} />
          <svg viewBox="0 0 150 150" style={{ position: "absolute", left: "35%", top: "35%", width: "30%", height: "30%" }}>
            <path d={RING_PATHS.outer} fill="#9799A5" />
          </svg>
          <svg viewBox="0 0 118 118" style={{ position: "absolute", left: "36.2%", top: "36.2%", width: "27.6%", height: "27.6%" }}>
            <path d={RING_PATHS.middle} fill="#CAC4C8" stroke="#ABA7AB" strokeWidth="2" />
          </svg>
          <svg viewBox="0 0 88 88" style={{ position: "absolute", left: "39.7%", top: "39.7%", width: "20.6%", height: "20.6%" }}>
            <path d={RING_PATHS.inner} fill="white" />
          </svg>
          <img
            src={vinylRing}
            alt=""
            style={{ position: "absolute", left: "37.1%", top: "37.1%", width: "25.7%", height: "25.7%" }}
          />
        </motion.div>
      </div>

      <div style={{ padding: "0 28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {status === "connected" && track ? (
          <>
            <div style={{ textAlign: "center" }}>
              <p className="font-jakarta" style={{ fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: "#625e37" }}>
                {track.artist}
              </p>
              <p className="font-caslon not-italic" style={{ fontSize: 24, fontWeight: 600, color: "#212012", marginTop: 4 }}>
                {track.name}
              </p>
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={togglePlay}
                aria-label={track.isPlaying ? "Pause" : "Play"}
                style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#625e37" }}
              >
                {track.isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="2" width="3" height="12" rx="1" fill="currentColor" />
                    <rect x="10" y="2" width="3" height="12" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3L13 8L5 13V3Z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div onClick={handleSeek} style={{ position: "relative", flex: 1, height: 10, display: "flex", alignItems: "center", cursor: "pointer" }}>
                <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: "#c3be6f", borderRadius: 2 }} />
                <div
                  style={{
                    position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: "#c67d39",
                    width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%`,
                  }}
                />
              </div>
              <p className="font-jakarta font-medium" style={{ fontSize: 12, color: "#212012", whiteSpace: "nowrap", flexShrink: 0 }}>
                {formatTime(track.progressMs)} <span style={{ color: "rgba(33,32,18,0.5)" }}>/ {formatTime(track.durationMs)}</span>
              </p>
            </div>
            {errorMessage && (
              <p className="font-jakarta" style={{ fontSize: 11, color: "#c67d39", textAlign: "center", marginTop: -12 }}>{errorMessage}</p>
            )}
            <button onClick={disconnect} className="font-jakarta" style={{ fontSize: 10, color: "rgba(33,32,18,0.4)", background: "none", border: "none", cursor: "pointer", marginTop: -12, textDecoration: "underline" }}>
              disconnect spotify
            </button>
          </>
        ) : (
          notPlayingState
        )}
      </div>
    </div>
  );
}

// ── ExperienceRow ───────────────────────────────────────────────────────────────

function ExperienceRow({ exp, index, isMobile }: { exp: typeof EXPERIENCE[0]; index: number; isMobile: boolean }) {
  const m = isMobile;

  const bulletsBlock = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {exp.bullets.map((b, i) => (
        <p key={i} className="font-jakarta" style={{ fontSize: m ? 13 : 13.5, lineHeight: m ? "19px" : "18px", letterSpacing: "-0.02em", color: "#212012", opacity: 0.85 }}>
          {b}
        </p>
      ))}
      {exp.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {exp.skills.map((s) => (
            <span key={s} className="font-jakarta font-medium" style={{ fontSize: 10, color: "#625e37", backgroundColor: "rgba(98,94,55,0.1)", padding: "3px 10px", borderRadius: 20 }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: m ? "18px 0" : "24px 0" }}>
        {m ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <p className="font-jakarta font-semibold" style={{ fontSize: 16, color: "#625e37" }}>{exp.role}</p>
                <p className="font-jakarta" style={{ fontSize: 13, color: "#625e37", marginTop: 2 }}>{exp.company} · {exp.location}</p>
              </div>
              <p className="font-jakarta font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.3px", color: "#c67d39", flexShrink: 0, whiteSpace: "nowrap", textAlign: "right" }}>{exp.period}</p>
            </div>
            {bulletsBlock}
          </>
        ) : (
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ width: 270, flexShrink: 0 }}>
              <p className="font-jakarta font-semibold" style={{ fontSize: 16, color: "#625e37" }}>{exp.role}</p>
              <p className="font-jakarta" style={{ fontSize: 14, color: "#625e37", marginTop: 2 }}>{exp.company} · {exp.location}</p>
              <p className="font-jakarta font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.3px", color: "#c67d39", marginTop: 8 }}>{exp.period}</p>
            </div>
            <div style={{ flex: 1 }}>{bulletsBlock}</div>
          </div>
        )}

        {exp.recommendation && (
          <div style={{ paddingLeft: m ? 0 : 294 }}>
            <p className="font-jakarta font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.4px", color: "#c67d39" }}>
              Recommendation
            </p>
            <p className="font-caslon not-italic" style={{ fontSize: 15, color: "#212012", marginTop: 4 }}>
              {exp.recommendation.name}, {exp.recommendation.title}
            </p>
          </div>
        )}
      </div>
      {index < EXPERIENCE.length - 1 && <div style={{ height: 1, backgroundColor: "#d1c0ae" }} />}
    </motion.div>
  );
}

// ── AiProjectsRow ────────────────────────────────────────────────────────────────

function AiProjectsRow({ isMobile, onViewAll }: { isMobile: boolean; onViewAll?: () => void }) {
  const m = isMobile;
  const preview = AI_PROJECTS.slice(0, 3);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: m ? 12 : 16 }}>
        <p className="font-jakarta font-medium uppercase" style={{ fontSize: 16, letterSpacing: "0.02em", color: "#625e37" }}>
          AI projects I've been tinkering with...
        </p>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="font-jakarta font-medium"
            style={{ fontSize: 12, color: "#c67d39", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            View all
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: m ? 12 : 20, flexDirection: m ? "column" : "row" }}>
        {preview.map((p) => (
          <motion.button
            key={p.id}
            onClick={onViewAll}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            style={{
              flex: 1, textAlign: "left", cursor: onViewAll ? "pointer" : "default", border: "none",
              borderRadius: 12, padding: 16, backgroundColor: "#e6cccc",
              height: m ? "auto" : 200, minHeight: m ? 140 : 200, display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.statusColor, flexShrink: 0 }} />
                <span className="font-jakarta font-medium uppercase" style={{ fontSize: 9, letterSpacing: "0.4px", color: "#625e37" }}>{p.status}</span>
              </div>
              <p className="font-caslon not-italic" style={{ fontSize: 15, fontWeight: 600, color: "#212012" }}>{p.title}</p>
              <p className="font-jakarta" style={{ fontSize: 12, lineHeight: "17px", color: "#212012", opacity: 0.75, marginTop: 6 }}>{p.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── AboutMeDrawer ──────────────────────────────────────────────────────────────

interface AboutMeDrawerProps {
  open: boolean;
  onClose: () => void;
  onViewAiProjects?: () => void;
}

export function AboutMeDrawer({ open, onClose, onViewAiProjects }: AboutMeDrawerProps) {
  const isMobile = useIsMobile(768);
  const m = isMobile;
  const drawerWidth = m ? "100%" : "min(900px, 90vw)";
  const drawerBorderRadius = m ? 0 : "24px 0 0 24px";
  const contentPad = m ? 18 : 36;

  // Loops the photo between the two poses, like a boomerang GIF.
  const [photoFrame, setPhotoFrame] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setPhotoFrame((f) => 1 - f), 1400);
    return () => clearInterval(id);
  }, [open]);

  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="about-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 499, backgroundColor: "rgba(33,32,18,0.35)", backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="about-drawer"
            initial={{ x: m ? "100%" : 700 }}
            animate={{ x: 0 }}
            exit={{ x: m ? "100%" : 700 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: drawerWidth, zIndex: 500,
              borderRadius: drawerBorderRadius,
              backgroundColor: "#c3be6f",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button — always floats over whatever content is scrolled beneath it */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: m ? 14 : 20, right: m ? 14 : 20, zIndex: 20,
                width: m ? 32 : 36, height: m ? 32 : 36, borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.45)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.45)"; }}
            >
              <X size={15} color="#212012" />
            </button>

            {/* Photo gallery — spreads the personal photo stack across the drawer */}
            <PhotoGallery isMobile={m} open={galleryOpen} onClose={() => setGalleryOpen(false)} />

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

              {/* ── Section A: olive hero ── */}
              <div style={{ position: "relative", backgroundColor: "#c3be6f" }}>
                <div
                  style={{
                    position: "absolute", top: 40, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${gridBg})`, backgroundSize: "cover", backgroundPosition: "top center", backgroundRepeat: "no-repeat",
                    opacity: 0.5, mixBlendMode: "multiply", pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1, padding: `${m ? 20 : 36}px ${contentPad}px 0` }}>
                <p className="font-caslon not-italic" style={{ fontSize: m ? 26 : 36, lineHeight: m ? "32px" : "47px", letterSpacing: "-0.02em", color: "#212012", fontWeight: 600, marginBottom: m ? 20 : 28 }}>
                  About me
                </p>

                {/* Photo collage: envelope stack backdrop + looping photo on top — click either to open the photo stack */}
                <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: m ? 16 : 24 }}>
                  <button
                    onClick={() => setGalleryOpen(true)}
                    aria-label="Open photo stack"
                    style={{ position: "relative", width: m ? "78%" : "68%", maxWidth: 480, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <img src={envelopeStack} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
                    <div
                      style={{
                        position: "absolute", left: "50%", top: m ? "-6%" : "-8%",
                        width: m ? "46%" : "38%", maxWidth: 260,
                        transform: "translateX(-62%) rotate(16.26deg)",
                      }}
                    >
                      <div style={{ position: "relative", width: "100%", paddingBottom: "153.7%" }}>
                        <img
                          src={photoFrame === 0 ? myPhoto1 : myPhoto2}
                          alt="Laxmi Mahajan"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  </button>

                  <div style={{ position: "absolute", right: m ? "2%" : "6%", bottom: m ? "-6%" : "-10%", transform: "scale(0.5)", transformOrigin: "bottom right" }}>
                    <PhotoStack isMobile={m} onOpen={() => setGalleryOpen(true)} />
                  </div>
                </div>

                <p className="font-jakarta" style={{ fontSize: m ? 14 : 18, lineHeight: m ? "21px" : "26px", textAlign: "center", letterSpacing: "-0.02em", color: "#212012", maxWidth: 560, margin: "0 auto", marginBottom: m ? 24 : 32 }}>
                  A small window into the things I return to outside of work — the books I read, the films I rewatch, and the songs on repeat.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: m ? 24 : 32 }}>
                  <motion.span
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#212012", display: "inline-block", flexShrink: 0 }}
                  />
                  <p className="font-jakarta font-medium" style={{ fontSize: 11, color: "#625e37", letterSpacing: "0.4px", textTransform: "uppercase" }}>open to work</p>
                </div>

                {/* Books/Movies + Music player row */}
                <div style={{ display: "flex", gap: m ? 16 : 24, flexDirection: m ? "column" : "row", alignItems: "flex-start", marginBottom: m ? 24 : 36 }}>
                  <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <BooksAndMoviesCard isMobile={m} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <MusicPlayerCard isMobile={m} />
                  </div>
                </div>
                </div>
              </div>

              {/* ── Section B: tan work-experience shelf ── */}
              <div style={{ backgroundColor: "#e3d9ce", borderRadius: m ? "16px 16px 0 0" : "24px 24px 0 0", padding: `${m ? 24 : 36}px ${contentPad}px` }}>
                <p className="font-caslon not-italic" style={{ fontSize: m ? 24 : 32, letterSpacing: "-0.02em", color: "#212012", fontWeight: 600, marginBottom: m ? 8 : 12 }}>
                  Work experience
                </p>
                <div style={{ display: "flex", gap: m ? 12 : 20 }}>
                  {/* Year scale — spans the full height of the entry list */}
                  <div style={{ width: m ? 34 : 44, flexShrink: 0, position: "relative" }}>
                    <div style={{ position: "absolute", left: "50%", top: 4, bottom: 4, width: 1, backgroundColor: "#d1c0ae", transform: "translateX(-50%)" }} />
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      {EXPERIENCE.map((exp) => (
                        <div key={exp.company} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#c67d39", position: "relative", zIndex: 1, flexShrink: 0 }} />
                          <p className="font-jakarta font-medium" style={{ fontSize: m ? 9 : 10, color: "#625e37", writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.3px" }}>
                            {exp.period.match(/\d{4}/)?.[0] ?? exp.period}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {EXPERIENCE.map((exp, i) => (
                      <ExperienceRow key={exp.company} exp={exp} index={i} isMobile={m} />
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: "#d1c0ae", margin: `${m ? 16 : 20}px 0` }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: m ? "space-between" : "flex-start", gap: m ? 12 : 28 }}>
                  {[
                    { label: "LinkedIn", href: "https://in.linkedin.com/in/laxmi-mahajan", Icon: Linkedin },
                    { label: "Email", href: "mailto:laxmimahajanwork@gmail.com", Icon: Mail },
                    { label: "Resume", href: "https://drive.google.com/file/d/1cm1x-y31ugOERxl7MaLuoOYGnNq0r1p0/view?usp=sharing", Icon: FileText },
                  ].map(({ label, href, Icon }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.15 }}
                      style={{ display: "flex", alignItems: "center", gap: 8, color: "#c67d39", textDecoration: "none" }}
                    >
                      <Icon size={18} strokeWidth={1.75} />
                      {!m && <span className="font-jakarta font-medium" style={{ fontSize: 14 }}>{label}</span>}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* ── Section C: olive AI-projects strip ── */}
              <div style={{ padding: `${m ? 24 : 36}px ${contentPad}px ${m ? 88 : 60}px` }}>
                <AiProjectsRow isMobile={m} onViewAll={onViewAiProjects} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
