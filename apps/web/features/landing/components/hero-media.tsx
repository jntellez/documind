"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

import { landingContent } from "@/features/landing/content";

export function HeroMedia() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    const handleMouseLeave = () => {
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative isolate w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[18rem]"
      style={{
        transform,
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
      data-testid="hero-media-shell"
    >
      <div className="absolute left-1/2 top-[20%] h-20 w-20 -translate-x-1/2 rounded-full before:absolute before:left-1/2 before:top-[20%] before:h-20 before:w-20 before:-translate-x-1/2 before:rounded-full before:content-[''] sm:before:h-30 sm:before:w-30 lg:before:h-40 lg:before:w-40"></div>
      <div className="absolute bottom-5 left-1/2 h-16 w-[72%] -translate-x-1/2 after:absolute after:bottom-5 after:left-1/2 after:h-16 after:w-[72%] after:-translate-x-1/2 after:content-['']"></div>
      
      <Image
        alt={landingContent.hero.imageAlt}
        className="relative z-10 mx-auto h-auto w-full drop-shadow-[0_28px_46px_rgba(28,27,27,0.18)]"
        fetchPriority="high"
        priority
        src={landingContent.hero.image}
      />
      <div className="absolute top-1/2 right-1 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-600/12 blur-3xl sm:right-2 sm:h-60 sm:w-60 lg:right-3 lg:h-100 lg:w-100"></div>
    </div>
  );
}
