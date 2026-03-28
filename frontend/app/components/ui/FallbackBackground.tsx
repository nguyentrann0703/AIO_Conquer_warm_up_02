"use client";

import { motion } from "framer-motion";

const FallbackBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(58,223,250,0.18),transparent_40%),radial-gradient(circle_at_78%_20%,rgba(255,134,195,0.16),transparent_42%),radial-gradient(circle_at_50%_90%,rgba(252,223,70,0.14),transparent_45%),linear-gradient(145deg,#070707_0%,#111213_45%,#090909_100%)]" />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.4, 0.62, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(58,223,250,0.09)_45%,transparent_100%)]" />
      </motion.div>
      <div className="absolute inset-0 scanline-bg opacity-15" />
    </div>
  );
};

export default FallbackBackground;
