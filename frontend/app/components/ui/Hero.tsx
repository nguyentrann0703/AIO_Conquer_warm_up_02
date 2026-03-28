"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Nebula from "./background";
import FallbackBackground from "./FallbackBackground";
import HeroControls from "./HeroControls";
import RightHeroSection from "./RightHeroSection";
import SequenceWebpPlayer from "./SequenceWebpPlayer";

const Hero = () => {
  const [sequenceCompleted, setSequenceCompleted] = useState(false);
  const [isNebulaEnabled, setIsNebulaEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const [musicUnavailable, setMusicUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/background.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "none";
    audioRef.current = audio;

    let removeUnlockListeners: (() => void) | null = null;

    const cleanupUnlockListeners = () => {
      if (removeUnlockListeners) {
        removeUnlockListeners();
        removeUnlockListeners = null;
      }
    };

    const registerUnlockListeners = () => {
      const unlock = async () => {
        try {
          await audio.play();
          setIsMusicEnabled(true);
          setMusicUnavailable(false);
          cleanupUnlockListeners();
        } catch {
          // Keep listeners alive until user interaction/playback succeeds.
        }
      };

      window.addEventListener("pointerdown", unlock);
      window.addEventListener("keydown", unlock);
      window.addEventListener("touchstart", unlock);

      removeUnlockListeners = () => {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
      };
    };

    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsMusicEnabled(true);
        setMusicUnavailable(false);
      } catch {
        // Browser autoplay policy blocked playback; retry on first interaction.
        registerUnlockListeners();
      }
    };

    void tryAutoplay();

    return () => {
      cleanupUnlockListeners();
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = musicVolume;
    }
  }, [musicVolume]);

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = value;
    }
  };

  const toggleNebula = () => {
    setIsNebulaEnabled((prev) => !prev);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isMusicEnabled) {
      audio.pause();
      setIsMusicEnabled(false);
      return;
    }

    try {
      await audio.play();
      setIsMusicEnabled(true);
      setMusicUnavailable(false);
    } catch {
      setIsMusicEnabled(false);
      setMusicUnavailable(true);
    }
  };

  return (
    <section className="min-h-screen font-body flex flex-col md:flex-row items-center px-6 md:px-16 gap-12 relative overflow-hidden">
      <HeroControls
        isNebulaEnabled={isNebulaEnabled}
        onToggleNebula={toggleNebula}
        isMusicEnabled={isMusicEnabled}
        onToggleMusic={toggleMusic}
        musicVolume={musicVolume}
        onMusicVolumeChange={handleMusicVolumeChange}
        musicUnavailable={musicUnavailable}
      />
      {/* Nebula background - doesn't adjust anything */}
      {isNebulaEnabled ? (
        <Nebula
          speed={0.5}
          brightness={1}
          translateX={0}
          translateY={0}
          scale={1}
          density={0.1}
          turbulence={0.5}
          intensity={0.2}
          colorR={1.1}
          colorG={0.8500000000000001}
          colorB={0.4}
          renderScale={0.6}
        />
      ) : (
        <FallbackBackground />
      )}
      {/* Background Decorative Elements */}
      <motion.div
        className="absolute left-0 bg-transparent"
        aria-hidden
        initial={{ opacity: 0, scale: 0.96, x: -40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative w-480 h-270"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <SequenceWebpPlayer
            className="absolute inset-0 h-full w-full object-cover"
            fadeOut={false}
            onComplete={() => setSequenceCompleted(true)}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: sequenceCompleted ? 1 : 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            {/* <CyberpunkModel visible={sequenceCompleted} /> */}
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 scanline-bg opacity-10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary opacity-5 blur-[120px] rounded-full" />
      {/* Left: Hero Visual */}
      <motion.div
        className="w-full md:w-1/2 flex justify-center items-center relative z-10 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      ></motion.div>
      {/* Right: Content */}
      <motion.div
        initial={{ opacity: 0, y: 36, x: 16 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <RightHeroSection />
      </motion.div>
    </section>
  );
};

export default Hero;
