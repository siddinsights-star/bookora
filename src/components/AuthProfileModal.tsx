import React, { useState } from 'react';
import { UserProfile, Story } from '../types';
import { X, User, Cloud, HardDrive, Download, Upload, Check, ShieldCheck, RefreshCw, LogIn } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

interface AuthProfileModalProps {
  user: UserProfile;
  stories: Story[];
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onImportBackup: (importedStories: Story[]) => void;
  onSyncFirestoreStories?: (fetchedStories: Story[]) => void;
}

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  user,
  stories,
  onClose,
  onUpdateUser,
  onImportBackup,
  onSyncFirestoreStories,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Connected to Firebase Firestore & Cloud Vault');

  const handleGoogleSignIn = async () => {
    try {
      setIsSyncing(true);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const updatedUser: UserProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || name,
        email: firebaseUser.email || email,
        isCloudSynced: true,
        lastSyncTime: new Date().toISOString(),
      };
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      onUpdateUser(updatedUser);

      // Sync local stories to Firestore under users/{uid}/stories/{storyId}
      for (const story of stories) {
        const storyRef = doc(db, 'users', firebaseUser.uid, 'stories', story.id);
        await setDoc(storyRef, { ...story, userId: firebaseUser.uid }, { merge: true });
      }

      // Fetch stories from Firestore
      const querySnapshot = await getDocs(collection(db, 'users', firebaseUser.uid, 'stories'));
      const fetched: Story[] = [];
      querySnapshot.forEach((d) => {
        fetched.push(d.data() as Story);
      });
      if (fetched.length > 0 && onSyncFirestoreStories) {
        onSyncFirestoreStories(fetched);
      }

      setSyncStatus(`Successfully signed in as ${firebaseUser.email} & synchronized Firestore vault!`);
    } catch (err: any) {
      console.error(err);
      alert('Google Sign-In failed: ' + (err.message || String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        for (const story of stories) {
          const storyRef = doc(db, 'users', currentUser.uid, 'stories', story.id);
          await setDoc(storyRef, { ...story, userId: currentUser.uid }, { merge: true });
        }
        setSyncStatus(`Firebase Firestore sync complete. ${stories.length} stories synchronized securely.`);
      } else {
        setSyncStatus(`Local archive synchronized (${stories.length} stories). Sign in with Google above to sync with Firebase Cloud.`);
      }
      onUpdateUser({
        ...user,
        name,
        email,
        isCloudSynced: true,
        lastSyncTime: new Date().toISOString(),
      });
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message || String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportFullBackup = () => {
    const backupData = {
      app: 'Bookora Studio',
      exportDate: new Date().toISOString(),
      version: '2.5',
      user: { name, email },
      stories,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookora-complete-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && Array.isArray(parsed.stories)) {
          onImportBackup(parsed.stories);
          alert(`Successfully imported ${parsed.stories.length} stories from backup file.`);
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#09172d] border border-cyan-500/30 shadow-[0_0_50px_rgba(10,50,110,0.4)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#254877]/30 bg-[#071325] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Firebase Account & Cloud Vault</h3>
              <p className="text-xs text-slate-400">
                Google Authentication &middot; <span className="text-cyan-300 font-medium">Created by Siddee Insights &ndash; Web Creator</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Google Sign-In Action */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                Google Authentication
              </span>
              <p className="text-xs text-slate-300">
                {auth.currentUser ? `Signed in as ${auth.currentUser.email}` : 'Sign in with Google to sync stories to your secure Firebase Firestore vault.'}
              </p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 shadow-md flex items-center gap-2 shrink-0 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>{auth.currentUser ? 'Switch Google Account' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* User Profile Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#061224] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#061224] border border-[#2b5185]/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Cloud Sync Status Box */}
          <div className="p-4 rounded-xl bg-[#061224] border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>Firestore Vault Sync</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                {auth.currentUser ? 'Firebase Connected' : 'Local Vault Active'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{syncStatus}</p>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="mt-2 w-full py-2 px-3 rounded-lg text-xs font-medium text-cyan-200 bg-[#122849] border border-cyan-500/30 hover:bg-[#193a6b] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Archive...' : 'Sync Stories with Firebase Firestore'}</span>
            </button>
          </div>

          {/* Backup & Data Portability */}
          <div className="space-y-2 pt-2 border-t border-[#254877]/30">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Complete Data Portability
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExportFullBackup}
                className="p-3 rounded-xl bg-[#0d1e38] border border-[#2b5185]/40 hover:bg-[#142c52] text-xs font-medium text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download JSON Backup</span>
              </button>

              <label className="p-3 rounded-xl bg-[#0d1e38] border border-[#2b5185]/40 hover:bg-[#142c52] text-xs font-medium text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Restore from JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#254877]/30 bg-[#071325] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Created by</span>
            <span className="font-semibold text-white">Siddee Insights</span>
            <span className="text-cyan-400">&ndash;</span>
            <span className="text-cyan-300 font-medium">Web Creator</span>
          </div>

          <button
            onClick={() => {
              onUpdateUser({ ...user, name, email });
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
