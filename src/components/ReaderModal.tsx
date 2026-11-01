import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  BookOpen,
  Sliders,
  Download,
  Share2
} from 'lucide-react';

interface ReaderModalProps {
  story: Story;
  onClose: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ story, onClose }) => {
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Audio Speech Narration
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        const textToRead = `${story.title}. By StoryNex Studio. ${story.content}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = speechRate;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const words = story.content.trim() ? story.content.trim().split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  // Theme styles
  const themeContainerClasses =
    theme === 'sepia'
      ? 'bg-[#f4ecd8] text-[#3c2f1f]'
      : theme === 'light'
      ? 'bg-[#fbfbfb] text-[#1a202c]'
      : 'bg-[#06101f] text-[#e2ecfa]';

  const themeCardClasses =
    theme === 'sepia'
      ? 'bg-[#ede3cc] border-[#d8c8a8]'
      : theme === 'light'
      ? 'bg-white border-slate-200 shadow-xl'
      : 'bg-[#09172e]/90 border-[#264878]/30';

  const textSizeClass =
    fontSize === 'sm'
      ? 'text-base leading-relaxed'
      : fontSize === 'lg'
      ? 'text-xl leading-[2.1]'
      : fontSize === 'xl'
      ? 'text-2xl leading-[2.3]'
      : 'text-lg leading-[1.9]';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-3 sm:p-6 md:p-8 animate-fadeIn">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${themeContainerClasses}`}
      >
        {/* Sticky Reader Controls Header */}
        <div
          className={`sticky top-0 z-20 px-4 md:px-8 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 backdrop-blur-md ${themeCardClasses}`}
        >
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-sm tracking-wide">Story Reader</span>
            <span className="text-xs opacity-60">·</span>
            <span className="text-xs opacity-80">{words} words (~{readMinutes} min)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Narration Controls */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-black/10 text-xs">
              <button
                onClick={handlePlayPause}
                className="p-1 rounded hover:bg-black/20 transition-colors flex items-center gap-1 font-medium"
                title={isPlaying ? 'Pause Narration' : 'Play Narration'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-500" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Listen'}</span>
              </button>
              {isPlaying && (
                <button
                  onClick={handleStopSpeech}
                  className="p-1 rounded hover:bg-black/20 text-red-400"
                  title="Stop"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-xs font-semibold">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 rounded ${fontSize === 'sm' ? 'bg-black/30 font-bold' : 'opacity-60'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-1.5 rounded ${fontSize === 'md' ? 'bg-black/30 font-bold' : 'opacity-60'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 rounded ${fontSize === 'lg' ? 'bg-black/30 font-bold' : 'opacity-60'}`}
              >
                A+
              </button>
            </div>

            {/* Reading Themes */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-xs">
              <button
                onClick={() => setTheme('dark')}
                title="Cosmic Dark"
                className={`w-5 h-5 rounded-full bg-[#06101f] border transition-transform ${
                  theme === 'dark' ? 'scale-115 border-cyan-400' : 'border-transparent'
                }`}
              />
              <button
                onClick={() => setTheme('sepia')}
                title="Warm Sepia"
                className={`w-5 h-5 rounded-full bg-[#f4ecd8] border transition-transform ${
                  theme === 'sepia' ? 'scale-115 border-amber-600' : 'border-transparent'
                }`}
              />
              <button
                onClick={() => setTheme('light')}
                title="Paper White"
                className={`w-5 h-5 rounded-full bg-white border transition-transform ${
                  theme === 'light' ? 'scale-115 border-slate-400' : 'border-transparent'
                }`}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/20 opacity-80 hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Manuscript Body */}
        <div className="p-6 md:p-12 lg:p-16 max-w-3xl mx-auto w-full space-y-8">
          {/* Cover Art Banner if available */}
          {story.coverImage && (
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-black/10">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full max-h-96 object-cover"
              />
              {story.imagePrompt && (
                <div className="p-3 text-xs opacity-75 italic text-center border-t border-black/10 bg-black/5">
                  “{story.imagePrompt}”
                </div>
              )}
            </div>
          )}

          {/* Story Heading */}
          <div className="text-center space-y-2 border-b pb-6 border-current/10">
            <span className="text-xs uppercase tracking-[0.25em] opacity-60 font-semibold">
              {story.genre} · {story.tone}
            </span>
            <h1 className="font-editorial text-3xl md:text-5xl font-bold tracking-tight">
              {story.title || 'Untitled Manuscript'}
            </h1>
          </div>

          {/* Formatted Markdown Reader Content */}
          <div className={`font-editorial ${textSizeClass} whitespace-pre-wrap break-words space-y-6`}>
            {story.content}
          </div>

          {/* Book Ending Marker */}
          <div className="pt-12 text-center border-t border-current/10 space-y-2">
            <div className="text-xl opacity-60">⁂</div>
            <p className="text-xs opacity-60 tracking-widest uppercase font-sans">End of Scene</p>
          </div>
        </div>
      </div>
    </div>
  );
};
