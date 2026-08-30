"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw, RotateCw, Shuffle, Repeat, Heart, ListMusic } from "lucide-react";
import { Track } from "@/types";

interface GlobalPlayerProps {
  currentTrack: Track | null;
  queue: Track[];
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (trackId: string) => void;
  isFavorite: boolean;
}

export default function GlobalPlayer({
  currentTrack,
  queue,
  onNext,
  onPrev,
  onToggleFavorite,
  isFavorite,
}: GlobalPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error("Playback error:", e));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border px-4 py-3 z-40 shadow-skeuo backdrop-blur-md bg-opacity-95">
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          if (isRepeat && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            onNext();
          }
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4">
          <img
            src={currentTrack.thumbnailUrl || "https://picsum.photos/300"}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover shadow-skeuo-inset"
          />
          <div className="truncate">
            <h4 className="font-semibold text-sm text-white truncate">{currentTrack.title}</h4>
            <p className="text-xs text-dark-muted truncate">{currentTrack.description}</p>
          </div>
          <button
            onClick={() => onToggleFavorite(currentTrack.id)}
            className={`p-2 rounded-lg ${isFavorite ? "text-red-500" : "text-dark-muted hover:text-white"}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Player Controls & Progress */}
        <div className="flex flex-col items-center w-full md:w-2/4 gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-lg ${isShuffle ? "text-accent" : "text-dark-muted hover:text-white"}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={onPrev} className="p-2 text-white hover:text-accent transition">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={() => skipTime(-10)} className="p-2 text-dark-muted hover:text-white transition" title="Rewind 10s">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-accent text-dark rounded-full shadow-skeuo-btn hover:scale-105 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button onClick={() => skipTime(10)} className="p-2 text-dark-muted hover:text-white transition" title="Forward 10s">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={onNext} className="p-2 text-white hover:text-accent transition">
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-lg ${isRepeat ? "text-accent" : "text-dark-muted hover:text-white"}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full text-xs text-dark-muted">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-accent cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Secondary controls: Speed & Volume */}
        <div className="hidden md:flex items-center gap-4 w-1/4 justify-end">
          <button
            onClick={changeSpeed}
            className="px-2 py-1 bg-dark-card border border-dark-border rounded text-xs font-semibold text-accent hover:bg-dark-border"
          >
            {playbackSpeed}x
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="text-dark-muted hover:text-white">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setVolume(val);
              setIsMuted(false);
              if (audioRef.current) audioRef.current.volume = val;
            }}
            className="w-20 accent-accent cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
