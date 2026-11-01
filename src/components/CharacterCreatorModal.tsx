import React, { useState } from 'react';
import { CharacterProfile, Story } from '../types';
import { X, Sparkles, User, Upload, Plus, Trash2, Check, Wand2, Shield, Eye, Camera } from 'lucide-react';

interface CharacterCreatorModalProps {
  story: Story;
  onClose: () => void;
  onUpdateCharacters: (characters: CharacterProfile[]) => void;
}

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  story,
  onClose,
  onUpdateCharacters,
}) => {
  const [characters, setCharacters] = useState<CharacterProfile[]>(story.characters || []);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRole, setAiRole] = useState('Protagonist');
  const [aiConcept, setAiConcept] = useState('');

  const activeChar = characters[activeCharIndex];

  // AI Character Generator with Visual Anchor
  const handleGenerateAICharacter = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/character/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: aiRole,
          genre: story.genre,
          concept: aiConcept,
          existingCharacters: characters.map((c) => c.name).join(', '),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate character.');

      const newChar: CharacterProfile = {
        ...data.character,
        id: 'char-' + Date.now(),
      };

      const updated = [newChar, ...characters];
      setCharacters(updated);
      setActiveCharIndex(0);
      onUpdateCharacters(updated);
    } catch (err: any) {
      alert(err.message || 'Error generating character.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reference Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      if (activeChar) {
        const updated = [...characters];
        updated[activeCharIndex] = {
          ...activeChar,
          referenceImageUrl: b64,
        };
        setCharacters(updated);
        onUpdateCharacters(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewManual = () => {
    const newChar: CharacterProfile = {
      id: 'char-' + Date.now(),
      name: 'New Character',
      role: 'Protagonist',
      age: '24',
      appearance: 'Distinct facial features, eye color, expression...',
      hair: 'Hairstyle, color, texture...',
      clothing: 'Signature attire and colors...',
      personality: 'Key traits and motivations...',
      backstory: 'Origin and driving purpose...',
      visualAnchorPrompt: '',
    };
    const updated = [...characters, newChar];
    setCharacters(updated);
    setActiveCharIndex(updated.length - 1);
    onUpdateCharacters(updated);
  };

  const handleDeleteChar = (index: number) => {
    const updated = characters.filter((_, i) => i !== index);
    setCharacters(updated);
    setActiveCharIndex(Math.max(0, index - 1));
    onUpdateCharacters(updated);
  };

  const handleUpdateActiveField = (field: keyof CharacterProfile, value: string) => {
    if (!activeChar) return;
    const updated = [...characters];
    const modified = { ...activeChar, [field]: value };

    // Auto-update visual anchor prompt if appearance/hair/clothing changes
    if (field === 'appearance' || field === 'hair' || field === 'clothing' || field === 'name' || field === 'age') {
      const name = field === 'name' ? value : modified.name;
      const age = field === 'age' ? value : modified.age;
      const app = field === 'appearance' ? value : modified.appearance;
      const hair = field === 'hair' ? value : modified.hair;
      const clothes = field === 'clothing' ? value : modified.clothing;
      modified.visualAnchorPrompt = `${name}: ${age ? `${age}-year-old ` : ''}${app}, with ${hair}, wearing ${clothes}`.trim();
    }

    updated[activeCharIndex] = modified;
    setCharacters(updated);
    onUpdateCharacters(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Consistent Character Identity Studio</h3>
              <p className="text-xs text-slate-400">Manage character profiles and lock in consistent visual faces, hair, and clothing across chapters</p>
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
          {/* Left Column: Character List & AI Generator */}
          <div className="md:col-span-4 border-r border-[#254877]/30 bg-[#06101f] p-4 overflow-y-auto space-y-4">
            {/* Quick AI Creator Box */}
            <div className="p-3.5 rounded-xl bg-[#0b1b36] border border-[#274d80]/40 space-y-2.5">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Character Generator</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={aiRole}
                  onChange={(e) => setAiRole(e.target.value)}
                  className="bg-[#061224] border border-[#2b5185]/40 rounded-lg px-2 py-1 text-xs text-slate-200"
                >
                  <option value="Protagonist">Protagonist</option>
                  <option value="Antagonist">Antagonist</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Companion">Companion</option>
                  <option value="Rival">Rival</option>
                </select>
                <input
                  type="text"
                  value={aiConcept}
                  onChange={(e) => setAiConcept(e.target.value)}
                  placeholder="e.g. Blind seer"
                  className="bg-[#061224] border border-[#2b5185]/40 rounded-lg px-2 py-1 text-xs text-slate-200 placeholder-slate-600"
                />
              </div>

              <button
                onClick={handleGenerateAICharacter}
                disabled={isGenerating}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Designing...' : '✦ Create Character'}</span>
              </button>
            </div>

            {/* Character Roster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#24426f]/30">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Roster ({characters.length})
                </span>
                <button
                  onClick={handleAddNewManual}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              </div>

              {characters.map((char, i) => (
                <div
                  key={char.id || i}
                  onClick={() => setActiveCharIndex(i)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${
                    activeCharIndex === i
                      ? 'bg-[#12274b] border-cyan-400/50 shadow-md'
                      : 'bg-[#091931] border-[#224472]/30 hover:bg-[#0f2240]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 overflow-hidden shrink-0 border border-slate-700/60 flex items-center justify-center">
                    {char.referenceImageUrl ? (
                      <img src={char.referenceImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{char.name}</div>
                    <span className="text-[10px] text-cyan-400/90">{char.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Character Profile & Visual Anchor Config */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-4 bg-[#09172d]">
            {activeChar ? (
              <>
                {/* Character Name & Role Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                    {/* Character Avatar / Upload */}
                    <div className="relative group w-16 h-16 rounded-2xl bg-black/50 overflow-hidden border-2 border-cyan-500/40 shrink-0">
                      {activeChar.referenceImageUrl ? (
                        <img src={activeChar.referenceImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <User className="w-8 h-8 text-cyan-400/60" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px]">
                        <Camera className="w-4 h-4 text-cyan-300" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={activeChar.name}
                        onChange={(e) => handleUpdateActiveField('name', e.target.value)}
                        placeholder="Character Name"
                        className="w-full bg-[#061224] border border-[#2b5185]/40 rounded-xl px-3 py-1.5 text-base font-display font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={activeChar.role}
                          onChange={(e) => handleUpdateActiveField('role', e.target.value)}
                          placeholder="Role (e.g. Protagonist)"
                          className="bg-[#061224] border border-[#2b5185]/30 rounded-lg px-2 py-0.5 text-xs text-cyan-300 font-medium"
                        />
                        <input
                          type="text"
                          value={activeChar.age || ''}
                          onChange={(e) => handleUpdateActiveField('age', e.target.value)}
                          placeholder="Age (e.g. 19)"
                          className="w-20 bg-[#061224] border border-[#2b5185]/30 rounded-lg px-2 py-0.5 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteChar(activeCharIndex)}
                    title="Delete Character"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* VISUAL CONSISTENCY ANCHOR */}
                <div className="p-4 rounded-xl bg-[#061224] border border-cyan-500/40 shadow-inner space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Consistent Face & Appearance Anchor</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Injected into all chapter art prompts</span>
                  </div>
                  <textarea
                    value={activeChar.visualAnchorPrompt || ''}
                    onChange={(e) => handleUpdateActiveField('visualAnchorPrompt', e.target.value)}
                    rows={2}
                    placeholder="e.g. A 19-year-old girl with dark auburn braided hair, alert hazel eyes, wearing a deep navy wool scholar cloak with silver piping and brass compass"
                    className="w-full bg-[#030914] border border-[#2a4d7d]/50 rounded-xl p-2.5 text-xs text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>

                {/* Detailed Traits Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Facial Appearance & Features
                    </label>
                    <textarea
                      value={activeChar.appearance}
                      onChange={(e) => handleUpdateActiveField('appearance', e.target.value)}
                      rows={2}
                      placeholder="Eye color, skin tone, facial structure, scars..."
                      className="w-full bg-[#061224] border border-[#2b5185]/30 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Hairstyle & Hair Color
                    </label>
                    <textarea
                      value={activeChar.hair || ''}
                      onChange={(e) => handleUpdateActiveField('hair', e.target.value)}
                      rows={2}
                      placeholder="Hair color, texture, length, signature style..."
                      className="w-full bg-[#061224] border border-[#2b5185]/30 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Signature Clothing & Accessories
                    </label>
                    <textarea
                      value={activeChar.clothing || ''}
                      onChange={(e) => handleUpdateActiveField('clothing', e.target.value)}
                      rows={2}
                      placeholder="Signature cloak, armor, colors, jewelry, props..."
                      className="w-full bg-[#061224] border border-[#2b5185]/30 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Personality & Flaws
                    </label>
                    <textarea
                      value={activeChar.personality}
                      onChange={(e) => handleUpdateActiveField('personality', e.target.value)}
                      rows={2}
                      placeholder="Virtues, flaws, voice tone, habits..."
                      className="w-full bg-[#061224] border border-[#2b5185]/30 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Backstory */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Backstory & Motivations
                  </label>
                  <textarea
                    value={activeChar.backstory}
                    onChange={(e) => handleUpdateActiveField('backstory', e.target.value)}
                    rows={2}
                    placeholder="Origin, key events that formed them, what they fight for..."
                    className="w-full bg-[#061224] border border-[#2b5185]/30 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">Select or create a character to manage their profile</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
