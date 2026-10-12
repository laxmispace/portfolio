import svgPaths from "./svg-ccg4bru9n2";

function HomeActive() {
  return (
    <div className="absolute bg-[#ece6df] h-[116px] left-[59px] top-[77px] w-[187px]" data-name="home active">
      <p className="[word-break:break-word] absolute font-['Libre_Caslon_Condensed:Medium',sans-serif] leading-[normal] left-[24px] not-italic text-[#625e37] text-[14px] top-[10px] tracking-[-0.28px] whitespace-nowrap">home</p>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#c67d39] text-[14px] top-[36px] tracking-[0.56px] uppercase whitespace-nowrap">projects</p>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#c67d39] text-[14px] top-[62px] tracking-[0.56px] uppercase whitespace-nowrap">ai playground</p>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#c67d39] text-[14px] top-[88px] tracking-[0.56px] uppercase whitespace-nowrap">tinkering hobbies</p>
      <div className="absolute flex h-[78px] items-center justify-center left-[16px] top-[19px] w-px">
        <div className="flex-none rotate-90">
          <div className="h-px relative w-[78px]" data-name="Line 5 (Stroke)">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 78 1">
              <path d="M78 0V1H0V0H78Z" fill="var(--fill-0, #D1C0AE)" id="Line 5 (Stroke)" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute left-[14px] size-[5px] top-[17px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <path d={svgPaths.p11c4ee00} fill="var(--fill-0, #625E37)" id="Polygon 1" />
        </svg>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[5px] h-full items-center relative shrink-0 w-[5px]">
      <div className="absolute flex items-center justify-center left-0 size-[5px] top-[5px]">
        <div className="-scale-y-100 flex-none">
          <div className="relative size-[5px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
              <path d={svgPaths.p11c4ee00} fill="var(--fill-0, #625E37)" id="Polygon 2" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute left-0 size-[5px] top-[8px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <path d={svgPaths.p11c4ee00} fill="var(--fill-0, #625E37)" id="Polygon 2" />
        </svg>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[5px] items-end left-[14px] top-[36px] w-[62px]">
      <div className="flex flex-row items-end self-stretch">
        <Frame1 />
      </div>
      <p className="[word-break:break-word] font-['Libre_Caslon_Condensed:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#625e37] text-[14px] tracking-[-0.28px] whitespace-nowrap">projects</p>
    </div>
  );
}

function ProjectsActive() {
  return (
    <div className="absolute bg-[#ece6df] h-[116px] left-[59px] top-[223px] w-[187px]" data-name="projects active">
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] right-[14px] text-[#c67d39] text-[14px] top-[62px] tracking-[0.56px] uppercase">ai playground</p>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] right-[14px] text-[#c67d39] text-[14px] top-[88px] tracking-[0.56px] uppercase">tinkering hobbies</p>
      <div className="absolute flex h-[78px] items-center justify-center left-[16px] top-[19px] w-px">
        <div className="flex-none rotate-90">
          <div className="h-px relative w-[78px]" data-name="Line 5 (Stroke)">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 78 1">
              <path d="M78 0V1H0V0H78Z" fill="var(--fill-0, #D1C0AE)" id="Line 5 (Stroke)" />
            </svg>
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#c67d39] text-[14px] top-[10px] tracking-[0.56px] uppercase w-[149px]">Home</p>
      <Frame />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[5px]">
      <div className="-translate-y-1/2 absolute left-0 size-[5px] top-[calc(50%-0.5px)]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" fill="var(--fill-0, #625E37)" id="Ellipse 1" r="2.5" />
        </svg>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex gap-[5px] items-end left-[14px] top-[62px] w-[62px]">
      <div className="flex flex-row items-end self-stretch">
        <Frame3 />
      </div>
      <p className="[word-break:break-word] font-['Libre_Caslon_Condensed:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#625e37] text-[14px] tracking-[-0.28px] whitespace-nowrap">ai playground</p>
    </div>
  );
}

function AiPlaygroundActive() {
  return (
    <div className="absolute bg-[#ece6df] h-[116px] left-[59px] top-[369px] w-[187px]" data-name="Ai playground active">
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] right-[14px] text-[#c67d39] text-[14px] top-[36px] tracking-[0.56px] uppercase">projects</p>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] right-[14px] text-[#c67d39] text-[14px] top-[88px] tracking-[0.56px] uppercase">tinkering hobbies</p>
      <div className="absolute flex h-[78px] items-center justify-center left-[16px] top-[19px] w-px">
        <div className="flex-none rotate-90">
          <div className="h-px relative w-[78px]" data-name="Line 5 (Stroke)">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 78 1">
              <path d="M78 0V1H0V0H78Z" fill="var(--fill-0, #D1C0AE)" id="Line 5 (Stroke)" />
            </svg>
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#c67d39] text-[14px] top-[10px] tracking-[0.56px] uppercase w-[149px]">Home</p>
      <Frame2 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[5px] h-full items-center relative shrink-0 w-[5px]">
      <div className="-translate-y-1/2 absolute left-0 size-[5px] top-[calc(50%+1.5px)]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" fill="var(--fill-0, #625E37)" id="Ellipse 1" r="2.5" />
        </svg>
      </div>
      <div className="-translate-y-1/2 absolute left-0 size-[5px] top-[calc(50%-1.5px)]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" fill="var(--fill-0, #625E37)" id="Ellipse 1" r="2.5" />
        </svg>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex gap-[5px] items-end left-[14px] top-[88px]">
      <div className="flex flex-row items-end self-stretch">
        <Frame5 />
      </div>
      <p className="[word-break:break-word] font-['Libre_Caslon_Condensed:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#625e37] text-[14px] tracking-[-0.28px] whitespace-nowrap">tinkering hobbies</p>
    </div>
  );
}

function TinkeringHobbiesActive() {
  return (
    <div className="absolute bg-[#ece6df] h-[116px] left-[59px] top-[515px] w-[187px]" data-name="tinkering hobbies active">
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] right-[14px] text-[#c67d39] text-[14px] top-[36px] tracking-[0.56px] uppercase">projects</p>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] right-[14px] text-[#c67d39] text-[14px] top-[62px] tracking-[0.56px] uppercase">ai playground</p>
      <div className="absolute flex h-[78px] items-center justify-center left-[16px] top-[19px] w-px">
        <div className="flex-none rotate-90">
          <div className="h-px relative w-[78px]" data-name="Line 5 (Stroke)">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 78 1">
              <path d="M78 0V1H0V0H78Z" fill="var(--fill-0, #D1C0AE)" id="Line 5 (Stroke)" />
            </svg>
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#c67d39] text-[14px] top-[10px] tracking-[0.56px] uppercase w-[149px]">Home</p>
      <Frame4 />
    </div>
  );
}

export default function SideNavStates() {
  return (
    <div className="relative size-full" data-name="side nav states">
      <HomeActive />
      <ProjectsActive />
      <AiPlaygroundActive />
      <TinkeringHobbiesActive />
    </div>
  );
}