import React, { useState } from 'react';
import { ArtStyle, Story } from '../types';
import {
  Sparkles,
  Image as ImageIcon,
  Zap,
  Wand2,
  ArrowRight,
  Download,
  Check,
  RefreshCw,
  Compass,
  Layers,
  Sliders,
  ExternalLink,
  Plus
} from 'lucide-react';

interface ToolsPanelProps {
  story: Story;
  onApplyGeneratedStory: (newText: string, suggestedTitle?: string) => void;
  onAppendContinuation: (continuation: string) => void;
  onAttachCoverImage: (imageUrl: string, prompt: string) => void;
  onInsertImageIntoContent: (markdownImage: string) => void;
  activeDirectorScene: string;
  onClearDirectorScene: () => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  story,
  onApplyGeneratedStory,
  onAppendContinuation,
  onAttachCoverImage,
  onInsertImageIntoContent,
  activeDirectorScene,
  onClearDirectorScene,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'image' | 'twists'>('generate');

  // Generator form state
  const [idea, setIdea] = useState('');
  const [genre, setGenre] = useState(story.genre || 'Fantasy');
  const [tone, setTone] = useState(story.tone || 'Cinematic');
  const [length, setLength] = useState('Short');
  const [characters, setCharacters] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isContinuingStory, setIsContinuingStory] = useState(false);

  // Image Lab state
  const [sceneText, setSceneText] = useState(activeDirectorScene || '');
  const [artStyle, setArtStyle] = useState<ArtStyle>('cinematic digital storybook illustration');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '3:4'>('16:9');
  const [visualPrompt, setVisualPrompt] = useState('');
  const [isDirectingPrompt, setIsDirectingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(story.coverImage || null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Plot twists state
  const [isGeneratingTwists, setIsGeneratingTwists] = useState(false);
  const [twists, setTwists] = useState<{ headline: string; description: string; snippet?: string }[]>([]);

  // Synchronize active director scene when passed from parent
  React.useEffect(() => {
    if (activeDirectorScene) {
      setSceneText(activeDirectorScene);
      setActiveTab('image');
    }
  }, [activeDirectorScene]);

  // 1. Generate Story
  const handleGenerateStory = async () => {
    if (!idea.trim()) {
      alert('Please enter a story idea or concept first.');
      return;
    }

    setIsGeneratingStory(true);
    try {
      const charNames = story.characters && story.characters.length > 0
        ? story.characters.map((c) => `${c.name} (${c.role}): ${c.visualAnchorPrompt || c.appearance}`).join('; ')
        : characters;

      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          genre,
          tone,
          length,
          characters: charNames,
          language: story.language || 'en',
          worldContext: story.worldLore?.worldName ? `${story.worldLore.worldName} (${story.worldLore.theme})` : '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate story.');

      onApplyGeneratedStory(data.story, data.title);
    } catch (err: any) {
      alert(err.message || 'Error creating story.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // 2. Continue Story
  const handleContinueStory = async () => {
    if (!story.content.trim()) {
      alert('Write or generate some story content before asking AI to continue.');
      return;
    }

    setIsContinuingStory(true);
    try {
      const charAnchors = story.characters?.map((c) => c.visualAnchorPrompt).filter(Boolean).join('; ');
      const res = await fetch('/api/story/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStory: story.content,
          direction: idea ? `Head in this direction: ${idea}` : '',
          charactersContext: charAnchors,
          language: story.language || 'en',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to continue story.');

      onAppendContinuation(data.continuation);
    } catch (err: any) {
      alert(err.message || 'Error continuing story.');
    } finally {
      setIsContinuingStory(false);
    }
  };

  // 3. Direct Visual Scene Prompt
  const handleDirectScenePrompt = async () => {
    if (!story.content.trim() && !sceneText.trim()) {
      alert('Please write some story text or specify a scene.');
      return;
    }

    setIsDirectingPrompt(true);
    setImageError(null);
    try {
      const charAnchors = story.characters?.map((c) => c.visualAnchorPrompt).filter(Boolean).join('; ');
      const res = await fetch('/api/image/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: story.content,
          scene: sceneText,
          style: artStyle,
          characterAnchors: charAnchors,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to direct scene prompt.');

      setVisualPrompt(data.prompt);
    } catch (err: any) {
      setImageError(err.message || 'Could not direct scene.');
    } finally {
      setIsDirectingPrompt(false);
    }
  };

  // 4. Generate Scene Image
  const handleGenerateImage = async () => {
    const promptToUse = visualPrompt.trim() || sceneText.trim() || `${story.title}, ${story.genre} scene in ${artStyle}`;
    if (!promptToUse) {
      alert('Please enter or direct a visual prompt first.');
      return;
    }

    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image.');

      setGeneratedImage(data.imageUrl);
      onAttachCoverImage(data.imageUrl, promptToUse);
    } catch (err: any) {
      // In case image generation quota or paid tier isn't configured, provide helpful status and fallback
      setImageError(err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 5. Brainstorm Plot Twists
  const handleBrainstormTwists = async () => {
    if (!story.content.trim()) {
      alert('Write some story content first so AI can tailor twists to your characters and world.');
      return;
    }

    setIsGeneratingTwists(true);
    try {
      const res = await fetch('/api/story/twist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStory: story.content,
          genre: story.genre,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate twists.');

      setTwists(data.twists || []);
    } catch (err: any) {
      alert(err.message || 'Error generating plot twists.');
    } finally {
      setIsGeneratingTwists(false);
    }
  };

  // Curated Preset Scene Gallery for instant testing
  const PRESET_GALLERY = [
    {
      title: 'Celestial Archive',
      url: '/src/assets/images/story_celestial_library_1793523868966.jpg',
      prompt: 'A mysterious girl holding a glowing blue lantern discovers a hidden doorway of starlight between ancient bookshelves in an arcane library',
    },
    {
      title: 'Moss Golem',
      url: '/src/assets/images/story_forest_whisper_1793523869337.jpg',
      prompt: 'A gentle moss-covered stone forest creature leaning down to offer a glowing bioluminescent flower to a young traveler in an enchanted woodland',
    },
    {
      title: 'Neo-Kyoto Drift',
      url: '/src/assets/images/story_cyber_drifter_1793523869513.jpg',
      prompt: 'A wanderer in a hooded coat on a rain-soaked rooftop overlooking a futuristic megacity with neon lights and flying airships',
    },
    {
      title: 'Clockwork Sea',
      url: '/src/assets/images/story_clockwork_sea_1793523869882.jpg',
      prompt: 'A majestic vintage brass clockwork vessel cutting through bioluminescent turquoise ocean waves under twin moons',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a172c]/90 border border-[#2b4d7e]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Segmented Control Tabs */}
      <div className="p-2 border-b border-[#294c7e]/20 bg-[#071325]/70 grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'generate'
              ? 'bg-[#183968] text-cyan-300 shadow-md border border-cyan-400/30'
              : 'text-slate-400 hover:text-white hover:bg-[#112444]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate">Story Gen</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'image'
              ? 'bg-[#183968] text-purple-300 shadow-md border border-purple-400/30'
              : 'text-slate-400 hover:text-white hover:bg-[#112444]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          <span className="truncate">Image Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('twists')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'twists'
              ? 'bg-[#183968] text-amber-300 shadow-md border border-amber-400/30'
              : 'text-slate-400 hover:text-white hover:bg-[#112444]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">Plot Twists</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
        {/* TAB 1: STORY GENERATOR */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                  Story Premise & Hook
                </label>
                <span className="text-[10px] text-cyan-400 font-medium">Gemini 3.8 Flash</span>
              </div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="A girl discovers a hidden door in an ancient library that leads to an uncharted realm of stars..."
                rows={3}
                className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Try an idea starter:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIdea('A clockwork diver descends into a glowing subterranean ocean where sunken galleons are powered by captured starlight.');
                    setGenre('Steampunk');
                    setTone('Cinematic');
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-[#102444] text-slate-300 hover:text-white hover:bg-[#183968] border border-[#2b5286]/30 transition-colors"
                >
                  Sunken Starlight
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdea('A memory archivist in a neon metropolis who buys and sells people\'s happiest forgotten moments discovers her own erased childhood.');
                    setGenre('Cyberpunk');
                    setTone('Emotional');
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-[#102444] text-slate-300 hover:text-white hover:bg-[#183968] border border-[#2b5286]/30 transition-colors"
                >
                  Erased Memory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdea('An ancient stone golem wakes up after 500 years because a tiny bird built a nest inside its hollow granite heart.');
                    setGenre('Fairy Tale');
                    setTone('Wholesome');
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-[#102444] text-slate-300 hover:text-white hover:bg-[#183968] border border-[#2b5286]/30 transition-colors"
                >
                  The Golem's Nest
                </button>
              </div>
            </div>

            {/* Genre & Length grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Fantasy">Fantasy</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Steampunk">Steampunk</option>
                  <option value="Fairy Tale">Fairy Tale</option>
                  <option value="Gothic Horror">Gothic Horror</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1">
                  Story Scope
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Flash">Flash Fiction (~250 words)</option>
                  <option value="Short">Short Story (~600 words)</option>
                  <option value="Medium">Medium Story (~1000 words)</option>
                  <option value="Epic Chapter">Epic Chapter (~1500 words)</option>
                </select>
              </div>
            </div>

            {/* Writing Tone & Key Characters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1">
                  Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Cinematic">Cinematic</option>
                  <option value="Lyrical & Poetic">Lyrical & Poetic</option>
                  <option value="Gritty & Noir">Gritty & Noir</option>
                  <option value="Suspenseful">Suspenseful</option>
                  <option value="Emotional & Deep">Emotional & Deep</option>
                  <option value="Wholesome & Cozy">Wholesome & Cozy</option>
                  <option value="Epic & Mythic">Epic & Mythic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1">
                  Characters (Optional)
                </label>
                <input
                  type="text"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="e.g. Captain Vance, Mara"
                  className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleGenerateStory}
                disabled={isGeneratingStory}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                <Wand2 className={`w-4 h-4 ${isGeneratingStory ? 'animate-spin' : ''}`} />
                <span>{isGeneratingStory ? 'Weaving Story...' : '✦ Generate New Story'}</span>
              </button>

              <button
                type="button"
                onClick={handleContinueStory}
                disabled={isContinuingStory || !story.content.trim()}
                className="w-full py-2 px-4 rounded-xl font-medium text-xs text-slate-200 bg-[#122749] border border-[#2b5185]/40 hover:bg-[#183968] hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowRight className={`w-4 h-4 ${isContinuingStory ? 'animate-bounce' : ''}`} />
                <span>{isContinuingStory ? 'Writing Next Scene...' : '⤓ Continue Story / Next Scene'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMAGE LAB & SCENE DIRECTOR */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                  Target Scene to Illustrate
                </label>
                {sceneText && (
                  <button
                    onClick={() => {
                      setSceneText('');
                      onClearDirectorScene();
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <textarea
                value={sceneText}
                onChange={(e) => setSceneText(e.target.value)}
                placeholder="Leave blank for AI to choose the most cinematic scene from your story, or specify a moment (e.g. 'Mara discovering the glowing doorway in the library')..."
                rows={2}
                className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1">
                  Art Style
                </label>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                  className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="cinematic digital storybook illustration">Storybook Illustration</option>
                  <option value="anime-inspired illustration">Ghibli / Anime Watercolor</option>
                  <option value="realistic cinematic concept art">Realistic Concept Art</option>
                  <option value="classic fantasy oil painting">Classic Fantasy Oil</option>
                  <option value="dark graphic novel and comic art">Graphic Novel / Comic</option>
                  <option value="cyberpunk neon concept art">Cyberpunk Neon</option>
                  <option value="watercolor children's book art">Watercolor Whimsical</option>
                  <option value="vintage retro-futuristic sci-fi">Retro Vintage Sci-Fi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="16:9">16:9 Widescreen</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="3:4">3:4 Book Cover</option>
                </select>
              </div>
            </div>

            {/* Step 1: Direct Visual Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Visual Prompt Direction
                </span>
                <button
                  type="button"
                  onClick={handleDirectScenePrompt}
                  disabled={isDirectingPrompt}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isDirectingPrompt ? 'Directing...' : 'Auto-Direct Prompt'}</span>
                </button>
              </div>
              <textarea
                value={visualPrompt}
                onChange={(e) => setVisualPrompt(e.target.value)}
                placeholder="AI directed prompt will appear here, or you can write your own detailed scene composition..."
                rows={3}
                className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Step 2: Generate Artwork Button */}
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50"
            >
              <ImageIcon className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              <span>{isGeneratingImage ? 'Painting Scene Artwork...' : '✧ Generate Scene Illustration'}</span>
            </button>

            {/* Error / Status message if applicable */}
            {imageError && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                <p className="font-semibold mb-1">Notice</p>
                <p className="text-[11px] leading-relaxed opacity-90">{imageError}</p>
                <p className="text-[11px] text-cyan-300 mt-2">
                  You can also pick from the curated Masterpiece Gallery below to instantly attach high-res artwork!
                </p>
              </div>
            )}

            {/* Result Image or Preview */}
            {generatedImage && (
              <div className="space-y-2 p-3 rounded-xl bg-[#081528] border border-[#2b5286]/30">
                <div className="relative rounded-lg overflow-hidden border border-[#2d5891]/40">
                  <img
                    src={generatedImage}
                    alt="Generated scene art"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <a
                      href={generatedImage}
                      download="storynex-artwork.png"
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAttachCoverImage(generatedImage, visualPrompt)}
                    className="flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  >
                    Set as Story Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertImageIntoContent(`\n\n![${story.title || 'Scene Artwork'}](${generatedImage})\n\n`);
                    }}
                    className="flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg bg-[#142a4e] hover:bg-[#1a3866] text-slate-200 border border-[#2b5185]/30 transition-colors"
                  >
                    Insert into Story
                  </button>
                </div>
              </div>
            )}

            {/* Preset Showcase Artwork Gallery */}
            <div className="pt-2 border-t border-[#294c7e]/20">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Studio Masterpiece Gallery
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GALLERY.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setGeneratedImage(item.url);
                      setVisualPrompt(item.prompt);
                      onAttachCoverImage(item.url, item.prompt);
                    }}
                    className="group relative cursor-pointer rounded-lg overflow-hidden border border-[#294c7e]/40 hover:border-cyan-400 transition-all"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[10px] font-semibold text-white leading-tight truncate">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLOT TWISTS & NARRATIVE SPARKS */}
        {activeTab === 'twists' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#081528] border border-[#2a4d7d]/40">
              <div className="flex items-center gap-2 mb-1 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Subvert Expectations</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Stuck at a crossroads? Let AI study your story context and introduce unforeseen plot twists, character revelations, or escalating stakes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBrainstormTwists}
              disabled={isGeneratingTwists || !story.content.trim()}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-900 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isGeneratingTwists ? 'animate-spin' : ''}`} />
              <span>{isGeneratingTwists ? 'Spinning Narrative Webs...' : '⚡ Brainstorm 3 Plot Twists'}</span>
            </button>

            {twists.length > 0 && (
              <div className="space-y-3 pt-2">
                {twists.map((twist, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#08162b] border border-amber-500/20 hover:border-amber-400/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-200">
                        {idx + 1}. {twist.headline}
                      </span>
                      <button
                        onClick={() => {
                          const injection = `\n\n## Unexpected Revelation\n\n> *${twist.headline}*\n\n${twist.description}\n\n`;
                          onAppendContinuation(injection);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Insert
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{twist.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Character sheets */}
            {story.characters && story.characters.length > 0 && (
              <div className="pt-2 border-t border-[#294c7e]/20 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Character Vault
                </span>
                {story.characters.map((char, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#071325] border border-[#2b5185]/30 text-xs">
                    <div className="font-bold text-cyan-300">{char.name}</div>
                    <div className="text-[11px] text-slate-400">{char.role}</div>
                    <div className="text-[11px] text-slate-300 mt-1 italic">{char.visualAnchorPrompt || char.personality || char.appearance}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
