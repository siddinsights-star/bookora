import React, { useState } from 'react';
import { Story } from '../types';
import { X, Wand2, Check, Copy, ArrowRight, ShieldCheck, Sparkles, BookOpen, Layers } from 'lucide-react';

interface GrammarVocabularyModalProps {
  story: Story;
  selectedText?: string;
  onClose: () => void;
  onApplyChanges: (correctedText: string) => void;
}

export const GrammarVocabularyModal: React.FC<GrammarVocabularyModalProps> = ({
  story,
  selectedText,
  onClose,
  onApplyChanges,
}) => {
  const initialText = selectedText || story.content;
  const [inputText, setInputText] = useState(initialText);
  const [mode, setMode] = useState<'grammar' | 'vocabulary' | 'polish' | 'cinematic'>('grammar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim()) {
      alert('Please enter or select text to analyze.');
      return;
    }

    setIsProcessing(true);
    setCorrectedText(null);
    try {
      const res = await fetch('/api/story/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode,
          language: story.language || 'en',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to polish text.');

      setCorrectedText(data.correctedText || '');
      setExplanation(data.explanation || '');
      setImprovements(data.improvements || []);
    } catch (err: any) {
      alert(err.message || 'Error refining text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRTL = story.language === 'ar' || story.language === 'ur';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">AI Grammar & Vocabulary Studio</h3>
              <p className="text-xs text-slate-400">Polish grammar, upgrade vocabulary, and compare original vs corrected text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Strip */}
        <div className="px-6 py-3 border-b border-[#254877]/30 bg-[#06101f] flex flex-wrap gap-2">
          <button
            onClick={() => setMode('grammar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mode === 'grammar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0b1c36]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Grammar & Spelling</span>
          </button>

          <button
            onClick={() => setMode('vocabulary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mode === 'vocabulary'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0b1c36]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advanced Vocabulary</span>
          </button>

          <button
            onClick={() => setMode('polish')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mode === 'polish'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0b1c36]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flow & Polish</span>
          </button>

          <button
            onClick={() => setMode('cinematic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mode === 'cinematic'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0b1c36]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cinematic Rewrite</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Input */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Original Text</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {inputText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={10}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder="Paste or type text to polish..."
                className="w-full bg-[#061122] border border-[#2b5185]/40 rounded-xl p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-editorial resize-none flex-1"
              />
            </div>

            {/* Corrected Text Box */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <span>Enhanced & Corrected Text</span>
                {correctedText && (
                  <span className="text-[11px] text-cyan-300 font-normal">
                    {correctedText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                )}
              </label>
              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className="w-full bg-[#07152b] border border-cyan-500/30 rounded-xl p-3 text-xs md:text-sm text-cyan-100 leading-relaxed font-editorial overflow-y-auto h-[260px] whitespace-pre-wrap"
              >
                {correctedText ? (
                  correctedText
                ) : (
                  <span className="text-slate-500 italic">
                    Click &ldquo;Polish Text&rdquo; to generate improved prose with vocabulary suggestions and grammar fixes...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Polishing Text with AI...' : `✦ Polish with ${mode.toUpperCase()}`}</span>
          </button>

          {/* Explanation & Improvements breakdown */}
          {correctedText && (
            <div className="p-4 rounded-xl bg-[#071327] border border-[#264b7c]/40 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Editor Note
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
              </div>

              {improvements.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
                    Key Improvements
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {improvements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#0c1f3c] p-2 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#254673]/30">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#0e213d] hover:bg-[#15315b] border border-[#2b5185]/40 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Corrected Text'}</span>
                </button>

                <button
                  onClick={() => onApplyChanges(correctedText)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Changes into Manuscript</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
