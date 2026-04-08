export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

export const EASE = {
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.4, 0, 0.2, 1],
} as const;

export const STAGGER_DELAY = 0.05;
