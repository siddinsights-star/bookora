import React, { useState } from 'react';
import { Story, WorldLore, WorldLocation, MagicSystem, WorldFaction, WorldCreature } from '../types';
import { X, Globe, Sparkles, MapPin, Wand2, Shield, Flame, BookOpen, Plus, Trash2, Check } from 'lucide-react';

interface WorldBuilderModalProps {
  story: Story;
  onClose: () => void;
  onSaveWorld: (worldLore: WorldLore) => void;
}

export const WorldBuilderModal: React.FC<WorldBuilderModalProps> = ({
  story,
  onClose,
  onSaveWorld,
}) => {
  const [world, setWorld] = useState<WorldLore>(() => {
    if (story.worldLore) return story.worldLore;
    return {
      id: 'world-' + Date.now(),
      worldName: 'Aethelgard Realm',
      theme: story.genre || 'Epic Fantasy',
      locations: [
        {
          id: 'loc-1',
          name: 'The Whispering Spire',
          type: 'Arcane Citadel',
          climate: 'High altitude, frosted winds',
          dangerLevel: 'High',
          description: 'A crystalline tower where ancient celestial maps project constellations into the northern clouds.',
        },
      ],
      magicSystem: {
        name: 'Aether Weaving',
        source: 'Starlight trapped in obsidian crystals',
        rules: ['Chants must follow celestial alignments', 'Living organic matter resists direct enchantment'],
        limitations: 'Spells dissolve during a total solar eclipse',
        cost: 'Each casting drains physical body heat temporarily',
      },
      factions: [
        {
          id: 'fac-1',
          name: 'Order of the Brass Meridian',
          alignment: 'Lawful Neutral',
          goals: 'Chart every forgotten realm and guard celestial gateways',
          insignia: 'A brass compass surrounded by three silver stars',
        },
      ],
      creatures: [
        {
          id: 'cre-1',
          name: 'Starlight Drake',
          habitat: 'Skyway mountain ridges',
          traits: 'Translucent bioluminescent scales, feeds on magnetic auroras',
          threat: 'Cautious unless nest is disturbed',
        },
      ],
      historicalEras: [
        {
          id: 'era-1',
          era: 'The Dawn of Shards',
          description: 'The cataclysmic collision that broke the silver moon into twin celestial bodies.',
        },
      ],
    };
  });

  const [activeTab, setActiveTab] = useState<'locations' | 'magic' | 'factions' | 'creatures' | 'history'>('locations');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate complete world lore with AI
  const handleGenerateWorldLore = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/story/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldName: world.worldName,
          theme: story.genre || 'Fantasy',
          existingLore: story.content.slice(0, 1500),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate world lore.');

      if (data.world) {
        setWorld({
          ...world,
          ...data.world,
          id: 'world-' + Date.now(),
        });
      }
    } catch (err: any) {
      alert(err.message || 'Error generating world lore.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onSaveWorld(world);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Fantasy World Builder</h3>
              <p className="text-xs text-slate-400">Construct lore, map locations, magic laws, factions, and fictional creatures</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateWorldLore}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-[#122849] border border-cyan-500/30 hover:bg-[#193a6b] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Weaving Lore...' : '✦ AI Generate World'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Realm Name & Sub-tabs */}
        <div className="px-6 py-3 border-b border-[#254877]/30 bg-[#06101f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Realm:</span>
            <input
              type="text"
              value={world.worldName}
              onChange={(e) => setWorld({ ...world, worldName: e.target.value })}
              className="w-full bg-[#081528] border border-[#2b5185]/40 rounded-lg px-2.5 py-1 text-xs font-bold text-cyan-300 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'locations', label: 'Locations', icon: MapPin },
              { id: 'magic', label: 'Magic System', icon: Flame },
              { id: 'factions', label: 'Factions', icon: Shield },
              { id: 'creatures', label: 'Creatures', icon: Sparkles },
              { id: 'history', label: 'History', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-[#0b1c36]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#09172d]">
          {/* 1. Locations */}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Cartography & Regions ({world.locations.length})
                </span>
                <button
                  onClick={() => {
                    const newLoc: WorldLocation = {
                      id: 'loc-' + Date.now(),
                      name: 'New Location',
                      type: 'City / Forest / Ruin',
                      climate: 'Temperate',
                      dangerLevel: 'Moderate',
                      description: 'Describe geography and significance...',
                    };
                    setWorld({ ...world, locations: [...world.locations, newLoc] });
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Location
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {world.locations.map((loc, i) => (
                  <div key={loc.id || i} className="p-3.5 rounded-xl bg-[#071327] border border-[#274d80]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={loc.name}
                        onChange={(e) => {
                          const updated = [...world.locations];
                          updated[i] = { ...loc, name: e.target.value };
                          setWorld({ ...world, locations: updated });
                        }}
                        className="bg-transparent font-display font-bold text-sm text-cyan-300 border-0 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          setWorld({ ...world, locations: world.locations.filter((_, idx) => idx !== i) });
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <input
                        type="text"
                        value={loc.type}
                        placeholder="Type"
                        onChange={(e) => {
                          const updated = [...world.locations];
                          updated[i] = { ...loc, type: e.target.value };
                          setWorld({ ...world, locations: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-slate-300"
                      />
                      <input
                        type="text"
                        value={loc.climate}
                        placeholder="Climate"
                        onChange={(e) => {
                          const updated = [...world.locations];
                          updated[i] = { ...loc, climate: e.target.value };
                          setWorld({ ...world, locations: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-slate-300"
                      />
                      <input
                        type="text"
                        value={loc.dangerLevel}
                        placeholder="Danger"
                        onChange={(e) => {
                          const updated = [...world.locations];
                          updated[i] = { ...loc, dangerLevel: e.target.value };
                          setWorld({ ...world, locations: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-amber-300"
                      />
                    </div>

                    <textarea
                      value={loc.description}
                      onChange={(e) => {
                        const updated = [...world.locations];
                        updated[i] = { ...loc, description: e.target.value };
                        setWorld({ ...world, locations: updated });
                      }}
                      rows={2}
                      className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Magic System */}
          {activeTab === 'magic' && (
            <div className="p-4 rounded-xl bg-[#071327] border border-[#274d80]/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Magic System Name
                  </label>
                  <input
                    type="text"
                    value={world.magicSystem?.name || ''}
                    onChange={(e) =>
                      setWorld({
                        ...world,
                        magicSystem: { ...world.magicSystem!, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Source of Power
                  </label>
                  <input
                    type="text"
                    value={world.magicSystem?.source || ''}
                    onChange={(e) =>
                      setWorld({
                        ...world,
                        magicSystem: { ...world.magicSystem!, source: e.target.value },
                      })
                    }
                    className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Limitations & Constraints
                </label>
                <input
                  type="text"
                  value={world.magicSystem?.limitations || ''}
                  onChange={(e) =>
                    setWorld({
                      ...world,
                      magicSystem: { ...world.magicSystem!, limitations: e.target.value },
                    })
                  }
                  className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cost / Consequence of Use
                </label>
                <input
                  type="text"
                  value={world.magicSystem?.cost || ''}
                  onChange={(e) =>
                    setWorld({
                      ...world,
                      magicSystem: { ...world.magicSystem!, cost: e.target.value },
                    })
                  }
                  className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded-lg p-2 text-xs text-amber-300"
                />
              </div>
            </div>
          )}

          {/* 3. Factions */}
          {activeTab === 'factions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Factions & Guilds ({world.factions.length})
                </span>
                <button
                  onClick={() => {
                    const newFac: WorldFaction = {
                      id: 'fac-' + Date.now(),
                      name: 'New Faction',
                      alignment: 'Neutral',
                      goals: 'Influence and expansion...',
                      insignia: 'Emblem symbol',
                    };
                    setWorld({ ...world, factions: [...world.factions, newFac] });
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Faction
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {world.factions.map((fac, i) => (
                  <div key={fac.id || i} className="p-3.5 rounded-xl bg-[#071327] border border-[#274d80]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={fac.name}
                        onChange={(e) => {
                          const updated = [...world.factions];
                          updated[i] = { ...fac, name: e.target.value };
                          setWorld({ ...world, factions: updated });
                        }}
                        className="bg-transparent font-display font-bold text-sm text-cyan-300 border-0 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          setWorld({ ...world, factions: world.factions.filter((_, idx) => idx !== i) });
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <input
                        type="text"
                        value={fac.alignment}
                        placeholder="Alignment"
                        onChange={(e) => {
                          const updated = [...world.factions];
                          updated[i] = { ...fac, alignment: e.target.value };
                          setWorld({ ...world, factions: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-slate-300"
                      />
                      <input
                        type="text"
                        value={fac.insignia || ''}
                        placeholder="Insignia"
                        onChange={(e) => {
                          const updated = [...world.factions];
                          updated[i] = { ...fac, insignia: e.target.value };
                          setWorld({ ...world, factions: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-slate-300"
                      />
                    </div>

                    <textarea
                      value={fac.goals}
                      onChange={(e) => {
                        const updated = [...world.factions];
                        updated[i] = { ...fac, goals: e.target.value };
                        setWorld({ ...world, factions: updated });
                      }}
                      rows={2}
                      placeholder="Goals & motivations..."
                      className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Creatures */}
          {activeTab === 'creatures' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Bestiary ({world.creatures.length})
                </span>
                <button
                  onClick={() => {
                    const newCre: WorldCreature = {
                      id: 'cre-' + Date.now(),
                      name: 'New Creature',
                      habitat: 'Deep forests',
                      traits: 'Characteristics and behavior...',
                      threat: 'Low',
                    };
                    setWorld({ ...world, creatures: [...world.creatures, newCre] });
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Creature
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {world.creatures.map((cre, i) => (
                  <div key={cre.id || i} className="p-3.5 rounded-xl bg-[#071327] border border-[#274d80]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={cre.name}
                        onChange={(e) => {
                          const updated = [...world.creatures];
                          updated[i] = { ...cre, name: e.target.value };
                          setWorld({ ...world, creatures: updated });
                        }}
                        className="bg-transparent font-display font-bold text-sm text-cyan-300 border-0 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          setWorld({ ...world, creatures: world.creatures.filter((_, idx) => idx !== i) });
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <input
                        type="text"
                        value={cre.habitat}
                        placeholder="Habitat"
                        onChange={(e) => {
                          const updated = [...world.creatures];
                          updated[i] = { ...cre, habitat: e.target.value };
                          setWorld({ ...world, creatures: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-slate-300"
                      />
                      <input
                        type="text"
                        value={cre.threat}
                        placeholder="Threat Level"
                        onChange={(e) => {
                          const updated = [...world.creatures];
                          updated[i] = { ...cre, threat: e.target.value };
                          setWorld({ ...world, creatures: updated });
                        }}
                        className="bg-[#040c1a] border border-[#284f82]/30 rounded px-2 py-0.5 text-amber-300"
                      />
                    </div>

                    <textarea
                      value={cre.traits}
                      onChange={(e) => {
                        const updated = [...world.creatures];
                        updated[i] = { ...cre, traits: e.target.value };
                        setWorld({ ...world, creatures: updated });
                      }}
                      rows={2}
                      placeholder="Physical features, behaviors..."
                      className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Historical Eras */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Historical Eras & Timeline
              </span>
              {world.historicalEras.map((era, i) => (
                <div key={era.id || i} className="p-3.5 rounded-xl bg-[#071327] border border-[#274d80]/30 space-y-1.5">
                  <input
                    type="text"
                    value={era.era}
                    onChange={(e) => {
                      const updated = [...world.historicalEras];
                      updated[i] = { ...era, era: e.target.value };
                      setWorld({ ...world, historicalEras: updated });
                    }}
                    className="bg-transparent font-display font-bold text-sm text-cyan-300 border-0 focus:outline-none w-full"
                  />
                  <textarea
                    value={era.description}
                    onChange={(e) => {
                      const updated = [...world.historicalEras];
                      updated[i] = { ...era, description: e.target.value };
                      setWorld({ ...world, historicalEras: updated });
                    }}
                    rows={2}
                    className="w-full bg-[#040c1a] border border-[#284f82]/30 rounded p-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            World lore automatically guides AI story generation and character actions.
          </span>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save World Lore</span>
          </button>
        </div>
      </div>
    </div>
  );
};
