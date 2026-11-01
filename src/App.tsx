import React, { useState, useEffect } from 'react';
import {
  Story,
  ViewTab,
  UserProfile,
  CharacterProfile,
  StoryChapter,
  WorldLore,
  BookCoverConfig,
  StoryVersion,
  StorySceneIllustration,
} from './types';
import { INITIAL_STORIES } from './data/initialStories';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StoryEditor } from './components/StoryEditor';
import { ToolsPanel } from './components/ToolsPanel';
import { AutoIllustratorPanel } from './components/AutoIllustratorPanel';
import { LibraryView } from './components/LibraryView';
import { ReaderModal } from './components/ReaderModal';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { StoryContinuationModal } from './components/StoryContinuationModal';
import { GrammarVocabularyModal } from './components/GrammarVocabularyModal';
import { ChapterManagerModal } from './components/ChapterManagerModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { BookCoverGeneratorModal } from './components/BookCoverGeneratorModal';
import { WorldBuilderModal } from './components/WorldBuilderModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { AuthProfileModal } from './components/AuthProfileModal';
import { AboutCreditsModal } from './components/AboutCreditsModal';
import { Sparkles, Wand2 } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from './lib/firebase';
import {
  saveStoryToFirestore,
  loadUserStoriesFromFirestore,
  deleteStoryFromFirestore,
  syncAllStoriesToFirestore,
  saveUserProfileToFirestore,
} from './lib/firestoreService';

const STORAGE_KEY = 'bookora_saved_stories_v3';
const USER_KEY = 'bookora_user_profile_v3';

export default function App() {
  // User profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
    return {
      id: 'usr-1',
      name: 'Siddharth M.',
      email: 'siddinsights@gmail.com',
      isCloudSynced: true,
      lastSyncTime: new Date().toISOString(),
    };
  });

  // Load stories from local storage or default to initial sample stories
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved stories', e);
    }
    return INITIAL_STORIES;
  });

  const [currentStoryId, setCurrentStoryId] = useState<string>(() => {
    return stories[0]?.id || 'story-1';
  });

  const [currentTab, setCurrentTab] = useState<ViewTab>('editor');
  const [isHeroCollapsed, setIsHeroCollapsed] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [readerStoryId, setReaderStoryId] = useState<string | null>(null);
  const [activeDirectorScene, setActiveDirectorScene] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('Ready to write');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'tools' | 'illustrator'>('tools');

  // Active Modals
  type ActiveModalType =
    | null
    | 'continuation'
    | 'grammar'
    | 'chapters'
    | 'characters'
    | 'world'
    | 'cover'
    | 'history'
    | 'profile'
    | 'about';

  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  // Monitor Firebase Auth state & sync stories with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsFirebaseConnected(true);
        const updatedUser: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || user.name,
          email: firebaseUser.email || user.email,
          avatarUrl: firebaseUser.photoURL || undefined,
          isCloudSynced: true,
          lastSyncTime: new Date().toISOString(),
        };
        setUser(updatedUser);
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
          saveUserProfileToFirestore(firebaseUser.uid, updatedUser).catch(console.error);
        } catch (e) {
          console.error(e);
        }

        // Load stories from Firestore
        try {
          setIsFirebaseSyncing(true);
          const cloudStories = await loadUserStoriesFromFirestore(firebaseUser.uid);
          if (cloudStories && cloudStories.length > 0) {
            // Merge with local stories
            const map = new Map<string, Story>();
            stories.forEach((s) => map.set(s.id, s));
            cloudStories.forEach((s) => map.set(s.id, s));
            const merged = Array.from(map.values());
            persistStories(merged);
            setSaveStatus('Firebase Connected');
          } else if (stories.length > 0) {
            // Seed Firestore with local stories
            await syncAllStoriesToFirestore(firebaseUser.uid, stories);
            setSaveStatus('Firebase Synced');
          }
        } catch (err) {
          console.error('Failed to sync stories with Firestore:', err);
        } finally {
          setIsFirebaseSyncing(false);
        }
      } else {
        setIsFirebaseConnected(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleQuickGoogleSignIn = async () => {
    try {
      setIsFirebaseSyncing(true);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      showToast(`Connected to Firebase as ${firebaseUser.email}!`);
      // Sync local stories to Firestore
      await syncAllStoriesToFirestore(firebaseUser.uid, stories);
      setSaveStatus('Saved to Firebase');
    } catch (err: any) {
      console.error(err);
      showToast('Firebase Sign-In: ' + (err.message || 'Cancelled'));
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Active story reference
  const currentStory =
    stories.find((s) => s.id === currentStoryId) || stories[0] || INITIAL_STORIES[0];

  // Helper toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync with localStorage
  const persistStories = (updatedStories: Story[]) => {
    setStories(updatedStories);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
    } catch (e) {
      console.error('Storage error', e);
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
    showToast('Author profile updated and cloud synced.');
  };

  // Update current story fields
  const handleUpdateCurrentStory = (updated: Partial<Story>) => {
    const updatedList = stories.map((s) => {
      if (s.id === currentStory.id) {
        const newStory = {
          ...s,
          ...updated,
          updatedAt: new Date().toISOString(),
        };
        if (updated.content !== undefined) {
          newStory.wordCount = updated.content.trim()
            ? updated.content.trim().split(/\s+/).filter(Boolean).length
            : 0;
        }
        return newStory;
      }
      return s;
    });

    persistStories(updatedList);
    setSaveStatus('Saved locally');
  };

  // Manual save trigger
  const handleSave = () => {
    // Automatically save a version snapshot if content changed
    const autoSnapshot: StoryVersion = {
      id: 'ver-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: currentStory.title,
      content: currentStory.content,
      wordCount: currentStory.wordCount,
      summary: 'Manual Save Milestone',
    };

    const existingHistory = currentStory.versionHistory || [];
    handleUpdateCurrentStory({
      versionHistory: [autoSnapshot, ...existingHistory.slice(0, 15)],
    });

    setSaveStatus('Saved just now');
    showToast('Manuscript saved to your private Bookora archive.');
  };

  // Create new story
  const handleNewStory = () => {
    const newStory: Story = {
      id: 'story-' + Date.now(),
      title: 'Untitled Manuscript',
      author: user.name,
      genre: 'Fantasy',
      tone: 'Cinematic',
      length: 'Short',
      language: 'en',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
      chapters: [],
      characters: [],
      versionHistory: [],
    };

    const updated = [newStory, ...stories];
    persistStories(updated);
    setCurrentStoryId(newStory.id);
    setCurrentTab('editor');
    setSaveStatus('New manuscript ready');
    showToast('New book canvas ready!');
  };

  // Select an existing story
  const handleSelectStory = (id: string) => {
    setCurrentStoryId(id);
    setCurrentTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Duplicate a story
  const handleDuplicateStory = (id: string) => {
    const target = stories.find((s) => s.id === id);
    if (!target) return;

    const copy: Story = {
      ...target,
      id: 'story-' + Date.now(),
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    persistStories([copy, ...stories]);
    showToast('Story duplicated in your library.');
  };

  // Delete a story
  const handleDeleteStory = (id: string) => {
    const remaining = stories.filter((s) => s.id !== id);
    const fallback = remaining[0] || {
      id: 'story-' + Date.now(),
      title: 'Untitled Manuscript',
      genre: 'Fantasy',
      tone: 'Cinematic',
      language: 'en',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
    };

    const finalList = remaining.length > 0 ? remaining : [fallback];
    persistStories(finalList);

    if (currentStoryId === id) {
      setCurrentStoryId(finalList[0].id);
    }
    showToast('Story removed from library.');
  };

  // Handle AI generated story application
  const handleApplyGeneratedStory = (storyText: string, suggestedTitle?: string) => {
    handleUpdateCurrentStory({
      content: storyText,
      ...(suggestedTitle ? { title: suggestedTitle } : {}),
    });
    setSaveStatus('AI Story generated');
    showToast('Story generated! Ready to refine.');
  };

  // Handle continuation from modal
  const handleApplyContinuation = (
    newText: string,
    mode: 'append' | 'replace' | 'new_chapter'
  ) => {
    if (mode === 'new_chapter') {
      const nextNum = (currentStory.chapters?.length || 0) + 1;
      const newChap: StoryChapter = {
        id: 'chap-' + Date.now(),
        chapterNumber: nextNum,
        title: `Chapter ${nextNum}: Continuation`,
        content: newText,
        wordCount: newText.trim().split(/\s+/).filter(Boolean).length,
      };
      const updatedChapters = [...(currentStory.chapters || []), newChap];
      const appendedStory = currentStory.content + `\n\n## Chapter ${nextNum}: Continuation\n\n` + newText;
      handleUpdateCurrentStory({
        content: appendedStory,
        chapters: updatedChapters,
      });
    } else {
      const separator = currentStory.content.endsWith('\n') ? '\n' : '\n\n';
      const updatedContent = currentStory.content + separator + newText;
      handleUpdateCurrentStory({ content: updatedContent });
    }
    setActiveModal(null);
    showToast('Continuation merged into manuscript.');
  };

  // Handle grammar & rewrite accept
  const handleApplyGrammarChanges = (correctedText: string) => {
    handleUpdateCurrentStory({ content: correctedText });
    setActiveModal(null);
    showToast('Enhanced prose accepted into manuscript.');
  };

  // Handle Chapter updates
  const handleUpdateChapters = (chapters: StoryChapter[]) => {
    handleUpdateCurrentStory({ chapters });
    showToast('Chapters & illustrations synchronized.');
  };

  // Handle Character updates
  const handleUpdateCharacters = (characters: CharacterProfile[]) => {
    handleUpdateCurrentStory({ characters });
    showToast('Character identities & visual anchors saved.');
  };

  // Handle World Lore save
  const handleSaveWorld = (worldLore: WorldLore) => {
    handleUpdateCurrentStory({ worldLore });
    showToast('Fantasy world lore saved to story.');
  };

  // Handle Book Cover save
  const handleSaveCover = (coverConfig: BookCoverConfig, coverImageUrl?: string) => {
    handleUpdateCurrentStory({
      coverConfig,
      coverImage: coverImageUrl || currentStory.coverImage,
    });
    showToast('Book cover design saved!');
  };

  // Handle Snapshot creation
  const handleCreateSnapshot = (summary: string) => {
    const newSnapshot: StoryVersion = {
      id: 'ver-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: currentStory.title,
      content: currentStory.content,
      wordCount: currentStory.wordCount,
      summary,
    };
    const updatedHistory = [newSnapshot, ...(currentStory.versionHistory || [])];
    handleUpdateCurrentStory({ versionHistory: updatedHistory });
    showToast('Snapshot saved to version history.');
  };

  // Handle Snapshot restore
  const handleRestoreVersion = (version: StoryVersion) => {
    handleUpdateCurrentStory({
      content: version.content,
    });
    showToast(`Restored snapshot from ${new Date(version.timestamp).toLocaleDateString()}.`);
  };

  // Handle backup import
  const handleImportBackup = (importedStories: Story[]) => {
    persistStories(importedStories);
    if (importedStories[0]) {
      setCurrentStoryId(importedStories[0].id);
    }
  };

  // Handle attaching artwork
  const handleAttachCoverImage = (imageUrl: string, prompt: string) => {
    handleUpdateCurrentStory({
      coverImage: imageUrl,
      imagePrompt: prompt,
    });
    showToast('Artwork attached to story!');
  };

  // Handle inserting markdown image into content
  const handleInsertImageIntoContent = (markdownImage: string) => {
    const updatedContent = currentStory.content + markdownImage;
    handleUpdateCurrentStory({ content: updatedContent });
    showToast('Illustration markdown added to manuscript.');
  };

  // Handle automatic illustrated scenes update
  const handleUpdateIllustratedScenes = (illustratedScenes: StorySceneIllustration[]) => {
    handleUpdateCurrentStory({ illustratedScenes });
    showToast(`Saved ${illustratedScenes.length} book illustrations.`);
  };

  const handleToggleAutoIllustrate = (enabled: boolean) => {
    handleUpdateCurrentStory({ autoIllustrateEnabled: enabled });
    showToast(enabled ? 'Automatic book illustrations enabled.' : 'Automatic illustrations paused.');
  };

  // Quick Seed clicked from Hero Banner
  const handleSelectPromptSeed = (seed: string, genre: string, tone: string) => {
    setCurrentTab('editor');
    handleUpdateCurrentStory({
      genre,
      tone,
    });
    showToast(`Genre set to ${genre}. Paste or generate your story!`);
  };

  // Aggregated studio stats
  const totalWords = stories.reduce((sum, s) => sum + (s.wordCount || 0), 0);
  const illustratedCount = stories.filter((s) => Boolean(s.coverImage)).length;

  return (
    <div className="min-h-screen cosmic-radial flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* 3-Zone Top Bar - BOOKORA Book Creation Studio */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'reader') {
            setReaderStoryId(currentStory.id);
          } else {
            setCurrentTab(tab);
          }
        }}
        onNewStory={handleNewStory}
        onToggleFocus={() => setIsFocusMode(true)}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenAbout={() => setActiveModal('about')}
        user={user}
        storyCount={stories.length}
      />

      {/* Atmospheric Hero Banner */}
      <HeroBanner
        storyCount={stories.length}
        totalWords={totalWords}
        illustratedCount={illustratedCount}
        isCollapsed={isHeroCollapsed}
        onToggleCollapse={() => setIsHeroCollapsed(!isHeroCollapsed)}
        onSelectPromptSeed={handleSelectPromptSeed}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {currentTab === 'library' ? (
          <LibraryView
            stories={stories}
            onSelectStory={handleSelectStory}
            onOpenReader={(id) => setReaderStoryId(id)}
            onDuplicateStory={handleDuplicateStory}
            onDeleteStory={handleDeleteStory}
            onNewStory={handleNewStory}
          />
        ) : (
          /* Dual-column Studio Workspace: Editor (Left) & Tools/Director (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Story Manuscript Editor */}
            <div className="lg:col-span-7 xl:col-span-7">
              <StoryEditor
                story={currentStory}
                onChange={handleUpdateCurrentStory}
                onSave={handleSave}
                onOpenReader={() => setReaderStoryId(currentStory.id)}
                onToggleFocus={() => setIsFocusMode(true)}
                onDirectScene={(scene) => {
                  setActiveDirectorScene(scene);
                  setRightPanelTab('tools');
                }}
                onOpenContinuation={() => setActiveModal('continuation')}
                onOpenGrammar={() => setActiveModal('grammar')}
                onOpenChapters={() => setActiveModal('chapters')}
                onOpenCharacters={() => setActiveModal('characters')}
                onOpenWorldBuilder={() => setActiveModal('world')}
                onOpenBookCover={() => setActiveModal('cover')}
                onOpenVersionHistory={() => setActiveModal('history')}
                onOpenAutoIllustrator={() => setRightPanelTab('illustrator')}
                onUpdateIllustratedScenes={handleUpdateIllustratedScenes}
                saveStatus={saveStatus}
              />
            </div>

            {/* Right 5 Columns: AI Generator & Auto-Illustrator Studio */}
            <div className="lg:col-span-5 xl:col-span-5 sticky top-24 flex flex-col gap-3">
              {/* Studio Sidebar Mode Switcher */}
              <div className="flex items-center justify-between p-1 rounded-xl bg-[#081528] border border-[#264977]/40 shadow-lg">
                <button
                  onClick={() => setRightPanelTab('tools')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    rightPanelTab === 'tools'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>AI Story & Sparks</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('illustrator')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    rightPanelTab === 'illustrator'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>Auto-Illustrator ({currentStory.illustratedScenes?.length || 0})</span>
                </button>
              </div>

              {rightPanelTab === 'tools' ? (
                <ToolsPanel
                  story={currentStory}
                  onApplyGeneratedStory={handleApplyGeneratedStory}
                  onAppendContinuation={(cont) => {
                    const separator = currentStory.content.endsWith('\n') ? '\n' : '\n\n';
                    handleUpdateCurrentStory({ content: currentStory.content + separator + cont });
                    showToast('Narrative expanded!');
                  }}
                  onAttachCoverImage={handleAttachCoverImage}
                  onInsertImageIntoContent={handleInsertImageIntoContent}
                  activeDirectorScene={activeDirectorScene}
                  onClearDirectorScene={() => setActiveDirectorScene('')}
                />
              ) : (
                <AutoIllustratorPanel
                  story={currentStory}
                  onUpdateIllustratedScenes={handleUpdateIllustratedScenes}
                  onToggleAutoIllustrate={handleToggleAutoIllustrate}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Website Footer with Creator Credit */}
      <footer className="border-t border-[#234270]/30 py-8 text-xs text-slate-400 bg-[#040a16] relative overflow-hidden">
        {/* Subtle glowing ambient accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-cyan-600/5 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Main Brand Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-white">
                BOOK<span className="text-cyan-400">ORA</span>
              </span>
              <span className="text-slate-600">&middot;</span>
              <span className="text-slate-300 font-medium">Book &amp; Magazine Design Studio</span>
            </div>
            <span className="hidden sm:inline text-slate-600">&middot;</span>
            <span className="text-[11px] text-slate-500">Next-Gen Story &amp; Publishing Suite</span>
          </div>

          {/* Creator Credit with subtle blue neon styling */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
            <button
              onClick={() => setActiveModal('about')}
              title="View Creator Credits & About BOOKORA"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#091b36] border border-cyan-500/30 text-xs text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-[#102952] transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <span>Created by <strong className="text-cyan-300 group-hover:text-cyan-200 font-semibold">Siddee Insights</strong></span>
              <span className="text-cyan-500">&ndash;</span>
              <span className="text-slate-400 group-hover:text-slate-200">Web Creator</span>
            </button>
            <button
              onClick={() => setActiveModal('about')}
              className="text-[11px] text-slate-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              About &amp; Credits
            </button>
          </div>
        </div>
      </footer>

      {/* Reader Modal View */}
      {readerStoryId && (
        <ReaderModal
          story={stories.find((s) => s.id === readerStoryId) || currentStory}
          onClose={() => setReaderStoryId(null)}
        />
      )}

      {/* Fullscreen Zen Focus Mode */}
      {isFocusMode && (
        <FocusModeOverlay
          title={currentStory.title}
          content={currentStory.content}
          onChangeContent={(content) => handleUpdateCurrentStory({ content })}
          onExit={() => setIsFocusMode(false)}
        />
      )}

      {/* Feature Modal: AI Story Continuation */}
      {activeModal === 'continuation' && (
        <StoryContinuationModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onApplyContinuation={handleApplyContinuation}
        />
      )}

      {/* Feature Modal: AI Grammar & Vocabulary Polish */}
      {activeModal === 'grammar' && (
        <GrammarVocabularyModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onApplyChanges={handleApplyGrammarChanges}
        />
      )}

      {/* Feature Modal: Chapter-wise AI Images */}
      {activeModal === 'chapters' && (
        <ChapterManagerModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onUpdateChapters={handleUpdateChapters}
        />
      )}

      {/* Feature Modal: Character Creator & Consistency */}
      {activeModal === 'characters' && (
        <CharacterCreatorModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onUpdateCharacters={handleUpdateCharacters}
        />
      )}

      {/* Feature Modal: Fantasy World Builder */}
      {activeModal === 'world' && (
        <WorldBuilderModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onSaveWorld={handleSaveWorld}
        />
      )}

      {/* Feature Modal: AI Book Cover Generator */}
      {activeModal === 'cover' && (
        <BookCoverGeneratorModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onSaveCover={handleSaveCover}
        />
      )}

      {/* Feature Modal: Story Version History */}
      {activeModal === 'history' && (
        <VersionHistoryModal
          story={currentStory}
          onClose={() => setActiveModal(null)}
          onRestoreVersion={handleRestoreVersion}
          onCreateSnapshot={handleCreateSnapshot}
        />
      )}

      {/* Feature Modal: User Profile & Cloud Storage */}
      {activeModal === 'profile' && (
        <AuthProfileModal
          user={user}
          stories={stories}
          onClose={() => setActiveModal(null)}
          onUpdateUser={handleUpdateUser}
          onImportBackup={handleImportBackup}
          onSyncFirestoreStories={(fetched) => persistStories(fetched)}
        />
      )}

      {/* Feature Modal: About & Creator Credits */}
      {activeModal === 'about' && (
        <AboutCreditsModal onClose={() => setActiveModal(null)} />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#12284c] border border-cyan-400/40 text-cyan-200 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
