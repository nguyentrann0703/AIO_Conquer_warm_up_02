"use client";

import { motion } from "framer-motion";

interface HeroControlsProps {
  isNebulaEnabled: boolean;
  onToggleNebula: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
  musicVolume: number;
  onMusicVolumeChange: (value: number) => void;
  musicUnavailable?: boolean;
}

const HeroControls = ({
  isNebulaEnabled,
  onToggleNebula,
  isMusicEnabled,
  onToggleMusic,
  musicVolume,
  onMusicVolumeChange,
  musicUnavailable = false,
}: HeroControlsProps) => {
  return (
    <div className="fixed top-4 left-4 z-120 flex flex-col gap-3">
      <motion.button
        type="button"
        onClick={onToggleNebula}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="group min-w-44 bg-surface-container-high/85 border border-secondary/60 text-on-surface px-4 py-3 rounded-md backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs tracking-widest uppercase font-semibold">
            Background
          </span>
          <span className="material-symbols-outlined text-base text-secondary">
            {isNebulaEnabled ? "blur_on" : "hide_source"}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-secondary mt-1 text-left">
          {isNebulaEnabled ? "Nebula: On" : "Nebula: Off"}
        </p>
      </motion.button>

      <motion.button
        type="button"
        onClick={onToggleMusic}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="group min-w-44 bg-surface-container-high/85 border border-primary/60 text-on-surface px-4 py-3 rounded-md backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs tracking-widest uppercase font-semibold">
            Music
          </span>
          <span className="material-symbols-outlined text-base text-primary">
            {isMusicEnabled ? "music_note" : "music_off"}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-primary mt-1 text-left">
          {musicUnavailable
            ? "Track Missing"
            : isMusicEnabled
              ? "Music: On"
              : "Music: Off"}
        </p>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-w-44 bg-surface-container-high/85 border border-primary/30 text-on-surface px-4 py-3 rounded-md backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs tracking-widest uppercase font-semibold text-primary">
            Volume
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-primary">
            {Math.round(musicVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(musicVolume * 100)}
          onChange={(e) => onMusicVolumeChange(Number(e.target.value) / 100)}
          className="w-full h-1 accent-primary cursor-pointer"
          aria-label="Music volume"
        />
      </motion.div>
    </div>
  );
};

export default HeroControls;
