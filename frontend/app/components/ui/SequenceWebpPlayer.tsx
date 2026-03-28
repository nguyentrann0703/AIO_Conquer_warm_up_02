"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface SequenceWebpPlayerProps {
  frameDirectory?: string;
  startFrame?: number;
  endFrame?: number;
  fps?: number;
  width?: number;
  height?: number;
  className?: string;
  fadeOut?: boolean;
  onComplete?: () => void;
}

const SequenceWebpPlayer = ({
  frameDirectory = "/sequence",
  startFrame = 1,
  endFrame = 120,
  fps = 30,
  width = 1920,
  height = 1080,
  className,
  fadeOut = false,
  onComplete,
}: SequenceWebpPlayerProps) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const completedRef = useRef(false);

  const frames = useMemo(() => {
    const list: string[] = [];

    for (let i = startFrame; i <= endFrame; i += 1) {
      list.push(`${frameDirectory}/${String(i).padStart(4, "0")}.webp`);
    }

    return list;
  }, [frameDirectory, startFrame, endFrame]);

  useEffect(() => {
    let rafId = 0;
    let currentFrame = 0;
    let lastTick = performance.now();
    const frameDuration = 1000 / fps;

    const tick = (now: number) => {
      if (now - lastTick >= frameDuration) {
        lastTick = now;

        if (currentFrame < frames.length - 1) {
          currentFrame += 1;
          setFrameIndex(currentFrame);
        } else if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }

      if (currentFrame < frames.length - 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [fps, frames.length, onComplete]);

  return (
    <Image
      src={frames[frameIndex]}
      alt="Sequence animation"
      width={width}
      height={height}
      unoptimized
      priority
      draggable={false}
      className={`pointer-events-none select-none transition-opacity duration-1000 ease-out ${
        fadeOut ? "opacity-0" : "opacity-100"
      } ${className ?? ""}`}
    />
  );
};

export default SequenceWebpPlayer;
