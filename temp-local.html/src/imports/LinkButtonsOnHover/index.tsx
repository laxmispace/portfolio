function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-[48px] top-[26px]">
      <p className="[text-underline-position:from-font] [word-break:break-word] decoration-from-font decoration-solid font-['Libre_Caslon_Condensed:Italic',sans-serif] italic leading-[normal] lowercase relative shrink-0 text-[#212012] text-[14px] underline whitespace-nowrap">LinkedIn</p>
      <div className="relative shrink-0 size-[4px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #C3BE6F)" id="Ellipse 10" r="2" />
        </svg>
      </div>
      <p className="[text-underline-position:from-font] [word-break:break-word] decoration-from-font decoration-solid font-['Libre_Caslon_Condensed:Regular',sans-serif] leading-[normal] lowercase not-italic relative shrink-0 text-[#625e37] text-[14px] underline whitespace-nowrap">Gmail</p>
    </div>
  );
}

export default function LinkButtonsOnHover() {
  return (
    <div className="bg-[#ece6df] relative size-full" data-name="link Buttons on hover">
      <Frame />
    </div>
  );
}