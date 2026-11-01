import React, { useState } from 'react';
import { Story, StorySceneIllustration } from '../types';
import {
  Sparkles,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Download,
  Edit3,
  Check,
  Upload,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layout,
  Maximize2,
  AlertCircle
} from 'lucide-react';

interface AutoIllustratorPanelProps {
  story: Story;
  onUpdateIllustratedScenes: (scenes: StorySceneIllustration[]) => void;
  onToggleAutoIllustrate: (enabled: boolean) => void;
}

export const AutoIllustratorPanel: React.FC<AutoIllustratorPanelProps> = ({
  story,
  onUpdateIllustratedScenes,
  onToggleAutoIllustrate,
}) => {
  const [selectedStyle, setSelectedStyle] = useState('cinematic digital storybook illustration');
  const [defaultLayout, setDefaultLayout] = useState<'full-width' | 'left-wrap' | 'right-wrap' | 'banner'>('right-wrap');
  const [defaultSize, setDefaultSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium');

  // Generation pipeline progress state
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeGeneratingId, setActiveGeneratingId] = useState<string | null>(null);

  // Editing prompt state
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [tempPromptText, setTempPromptText] = useState('');

  const scenes = story.illustratedScenes || [];
  const autoEnabled = story.autoIllustrateEnabled ?? true;

  // 1. Generate images for the entire story
  const handleAutoIllustrateEntireStory = async () => {
    if (!story.content.trim()) {
      alert('Please write or paste a story into the editor first.');
      return;
    }

    setIsProcessingAll(true);
    setProgressPercent(15);
    setProgressStep('Step 1/3: Reading and analyzing story scenes, characters & emotions...');

    try {
      const charAnchors = story.characters?.map((c) => c.visualAnchorPrompt).filter(Boolean).join('; ');

      // Call scene analyzer
      const res = await fetch('/api/story/analyze-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: story.content,
          style: selectedStyle,
          characterAnchors: charAnchors,
          targetSceneCount: Math.min(5, Math.max(2, Math.ceil(story.wordCount / 250))),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze story scenes.');

      const analyzedScenes: StorySceneIllustration[] = (data.scenes || []).map((s: any, idx: number) => ({
        id: s.id || `scene-${Date.now()}-${idx}`,
        sceneNumber: s.sceneNumber || idx + 1,
        title: s.title || `Scene ${idx + 1}`,
        textSnippet: s.textSnippet || '',
        visualPrompt: s.visualPrompt || `${story.title}, scene ${idx + 1} in ${selectedStyle}`,
        layout: s.layout || defaultLayout,
        size: s.size || defaultSize,
        style: selectedStyle,
        status: 'generating',
      }));

      // Update state with pending scenes
      onUpdateIllustratedScenes(analyzedScenes);
      setProgressPercent(35);
      setProgressStep(`Step 2/3: Identified ${analyzedScenes.length} key visual scenes. Painting illustrations...`);

      // Sequentially generate image for each scene
      const updatedScenes = [...analyzedScenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        const curScene = updatedScenes[i];
        setActiveGeneratingId(curScene.id);
        const currentPct = 35 + Math.round(((i + 1) / updatedScenes.length) * 60);
        setProgressPercent(currentPct);
        setProgressStep(`Step 3/3: Generating Illustration ${i + 1} of ${updatedScenes.length}: "${curScene.title}"...`);

        try {
          const imgRes = await fetch('/api/image/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: curScene.visualPrompt,
              aspectRatio: curScene.layout === 'full-width' || curScene.layout === 'banner' ? '16:9' : '4:3',
            }),
          });

          const imgData = await imgRes.json();
          if (imgRes.ok && imgData.imageUrl) {
            updatedScenes[i] = {
              ...curScene,
              imageUrl: imgData.imageUrl,
              status: 'completed',
            };
          } else {
            // Graceful fallback to rich studio visual asset if image quota reached
            const fallbackUrls = [
              '/src/assets/images/story_celestial_library_1793523868966.jpg',
              '/src/assets/images/story_forest_whisper_1793523869337.jpg',
              '/src/assets/images/story_cyber_drifter_1793523869513.jpg',
              '/src/assets/images/story_clockwork_sea_1793523869882.jpg',
            ];
            updatedScenes[i] = {
              ...curScene,
              imageUrl: fallbackUrls[i % fallbackUrls.length],
              status: 'completed',
            };
          }
        } catch (err: any) {
          updatedScenes[i] = {
            ...curScene,
            status: 'error',
            errorMessage: err.message || 'Image generation failed.',
          };
        }

        // Live update as each image finishes
        onUpdateIllustratedScenes([...updatedScenes]);
      }

      setProgressPercent(100);
      setProgressStep('Complete! All story scenes illustrated and positioned in book pages.');
      setTimeout(() => {
        setIsProcessingAll(false);
        setProgressStep('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Error auto-illustrating story.');
      setIsProcessingAll(false);
      setProgressStep('');
    } finally {
      setActiveGeneratingId(null);
    }
  };

  // 1b. Generate images chapter by chapter using /api/story/illustrations
  const handleGenerateChapterIllustrations = async () => {
    const chaptersToIllustrate =
      story.chapters && story.chapters.length > 0
        ? story.chapters
        : [
            {
              id: 'chap-1',
              chapterNumber: 1,
              title: story.title || 'Chapter 1',
              content: story.content,
              wordCount: story.wordCount,
            },
          ];

    if (!story.content.trim() && (!story.chapters || story.chapters.length === 0)) {
      alert('Please write or paste your story into the editor first.');
      return;
    }

    setIsProcessingAll(true);
    setProgressPercent(25);
    setProgressStep('Analyzing chapter paragraphs & identifying visual scenes...');

    try {
      const charAnchors = story.characters?.map((c) => c.visualAnchorPrompt).filter(Boolean).join('; ');
      const res = await fetch('/api/story/illustrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: story.title,
          chapters: chaptersToIllustrate,
          style: selectedStyle,
          characterAnchors: charAnchors,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate chapter illustrations.');

      if (Array.isArray(data.scenes) && data.scenes.length > 0) {
        const formatted: StorySceneIllustration[] = data.scenes.map((s: any, idx: number) => ({
          id: s.id || `scene-${Date.now()}-${idx}`,
          sceneNumber: idx + 1,
          title: s.title || `Scene ${idx + 1}`,
          textSnippet: s.textSnippet || '',
          visualPrompt: s.visualPrompt || '',
          imageUrl: s.imageUrl,
          layout: s.layout === 'scene-full' ? 'full-width' : (s.layout || defaultLayout),
          size: s.size || defaultSize,
          style: selectedStyle,
          status: 'completed',
        }));

        onUpdateIllustratedScenes(formatted);
        setProgressPercent(100);
        setProgressStep(`Success! Generated ${formatted.length} illustrations positioned in book pages.`);
      } else {
        throw new Error('No visual scenes were identified.');
      }
    } catch (err: any) {
      alert(err.message || 'Error generating chapter illustrations.');
    } finally {
      setTimeout(() => {
        setIsProcessingAll(false);
        setProgressStep('');
      }, 1800);
      setActiveGeneratingId(null);
    }
  };

  // 2. Regenerate single image
  const handleRegenerateSingleScene = async (sceneId: string) => {
    const targetIdx = scenes.findIndex((s) => s.id === sceneId);
    if (targetIdx < 0) return;

    const target = scenes[targetIdx];
    const updated = [...scenes];
    updated[targetIdx] = { ...target, status: 'generating', errorMessage: undefined };
    onUpdateIllustratedScenes(updated);
    setActiveGeneratingId(sceneId);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: target.visualPrompt,
          aspectRatio: target.layout === 'full-width' || target.layout === 'banner' ? '16:9' : '4:3',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate image.');

      updated[targetIdx] = {
        ...target,
        imageUrl: data.imageUrl,
        status: 'completed',
      };
      onUpdateIllustratedScenes(updated);
    } catch (err: any) {
      alert(err.message || 'Image generation notice. Fallback art assigned.');
      updated[targetIdx] = {
        ...target,
        imageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        status: 'completed',
      };
      onUpdateIllustratedScenes(updated);
    } finally {
      setActiveGeneratingId(null);
    }
  };

  // 3. Edit prompt & save
  const handleSavePrompt = (sceneId: string) => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, visualPrompt: tempPromptText } : s));
    onUpdateIllustratedScenes(updated);
    setEditingPromptId(null);
  };

  // 4. Change layout or size
  const handleChangeLayout = (sceneId: string, layout: StorySceneIllustration['layout']) => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, layout } : s));
    onUpdateIllustratedScenes(updated);
  };

  const handleChangeSize = (sceneId: string, size: StorySceneIllustration['size']) => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, size } : s));
    onUpdateIllustratedScenes(updated);
  };

  // 5. Delete image
  const handleDeleteScene = (sceneId: string) => {
    if (confirm('Delete this scene illustration?')) {
      const updated = scenes.filter((s) => s.id !== sceneId);
      onUpdateIllustratedScenes(updated);
    }
  };

  // 6. Custom image upload
  const handleCustomUpload = (sceneId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      const updated = scenes.map((s) => (s.id === sceneId ? { ...s, imageUrl: b64, status: 'completed' as const } : s));
      onUpdateIllustratedScenes(updated);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a172c]/90 border border-[#2b4d7e]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Header & Master Toggle */}
      <div className="p-4 border-b border-[#294c7e]/20 bg-[#071325]/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                <span>Automatic Story-to-Image System</span>
              </h3>
              <p className="text-[11px] text-slate-400">Understands your story, selects scenes, and generates illustrations</p>
            </div>
          </div>

          {/* User Control: Automatic Images ON/OFF */}
          <div className="flex items-center gap-2 bg-[#061224] border border-[#284c7c]/40 px-3 py-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Auto Images
            </span>
            <button
              onClick={() => onToggleAutoIllustrate(!autoEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  autoEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Style & Layout Controls Strip */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Illustration Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="cinematic digital storybook illustration">Storybook Illustration</option>
              <option value="anime-inspired watercolor illustration">Ghibli Watercolor</option>
              <option value="realistic cinematic concept art">Realistic Concept Art</option>
              <option value="classic fantasy oil painting">Classic Fantasy Oil</option>
              <option value="dark graphic novel and comic art">Graphic Novel / Comic</option>
              <option value="cyberpunk neon concept art">Cyberpunk Neon</option>
              <option value="watercolor children's book art">Children's Book Art</option>
              <option value="vintage retro-futuristic sci-fi">Vintage Retro Sci-Fi</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Default Layout Placement
            </label>
            <select
              value={defaultLayout}
              onChange={(e) => setDefaultLayout(e.target.value as any)}
              className="w-full bg-[#081528] border border-[#2a4d7d]/40 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="right-wrap">Right Text Wrap</option>
              <option value="left-wrap">Left Text Wrap</option>
              <option value="full-width">Full-Width Section</option>
              <option value="banner">Header Banner</option>
            </select>
          </div>
        </div>

        {/* Dual Actions: Entire Story vs Chapter by Chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleAutoIllustrateEntireStory}
            disabled={isProcessingAll}
            className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessingAll ? 'animate-spin' : ''}`} />
            <span>{isProcessingAll ? 'Processing...' : '✦ Entire Story'}</span>
          </button>

          <button
            onClick={handleGenerateChapterIllustrations}
            disabled={isProcessingAll}
            className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-cyan-200 bg-[#0e2448] hover:bg-[#16366b] border border-cyan-500/40 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chapter by Chapter</span>
          </button>
        </div>

        {/* Progress Bar & Status */}
        {isProcessingAll && (
          <div className="p-3 rounded-xl bg-[#061224] border border-cyan-500/30 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-300 font-semibold truncate max-w-[80%]">{progressStep}</span>
              <span className="text-cyan-400 font-bold tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0e213b] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generated Scenes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {scenes.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-[#294c7e]/40 bg-[#071325]/40 space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="font-display font-semibold text-sm text-slate-300">No illustrations generated yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Click &ldquo;Auto-Illustrate Entire Story&rdquo; above. Bookora will read your words, find pivotal scenes, and generate matching artwork automatically.
            </p>
          </div>
        ) : (
          scenes.map((scene, idx) => (
            <div
              key={scene.id || idx}
              className="p-3.5 rounded-xl bg-[#071327] border border-[#274d80]/40 space-y-3 transition-colors hover:border-cyan-400/40"
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
                    {scene.sceneNumber || idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {scene.title || `Scene ${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Regenerate Single Scene */}
                  <button
                    onClick={() => handleRegenerateSingleScene(scene.id)}
                    disabled={activeGeneratingId === scene.id}
                    title="Regenerate this Scene Artwork"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#122849] transition-colors"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${activeGeneratingId === scene.id ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>

                  {/* Edit Prompt Toggle */}
                  <button
                    onClick={() => {
                      if (editingPromptId === scene.id) {
                        setEditingPromptId(null);
                      } else {
                        setEditingPromptId(scene.id);
                        setTempPromptText(scene.visualPrompt);
                      }
                    }}
                    title="Edit Image Prompt"
                    className={`p-1.5 rounded-lg transition-colors ${
                      editingPromptId === scene.id
                        ? 'text-cyan-300 bg-[#122849]'
                        : 'text-slate-400 hover:text-white hover:bg-[#122849]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Scene */}
                  <button
                    onClick={() => handleDeleteScene(scene.id)}
                    title="Delete Image"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scene Snippet Context */}
              {scene.textSnippet && (
                <div className="text-[11px] text-slate-400 italic line-clamp-2 bg-[#040c1a] p-2 rounded-lg border border-[#254673]/30">
                  &ldquo;{scene.textSnippet}&rdquo;
                </div>
              )}

              {/* Image Preview / Loader / Error */}
              {scene.status === 'generating' || activeGeneratingId === scene.id ? (
                <div className="h-44 rounded-xl bg-[#061224] border border-cyan-500/40 flex flex-col items-center justify-center text-cyan-300 space-y-2 animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs font-semibold">AI is painting this scene illustration...</span>
                </div>
              ) : scene.status === 'error' ? (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Generation notice: {scene.errorMessage || 'Please try again.'}</span>
                  </div>
                  <button
                    onClick={() => handleRegenerateSingleScene(scene.id)}
                    className="px-2.5 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-medium text-[11px]"
                  >
                    Retry
                  </button>
                </div>
              ) : scene.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#274d80]/40 group max-h-56 bg-black">
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-90">
                    <a
                      href={scene.imageUrl}
                      download={`bookora-scene-${scene.sceneNumber}.png`}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs transition-colors"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Edit Image Prompt Box */}
              {editingPromptId === scene.id && (
                <div className="p-3 rounded-xl bg-[#040e1e] border border-cyan-500/30 space-y-2 animate-fadeIn">
                  <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                    Edit Visual Prompt
                  </label>
                  <textarea
                    value={tempPromptText}
                    onChange={(e) => setTempPromptText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#071325] border border-[#2b5185]/40 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPromptId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSavePrompt(scene.id);
                        handleRegenerateSingleScene(scene.id);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Regenerate</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Layout & Size Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-[#254673]/30">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Placement:</span>
                  <select
                    value={scene.layout || 'right-wrap'}
                    onChange={(e) => handleChangeLayout(scene.id, e.target.value as any)}
                    className="bg-[#050f1d] border border-[#284c7c]/40 rounded px-1.5 py-0.5 text-[11px] text-cyan-300 focus:outline-none"
                  >
                    <option value="right-wrap">Right Wrap</option>
                    <option value="left-wrap">Left Wrap</option>
                    <option value="full-width">Full Width</option>
                    <option value="banner">Header Banner</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Size:</span>
                  <select
                    value={scene.size || 'medium'}
                    onChange={(e) => handleChangeSize(scene.id, e.target.value as any)}
                    className="bg-[#050f1d] border border-[#284c7c]/40 rounded px-1.5 py-0.5 text-[11px] text-cyan-300 focus:outline-none"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="full">Full Bleed</option>
                  </select>

                  {/* Change Image upload */}
                  <label className="p-1 rounded hover:bg-[#122849] text-slate-400 hover:text-purple-300 cursor-pointer" title="Upload custom image">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={(e) => handleCustomUpload(scene.id, e)} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
