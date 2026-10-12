import img3 from "./7a03b2db88da606048d49d06f95072b544ff0764.png";

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[444.557px] items-center justify-center left-1/2 top-1/2 w-[377.848px]">
      <div className="flex-none rotate-[-8.87deg]">
        <div className="bg-[#f5d13e] border-10 border-solid border-white h-[400px] relative w-[320px]" />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[354.274px] items-center justify-center left-[calc(50%+0.27px)] top-[calc(50%+0.14px)] w-[448.985px]">
      <div className="flex-none rotate-[1.89deg]">
        <div className="bg-[#0037ff] border-10 border-solid border-white h-[340px] relative w-[438px]" />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[371.62px] items-center justify-center left-[calc(50%+0.05px)] top-[calc(50%+0.35px)] w-[353.822px]">
      <div className="flex-none rotate-[-6.01deg]">
        <div className="bg-[red] border-10 border-solid border-white h-[340px] relative w-[320px]" />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[216.08px] items-center justify-center left-[calc(50%+0.22px)] top-[calc(50%-0.23px)] w-[566.444px]">
      <div className="flex-none rotate-[-1.97deg]">
        <div className="bg-[#f5d13e] border-10 border-solid border-white h-[196.928px] relative w-[560px]" />
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="3">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-white inset-0" />
        <img alt="" className="absolute max-w-none object-cover size-full" src={img3} />
      </div>
      <Frame />
      <Frame1 />
      <Frame2 />
      <Frame3 />
    </div>
  );
}