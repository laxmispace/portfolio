import { useState, useEffect, useRef, useCallback } from "react";
import svgPaths from "../../imports/svg-hu3zk373zt.ts";
import imgEllipse11 from "@/imports/MusicPlayer/33d225db3aa89638b45ca9fc11123138026e9e37.png";
import imgEllipse14 from "@/imports/MusicPlayer/962e0841c4a0af1d086d5ec4c5a2cf31d141be94.png";

const TOTAL_DURATION = 240;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const progress = currentTime / TOTAL_DURATION;

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setCurrentTime(Math.round((x / rect.width) * TOTAL_DURATION));
  }, []);

  return (
    <div
      className="bg-[#e3d9ce] border border-[#d1c0ae] border-solid overflow-clip relative rounded-[16px] size-full"
      data-name="Music player"
    >
      {/* Vinyl disc — subtle spin when playing */}
      <div
        className="absolute vinyl-spin"
        style={{
          left: "-18px",
          top: "-216px",
          width: "428px",
          height: "428px",
          transformOrigin: "214px 214px",
        }}
      >
        <div className="absolute inset-[0_-0.93%_-1.87%_-0.93%]">
          <img alt="Vinyl disc" className="block max-w-none size-full" height="436" src={imgEllipse11} width="436" />
        </div>
        <div className="absolute" style={{ left: "139px", top: "139px", width: "150px", height: "150px" }}>
          <svg className="absolute block inset-0 size-full" fill="none" height="150" preserveAspectRatio="none" viewBox="0 0 150 150" width="150">
            <path d={svgPaths.p326431c0} fill="#9799A5" />
          </svg>
        </div>
        <div className="absolute" style={{ left: "155px", top: "155px", width: "118px", height: "118px" }}>
          <svg className="absolute block inset-0 size-full" fill="none" height="118" preserveAspectRatio="none" viewBox="0 0 118 118" width="118">
            <g>
              <mask fill="white" id="path-1-inside-1_0_4">
                <path d={svgPaths.pea82100} />
              </mask>
              <path d={svgPaths.pea82100} fill="#CAC4C8" mask="url(#path-1-inside-1_0_4)" stroke="#ABA7AB" strokeWidth="2" />
            </g>
          </svg>
        </div>
        <div className="absolute" style={{ left: "170px", top: "170px", width: "88px", height: "88px" }}>
          <svg className="absolute block inset-0 size-full" fill="none" height="88" preserveAspectRatio="none" viewBox="0 0 88 88" width="88">
            <path d={svgPaths.p3f376000} fill="white" />
          </svg>
        </div>
        <div className="absolute" style={{ left: "159px", top: "159px", width: "110px", height: "110px" }}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" height="110" src={imgEllipse14} width="110" />
        </div>
      </div>

      {/* Track info + controls */}
      <div className="absolute flex flex-col gap-[40px] items-center left-[23px] top-[259px] w-[344px]">

        {/* Artist + Song name */}
        <div className="flex flex-col gap-[4px] items-center text-center w-full">
          <p className="font-['Inclusive_Sans:Regular',sans-serif] font-normal text-[#625e37] text-[14px] uppercase w-full tracking-[0.5px]">
            Name of the artist
          </p>
          <p className="font-['Libre_Caslon_Condensed:SemiBold',sans-serif] not-italic text-[#212012] text-[24px] w-full tracking-[0px]">
            Name of the song
          </p>
        </div>

        {/* Controls row: play/pause + seek + time */}
        <div className="flex flex-col gap-[8px] w-full">
          {/* Play/pause inline with seek bar */}
          <div className="flex items-center gap-[10px] w-full">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="shrink-0 flex items-center justify-center w-[20px] h-[20px] text-[#625e37] hover:text-[#c67d39] transition-colors duration-150"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
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

            {/* Seek bar */}
            <div
              className="relative flex-1 h-[10px] flex items-center cursor-pointer"
              onClick={seek}
            >
              <div className="absolute w-full h-[2px] bg-[#c3be6f]" />
              <div
                className="absolute h-[2px] left-0 bg-[#c67d39] transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.max(2, progress * 100)}%` }}
              />
            </div>

            {/* Time */}
            <p className="font-['Inclusive_Sans:Medium',sans-serif] font-medium text-[#212012] text-[12px] tracking-[0px] whitespace-nowrap shrink-0">
              <span>{formatTime(currentTime)} </span>
              <span className="text-[rgba(33,32,18,0.5)]">/ {formatTime(TOTAL_DURATION)}</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
