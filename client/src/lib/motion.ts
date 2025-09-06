// src/utils/motion.ts
import { AnimationGeneratorType, Variants } from "framer-motion";

export const staggerContainer = (
  staggerChildren: number = 0.1,
  delayChildren: number = 0.1
): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeIn = (
  direction: "up" | "down" | "left" | "right" = "up",
  type: AnimationGeneratorType = "spring",
  delay: number = 0,
  duration: number = 0.5
): Variants => {
  return {
    hidden: {
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut",
      },
    },
  };
};

export const slideIn = (
  direction: "up" | "down" | "left" | "right",
  type: AnimationGeneratorType = "spring",
  delay: number = 0,
  duration: number = 0.5
): Variants => ({
  hidden: {
    x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
    y: direction === "up" ? "100%" : direction === "down" ? "100%" : 0,
  },
  show: {
    x: 0,
    y: 0,
    transition: {
      type,
      delay,
      duration,
      ease: "easeOut",
    },
  },
});

export const zoomIn = (
  delay: number = 0,
  duration: number = 0.5
): Variants => ({
  hidden: {
    scale: 0.95,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      delay,
      duration,
      ease: "easeOut",
    },
  },
});

export const textVariant = (delay: number = 0): Variants => ({
  hidden: {
    y: 50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1.25,
      delay,
    },
  },
});

export const textContainer = (): Variants => ({
  hidden: {
    opacity: 0,
  },
  show: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: i * 0.1 },
  }),
});

export const textVariant2 = (): Variants => ({
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "easeIn",
    },
  },
});

// For cards and grid items
export const staggerChildren = (stagger: number = 0.05): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
    },
  },
});

export const listItem = (): Variants => ({
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
});

// For hover effects
export const hoverScale = (scale: number = 1.05): Variants => ({
  hover: {
    scale,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
});

export const hoverRotate = (rotate: number = 5): Variants => ({
  hover: {
    rotate,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
});

export const tapScale = (scale: number = 0.98): Variants => ({
  tap: {
    scale,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
  },
});

// For section dividers
export const dividerVariant = (): Variants => ({
  hidden: { width: 0 },
  show: {
    width: "100%",
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
});

// For complex path animations
export const pathVariant = (duration: number = 1.5): Variants => ({
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration,
      ease: "easeInOut",
    },
  },
});

// For floating animations
export const floatVariant = (y: [number, number] = [-10, 10]): Variants => ({
  float: {
    y,
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  },
});
