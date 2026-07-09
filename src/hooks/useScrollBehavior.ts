"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface ScrollState {
  isScrolled: boolean;
  isHeaderVisible: boolean;
  isCompact: boolean;
  scrollProgress: number;
  showHeader: () => void;
}

interface UseScrollBehaviorOptions {
  /** Threshold in px before `isScrolled` becomes true */
  scrolledThreshold?: number;
  /** Threshold in px before `isCompact` becomes true */
  compactThreshold?: number;
  /** Distance from top at which hide-on-scroll-down activates */
  hideThreshold?: number;
}

export function useScrollBehavior(
  options: UseScrollBehaviorOptions = {}
): ScrollState {
  const {
    scrolledThreshold = 20,
    compactThreshold = 100,
    hideThreshold = 150,
  } = options;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const documentHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
        const isScrollingDown = currentScrollY > lastScrollY.current;

        // Scroll progress — always update for progress bar
        const progress =
          documentHeight > 0
            ? (currentScrollY / documentHeight) * 100
            : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));

        // Scrolled state
        setIsScrolled((prev) => {
          const next = currentScrollY > scrolledThreshold;
          return next !== prev ? next : prev;
        });

        // Compact mode
        setIsCompact((prev) => {
          const next = currentScrollY > compactThreshold;
          return next !== prev ? next : prev;
        });

        // Header visibility
        if (currentScrollY < 50) {
          setIsHeaderVisible(true);
        } else if (scrollDelta > 5) {
          if (isScrollingDown && currentScrollY > hideThreshold) {
            setIsHeaderVisible(false);
          } else if (!isScrollingDown) {
            setIsHeaderVisible(true);
          }
        }

        lastScrollY.current = currentScrollY;
        rafId.current = null;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (
        e.clientY < 100 &&
        !isHeaderVisible &&
        window.scrollY > hideThreshold
      ) {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [
    isHeaderVisible,
    scrolledThreshold,
    compactThreshold,
    hideThreshold,
  ]);

  const showHeader = useCallback(() => {
    setIsHeaderVisible(true);
  }, []);

  return {
    isScrolled,
    isHeaderVisible,
    isCompact,
    scrollProgress,
    showHeader,
  };
}
