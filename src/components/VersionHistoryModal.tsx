import React, { useState } from 'react';
import { Story, StoryVersion } from '../types';
import { X, History, RotateCcw, Clock, Check, Plus, Trash2, ArrowRight } from 'lucide-react';

interface VersionHistoryModalProps {
  story: Story;
  onClose: () => void;
  onRestoreVersion: (version: StoryVersion) => void;
  onCreateSnapshot: (summary: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  story,
  onClose,
  onRestoreVersion,
  onCreateSnapshot,
}) => {
  const versions = story.versionHistory || [];
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [newSnapshotSummary, setNewSnapshotSummary] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedVersion = versions[selectedVersionIndex];

  const handleCreate = () => {
    if (!newSnapshotSummary.trim()) {
      alert('Please enter a brief note for this snapshot (e.g., "Before major chapter 2 edit").');
      return;
    }
    onCreateSnapshot(newSnapshotSummary.trim());
    setNewSnapshotSummary('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Story Version History & Snapshots</h3>
              <p className="text-xs text-slate-400">Preserve snapshots, compare revisions, and restore previous manuscript states</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Version Snapshots List */}
          <div className="md:col-span-4 border-r border-[#254877]/30 bg-[#06101f] p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#24426f]/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Snapshots ({versions.length})
              </span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Save State
              </button>
            </div>

            {isCreating && (
              <div className="p-3 rounded-xl bg-[#0b1c36] border border-cyan-500/30 space-y-2">
                <input
                  type="text"
                  value={newSnapshotSummary}
                  onChange={(e) => setNewSnapshotSummary(e.target.value)}
                  placeholder="Snapshot note..."
                  className="w-full bg-[#050f1d] border border-[#2b5185]/40 rounded-lg p-2 text-xs text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {versions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No previous snapshots yet. Click &ldquo;Save State&rdquo; to capture this manuscript point.
              </div>
            ) : (
              versions.map((ver, i) => (
                <div
                  key={ver.id || i}
                  onClick={() => setSelectedVersionIndex(i)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedVersionIndex === i
                      ? 'bg-[#12274b] border-cyan-400/50 shadow-md'
                      : 'bg-[#091931] border-[#224472]/30 hover:bg-[#0f2240]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {new Date(ver.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="tabular-nums font-medium text-slate-300">{ver.wordCount} words</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{ver.summary || ver.title}</div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Comparison & Restore */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-4 bg-[#09172d]">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#254877]/30">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                      Snapshot: {selectedVersion.summary || 'Manuscript Draft'}
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Captured on {new Date(selectedVersion.timestamp).toLocaleString()} &middot; {selectedVersion.wordCount} words
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Restore this snapshot? Your current content will be replaced with this version.')) {
                        onRestoreVersion(selectedVersion);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore this Version</span>
                  </button>
                </div>

                {/* Content Comparison View */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Snapshot Text Preview
                  </span>
                  <div className="p-4 rounded-xl bg-[#061122] border border-[#2b5185]/40 text-slate-200 text-xs md:text-sm font-editorial leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedVersion.content}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">Select a snapshot to preview and compare</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
