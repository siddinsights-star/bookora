import React, { useState } from 'react';
import { BookCoverConfig, Story } from '../types';
import { X, Sparkles, Image as ImageIcon, Download, Check, Palette, Type, Wand2 } from 'lucide-react';

interface BookCoverGeneratorModalProps {
  story: Story;
  onClose: () => void;
  onSaveCover: (coverConfig: BookCoverConfig, coverImageUrl?: string) => void;
}

export const BookCoverGeneratorModal: React.FC<BookCoverGeneratorModalProps> = ({
  story,
  onClose,
  onSaveCover,
}) => {
  const [title, setTitle] = useState(story.coverConfig?.title || story.title || 'Untitled Book');
  const [subtitle, setSubtitle] = useState(story.coverConfig?.subtitle || 'A Bookora Original Story');
  const [author, setAuthor] = useState(story.coverConfig?.author || story.author || 'Author Name');
  const [tagline, setTagline] = useState(story.coverConfig?.tagline || 'In a realm where stars whisper secrets...');
  const [coverStyle, setCoverStyle] = useState<BookCoverConfig['coverStyle']>(
    story.coverConfig?.coverStyle || 'Epic Fantasy'
  );
  const [accentColor, setAccentColor] = useState(story.coverConfig?.accentColor || '#38bdf8');
  const [fontFamily, setFontFamily] = useState(story.coverConfig?.fontFamily || 'Cinzel');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    story.coverConfig?.coverImageUrl || story.coverImage || '/src/assets/images/story_celestial_library_1793523868966.jpg'
  );
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState(false);
  const [artPrompt, setArtPrompt] = useState('');

  // AI Cover Art Generator
  const handleGenerateCoverArtwork = async () => {
    setIsGeneratingArtwork(true);
    try {
      // 1. Direct cover art prompt
      const planRes = await fetch('/api/cover/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          author,
          genre: story.genre,
          coverStyle,
          storyContext: story.content,
        }),
      });

      const planData = await planRes.json();
      const promptToUse =
        planData.coverPlan?.artPrompt ||
        `${title}, book cover background illustration in ${coverStyle} style, dramatic central motif, 8k cinematic art, high quality`;

      setArtPrompt(promptToUse);

      // 2. Generate artwork
      const imgRes = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio: '3:4',
        }),
      });

      const imgData = await imgRes.json();
      if (!imgRes.ok) throw new Error(imgData.error || 'Failed to generate cover art.');

      setCoverImageUrl(imgData.imageUrl);
    } catch (err: any) {
      alert(err.message || 'Artwork generation notice. Using preset showcase cover art.');
      setCoverImageUrl('/src/assets/images/story_clockwork_sea_1793523869882.jpg');
    } finally {
      setIsGeneratingArtwork(false);
    }
  };

  const handleApplyCover = () => {
    const config: BookCoverConfig = {
      title,
      subtitle,
      author,
      tagline,
      coverStyle,
      coverImageUrl,
      accentColor,
      fontFamily,
    };
    onSaveCover(config, coverImageUrl);
    onClose();
  };

  const isRTL = story.language === 'ar' || story.language === 'ur';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">AI Book Cover Generator</h3>
              <p className="text-xs text-slate-400">Design commercial-grade book covers with custom typography and AI artwork</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid: Controls (Left) vs Live Cover Preview (Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="lg:col-span-6 p-6 overflow-y-auto space-y-4 border-r border-[#254877]/30 bg-[#06101f]">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Book Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Subtitle / Series
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tagline / Teaser
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Cover Style & Typography */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cover Style
                </label>
                <select
                  value={coverStyle}
                  onChange={(e) => setCoverStyle(e.target.value as any)}
                  className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Epic Fantasy">Epic Fantasy</option>
                  <option value="Cinematic Noir">Cinematic Noir</option>
                  <option value="Gilded Classic">Gilded Classic</option>
                  <option value="Minimalist Modern">Minimalist Modern</option>
                  <option value="Vintage Graphic">Vintage Graphic</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Title Font
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Cinzel">Cinzel (Regal Serif)</option>
                  <option value="Playfair Display">Playfair Display (Literary)</option>
                  <option value="Space Grotesk">Space Grotesk (Modern)</option>
                  <option value="Amiri">Amiri (Arabic & Urdu)</option>
                  <option value="Noto Sans Malayalam">Noto Sans Malayalam</option>
                </select>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Accent Highlight Color
              </label>
              <div className="flex items-center gap-2">
                {['#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#10b981', '#f43f5e', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      accentColor === color ? 'scale-125 border-white shadow-md' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Generate Artwork Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateCoverArtwork}
                disabled={isGeneratingArtwork}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50"
              >
                <Wand2 className={`w-4 h-4 ${isGeneratingArtwork ? 'animate-spin' : ''}`} />
                <span>{isGeneratingArtwork ? 'Painting Cover Artwork...' : '✦ Generate AI Cover Artwork (3:4)'}</span>
              </button>
            </div>

            {/* Quick Preset Background Artwork */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or Pick from Studio Gallery
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  '/src/assets/images/story_celestial_library_1793523868966.jpg',
                  '/src/assets/images/story_forest_whisper_1793523869337.jpg',
                  '/src/assets/images/story_cyber_drifter_1793523869513.jpg',
                  '/src/assets/images/story_clockwork_sea_1793523869882.jpg',
                ].map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setCoverImageUrl(url)}
                    className={`h-16 rounded-lg overflow-hidden cursor-pointer border transition-all ${
                      coverImageUrl === url ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-slate-700/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Cover Preview Container */}
          <div className="lg:col-span-6 p-6 flex flex-col items-center justify-center bg-[#071325]">
            <div className="relative w-72 sm:w-80 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#3b679d]/40 flex flex-col justify-between p-6 select-none group">
              {/* Cover Background Image */}
              <img
                src={coverImageUrl}
                alt="Book Cover"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Atmospheric Scrim Gradients */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/90 pointer-events-none" />

              {/* Top Typography Zone */}
              <div className="relative z-10 text-center space-y-1">
                <span
                  style={{ color: accentColor }}
                  className="text-[9px] font-bold tracking-[0.3em] uppercase block drop-shadow-md"
                >
                  BOOKORA EDITIONS &middot; {coverStyle.toUpperCase()}
                </span>
                {subtitle && (
                  <div className="text-[11px] text-slate-200/90 italic font-editorial drop-shadow">
                    {subtitle}
                  </div>
                )}
                <h1
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={{ fontFamily }}
                  className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                >
                  {title}
                </h1>
              </div>

              {/* Bottom Typography Zone */}
              <div className="relative z-10 text-center space-y-2">
                {tagline && (
                  <p className="text-[10px] text-slate-300 italic max-w-xs mx-auto drop-shadow">
                    &ldquo;{tagline}&rdquo;
                  </p>
                )}
                <div className="w-12 h-0.5 mx-auto opacity-60" style={{ backgroundColor: accentColor }} />
                <div
                  style={{ color: accentColor }}
                  className="font-display text-sm font-bold tracking-[0.2em] uppercase drop-shadow-md"
                >
                  {author}
                </div>
              </div>
            </div>

            {/* Set as Cover Button */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleApplyCover}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-95 shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save as Story Book Cover</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
