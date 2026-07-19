"use client";

import dynamic from "next/dynamic";
import { portfolioData } from "@/data/portfolio";
import { ResumeIcon, CallIcon, MailIcon, LocationIcon, LoaderIcon } from "@/components/Icons";

const Card = dynamic(() => import("@/components/Card"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-white">
      <LoaderIcon className="w-30 h-30 text-[#ffde00]" />
    </div>
  ),
});

export function Banner() {
  const { personalInfo } = portfolioData;

  return (
    <section className="lg:min-h-screen pt-32 pb-20 flex items-center bg-comic-dots overflow-hidden">
      <div className="absolute top-[-30px] lg:top-0 right-0 h-[50vh] lg:h-full left-0 w-full pointer-events-none">
        <div className="w-full h-full relative flex justify-center items-center pointer-events-auto touch-none select-none">
          <Card
            position={[0, 0, 24]}
            gravity={[0, -25, 0]}
            fov={14}
            cardX={3.2}
            cardY={4.5}
            frontImage="/susheel.jpg"
            lanyardImage="/lanyard.jpg"
            imageFit="cover"
            lanyardWidth={1}
          />
        </div>
      </div>
      <div className="max-w-7xl lg:mt-0 mt-[25vh] mx-auto px-6 lg:px-12 relative z-10 w-full pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7  m-[0_auto] lg:m-0 max-w-xl xl:max-w-2xl space-y-6 text-center lg:text-start pointer-events-auto">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-playwrite font-semibold tracking-tight text-black leading-[1.4]">
                <span className="text-2xl lg:text-4xl lg:text-5xl">Hello, folks!</span> <br />
                I am Susheel
              </h1>
            </div>
            <p className="font-medium font-mona-sans"><b>Frontend Engineer</b> with 3.5+ years of experience creating modern web applications using <b>React.js</b>, <b>Tailwind CSS</b>, <b>GSAP</b>, and <b>Framer Motion</b>. From pixel-perfect UI implementation to performance optimization and interactive animations, I build fast, scalable, and engaging digital experiences that deliver measurable results.</p>
            <p className="font-medium font-mona-sans">From <b>Figma</b> to production—creating scalable React applications with clean code, smooth motion, and measurable performance.</p>

            <div className="pt-2 flex flex-wrap lg:justify-start justify-center items-center gap-4 font-fredoka text-xs font-bold text-black">
              <a href={personalInfo.resume} target="_blank" className="px-2.5 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5 hover:bg-amber-100 transition-colors">
                <ResumeIcon className="w-4 h-4 text-black" />
                <span>Resume</span>
              </a>
              <a href={`tel:${personalInfo.phone.replace(/\s+/g, '')}`} className="px-2.5 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5 hover:bg-amber-100 transition-colors">
                <CallIcon className="w-4 h-4 text-black" />
                <span>{personalInfo.phone}</span>
              </a>
              <a href={`mailto:${personalInfo.email}`} className="px-2.5 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5 hover:bg-amber-100 transition-colors">
                <MailIcon className="w-4 h-4 text-black" />
                <span>{personalInfo.email}</span>
              </a>
              <span className="px-2.5 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5">
                <LocationIcon className="w-4 h-4 text-black" />
                <span>Gurugram, HR, India</span>
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
