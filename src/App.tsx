import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Code2, Layers, Grid2x2, LayoutGrid, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import RevealLayer from "./components/RevealLayer";
import FluidGlass from "./components/FluidGlass";
import LoadingScreen from "./components/LoadingScreen";

gsap.registerPlugin(ScrollTrigger);

const BG_IMAGE_1 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const navItems = [
  { label: "Course", active: true, href: "#selected-works" },
  { label: "Field Guides", active: false, href: "#ai-lab" },
  { label: "Geology", active: false, href: "#hero" },
  { label: "Plans", active: false, href: "#selected-works" },
  { label: "Live Tour", active: false, href: "#ai-lab" },
];

const works = [
  { tag: "AI + VISUAL", title: "ECHO GENERATIVE", desc: "AI-driven visual system for generative art exploration.", gradient: "from-purple-900 via-purple-700 to-purple-500" },
  { tag: "BRAND + WEB", title: "NEXUS STUDIO", desc: "Digital identity and website design for a creative agency.", gradient: "from-slate-800 via-slate-600 to-slate-400" },
  { tag: "AI + PRODUCT", title: "FLOW AI", desc: "AI productivity platform with intelligent automation.", gradient: "from-indigo-900 via-violet-800 to-purple-600" },
  { tag: "MOTION + 3D", title: "BEYOND REALMS", desc: "Immersive motion story told through 3D and sound.", gradient: "from-purple-800 via-fuchsia-600 to-pink-400" },
];

const labFeatures = [
  { icon: Code2, title: "Prompt Engineering", desc: "Designing effective prompts for creative AI systems." },
  { icon: Layers, title: "Batch Generation", desc: "Building tools for large-scale AI content generation." },
  { icon: Grid2x2, title: "Style Control", desc: "Fine-tuning AI outputs with precise style control." },
  { icon: LayoutGrid, title: "Automation Systems", desc: "Creating scalable workflows with AI and automation." },
];

function useHeroGSAP(
  loading: boolean,
  refs: {
    heroBg: React.RefObject<HTMLDivElement | null>;
    heroTitle1: React.RefObject<HTMLSpanElement | null>;
    heroTitle2: React.RefObject<HTMLSpanElement | null>;
    heroDescLeft: React.RefObject<HTMLDivElement | null>;
    heroDescRight: React.RefObject<HTMLDivElement | null>;
    worksSection: React.RefObject<HTMLElement | null>;
    aiLabSection: React.RefObject<HTMLElement | null>;
  }
) {
  useGSAP(() => {
    if (loading) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([
        refs.heroTitle1.current, refs.heroTitle2.current,
        refs.heroDescLeft.current, refs.heroDescRight.current,
        refs.heroBg.current,
      ], { clearProps: "all" });
      return () => {};
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(refs.heroBg.current, { scale: 1.12 }, { scale: 1, duration: 1.8, ease: "power2.out" }, 0);
      tl.fromTo(refs.heroTitle1.current, { y: 32, autoAlpha: 0, filter: "blur(12px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1 }, 0.25);
      tl.fromTo(refs.heroTitle2.current, { y: 32, autoAlpha: 0, filter: "blur(12px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1 }, 0.42);
      tl.fromTo(refs.heroDescLeft.current, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.7);
      tl.fromTo(refs.heroDescRight.current, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.85);

      const ws = refs.worksSection.current;
      if (ws) {
        gsap.fromTo(ws.querySelector(".works-heading"), { y: 40, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: ws, start: "top 75%", toggleActions: "play none none reverse" },
        });
        gsap.fromTo(ws.querySelectorAll(".works-card"), { y: 60, autoAlpha: 0, scale: 0.95 }, {
          y: 0, autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ws, start: "top 70%", toggleActions: "play none none reverse" },
        });
      }

      const ai = refs.aiLabSection.current;
      if (ai) {
        gsap.fromTo(ai.querySelector(".ai-heading"), { y: 40, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: ai, start: "top 75%", toggleActions: "play none none reverse" },
        });
        gsap.fromTo(ai.querySelectorAll(".ai-card"), { y: 50, autoAlpha: 0, scale: 0.95 }, {
          y: 0, autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ai, start: "top 70%", toggleActions: "play none none reverse" },
        });
      }

      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, [loading]);
}

export default function App() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [loading, setLoading] = useState(true);

  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroTitle1Ref = useRef<HTMLSpanElement>(null);
  const heroTitle2Ref = useRef<HTMLSpanElement>(null);
  const heroDescLeftRef = useRef<HTMLDivElement>(null);
  const heroDescRightRef = useRef<HTMLDivElement>(null);
  const worksSectionRef = useRef<HTMLElement>(null);
  const aiLabSectionRef = useRef<HTMLElement>(null);

  useHeroGSAP(loading, {
    heroBg: heroBgRef,
    heroTitle1: heroTitle1Ref,
    heroTitle2: heroTitle2Ref,
    heroDescLeft: heroDescLeftRef,
    heroDescRight: heroDescRightRef,
    worksSection: worksSectionRef,
    aiLabSection: aiLabSectionRef,
  });

  const animate = useCallback(() => {
    smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
    smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
    setCursorPos({ x: smooth.current.x, y: smooth.current.y });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div
        className="min-h-screen bg-[#0a0a0f] tracking-[-0.02em]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" />
              <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" />
            </svg>
            <span className="text-white text-2xl font-playfair italic">Lithos</span>
          </div>
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" }); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${item.active ? "text-white" : "text-white/80 hover:bg-white/20 hover:text-white"}`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <button className="md:hidden text-white" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>

        <Suspense fallback={null}><FluidGlass /></Suspense>

        <section className="relative w-full overflow-hidden bg-black" style={{ height: "100dvh" }}>
          <div ref={heroBgRef} className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} />
          <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />
          <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
            <h1 className="text-white leading-[0.95]">
              <span ref={heroTitle1Ref} className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl" style={{ letterSpacing: "-0.05em", opacity: 0 }}>Layers hold</span>
              <span ref={heroTitle2Ref} className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1" style={{ letterSpacing: "-0.08em", opacity: 0 }}>tales of time</span>
            </h1>
          </div>
          <div ref={heroDescLeftRef} className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50" style={{ opacity: 0 }}>
            <p className="text-sm text-white/80 leading-relaxed">Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.</p>
          </div>
          <div ref={heroDescRightRef} className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50" style={{ opacity: 0 }}>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Our interactive maps let you peel back the crust to trace how stones, fossils, and deep time combine to shape the ground beneath your feet.</p>
            <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30">Start Digging</button>
          </div>
        </section>

        <section ref={worksSectionRef} className="bg-[#0a0a0f] px-6 sm:px-10 md:px-16 lg:px-20 py-20 sm:py-28 relative z-[10]">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="works-heading lg:w-[22%] flex-shrink-0" style={{ opacity: 0 }}>
              <p className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase mb-4">Selected Works</p>
              <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.05] tracking-[-0.03em]">Crafted<br /><span className="font-playfair italic">Experiences</span></h2>
            </div>
            <div className="lg:w-[78%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {works.map((work) => (
                <div key={work.title} className="works-card group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer aspect-[3/4]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${work.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <span className="inline-block w-fit text-[10px] font-medium tracking-wider text-white/70 bg-white/[0.15] backdrop-blur-sm px-2.5 py-1 rounded-full mb-3">{work.tag}</span>
                    <h3 className="text-white text-sm font-semibold tracking-wide mb-1.5">{work.title}</h3>
                    <p className="text-white/60 text-xs leading-relaxed mb-3">{work.desc}</p>
                    <div className="flex justify-end"><ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={aiLabSectionRef} className="relative bg-[#0d0d14] px-6 sm:px-10 md:px-16 lg:px-20 py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10 pointer-events-none" />
          <div className="relative max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="ai-heading lg:w-[22%] flex-shrink-0" style={{ opacity: 0 }}>
              <p className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase mb-4">AI Lab</p>
              <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.05] tracking-[-0.03em]">Exploring the Future<br /><span className="font-playfair italic">with AI</span></h2>
            </div>
            <div className="lg:w-[78%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {labFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="ai-card group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-5"><Icon className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" /></div>
                    <h3 className="text-white text-sm font-semibold mb-2">{feat.title}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
