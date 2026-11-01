import React, { useState } from 'react';
import { Story } from '../types';
import { X, Sparkles, ArrowRight, Check, RotateCcw, Compass, Plus, FileText } from 'lucide-react';

interface StoryContinuationModalProps {
  story: Story;
  onClose: () => void;
  onApplyContinuation: (newText: string, mode: 'append' | 'replace' | 'new_chapter') => void;
}

export const StoryContinuationModal: React.FC<StoryContinuationModalProps> = ({
  story,
  onClose,
  onApplyContinuation,
}) => {
  const [direction, setDirection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [continuation, setContinuation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Extract last 2 sentences as exact stopping point
  const sentences = story.content.trim().split(/(?<=[.!?])\s+/);
  const lastStoppingPoint = sentences.slice(-2).join(' ') || story.content.slice(-200);

  // Character context string
  const charactersContext =
    story.characters && story.characters.length > 0
      ? story.characters.map((c) => `${c.name} (${c.role}): ${c.visualAnchorPrompt || c.appearance}`).join('; ')
      : '';

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/story/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStory: story.content,
          direction,
          charactersContext,
          language: story.language || 'en',
          lastStoppingPoint,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate continuation.');

      setContinuation(data.continuation || '');
    } catch (err: any) {
      setError(err.message || 'Error continuing story.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isRTL = story.language === 'ar' || story.language === 'ur';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">AI Story Continuation</h3>
              <p className="text-xs text-slate-400">Continue the narrative seamlessly from the exact stopping point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Exact Stopping Point Indicator */}
          <div className="p-3.5 rounded-xl bg-[#0d1f3b] border border-[#264b7c]/40 text-xs">
            <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 block mb-1">
              Exact Stopping Point:
            </span>
            <p className="text-slate-300 italic font-editorial text-sm leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
              &ldquo;{lastStoppingPoint}&rdquo;
            </p>
          </div>

          {/* Direction Input */}
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-300 mb-1.5">
              Next Scene Goal or Guidance (Optional)
            </label>
            <textarea
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="e.g. Mara discovers the celestial door leads into a floating conservatory above the clouds, where an automaton is tending singing orchids..."
              rows={2}
              className="w-full bg-[#061122] border border-[#2b5185]/40 rounded-xl p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Weaving Continuation...' : '✦ Generate Continuation Preview'}</span>
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Preview Box */}
          {continuation && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Preview Before Inserting</span>
                </span>
                <span className="text-xs text-slate-400">
                  {continuation.trim().split(/\s+/).length} words
                </span>
              </div>

              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className="p-4 rounded-xl bg-[#061224] border border-cyan-400/40 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-editorial"
              >
                {continuation}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => onApplyContinuation(continuation, 'append')}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert at Stopping Point</span>
                </button>

                <button
                  onClick={() => onApplyContinuation(continuation, 'new_chapter')}
                  className="py-2 px-3 rounded-xl text-xs font-medium text-cyan-200 bg-[#122a4f] border border-cyan-500/30 hover:bg-[#183968] flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Add as New Chapter</span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="py-2 px-3 rounded-xl text-xs font-medium text-slate-300 bg-[#0d1e38] border border-[#2b5185]/40 hover:bg-[#142c52] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
