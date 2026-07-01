import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Returns a reactive scroll progress value (0 to 1) for a given element,
 * driven by GSAP ScrollTrigger with scrub.
 */
export function useScrollProgress(
  triggerRef: React.RefObject<HTMLElement | null>,
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
  } = {}
) {
  const { start = 'top center', end = 'bottom center', scrub = true } = options;
  const [progress, setProgress] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    const obj = { p: 0 };

    stRef.current = ScrollTrigger.create({
      trigger: triggerRef.current,
      start,
      end,
      scrub: typeof scrub === 'boolean' ? (scrub ? 1 : false) : scrub,
      onUpdate: (self) => {
        setProgress(self.progress);
      },
    });

    return () => {
      stRef.current?.kill();
    };
  }, [start, end, scrub]);

  return progress;
}
