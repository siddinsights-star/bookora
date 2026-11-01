import React from 'react';
import { ViewTab, UserProfile } from '../types';
import { BookOpen, Feather, Image as ImageIcon, Plus, Sparkles, Maximize2, User, Cloud } from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onNewStory: () => void;
  onToggleFocus: () => void;
  onOpenProfile: () => void;
  onOpenAbout: () => void;
  user: UserProfile;
  storyCount: number;
  isFirebaseConnected?: boolean;
  isFirebaseSyncing?: boolean;
  onQuickGoogleSignIn?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNewStory,
  onToggleFocus,
  onOpenProfile,
  onOpenAbout,
  user,
  isFirebaseConnected = false,
  isFirebaseSyncing = false,
  onQuickGoogleSignIn,
}) => {
  return (
    <header className="sticky top-0 z-40 h-[72px] px-4 md:px-8 bg-[#050c18]/90 backdrop-blur-xl border-b border-[#325a96]/20 flex items-center justify-between gap-8 transition-colors">
      {/* Zone 1: Wordmark - BOOKORA / Book Creation Studio */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('editor')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-cyan-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-0.5">
              BOOK<span className="text-cyan-400">ORA</span>
            </span>
            <span className="text-[9px] tracking-[0.2em] font-semibold text-slate-400 uppercase -mt-0.5">
              Book Creation Studio
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: 4 Clean Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <button
          onClick={() => onSelectTab('editor')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            currentTab === 'editor'
              ? 'text-cyan-300 border-cyan-400 font-semibold'
              : 'text-slate-300 hover:text-white border-transparent'
          }`}
        >
          <Feather className="w-4 h-4" />
          <span>Story Editor</span>
        </button>

        <button
          onClick={() => onSelectTab('library')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            currentTab === 'library'
              ? 'text-cyan-300 border-cyan-400 font-semibold'
              : 'text-slate-300 hover:text-white border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Library</span>
        </button>

        <button
          onClick={() => onSelectTab('director')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            currentTab === 'director'
              ? 'text-cyan-300 border-cyan-400 font-semibold'
              : 'text-slate-300 hover:text-white border-transparent'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Scene Director</span>
        </button>

        <button
          onClick={() => onSelectTab('reader')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            currentTab === 'reader'
              ? 'text-cyan-300 border-cyan-400 font-semibold'
              : 'text-slate-300 hover:text-white border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Book Reader</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action + Focus & Profile quick actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleFocus}
          title="Distraction-Free Focus Mode"
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-[#3b629b]/30 bg-[#0d1e38]/70 text-slate-300 hover:text-cyan-300 hover:bg-[#142b4d] transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Firebase Live Status & Connect Button */}
        {isFirebaseConnected ? (
          <button
            onClick={onOpenProfile}
            title={`Firebase Connected (${user.email || 'Cloud Vault'}) - Click to manage`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-[#081f2c] text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-[#0c2e42] transition-all text-xs cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.18)]"
          >
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isFirebaseSyncing ? 'animate-ping' : 'shadow-[0_0_6px_#34d399]'}`} />
            <span className="hidden sm:inline font-semibold">Firebase Live</span>
          </button>
        ) : (
          <button
            onClick={onQuickGoogleSignIn || onOpenProfile}
            title="Connect Firebase Firestore & Cloud Backup"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-[#1e1708] text-amber-300 hover:text-white hover:border-amber-400 hover:bg-[#2e230c] transition-all text-xs cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.18)] animate-pulse"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-semibold">Connect Firebase</span>
          </button>
        )}

        {/* User Account & Cloud Sync button */}
        <button
          onClick={onOpenProfile}
          title={`Signed in as ${user.name} - Cloud Storage`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#3b629b]/30 bg-[#0d1e38]/70 text-slate-300 hover:text-cyan-300 hover:bg-[#142b4d] transition-colors cursor-pointer text-xs"
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline font-medium">{user.name.split(' ')[0]}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </button>

        {/* About & Creator Credits button */}
        <button
          onClick={onOpenAbout}
          title="About BOOKORA & Creator Credits"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-[#0c1f3b] text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-[#122e57] transition-all text-xs cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-medium">Credits</span>
        </button>

        <button
          onClick={onNewStory}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-lg hover:brightness-110 active:scale-95 shadow-md shadow-blue-600/30 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Story</span>
        </button>
      </div>
    </header>
  );
};
