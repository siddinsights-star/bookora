import React, { useState } from 'react';
import { Story } from '../types';
import {
  Search,
  BookOpen,
  Feather,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  ArrowUpRight
} from 'lucide-react';

interface LibraryViewProps {
  stories: Story[];
  onSelectStory: (id: string) => void;
  onOpenReader: (id: string) => void;
  onDuplicateStory: (id: string) => void;
  onDeleteStory: (id: string) => void;
  onNewStory: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  stories,
  onSelectStory,
  onOpenReader,
  onDuplicateStory,
  onDeleteStory,
  onNewStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const genres = ['All', 'Fantasy', 'Science Fiction', 'Cyberpunk', 'Fairy Tale', 'Steampunk', 'Mystery'];

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === 'All' ||
      story.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 bg-[#0a172c]/80 border border-[#2b4d7e]/30 rounded-2xl backdrop-blur-md">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400 block mb-1">
            Your Creative Archive
          </span>
          <h2 className="font-display text-2xl font-bold text-white">My Library</h2>
          <p className="text-xs text-slate-400 mt-1">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} saved in your private studio archive.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manuscripts..."
              className="w-full bg-[#081529] border border-[#2a4e7e]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={onNewStory}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-xl hover:brightness-110 active:scale-95 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Story</span>
          </button>
        </div>
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedGenre === g
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                : 'text-slate-400 hover:text-white bg-[#0b1b36] border border-[#244270]/20'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid of Stories */}
      {filteredStories.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#09152b]/50 border border-dashed border-[#2b5185]/30 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-display text-lg font-semibold text-slate-200">No stories match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or genre filter, or start weaving a brand new tale.
          </p>
          <button
            onClick={onNewStory}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStories.map((story) => {
            const words = story.content.trim() ? story.content.trim().split(/\s+/).length : 0;
            const readMinutes = Math.max(1, Math.ceil(words / 200));
            const excerpt = story.content
              .replace(/#+\s[^\n]+/g, '')
              .replace(/[*_~`>]/g, '')
              .trim()
              .slice(0, 160);

            return (
              <article
                key={story.id}
                className="group flex flex-col justify-between bg-[#0a172c]/90 border border-[#2b4d7e]/30 hover:border-cyan-400/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Card Cover Art */}
                  <div className="relative h-44 overflow-hidden bg-black/40">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#102547] to-[#081324] flex flex-col items-center justify-center text-slate-500 p-4">
                        <Feather className="w-8 h-8 text-cyan-500/40 mb-2" />
                        <span className="text-xs text-slate-400 font-medium">{story.genre}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a172c] via-transparent to-transparent opacity-90" />
                    
                    {/* Quiet category marker */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
                      {story.genre}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {story.title || 'Untitled Manuscript'}
                    </h3>

                    {/* Clean unboxed metadata with separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="tabular-nums font-medium text-slate-300">{words} words</span>
                      <span aria-hidden="true">·</span>
                      <span>~{readMinutes} min read</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">{story.tone}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                      {excerpt || 'An unwritten story awaiting your imagination...'}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-2 border-t border-[#26436e]/20 flex items-center justify-between gap-2 bg-[#071325]/40">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateStory(story.id)}
                      title="Duplicate Manuscript"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#122747] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${story.title}"?`)) {
                          onDeleteStory(story.id);
                        }
                      }}
                      title="Delete Story"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenReader(story.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-[#112444] border border-[#2b5185]/30 hover:bg-[#183968] transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => onSelectStory(story.id)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
