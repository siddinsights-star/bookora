import React, { useState } from 'react';
import { Story, StoryChapter } from '../types';
import { X, Sparkles, Image as ImageIcon, Download, Plus, Trash2, RefreshCw, Check, BookOpen, Layers } from 'lucide-react';

interface ChapterManagerModalProps {
  story: Story;
  onClose: () => void;
  onUpdateChapters: (chapters: StoryChapter[]) => void;
}

export const ChapterManagerModal: React.FC<ChapterManagerModalProps> = ({
  story,
  onClose,
  onUpdateChapters,
}) => {
  const [chapters, setChapters] = useState<StoryChapter[]>(() => {
    if (story.chapters && story.chapters.length > 0) {
      return story.chapters;
    }
    // Parse from markdown headings ## Chapter
    const rawChapters: StoryChapter[] = [];
    const parts = story.content.split(/(?=^##\s+)/gm);
    let chapIndex = 1;

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.trim().split('\n');
      const firstLine = lines[0] || '';
      const title = firstLine.startsWith('#')
        ? firstLine.replace(/^#+\s*/, '').trim()
        : `Chapter ${chapIndex}`;
      const body = lines.slice(firstLine.startsWith('#') ? 1 : 0).join('\n').trim();

      rawChapters.push({
        id: 'chap-' + chapIndex,
        chapterNumber: chapIndex,
        title,
        content: body || part,
        illustrationUrl: chapIndex === 1 ? story.coverImage : undefined,
        wordCount: part.trim().split(/\s+/).length,
      });
      chapIndex++;
    }

    return rawChapters.length > 0
      ? rawChapters
      : [
          {
            id: 'chap-1',
            chapterNumber: 1,
            title: story.title || 'Chapter 1',
            content: story.content,
            illustrationUrl: story.coverImage,
            wordCount: story.wordCount,
          },
        ];
  });

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState<number | null>(null);

  // Auto-detect chapters from backend
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch('/api/story/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: story.content,
          charactersContext: story.characters?.map((c) => c.name).join(', '),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to detect chapters.');

      if (Array.isArray(data.chapters) && data.chapters.length > 0) {
        const detected = data.chapters.map((c: any, i: number) => ({
          id: 'chap-' + (i + 1),
          chapterNumber: c.chapterNumber || i + 1,
          title: c.title || `Chapter ${i + 1}`,
          content: c.summary || '',
          illustrationPrompt: c.visualPrompt || '',
          illustrationUrl: i === 0 ? story.coverImage : undefined,
          wordCount: 150,
        }));
        setChapters(detected);
        onUpdateChapters(detected);
      }
    } catch (err: any) {
      alert(err.message || 'Error detecting chapters.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Generate artwork for a specific chapter
  const handleGenerateChapterArt = async (index: number) => {
    const target = chapters[index];
    if (!target) return;

    setIsGeneratingImg(index);
    try {
      // Build prompt from chapter content + character anchors
      const charAnchor = story.characters?.[0]?.visualAnchorPrompt || '';
      const promptToUse =
        target.illustrationPrompt ||
        `${story.title}, Chapter ${target.chapterNumber}: ${target.title}. ${charAnchor}. Cinematic digital storybook illustration, rich lighting, 8k concept art`;

      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate chapter artwork.');

      const updated = [...chapters];
      updated[index] = {
        ...target,
        illustrationUrl: data.imageUrl,
        illustrationPrompt: promptToUse,
      };
      setChapters(updated);
      onUpdateChapters(updated);
    } catch (err: any) {
      // Fallback gracefully to preset image if paid model quota is reached
      alert(err.message || 'Image generation notice. Fallback art assigned.');
      const fallbackUrl = story.coverImage || '/src/assets/images/story_celestial_library_1793523868966.jpg';
      const updated = [...chapters];
      updated[index] = {
        ...target,
        illustrationUrl: fallbackUrl,
      };
      setChapters(updated);
      onUpdateChapters(updated);
    } finally {
      setIsGeneratingImg(null);
    }
  };

  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const newChap: StoryChapter = {
      id: 'chap-' + Date.now(),
      chapterNumber: nextNum,
      title: `Chapter ${nextNum}: The Next Journey`,
      content: 'Write the chapter content here...',
      wordCount: 0,
    };
    const updated = [...chapters, newChap];
    setChapters(updated);
    setActiveChapterIndex(updated.length - 1);
    onUpdateChapters(updated);
  };

  const handleDeleteChapter = (index: number) => {
    if (chapters.length <= 1) {
      alert('A story must have at least one chapter.');
      return;
    }
    const updated = chapters.filter((_, i) => i !== index);
    setChapters(updated);
    setActiveChapterIndex(Math.max(0, index - 1));
    onUpdateChapters(updated);
  };

  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Chapter-wise AI Image Studio</h3>
              <p className="text-xs text-slate-400">Organize chapters and generate individual chapter scene illustrations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-[#122849] border border-cyan-500/30 hover:bg-[#193a6b] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Detecting Chapters...' : 'Auto-Detect Chapters'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Layout: Chapter Nav Left & Editor/Art Right */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Chapter List */}
          <div className="md:col-span-4 border-r border-[#254877]/30 bg-[#06101f] p-4 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#24426f]/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chapters ({chapters.length})</span>
              <button
                onClick={handleAddChapter}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chapter
              </button>
            </div>

            {chapters.map((chap, i) => (
              <div
                key={chap.id || i}
                onClick={() => setActiveChapterIndex(i)}
                className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${
                  activeChapterIndex === i
                    ? 'bg-[#12274b] border-cyan-400/50 shadow-md'
                    : 'bg-[#091931] border-[#224472]/30 hover:bg-[#0f2240]'
                }`}
              >
                {/* Thumbnail if illustrated */}
                <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-slate-700/50 flex items-center justify-center">
                  {chap.illustrationUrl ? (
                    <img src={chap.illustrationUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                    Chapter {chap.chapterNumber || i + 1}
                  </span>
                  <div className="text-xs font-semibold text-white truncate">{chap.title}</div>
                  <span className="text-[10px] text-slate-400">{chap.wordCount} words</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Active Chapter Details & Illustration */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-5 bg-[#09172d]">
            {activeChapter ? (
              <>
                {/* Chapter Title Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Editing Chapter {activeChapter.chapterNumber}
                    </span>
                    <input
                      type="text"
                      value={activeChapter.title}
                      onChange={(e) => {
                        const updated = [...chapters];
                        updated[activeChapterIndex] = {
                          ...activeChapter,
                          title: e.target.value,
                        };
                        setChapters(updated);
                        onUpdateChapters(updated);
                      }}
                      className="w-full bg-[#061224] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-sm font-display font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteChapter(activeChapterIndex)}
                    title="Delete Chapter"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors mt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Chapter Illustration Spotlight */}
                <div className="p-4 rounded-xl bg-[#071327] border border-[#274d80]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>Chapter Artwork</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {activeChapter.illustrationUrl && (
                        <a
                          href={activeChapter.illustrationUrl}
                          download={`chapter_${activeChapter.chapterNumber}_art.png`}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-[#122849] hover:bg-[#183968] flex items-center gap-1 border border-[#2b5185]/30"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleGenerateChapterArt(activeChapterIndex)}
                        disabled={isGeneratingImg === activeChapterIndex}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isGeneratingImg === activeChapterIndex ? 'animate-spin' : ''}`} />
                        <span>
                          {isGeneratingImg === activeChapterIndex
                            ? 'Painting...'
                            : activeChapter.illustrationUrl
                            ? 'Regenerate Art'
                            : 'Generate Chapter Art'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {activeChapter.illustrationUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#294c7e]/40 max-h-64 bg-black">
                      <img
                        src={activeChapter.illustrationUrl}
                        alt={activeChapter.title}
                        className="w-full h-64 object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl border border-dashed border-[#294c7e]/50 bg-[#06101f] flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs text-slate-400">No artwork generated for this chapter yet</span>
                    </div>
                  )}

                  {/* Chapter Visual Prompt */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Scene Art Prompt Direction
                    </label>
                    <textarea
                      value={activeChapter.illustrationPrompt || ''}
                      onChange={(e) => {
                        const updated = [...chapters];
                        updated[activeChapterIndex] = {
                          ...activeChapter,
                          illustrationPrompt: e.target.value,
                        };
                        setChapters(updated);
                        onUpdateChapters(updated);
                      }}
                      rows={2}
                      placeholder="e.g. Mara stepping through the starlight doorway holding a cobalt lantern, dust motes in purple nebulae..."
                      className="w-full bg-[#061224] border border-[#2b5185]/30 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>
                </div>

                {/* Chapter Manuscript Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Chapter Manuscript
                  </label>
                  <textarea
                    value={activeChapter.content}
                    onChange={(e) => {
                      const updated = [...chapters];
                      updated[activeChapterIndex] = {
                        ...activeChapter,
                        content: e.target.value,
                        wordCount: e.target.value.trim().split(/\s+/).filter(Boolean).length,
                      };
                      setChapters(updated);
                      onUpdateChapters(updated);
                    }}
                    rows={8}
                    className="w-full bg-[#061224] border border-[#2b5185]/40 rounded-xl p-3.5 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-editorial leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">Select a chapter to edit or generate artwork</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
