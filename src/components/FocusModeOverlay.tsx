import React, { useState, useEffect } from 'react';
import { Minimize2, Volume2, VolumeX, Sparkles, Feather } from 'lucide-react';

interface FocusModeOverlayProps {
  content: string;
  title: string;
  onChangeContent: (text: string) => void;
  onExit: () => void;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  content,
  title,
  onChangeContent,
  onExit,
}) => {
  const [ambientAudio, setAmbientAudio] = useState<boolean>(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  // ESC to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Ambient sound generator via Web Audio API (soft pink noise / calming binaural breeze)
  const toggleAmbientSound = () => {
    if (!ambientAudio) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Create brown/pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Soft lowpass filter for rain/ocean rumble
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(340, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();

        setAudioCtx(ctx);
        setGainNode(gain);
        setAmbientAudio(true);
      } catch (err) {
        console.error('Audio init failed:', err);
      }
    } else {
      if (audioCtx) {
        audioCtx.close();
      }
      setAudioCtx(null);
      setAmbientAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtx) {
        audioCtx.close();
      }
    };
  }, [audioCtx]);

  return (
    <div className="fixed inset-0 z-50 bg-[#040913] text-[#e0ecfc] flex flex-col p-6 md:p-12 animate-fadeIn selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Floating Utility Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2 text-xs">
          <Feather className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300 truncate max-w-xs">{title || 'Untitled'}</span>
          <span className="opacity-40">·</span>
          <span className="tabular-nums text-slate-400">{words} words</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Ambient sound toggle */}
          <button
            onClick={toggleAmbientSound}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
              ambientAudio
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                : 'bg-black/30 text-slate-400 border-slate-700/50 hover:text-white'
            }`}
          >
            {ambientAudio ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ambientAudio ? 'Ambient Rain: ON' : 'Ambient Noise'}</span>
          </button>

          {/* Exit focus */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-slate-700/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus (ESC)</span>
          </button>
        </div>
      </div>

      {/* Zen Writing Body */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col py-8">
        <textarea
          autoFocus
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="Let your words breathe in total silence..."
          className="flex-1 w-full bg-transparent resize-none border-0 focus:outline-none focus:ring-0 text-slate-100 font-editorial text-xl md:text-2xl leading-[2.1] placeholder-slate-700"
        />
      </div>
    </div>
  );
};
