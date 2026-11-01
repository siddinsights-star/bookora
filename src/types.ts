export type Language = 'en' | 'ml' | 'ar' | 'ur' | 'kn';

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  age?: string;
  appearance: string;
  hair?: string;
  clothing?: string;
  personality: string;
  backstory: string;
  relationships?: string;
  referenceImageUrl?: string;
  visualAnchorPrompt?: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  illustrationUrl?: string;
  illustrationPrompt?: string;
  wordCount: number;
}

export interface WorldLocation {
  id: string;
  name: string;
  type: string;
  climate: string;
  dangerLevel: string;
  description: string;
}

export interface MagicSystem {
  name: string;
  source: string;
  rules: string[];
  limitations: string;
  cost: string;
}

export interface WorldFaction {
  id: string;
  name: string;
  alignment: string;
  goals: string;
  insignia?: string;
}

export interface WorldCreature {
  id: string;
  name: string;
  habitat: string;
  traits: string;
  threat: string;
}

export interface HistoricalEra {
  id: string;
  era: string;
  description: string;
}

export interface WorldLore {
  id: string;
  worldName: string;
  theme: string;
  locations: WorldLocation[];
  magicSystem?: MagicSystem;
  factions: WorldFaction[];
  creatures: WorldCreature[];
  historicalEras: HistoricalEra[];
}

export interface BookCoverConfig {
  title: string;
  subtitle?: string;
  author: string;
  tagline?: string;
  coverStyle: 'Epic Fantasy' | 'Cinematic Noir' | 'Gilded Classic' | 'Minimalist Modern' | 'Vintage Graphic';
  coverImageUrl?: string;
  accentColor: string;
  fontFamily: string;
}

export interface StoryVersion {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  wordCount: number;
  summary: string;
}

export interface StorySceneIllustration {
  id: string;
  sceneNumber: number;
  chapterId?: string;
  chapterNumber?: number;
  paragraphIndex?: number;
  title: string;
  textSnippet: string;
  visualPrompt: string;
  imageUrl?: string;
  layout: 'full-width' | 'left-wrap' | 'right-wrap' | 'banner';
  size: 'small' | 'medium' | 'large' | 'full';
  style?: string;
  status?: 'idle' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  tone: string;
  length?: string;
  language: Language;
  author?: string;
  coverImage?: string;
  imagePrompt?: string;
  updatedAt: string;
  createdAt: string;
  wordCount: number;
  autoIllustrateEnabled?: boolean;
  illustratedScenes?: StorySceneIllustration[];
  chapters?: StoryChapter[];
  characters?: CharacterProfile[];
  worldLore?: WorldLore;
  coverConfig?: BookCoverConfig;
  versionHistory?: StoryVersion[];
  twists?: { headline: string; description: string; snippet?: string }[];
}

export type ViewTab =
  | 'editor'
  | 'library'
  | 'director'
  | 'characters'
  | 'world'
  | 'cover'
  | 'reader';

export type ArtStyle =
  | 'cinematic digital storybook illustration'
  | 'watercolor children\'s book art'
  | 'anime-inspired illustration'
  | 'realistic cinematic concept art'
  | 'classic fantasy oil painting'
  | 'dark graphic novel and comic art'
  | 'cyberpunk neon concept art'
  | 'vintage retro-futuristic sci-fi';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isCloudSynced: boolean;
  lastSyncTime?: string;
}
