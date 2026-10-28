"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

type LottieComponentProps = {
  /** lottie-react v3 takes the animation via `src` (a URL string or the object). */
  src: string | Record<string, unknown>;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  style?: React.CSSProperties;
};

// lottie-react is client-only and heavy — load it lazily so the initial HTML
// stays small and the server never tries to render a canvas.
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.Lottie as unknown as React.ComponentType<LottieComponentProps>),
  { ssr: false, loading: () => null }
);

export type LottieAnimationProps = {
  /** Path under /public, e.g. "/lottie/hero-knowledge.json". */
  src: string;
  /** Accessible label; the animation is decorative by default. */
  label?: string;
  className?: string;
  /** Playback speed — lower is slower. */
  speed?: number;
};

/**
 * Decorative Lottie player. Honors the user's reduced-motion preference by
 * freezing on the first frame instead of looping.
 */
export function LottieAnimation({ src, label, className, speed = 1 }: LottieAnimationProps) {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className={cn("relative", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Lottie
        src={src}
        loop={!reduced}
        autoplay={!reduced}
        speed={speed}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
