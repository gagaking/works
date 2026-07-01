import { useEffect, useMemo, useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

type Slide = {
  id: string;
  image: string;
  label: string;
};

const slides: Slide[] = [
  { id: "01", image: "/assets/demo/cs1.png", label: "North / 01" },
  { id: "02", image: "/assets/demo/cs2.png", label: "Orbit / 02" },
  { id: "03", image: "/assets/demo/cs3.png", label: "Pulse / 03" },
  { id: "04", image: "/assets/demo/cs1.png", label: "North / 04" },
  { id: "05", image: "/assets/demo/cs2.png", label: "Orbit / 05" },
  { id: "06", image: "/assets/demo/cs3.png", label: "Pulse / 06" },
];

const copy = {
  left: "\u662f\u975e\u6210\u8d25\u8f6c\u5934\u7a7a\uff0c\u9752\u5c71\u4f9d\u65e7\u5728\uff0c\u60ef\u770b\u79cb\u6708\u6625\u98ce\u3002\u4e00\u58f6\u6d4a\u9152\u559c\u76f8\u9022\uff0c\u53e4\u4eca\u591a\u5c11\u4e8b\uff0c\u6eda\u6eda\u957f\u6c5f\u4e1c\u901d\u6c34\uff0c\u6d6a\u82b1\u6dd8\u5c3d\u82f1\u96c4\u3002\u51e0\u5ea6\u5915\u9633\u7ea2\u3002\u767d\u53d1\u6e14\u6911\u6c5f\u6e9d\u4e0a\uff0c\u90fd\u4ed8\u7b11\u8c08\u4e2d\u3002",
  right: "\u662f\u975e\u6210\u8d25\u8f6c\u5934\u7a7a\uff0c\u9752\u5c71\u4f9d\u65e7\u5728\uff0c\u60ef\u770b\u79cb\u6708\u6625\u98ce\u3002\u4e00\u58f6\u6d4a\u9152\u559c\u76f8\u9022\uff0c\u53e4\u4eca\u591a\u5c11\u4e8b\uff0c\u6eda\u6eda\u957f\u6c5f\u4e1c\u901d\u6c34\uff0c\u6d6a\u82b1\u6dd8\u5c3d\u82f1\u96c4\u3002\u51e0\u5ea6\u5915\u9633\u7ea2\u3002",
};

export default function GlassShowcase() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [paused, setPaused] = useState(false);
  const [background, setBackground] = useState({
    previous: slides[0].image,
    current: slides[0].image,
    version: 0,
  });
  const [loaded, setLoaded] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!loaded) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([headerRef.current, carouselRef.current, footerRef.current, bgRef.current], { clearProps: "all" });
      return () => {};
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background fade-in
      tl.fromTo(bgRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0);

      // Header: title + year staggered
      tl.fromTo(headerRef.current?.querySelector(".gsap-title"), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.3);
      tl.fromTo(headerRef.current?.querySelector(".gsap-year"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.5);

      // Carousel: cards stagger in from bottom with slight scale
      tl.fromTo(carouselRef.current, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "power2.out" }, 0.6);

      // Footer: copies slide in
      tl.fromTo(footerRef.current?.querySelectorAll(".gsap-copy"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" }, 1.0);
    });

    return () => mm.revert();
  }, [loaded]);

  const extendedSlides = useMemo(
    () => [slides[slides.length - 1], ...slides, slides[0]],
    [],
  );

  const activeSlide = slides[(activeIndex - 1 + slides.length) % slides.length];

  useEffect(() => {
    // Small delay to let DOM mount
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((value) => value + 1);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    setBackground((prev) => {
      if (prev.current === activeSlide.image) return prev;
      return { previous: prev.current, current: activeSlide.image, version: prev.version + 1 };
    });
  }, [activeSlide.image]);

  const jumpTo = (nextIndex: number) => {
    setIsJumping(true);
    setActiveIndex(nextIndex);
    window.requestAnimationFrame(() => setIsJumping(false));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 bg-black" style={{ opacity: 0 }}>
          <img
            src={background.previous}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-[1.12] object-cover object-center opacity-100"
          />
          <img
            key={background.version}
            src={background.current}
            alt=""
            aria-hidden="true"
            className="bg-enter absolute inset-0 h-full w-full scale-[1.12] object-cover object-center"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.2)_32%,rgba(0,0,0,0.82)_100%)]" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col px-[clamp(24px,4vw,64px)] py-[clamp(28px,4.5vh,54px)]">
          <header ref={headerRef} className="flex items-start justify-between gap-6">
            <h1 className="gsap-title font-playfair italic text-[clamp(2.6rem,4.4vw,5.1rem)] leading-none tracking-[-0.045em] text-white" style={{ opacity: 0 }}>
              Crafted Experiences
            </h1>
            <div className="gsap-year pt-[0.55rem] text-[clamp(1.7rem,2.2vw,2.95rem)] leading-none tracking-[-0.035em] text-white/92" style={{ opacity: 0 }}>
              <span className="font-playfair italic">2025-2026</span>
            </div>
          </header>

          <div ref={carouselRef} className="flex flex-1 items-center" style={{ opacity: 0 }}>
            <div className="w-full">
              <div
                className="mx-auto"
                style={{
                  width: "min(100%, calc((var(--card-width) * 6) + (var(--carousel-gap) * 5)))",
                }}
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
              >
                <div className="carousel-viewport overflow-hidden">
                  <div
                    className="carousel-track flex items-stretch"
                    style={{
                      transform: `translate3d(calc(-1 * ${activeIndex} * (var(--card-width) + var(--carousel-gap))), 0, 0)`,
                      transition: isJumping ? "none" : "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onTransitionEnd={() => {
                      if (activeIndex === 0) jumpTo(slides.length);
                      if (activeIndex === slides.length + 1) jumpTo(1);
                    }}
                  >
                    {extendedSlides.map((slide, index) => {
                      const isLive = index === activeIndex;
                      return (
                        <article key={`${slide.id}-${index}`} className={`carousel-card ${isLive ? "is-live" : ""}`} aria-label={slide.label}>
                          <span className="sr-only">{slide.label}</span>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end px-[clamp(6px,1vw,14px)]">
                <span className="text-[0.95rem] font-medium tracking-[0.08em] text-[#ff45d1]">{"\u8def\u5f84"}</span>
              </div>
            </div>
          </div>

          <footer ref={footerRef} className="mt-auto border-t border-white/10 pt-[clamp(18px,3.2vh,28px)]">
            <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
              <p className="gsap-copy max-w-[34ch] text-[clamp(0.92rem,1.05vw,1.08rem)] leading-[1.28] text-white/92" style={{ opacity: 0 }}>
                {copy.left}
                <span className="ml-1 inline-block h-2 w-2 translate-y-[-0.1em] bg-[#ff5dcf]" />
              </p>
              <div className="hidden md:block md:w-[14%]" aria-hidden="true" />
              <p className="gsap-copy max-w-[34ch] text-left text-[clamp(0.92rem,1.05vw,1.08rem)] leading-[1.28] text-white/92 md:text-right" style={{ opacity: 0 }}>
                {copy.right}
                <span className="ml-1 inline-block h-2 w-2 translate-y-[-0.1em] bg-[#ff5dcf]" />
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
