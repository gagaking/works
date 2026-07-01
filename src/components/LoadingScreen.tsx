import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete,
    });

    const bar = barRef.current;
    const pct = pctRef.current;

    if (bar && pct) {
      tl.to(bar, {
        scaleX: 1,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: function () {
          pct.textContent = Math.round(this.progress() * 100) + "%";
        },
      });
    }

    tl.to({}, { duration: 0.3 });

    tl.to(
      overlayRef.current,
      {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.inOut",
      },
      "-=0.1"
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0f]"
    >
      <div className="flex items-center gap-3 mb-8">
        <svg
          width="40"
          height="40"
          viewBox="0 0 256 256"
          fill="#ffffff"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" />
          <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span
          className="text-white text-3xl font-playfair italic"
          style={{ letterSpacing: "-0.03em" }}
        >
          Lithos
        </span>
      </div>

      <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
        <div
          ref={barRef}
          className="absolute inset-y-0 left-0 w-full origin-left bg-white rounded-full"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <span
        ref={pctRef}
        className="mt-3 text-white/40 text-xs font-mono tracking-widest"
      >
        0%
      </span>

      <p className="absolute bottom-12 text-white/20 text-xs tracking-[0.3em] uppercase">
        Loading
      </p>
    </div>
  );
}
