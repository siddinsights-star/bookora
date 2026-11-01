import React from 'react';
import { Sparkles, ChevronUp, ChevronDown, Compass, Feather, BookMarked } from 'lucide-react';

interface HeroBannerProps {
  storyCount: number;
  totalWords: number;
  illustratedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectPromptSeed: (seed: string, genre: string, tone: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  storyCount,
  totalWords,
  illustratedCount,
  isCollapsed,
  onToggleCollapse,
  onSelectPromptSeed,
}) => {
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between px-6 py-2 bg-[#09152a]/60 border-b border-[#254373]/20 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 font-semibold tracking-wider text-[11px] uppercase">
            Bookora Studio Active
          </span>
          <span className="text-slate-500">·</span>
          <span>{storyCount} Stories in Library</span>
          <span className="text-slate-500">·</span>
          <span>{totalWords.toLocaleString()} Words Crafted</span>
          <span className="hidden md:inline text-slate-500">·</span>
          <span className="hidden md:inline text-[11px] text-cyan-300/90">
            Created by <strong className="text-white font-semibold">Siddee Insights</strong> &ndash; Web Creator
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <span>Expand overview</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-[#2a4d80]/20 bg-gradient-to-b from-[#0a172e] via-[#081326] to-[#050c18] px-6 py-8 md:py-10">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left narrative content */}
        <div className="flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
              <span>Bookora Book Creation Studio</span>
            </div>
            <span className="hidden sm:inline text-slate-600">·</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0b1e38]/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <span>Created by</span>
              <strong className="text-white font-semibold">Siddee Insights</strong>
              <span className="text-cyan-400">&ndash;</span>
              <span className="text-slate-300">Web Creator</span>
            </div>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-3 max-w-2xl" style={{ textWrap: 'balance' }}>
            Stories start here.{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Worlds come alive.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed mb-6 font-normal">
            Author your next great book. Build fantasy worlds, lock consistent character faces, generate chapter artwork, and export to professional PDF and EPUB with Bookora Studio.
          </p>

          {/* Quick Idea Sparks */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Quick Sparks:
            </span>
            <button
              onClick={() => onSelectPromptSeed(
                'A young cartographer finds an unmapped island that appears only during lunar eclipses, carrying ancient ruins and whispering tides.',
                'Fantasy',
                'Cinematic'
              )}
              className="text-xs px-2.5 py-1 rounded-md bg-[#102444] border border-[#2b5185]/40 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-[#16325c] transition-colors"
            >
              The Eclipse Island
            </button>
            <button
              onClick={() => onSelectPromptSeed(
                'A lone orbital mechanic receives a distress Morse signal transmitting from inside an abandoned comet from 1899.',
                'Science Fiction',
                'Suspenseful'
              )}
              className="text-xs px-2.5 py-1 rounded-md bg-[#102444] border border-[#2b5185]/40 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-[#16325c] transition-colors"
            >
              Signal in the Comet
            </button>
            <button
              onClick={() => onSelectPromptSeed(
                'A clockwork tea shop in Victorian London where the tea blends allow patrons to revisit five minutes of their past memories.',
                'Steampunk',
                'Emotional'
              )}
              className="text-xs px-2.5 py-1 rounded-md bg-[#102444] border border-[#2b5185]/40 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-[#16325c] transition-colors"
            >
              Memory Tea Parlor
            </button>
          </div>
        </div>

        {/* Right side: Studio Metrics + Revolving Cosmic Orb */}
        <div className="flex items-center gap-8 lg:gap-12 shrink-0">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 rounded-xl bg-[#0b1b36]/80 border border-[#294c7e]/30 shadow-xl backdrop-blur-md">
            <div className="flex flex-col items-center px-3 py-1 text-center">
              <div className="flex items-center gap-1 text-cyan-400 text-xs mb-1">
                <BookMarked className="w-3.5 h-3.5" />
                <span>Stories</span>
              </div>
              <span className="font-display text-xl font-bold text-white tabular-nums">{storyCount}</span>
            </div>

            <div className="flex flex-col items-center px-3 py-1 text-center border-x border-[#254270]/40">
              <div className="flex items-center gap-1 text-blue-400 text-xs mb-1">
                <Feather className="w-3.5 h-3.5" />
                <span>Words</span>
              </div>
              <span className="font-display text-xl font-bold text-white tabular-nums">
                {totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
              </span>
            </div>

            <div className="flex flex-col items-center px-3 py-1 text-center">
              <div className="flex items-center gap-1 text-purple-400 text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Art</span>
              </div>
              <span className="font-display text-xl font-bold text-white tabular-nums">{illustratedCount}</span>
            </div>
          </div>

          {/* User's signature rotating Hero Orb */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(30,130,240,0.25)] shrink-0">
            {/* Outer spinning ring */}
            <div className="absolute inset-2 border border-dashed border-cyan-400/60 rounded-full animate-slow-spin" />
            <div className="text-3xl md:text-4xl text-cyan-300 drop-shadow-[0_0_20px_#4ae0ff]">✧</div>
            <div className="absolute -bottom-6 text-center font-display text-[9px] font-bold tracking-[0.2em] text-cyan-200 uppercase whitespace-nowrap">
              Dream in Stories
            </div>
          </div>
        </div>
      </div>

      {/* Collapse control */}
      <button
        onClick={onToggleCollapse}
        className="absolute bottom-2 right-6 text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
      >
        <span>Collapse</span>
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    </section>
  );
};
