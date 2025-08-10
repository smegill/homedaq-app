"use client";

export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* blurred blobs */}
      <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-blue-400/20 blur-[80px]" />
      <div className="absolute -right-24 -top-12 w-[32rem] h-[32rem] rounded-full bg-indigo-400/20 blur-[90px]" />
      <div className="absolute bottom-[-10rem] left-1/2 -translate-x-1/2 w-[50rem] h-[28rem] rounded-full bg-sky-300/15 blur-[120px]" />
    </div>
  );
}
