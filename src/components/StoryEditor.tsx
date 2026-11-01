import React, { useRef, useState, useEffect } from 'react';
import { Language, Story, StorySceneIllustration } from '../types';
import {
  Bold,
  Italic,
  Heading2,
  Quote,
  Save,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  BookOpen,
  Maximize2,
  Trash2,
  FileText,
  Clock,
  Globe,
  Layers,
  ShieldCheck,
  User,
  History,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  Printer,
  Eye,
  Sliders,
  RotateCcw,
  Check,
  Edit3,
  Layout,
  Plus
} from 'lucide-react';
import { exportToPDF, exportToEPUB } from '../utils/exportUtils';

interface StoryEditorProps {
  story: Story;
  onChange: (updated: Partial<Story>) => void;
  onSave: () => void;
  onOpenReader: () => void;
  onToggleFocus: () => void;
  onDirectScene: (sceneText: string) => void;
  onOpenContinuation: () => void;
  onOpenGrammar: () => void;
  onOpenChapters: () => void;
  onOpenCharacters: () => void;
  onOpenWorldBuilder: () => void;
  onOpenBookCover: () => void;
  onOpenVersionHistory: () => void;
  onOpenAutoIllustrator?: () => void;
  onUpdateIllustratedScenes?: (scenes: StorySceneIllustration[]) => void;
  saveStatus: string;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  story,
  onChange,
  onSave,
  onOpenReader,
  onToggleFocus,
  onDirectScene,
  onOpenContinuation,
  onOpenGrammar,
  onOpenChapters,
  onOpenCharacters,
  onOpenWorldBuilder,
  onOpenBookCover,
  onOpenVersionHistory,
  onOpenAutoIllustrator,
  onUpdateIllustratedScenes,
  saveStatus,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fontChoice, setFontChoice] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Compute stats
  const words = story.content.trim() ? story.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const characters = story.content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const isRTL = story.language === 'ar' || story.language === 'ur';

  // Speech narration
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${story.title}. ${story.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      if (story.language === 'ar') utterance.lang = 'ar-SA';
      else if (story.language === 'ur') utterance.lang = 'ur-PK';
      else if (story.language === 'ml') utterance.lang = 'ml-IN';
      else if (story.language === 'kn') utterance.lang = 'kn-IN';
      else utterance.lang = 'en-US';

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Format insertion
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = before + (selected || '') + after;

    textarea.setRangeText(replacement, start, end, 'end');
    onChange({ content: textarea.value });
    textarea.focus();
  };

  // Language translation handler
  const handleTranslateLanguage = async (targetLang: Language) => {
    if (targetLang === story.language) return;
    if (!story.content.trim()) {
      onChange({ language: targetLang });
      return;
    }

    if (!confirm(`Translate this story manuscript into ${targetLang.toUpperCase()}?`)) {
      onChange({ language: targetLang });
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/story/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: story.content,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed.');

      onChange({
        content: data.translatedContent,
        language: targetLang,
      });
    } catch (err: any) {
      alert(err.message || 'Translation failed.');
      onChange({ language: targetLang });
    } finally {
      setIsTranslating(false);
    }
  };

  const fontClass =
    story.language === 'ar' || story.language === 'ur'
      ? 'font-["Amiri"] text-lg leading-[2.2]'
      : story.language === 'ml'
      ? 'font-["Noto_Sans_Malayalam"] text-base leading-[2]'
      : story.language === 'kn'
      ? 'font-["Noto_Sans_Kannada"] text-base leading-[2]'
      : fontChoice === 'serif'
      ? 'font-editorial font-normal tracking-wide text-lg'
      : fontChoice === 'mono'
      ? 'font-display font-medium text-base'
      : 'font-sans font-normal text-base md:text-lg';

  const [editorMode, setEditorMode] = useState<'raw' | 'layout'>('raw');
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [editingPromptSceneId, setEditingPromptSceneId] = useState<string | null>(null);
  const [editPromptText, setEditPromptText] = useState('');

  const scenes = story.illustratedScenes || [];

  const handleUpdateSceneLayout = (sceneId: string, layout: 'full-width' | 'left-wrap' | 'right-wrap' | 'banner') => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, layout } : s));
    if (onUpdateIllustratedScenes) onUpdateIllustratedScenes(updated);
    else onChange({ illustratedScenes: updated });
  };

  const handleUpdateSceneSize = (sceneId: string, size: 'small' | 'medium' | 'large' | 'full') => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, size } : s));
    if (onUpdateIllustratedScenes) onUpdateIllustratedScenes(updated);
    else onChange({ illustratedScenes: updated });
  };

  const handleDeleteSceneIllustration = (sceneId: string) => {
    const updated = scenes.filter((s) => s.id !== sceneId);
    if (onUpdateIllustratedScenes) onUpdateIllustratedScenes(updated);
    else onChange({ illustratedScenes: updated });
  };

  const handleSaveScenePrompt = (sceneId: string) => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, visualPrompt: editPromptText } : s));
    if (onUpdateIllustratedScenes) onUpdateIllustratedScenes(updated);
    else onChange({ illustratedScenes: updated });
    setEditingPromptSceneId(null);
  };

  const handleRegenerateSceneIllustration = async (scene: StorySceneIllustration) => {
    setRegeneratingSceneId(scene.id);
    try {
      const charAnchors = story.characters?.map((c) => c.visualAnchorPrompt).filter(Boolean).join('; ');
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.visualPrompt,
          style: scene.style || 'cinematic digital storybook illustration',
          characterAnchor: charAnchors,
          aspectRatio: scene.layout === 'full-width' || scene.layout === 'banner' ? '16:9' : '4:3',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate illustration.');

      const updated = scenes.map((s) =>
        s.id === scene.id ? { ...s, imageUrl: data.imageUrl, status: 'completed' as const } : s
      );
      if (onUpdateIllustratedScenes) onUpdateIllustratedScenes(updated);
      else onChange({ illustratedScenes: updated });
    } catch (err: any) {
      alert(err.message || 'Image generation failed.');
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  // Split story content into paragraphs
  const paragraphs = story.content.split('\n\n').filter((p) => p.trim());

  return (
    <div className="flex flex-col h-full bg-[#0a172c]/90 border border-[#2b4d7e]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Header & Story Metadata */}
      <div className="p-4 md:p-6 border-b border-[#294c7e]/20 flex flex-col gap-3 bg-[#081427]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <input
            type="text"
            value={story.title}
            dir={isRTL ? 'rtl' : 'ltr'}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Untitled story..."
            maxLength={120}
            className="w-full bg-transparent font-display font-bold text-xl md:text-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-0 border-0"
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Multi-language Selector */}
            <div className="flex items-center gap-1 bg-[#0e213d] border border-[#2c5387]/40 rounded-lg p-0.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
              <select
                value={story.language || 'en'}
                onChange={(e) => handleTranslateLanguage(e.target.value as Language)}
                disabled={isTranslating}
                className="bg-transparent text-xs font-semibold text-cyan-300 px-1.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#0e213d] text-white">English (LTR)</option>
                <option value="ml" className="bg-[#0e213d] text-white">Malayalam (മലയാളം)</option>
                <option value="kn" className="bg-[#0e213d] text-white">Kannada (ಕನ್ನಡ)</option>
                <option value="ar" className="bg-[#0e213d] text-white">Arabic (العربية - RTL)</option>
                <option value="ur" className="bg-[#0e213d] text-white">Urdu (اردو - RTL)</option>
              </select>
            </div>

            {/* Genre selector */}
            <select
              value={story.genre}
              onChange={(e) => onChange({ genre: e.target.value })}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#112444] border border-[#2c5387]/40 text-cyan-300 focus:outline-none"
            >
              <option value="Fantasy">Fantasy</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Cyberpunk">Cyberpunk</option>
              <option value="Steampunk">Steampunk</option>
              <option value="Fairy Tale">Fairy Tale</option>
              <option value="Gothic Horror">Gothic Horror</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
            </select>

            {/* Reader View */}
            <button
              onClick={onOpenReader}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-[#122849] border border-[#2b5387]/40 text-slate-200 hover:text-white hover:bg-[#1a3866] transition-colors"
              title="Open Book Reader View"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reader</span>
            </button>
          </div>
        </div>

        {/* Clean unboxed metadata strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="tabular-nums font-medium text-slate-300">{words} words</span>
          <span aria-hidden="true">&middot;</span>
          <span className="tabular-nums text-slate-400">{characters} chars</span>
          <span aria-hidden="true">&middot;</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>~{readingTimeMinutes} min read</span>
          </span>
          <span aria-hidden="true">&middot;</span>
          <span className="text-slate-400">{story.tone} tone</span>
          <span aria-hidden="true">&middot;</span>
          <span className="text-cyan-400/90 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {isTranslating ? 'Translating...' : saveStatus}
          </span>
        </div>

        {/* Studio Modular Feature Buttons Strip */}
        <div className="pt-2 border-t border-[#254673]/30 flex flex-wrap items-center gap-1.5">
          {/* View Mode Toggle: Manuscript vs Book Page Layout */}
          <div className="flex items-center bg-[#071325] p-0.5 rounded-lg border border-cyan-500/40 mr-2 shadow-inner">
            <button
              onClick={() => setEditorMode('raw')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                editorMode === 'raw'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manuscript</span>
            </button>
            <button
              onClick={() => setEditorMode('layout')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                editorMode === 'layout'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-cyan-300" />
              <span>Book Pages ({scenes.length})</span>
            </button>
          </div>

          {onOpenAutoIllustrator && (
            <button
              onClick={onOpenAutoIllustrator}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-sm shadow-cyan-500/20"
              title="Open AI Automatic Story Illustration System"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Auto-Illustrator</span>
            </button>
          )}

          <button
            onClick={onOpenContinuation}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-cyan-200 bg-[#0e2344] hover:bg-[#153460] border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
            title="Continue story from exact stopping point with preview"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Continuation</span>
          </button>

          <button
            onClick={onOpenGrammar}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-purple-200 bg-[#161f44] hover:bg-[#202d60] border border-purple-500/30 flex items-center gap-1.5 transition-colors"
            title="Grammar, vocabulary improvements, and diff comparison"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Grammar & Vocab</span>
          </button>

          <button
            onClick={onOpenChapters}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 bg-[#0f2445] hover:bg-[#16335d] border border-[#2b5185]/40 flex items-center gap-1.5 transition-colors"
            title="Chapter-wise AI images and chapter manager"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Chapters ({story.chapters?.length || 0})</span>
          </button>

          <button
            onClick={onOpenCharacters}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 bg-[#0f2445] hover:bg-[#16335d] border border-[#2b5185]/40 flex items-center gap-1.5 transition-colors"
            title="Consistent character visual profiles"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Characters ({story.characters?.length || 0})</span>
          </button>

          <button
            onClick={onOpenWorldBuilder}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 bg-[#0f2445] hover:bg-[#16335d] border border-[#2b5185]/40 flex items-center gap-1.5 transition-colors"
            title="Fantasy worldbuilding lore and magic systems"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>World Lore</span>
          </button>

          <button
            onClick={onOpenBookCover}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 bg-[#0f2445] hover:bg-[#16335d] border border-[#2b5185]/40 flex items-center gap-1.5 transition-colors"
            title="Generate professional book cover art"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Book Cover</span>
          </button>

          <button
            onClick={onOpenVersionHistory}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 bg-[#0f2445] hover:bg-[#16335d] border border-[#2b5185]/40 flex items-center gap-1.5 transition-colors"
            title="Version snapshots and revision comparison"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Formatting & Tool Bar */}
      <div className="px-4 py-2 border-b border-[#294c7e]/20 bg-[#061122]/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertText('**', '**')}
            title="Bold (**text**)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#132849] transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('*', '*')}
            title="Italic (*text*)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#132849] transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('\n\n## Chapter: ', '\n\n')}
            title="Insert Chapter Heading"
            className="px-2 h-8 rounded-lg flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#132849] transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chapter</span>
          </button>
          <button
            onClick={() => insertText('\n\n⁂\n\n')}
            title="Scene Break Asterism (⁂)"
            className="px-2 h-8 rounded-lg flex items-center gap-1 text-xs text-slate-300 hover:text-white hover:bg-[#132849] transition-colors font-serif"
          >
            ⁂ Break
          </button>
          <button
            onClick={() => insertText('\n\n> "')}
            title="Blockquote / Dialogue"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#132849] transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-5 bg-[#294c7e]/30 mx-1" />

          {/* Typography font switcher */}
          <div className="flex items-center gap-1 bg-[#0b1b36] p-0.5 rounded-lg border border-[#2b5185]/30 text-xs">
            <button
              onClick={() => setFontChoice('sans')}
              className={`px-2 py-1 rounded-md transition-colors ${
                fontChoice === 'sans' ? 'bg-[#183968] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sans
            </button>
            <button
              onClick={() => setFontChoice('serif')}
              className={`px-2 py-1 rounded-md font-editorial transition-colors ${
                fontChoice === 'serif' ? 'bg-[#183968] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Serif
            </button>
            <button
              onClick={() => setFontChoice('mono')}
              className={`px-2 py-1 rounded-md font-display transition-colors ${
                fontChoice === 'mono' ? 'bg-[#183968] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Display
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct selection to scene director */}
          <button
            onClick={() => {
              const textarea = textareaRef.current;
              const selection = textarea
                ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
                : '';
              onDirectScene(selection || story.content.slice(0, 500));
            }}
            title="Direct Scene Artwork"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Direct Scene</span>
          </button>

          {/* Focus Mode button */}
          <button
            onClick={onToggleFocus}
            title="Enter Focus Mode"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:bg-[#132849] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Attached Cover / Scene Image Banner */}
      {story.coverImage && (
        <div className="relative group border-b border-[#294c7e]/20 max-h-56 overflow-hidden bg-black/40">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a172c] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
            <span className="truncate max-w-md font-medium text-cyan-200">
              Attached Illustration: {story.imagePrompt ? story.imagePrompt.slice(0, 70) + '...' : 'Scene Visual'}
            </span>
            <button
              onClick={() => onChange({ coverImage: undefined })}
              className="p-1 rounded bg-black/60 hover:bg-red-950/80 text-slate-400 hover:text-red-300 transition-colors"
              title="Remove cover art"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Raw Manuscript OR Illustrated Book Pages Layout */}
      {editorMode === 'raw' ? (
        <div className="flex-1 p-4 md:p-6 flex flex-col min-h-[420px]">
          <textarea
            ref={textareaRef}
            value={story.content}
            dir={isRTL ? 'rtl' : 'ltr'}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={`Once upon a time...\n\nStart writing your book here. Let your imagination take the lead.`}
            spellCheck={true}
            className={`flex-1 w-full bg-transparent resize-none border-0 focus:outline-none focus:ring-0 text-slate-100 ${fontClass}`}
          />
        </div>
      ) : (
        /* Illustrated Book Pages Layout View with In-Line Image Placement */
        <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[640px] space-y-6">
          <div className="p-3.5 rounded-xl bg-[#081528] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>BOOKORA Automatic Book Layout</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Illustrations are arranged beside corresponding story scenes. Adjust placement (Left, Right, Full, Banner) or regenerate art anytime.
              </p>
            </div>
            {onOpenAutoIllustrator && (
              <button
                onClick={onOpenAutoIllustrator}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 shrink-0 shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Auto-Illustrate Story</span>
              </button>
            )}
          </div>

          {/* Book Content with Illustrated Scenes Flow */}
          <div className={`prose prose-invert max-w-none ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {paragraphs.map((p, idx) => {
              // Find matching scene for this paragraph or assign periodically
              const matchedScene = scenes.find(
                (s) => (s.textSnippet && p.includes(s.textSnippet.slice(0, 30))) || s.sceneNumber === idx + 1
              );

              const isHeading = p.startsWith('#');

              return (
                <div key={idx} className="relative my-4 group/para">
                  {matchedScene && matchedScene.imageUrl && (
                    <div
                      className={`transition-all duration-300 ${
                        matchedScene.layout === 'left-wrap'
                          ? `float-left mr-6 mb-4 ${
                              matchedScene.size === 'small'
                                ? 'max-w-[200px]'
                                : matchedScene.size === 'large'
                                ? 'max-w-[420px]'
                                : 'max-w-[320px]'
                            }`
                          : matchedScene.layout === 'right-wrap'
                          ? `float-right ml-6 mb-4 ${
                              matchedScene.size === 'small'
                                ? 'max-w-[200px]'
                                : matchedScene.size === 'large'
                                ? 'max-w-[420px]'
                                : 'max-w-[320px]'
                            }`
                          : matchedScene.layout === 'banner'
                          ? 'w-full my-6 clear-both'
                          : 'w-full my-6 clear-both'
                      }`}
                    >
                      {/* Image Card Container */}
                      <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-[#061224] shadow-xl group/card">
                        <img
                          src={matchedScene.imageUrl}
                          alt={matchedScene.title}
                          className={`w-full object-cover ${
                            matchedScene.layout === 'banner' ? 'h-52 object-center' : 'h-auto max-h-80'
                          }`}
                        />

                        {/* Loading Overlay */}
                        {regeneratingSceneId === matchedScene.id && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                            <RotateCcw className="w-6 h-6 text-cyan-400 animate-spin" />
                            <span className="text-xs font-semibold text-cyan-200">Painting new artwork...</span>
                          </div>
                        )}

                        {/* Top Floating Controls Bar */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-cyan-500/30 z-10">
                          {/* Layout selector */}
                          <select
                            value={matchedScene.layout}
                            onChange={(e) => handleUpdateSceneLayout(matchedScene.id, e.target.value as any)}
                            className="bg-[#0b1d38] text-[10px] text-cyan-200 rounded px-1.5 py-0.5 border border-[#2b5286]/50 focus:outline-none"
                            title="Choose page placement"
                          >
                            <option value="right-wrap">Right Wrap</option>
                            <option value="left-wrap">Left Wrap</option>
                            <option value="full-width">Full Width</option>
                            <option value="banner">Banner</option>
                          </select>

                          {/* Size selector */}
                          <select
                            value={matchedScene.size}
                            onChange={(e) => handleUpdateSceneSize(matchedScene.id, e.target.value as any)}
                            className="bg-[#0b1d38] text-[10px] text-cyan-200 rounded px-1.5 py-0.5 border border-[#2b5286]/50 focus:outline-none"
                            title="Choose image size"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="full">Full</option>
                          </select>

                          {/* Edit prompt */}
                          <button
                            onClick={() => {
                              setEditingPromptSceneId(matchedScene.id);
                              setEditPromptText(matchedScene.visualPrompt);
                            }}
                            className="p-1 rounded hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-200"
                            title="Edit image prompt"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Regenerate */}
                          <button
                            onClick={() => handleRegenerateSceneIllustration(matchedScene)}
                            disabled={regeneratingSceneId === matchedScene.id}
                            className="p-1 rounded hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-200"
                            title="Regenerate this illustration"
                          >
                            <RotateCcw className={`w-3 h-3 ${regeneratingSceneId === matchedScene.id ? 'animate-spin' : ''}`} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteSceneIllustration(matchedScene.id)}
                            className="p-1 rounded hover:bg-red-950 text-slate-400 hover:text-red-300"
                            title="Delete this illustration"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom Caption */}
                        <div className="p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent">
                          <div className="text-[11px] font-semibold text-cyan-300 truncate">
                            {matchedScene.title}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {matchedScene.visualPrompt}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render Paragraph Content */}
                  {isHeading ? (
                    <div className="font-display font-bold text-xl text-cyan-200 my-4 border-b border-[#2b5185]/30 pb-2">
                      {p.replace(/^#+\s*/, '')}
                    </div>
                  ) : (
                    <p className="text-slate-200 leading-relaxed text-justify mb-4">
                      {p}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Clear floats */}
            <div className="clear-both" />

            {/* Fallback empty scenes call to action */}
            {scenes.length === 0 && (
              <div className="p-8 rounded-2xl border-2 border-dashed border-[#294c7e]/40 bg-[#071326]/60 text-center my-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  No AI Illustrations Generated Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  BOOKORA can automatically analyze your story, divide it into key visual scenes, and generate matching illustrations arranged throughout your book pages.
                </p>
                {onOpenAutoIllustrator && (
                  <button
                    onClick={onOpenAutoIllustrator}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Auto-Illustrate Entire Story</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Edit Prompt Modal */}
          {editingPromptSceneId && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0b1a32] border border-cyan-500/50 rounded-2xl p-5 max-w-lg w-full shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Scene Image Prompt</span>
                  </h4>
                  <button
                    onClick={() => setEditingPromptSceneId(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={editPromptText}
                  onChange={(e) => setEditPromptText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#061224] border border-[#2b5286]/50 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 mb-4"
                  placeholder="Describe the visual scene..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingPromptSceneId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#132849]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveScenePrompt(editingPromptSceneId)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Prompt</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-3 md:p-4 border-t border-[#294c7e]/20 bg-[#071325]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            onClick={handleToggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isSpeaking
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse'
                : 'bg-[#102444] text-slate-300 border-[#2b5286]/30 hover:bg-[#16335e] hover:text-white'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isSpeaking ? 'Stop Narration' : 'Narrate Story'}</span>
          </button>

          {/* Export Dropdown with PDF & EPUB */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#102444] text-slate-300 border border-[#2b5286]/30 hover:bg-[#16335e] hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Book</span>
            </button>

            {showExportMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#0c1c38] border border-[#2d568e]/50 shadow-2xl py-1.5 z-30 flex flex-col">
                <button
                  onClick={() => {
                    exportToPDF(story);
                    setShowExportMenu(false);
                  }}
                  className="px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#183968] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <span className="font-semibold block">Printable Book (PDF)</span>
                    <span className="text-[10px] text-slate-400">Cover, TOC & chapter images</span>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    await exportToEPUB(story);
                    setShowExportMenu(false);
                  }}
                  className="px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#183968] hover:text-white transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <span className="font-semibold block">EPUB 3 E-Book (.epub)</span>
                    <span className="text-[10px] text-slate-400">Kindle & Apple Books ready</span>
                  </div>
                </button>

                <div className="h-[1px] bg-slate-700/40 my-1" />

                <button
                  onClick={() => {
                    const md = `# ${story.title}\n\n*Genre: ${story.genre} | Tone: ${story.tone}*\n\n${story.content}`;
                    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${(story.title || 'story').replace(/[^a-z0-9-_]/gi, '_')}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowExportMenu(false);
                  }}
                  className="px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-[#183968] hover:text-white transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Markdown (.md)</span>
                </button>

                <button
                  onClick={() => {
                    const text = `${story.title}\nGenre: ${story.genre} | Tone: ${story.tone}\n\n${story.content}`;
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${(story.title || 'story').replace(/[^a-z0-9-_]/gi, '_')}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowExportMenu(false);
                  }}
                  className="px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-[#183968] hover:text-white transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Plain Text (.txt)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Primary Save Button */}
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-lg hover:brightness-110 active:scale-95 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Story</span>
        </button>
      </div>
    </div>
  );
};
