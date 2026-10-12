import img2 from "./7a03b2db88da606048d49d06f95072b544ff0764.png";

function Frame1() {
  return (
    <div className="gap-x-[4px] gap-y-[4px] grid-cols-[repeat(2,fit-content(100%))] grid-rows-[repeat(1,fit-content(100%))] inline-grid relative shrink-0">
      <p className="col-1 font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-self-start relative row-1 self-start shrink-0">📍</p>
      <p className="col-2 font-['Plus_Jakarta_Sans:Medium','Noto_Sans_Kannada:Medium',sans-serif] font-medium justify-self-start relative row-1 self-start shrink-0">ಬೆಂಗಳೂರು, IN</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="gap-x-[4px] gap-y-[4px] grid-cols-[repeat(2,fit-content(100%))] grid-rows-[repeat(1,fit-content(100%))] inline-grid relative shrink-0">
      <p className="col-1 font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-self-start relative row-1 self-start shrink-0">📍</p>
      <p className="col-2 font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium justify-self-start relative row-1 self-start shrink-0">Bangalore, IN</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="gap-x-[4px] gap-y-[4px] grid-cols-[repeat(2,fit-content(100%))] grid-rows-[repeat(1,fit-content(100%))] inline-grid relative shrink-0">
      <p className="col-1 font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-self-start relative row-1 self-start shrink-0">📍</p>
      <p className="col-2 font-['Plus_Jakarta_Sans:Medium','Noto_Sans_Devanagari:Medium',sans-serif] font-medium justify-self-start relative row-1 self-start shrink-0">बैंगलोर, IN</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="gap-x-[4px] gap-y-[4px] grid-cols-[repeat(2,fit-content(100%))] grid-rows-[repeat(1,fit-content(100%))] inline-grid relative shrink-0">
      <p className="col-1 font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-self-start relative row-1 self-start shrink-0">📍</p>
      <p className="col-2 font-['Plus_Jakarta_Sans:Medium','Noto_Sans_Malayalam:Medium',sans-serif] font-medium justify-self-start relative row-1 self-start shrink-0">ബംഗളൂരു, IN</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute content-stretch flex flex-col gap-[16px] items-center leading-[normal] left-[calc(50%-0.5px)] text-[16px] text-black top-1/2 whitespace-nowrap">
      <Frame1 />
      <Frame />
      <Frame2 />
      <Frame3 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="2">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img2} />
      <Frame4 />
    </div>
  );
}