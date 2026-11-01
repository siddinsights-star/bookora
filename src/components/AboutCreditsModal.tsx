import React from 'react';
import { X, Sparkles, BookOpen, Award, CheckCircle2, Globe, Palette, ShieldCheck, Layers, Feather } from 'lucide-react';

interface AboutCreditsModalProps {
  onClose: () => void;
}

export const AboutCreditsModal: React.FC<AboutCreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#08152a] border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.18)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#213f68]/40 bg-[#061122] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white tracking-wide">
                  BOOK<span className="text-cyan-400">ORA</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 border border-cyan-400/30 text-cyan-300">
                  v2.5 Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Book & Magazine Design Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Creator Credit Hero Card */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#0c2242] via-[#091a33] to-[#061124] border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-semibold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Creator Credit</span>
                </div>

                <h4 className="text-lg md:text-xl font-display font-bold text-white pt-1">
                  Created by <span className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4">Siddee Insights</span> – Web Creator
                </h4>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-lg pt-0.5">
                  Designed and developed by <strong className="text-white font-semibold">Siddee Insights</strong> as the lead <strong className="text-cyan-300 font-semibold">Web Creator</strong> for the next generation of creative writers, novelists, and magazine publishers.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-xl bg-[#051122]/90 border border-cyan-500/30 shrink-0 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Role</span>
                <span className="text-xs font-semibold text-cyan-300 whitespace-nowrap mt-0.5">Web Creator</span>
                <span className="text-[11px] font-bold text-white whitespace-nowrap mt-0.5">Siddee Insights</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#224470]/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-slate-300">
                  <strong className="text-white">Web Creator:</strong> <span className="text-cyan-300 font-medium">Siddee Insights</span>
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Official Production Release &middot; BOOKORA Studio
              </span>
            </div>
          </div>

          {/* About BOOKORA Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>About BOOKORA</span>
            </h4>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">BOOKORA</strong> (Book Creation Studio) is a professional creative environment built for authors, world-builders, and magazine designers. It unites advanced AI narrative continuation, automatic scene-to-illustration rendering, consistent character visualization, and multi-language typography into a distraction-free studio.
            </p>
          </div>

          {/* Key Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#061224] border border-[#213f68]/40 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Scene-to-Image Illustrator</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically scans chapters, identifies crucial visual beats, and inserts custom AI artwork seamlessly into the story layout.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#061224] border border-[#213f68]/40 space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <Globe className="w-3.5 h-3.5" />
                <span>Multi-Language Narrative</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Native typography and full RTL support for English, Malayalam, Arabic, Urdu, and Kannada.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#061224] border border-[#213f68]/40 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Palette className="w-3.5 h-3.5" />
                <span>Consistent Character Profiles</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Maintain visual consistency across chapters with character profile anchors, face archetypes, and wardrobe tags.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#061224] border border-[#213f68]/40 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Layers className="w-3.5 h-3.5" />
                <span>PDF & EPUB Publication</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Export beautifully typeset books, complete with cover spreads, table of contents, and responsive illustration flow.
              </p>
            </div>
          </div>

          {/* Credits Summary Footer */}
          <div className="p-4 rounded-xl bg-[#05101f] border border-[#203c62]/40 text-center space-y-1.5">
            <div className="text-xs text-slate-400">
              Platform Brand:{' '}
              <span className="text-white font-bold tracking-wide">BOOKORA</span> &middot;{' '}
              <span className="text-slate-300">Book & Magazine Design Studio</span>
            </div>
            <div className="text-xs text-cyan-300 font-medium">
              Created by <span className="font-bold text-cyan-400">Siddee Insights</span> &ndash; Web Creator
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#213f68]/40 bg-[#061122] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} BOOKORA. All rights reserved.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
