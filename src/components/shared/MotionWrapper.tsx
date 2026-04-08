"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { DURATION, EASE, STAGGER_DELAY } from "@/lib/constants/motion";

type MotionDivProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  className?: string;
};

export function FadeIn({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE.smooth }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInView({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: DURATION.slow, ease: EASE.smooth }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const staggerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER_DELAY,
    },
  },
};

export function StaggerContainer({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      variants={staggerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.smooth },
  },
};

export function StaggerItem({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
