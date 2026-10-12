function Frame() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[590px] left-1/2 top-1/2 w-[800px]" />;
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="1">
      <Frame />
    </div>
  );
}