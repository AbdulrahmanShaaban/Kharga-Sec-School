"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before the animation starts. */
  delay?: number;
  /** Vertical offset in pixels the element slides up from. */
  y?: number;
};

/**
 * Fade-and-rise reveal that fires once when the element scrolls into view.
 * Honors prefers-reduced-motion: the content is simply shown with no motion.
 */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container: wraps Reveal children so they cascade in sequence.
 * Usage: <Stagger>{items.map((i) => <RevealItem key={i.id}>…</RevealItem>)}</Stagger>
 */
export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Child of Stagger — animates as part of the cascade. */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
