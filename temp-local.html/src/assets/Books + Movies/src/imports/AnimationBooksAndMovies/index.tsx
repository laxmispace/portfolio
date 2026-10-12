import svgPaths from "./svg-werv6hsw3w";
import imgImage2924 from "./d20973e9440265524cd358a99114facbcf828225.png";

function Frame1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[127.311px] items-center justify-center left-[calc(50%-3.27px)] top-[calc(50%-0.24px)] w-[91.454px]">
      <div className="flex-none rotate-[-5.66deg]">
        <div className="h-[120px] relative w-[80px]" />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="-translate-x-1/2 absolute bottom-[8px] content-stretch flex gap-[4px] items-center left-[calc(50%-0.5px)]">
      <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#735933] text-[10px] tracking-[0.1px] whitespace-nowrap">5</p>
      <div className="relative shrink-0 size-[3px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="3" preserveAspectRatio="none" viewBox="0 0 3 3" width="3">
          <circle cx="1.5" cy="1.5" fill="#735933" fillOpacity="0.3" id="Ellipse 1" r="1.5" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[10px] text-[rgba(115,89,51,0.5)] tracking-[0.1px] whitespace-nowrap">5</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#e8d4bf] h-[188px] left-0 overflow-clip top-1/2 w-[154px]">
      <Frame1 />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[120px] left-1/2 rounded-[2px] shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)] top-[calc(50%-10px)] w-[90px]" data-name="image 2924">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={imgImage2924} />
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[80px] left-[calc(50%-87px)] opacity-30 rounded-[2px] shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)] top-[calc(50%-30px)] w-[60px]" data-name="image 2926">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={imgImage2924} />
      </div>
      <Frame4 />
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[16px] items-center leading-[normal] not-italic relative shrink-0 text-[#212012] text-[12px] text-center tracking-[-0.24px] whitespace-nowrap">
      <p className="font-['Libre_Caslon_Condensed:Medium',sans-serif] relative shrink-0">Books</p>
      <p className="[text-underline-position:from-font] decoration-from-font decoration-solid font-['Libre_Caslon_Condensed:Medium_Italic',sans-serif] relative shrink-0 underline">Movies</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[178px]">
      <p className="font-['Libre_Caslon_Condensed:SemiBold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#212012] text-[16px] w-full">Perfect days</p>
      <p className="font-['Inclusive_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[12px] text-[rgba(33,32,18,0.5)] uppercase w-full">2023</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="Frame 1597884713">
          <rect fill="white" fillOpacity="0.5" height="24" rx="12" width="24" />
          <path d={svgPaths.p73b4580} fill="#C67D39" id="â" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0">
      <Frame7 />
      <Frame6 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex flex-col h-[156px] items-end justify-between left-[170px] top-[16px] w-[206px]">
      <Frame />
      <Frame5 />
    </div>
  );
}

export default function AnimationBooksAndMovies() {
  return (
    <div className="bg-[#e3d9ce] overflow-clip relative rounded-[16px] size-full" data-name="animation - Books and movies">
      <Frame2 />
      <Frame3 />
    </div>
  );
}