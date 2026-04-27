export const smoothEase = [0.22, 1, 0.36, 1];

export const sectionReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.46, ease: smoothEase },
  },
};

export const cardReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: smoothEase },
  },
};

export const subtleLift = {
  y: -4,
  transition: { duration: 0.18, ease: smoothEase },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};
