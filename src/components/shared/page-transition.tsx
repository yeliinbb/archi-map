"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { DURATION, EASE } from "@/lib/constants/motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE.smooth }}
    >
      {children}
    </motion.div>
  );
}
