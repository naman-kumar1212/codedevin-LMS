'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, SkipBack, SkipForward, AlertCircle,
  Loader2, Settings, Minimize, RotateCcw,
  RotateCw, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';

interface LessonVideoPlayerProps {
  thumbnail?: string;
  videoUrl?: string;
  duration?: number;
  onPlay?: () => void;
  onDurationChange?: (duration: number) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function LessonVideoPlayer({ thumbnail, videoUrl, duration: initialDuration, onPlay, onDurationChange }: LessonVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    if (url.startsWith('/public/uploads')) return `${backendUrl}${url}`;
    return `${backendUrl}/public/uploads/videos/${url}`;
  };

  const resolvedVideoUrl = getFullUrl(videoUrl);
  const resolvedThumbnail = getFullUrl(thumbnail);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setError(false);
    setIsBuffering(false);
    setHasStarted(false);
    if (initialDuration) setDuration(initialDuration);
    if (videoRef.current) videoRef.current.load();
  }, [resolvedVideoUrl, initialDuration]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying && !isDragging) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying, isDragging]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [isPlaying, isDragging, resetHideTimer]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    setHasStarted(true);
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play()
        .then(() => onPlay?.())
        .catch(() => setError(true));
    }
  }, [isPlaying, onPlay]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    if (total > 0) setProgress((current / total) * 100);

    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / total) * 100);
    }
  };

  const onSliderValueChange = (values: number[]) => {
    if (!videoRef.current?.duration) return;
    const value = values[0];
    videoRef.current.currentTime = (value / 100) * videoRef.current.duration;
    setProgress(value);
  };

  const onVolumeChange = (values: number[]) => {
    const val = values[0] / 100;
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) videoRef.current.volume = val;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    videoRef.current.muted = next;
    if (next) setVolume(0);
    else {
        const prevVolume = 1; // Default to full if unmuting
        setVolume(prevVolume);
        videoRef.current.volume = prevVolume;
    }
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skip = (secs: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + secs));
  };

  const formatTime = (s: number) => {
    if (isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'j':
          skip(-10);
          break;
        case 'l':
          skip(10);
          break;
        case 'arrowleft':
          skip(-5);
          break;
        case 'arrowright':
          skip(5);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  if (!resolvedVideoUrl) {
    return (
      <div className="relative w-full bg-[#0f1117] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/5" style={{ aspectRatio: '16/9' }}>
        {resolvedThumbnail && (
          <img src={resolvedThumbnail} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale" />
        )}
        <div className="relative z-10 text-center px-6">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <AlertCircle className="size-8 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white/70 mb-2">Video Unavailable</h3>
          <p className="text-sm text-white/40 max-w-xs mx-auto">This lesson doesn't have a video file attached yet. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-black rounded-xl overflow-hidden shadow-2xl group transition-all duration-300",
          isFullscreen ? "rounded-none h-screen" : "aspect-video"
        )}
        onMouseMove={resetHideTimer}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          poster={resolvedThumbnail}
          className="size-full object-contain cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            const videoDuration = videoRef.current?.duration || 0;
            setDuration(videoDuration);
            if (onDurationChange) onDurationChange(videoDuration);
          }}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setError(true)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          playsInline
        />

        {/* Start Overlay */}
        {!hasStarted && !error && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 cursor-pointer group/start"
            onClick={togglePlay}
          >
            <div className="size-20 bg-primary/90 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl group-hover/start:scale-110 group-hover/start:bg-primary transition-all duration-300">
              <Play className="size-10 ml-1.5 fill-current" />
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {isBuffering && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px]">
            <Loader2 className="size-12 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
            <div className="text-center px-8 py-10 rounded-2xl bg-white/5 border border-white/10 shadow-2xl max-w-sm">
              <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Playback Error</h4>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">We encountered a problem loading this video. This might be due to a network issue or missing file.</p>
              <Button
                onClick={() => { setError(false); videoRef.current?.load(); }}
                variant="outline"
                className="bg-white/10 hover:bg-primary hover:text-white border-white/20"
              >
                <RotateCcw className="mr-2 size-4" />
                Retry Loading
              </Button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end transition-all duration-500 z-40 pb-0",
            hasStarted ? (showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none") : "opacity-0 pointer-events-none"
          )}
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
        >
          {/* Progress Slider (integrated on top of bar) */}
          <div className="w-full relative -mb-3 px-1 group/slider z-50">
            <Slider
              value={[progress]}
              max={100}
              step={0.01}
              onValueChange={onSliderValueChange}
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => setIsDragging(false)}
              className="py-4 cursor-pointer"
            />
          </div>

          <div className="px-4 md:px-6 pb-2 md:pb-4 pt-4 flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-1 md:gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="size-10 md:size-12 rounded-full hover:bg-white/10 text-white shrink-0"
                  >
                    {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current ml-0.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{isPlaying ? 'Pause (k)' : 'Play (k)'}</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-0.5 ml-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => skip(-10)}
                      className="size-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all"
                    >
                      <RotateCcw className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Back 10s (j)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => skip(10)}
                      className="size-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all"
                    >
                      <RotateCw className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Forward 10s (l)</TooltipContent>
                </Tooltip>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 group/volume ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="size-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white shrink-0"
                    >
                      <VolumeIcon className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{isMuted ? 'Unmute (m)' : 'Mute (m)'}</TooltipContent>
                </Tooltip>
                
                <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300 items-center hidden md:flex">
                   <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={onVolumeChange}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="hidden sm:flex items-center gap-1 text-[13px] font-medium tabular-nums text-white/90 ml-3 drop-shadow-sm">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/40 font-light">/</span>
                <span className="text-white/70">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Playback Speed Dropdown */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-9 px-3 text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-sm"
                      >
                        {playbackSpeed}×
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">Playback Speed</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="bg-[#1a1c23] border-white/10 text-white min-w-[120px] rounded-xl shadow-2xl">
                  <DropdownMenuLabel className="text-white/40 text-[10px] uppercase tracking-wider">Speed</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {SPEEDS.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={cn(
                        "text-xs px-3 py-2 cursor-pointer transition-colors focus:bg-primary focus:text-white rounded-md m-1",
                        s === playbackSpeed ? "bg-primary/20 text-primary font-bold" : "text-white/70"
                      )}
                    >
                      {s}× {s === 1 && <span className="ml-auto text-[10px] text-white/40 font-normal">Normal</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings / Extra */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full hover:bg-white/10 text-white/80 transition-all hidden md:flex"
                  >
                    <Settings className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Settings</TooltipContent>
              </Tooltip>

              {/* Fullscreen Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="size-9 rounded-full hover:bg-white/10 text-white"
                  >
                    {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
