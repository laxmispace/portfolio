import svgPaths from "./svg-hu3zk373zt";
import imgEllipse11 from "./33d225db3aa89638b45ca9fc11123138026e9e37.png";
import imgEllipse14 from "./962e0841c4a0af1d086d5ec4c5a2cf31d141be94.png";

function Group() {
  return (
    <div className="absolute contents left-[-19px] top-[-217px]">
      <div className="absolute left-[-18px] size-[428px] top-[-216px]">
        <div className="absolute inset-[0_-0.93%_-1.87%_-0.93%]">
          <img alt="" className="block max-w-none size-full" height="436" src={imgEllipse11} width="436" />
        </div>
      </div>
      <div className="absolute left-[121px] size-[150px] top-[-77px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="150" preserveAspectRatio="none" viewBox="0 0 150 150" width="150">
          <path d={svgPaths.p326431c0} fill="#9799A5" id="Ellipse 13" />
        </svg>
      </div>
      <div className="absolute left-[137px] size-[118px] top-[-61px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="118" preserveAspectRatio="none" viewBox="0 0 118 118" width="118">
          <g id="Ellipse 12">
            <mask fill="white" id="path-1-inside-1_0_4">
              <path d={svgPaths.pea82100} />
            </mask>
            <path d={svgPaths.pea82100} fill="#CAC4C8" mask="url(#path-1-inside-1_0_4)" stroke="#ABA7AB" strokeWidth="2" />
          </g>
        </svg>
      </div>
      <div className="absolute left-[152px] size-[88px] top-[-46px]" data-name="white">
        <svg className="absolute block inset-0 size-full" fill="none" height="88" preserveAspectRatio="none" viewBox="0 0 88 88" width="88">
          <path d={svgPaths.p3f376000} fill="white" id="white" />
        </svg>
      </div>
      <div className="absolute left-[141px] size-[110px] top-[-57px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="110" src={imgEllipse14} width="110" />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-center leading-[normal] relative shrink-0 text-center w-full whitespace-nowrap">
      <p className="font-['Inclusive_Sans:Regular',sans-serif] font-normal overflow-hidden relative shrink-0 text-[#625e37] text-[14px] text-ellipsis tracking-[-0.28px] uppercase w-full">Name of the artist</p>
      <p className="font-['Libre_Caslon_Condensed:SemiBold',sans-serif] not-italic overflow-hidden relative shrink-0 text-[#212012] text-[24px] text-ellipsis tracking-[-0.48px] w-full">Name of the song</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
      <div className="bg-[#c3be6f] h-[2px] relative shrink-0 w-[344px]" />
      <div className="absolute bg-[#c67d39] h-[2px] left-0 top-0 w-[8px]" />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-end justify-center relative shrink-0 w-full">
      <Frame1 />
      <p className="[word-break:break-word] font-['Inclusive_Sans:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-[#212012] text-[12px] text-center tracking-[-0.24px] whitespace-nowrap">
        <span className="leading-[normal]">{`00:30 `}</span>
        <span className="leading-[normal] text-[rgba(33,32,18,0.5)]">/ 04:00</span>
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-center left-[23px] top-[259px] w-[344px]">
      <Frame />
      <Frame2 />
    </div>
  );
}

export default function MusicPlayer() {
  return (
    <div className="bg-[#e3d9ce] border border-[#d1c0ae] border-solid overflow-clip relative rounded-[16px] size-full" data-name="Music player">
      <Group />
      <Frame3 />
    </div>
  );
}