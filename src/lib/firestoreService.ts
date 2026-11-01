import { doc, getDocs, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Story, UserProfile } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Clean undefined values from object because Firestore rejects `undefined`
function cleanUndefined<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanUndefined(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Save a single story to Firestore under /users/{userId}/stories/{storyId}
 */
export async function saveStoryToFirestore(userId: string, story: Story): Promise<void> {
  const path = `users/${userId}/stories/${story.id}`;
  try {
    const storyDocRef = doc(db, 'users', userId, 'stories', story.id);
    const sanitized = cleanUndefined({
      ...story,
      userId,
      updatedAt: story.updatedAt || new Date().toISOString(),
      createdAt: story.createdAt || new Date().toISOString(),
    });
    await setDoc(storyDocRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load all stories for a user from Firestore
 */
export async function loadUserStoriesFromFirestore(userId: string): Promise<Story[]> {
  const path = `users/${userId}/stories`;
  try {
    const storiesCol = collection(db, 'users', userId, 'stories');
    const snapshot = await getDocs(storiesCol);
    const stories: Story[] = [];
    snapshot.forEach((docSnap) => {
      stories.push(docSnap.data() as Story);
    });
    return stories;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Delete a story from Firestore
 */
export async function deleteStoryFromFirestore(userId: string, storyId: string): Promise<void> {
  const path = `users/${userId}/stories/${storyId}`;
  try {
    const storyDocRef = doc(db, 'users', userId, 'stories', storyId);
    await deleteDoc(storyDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sync all local stories to Firestore
 */
export async function syncAllStoriesToFirestore(userId: string, stories: Story[]): Promise<number> {
  let count = 0;
  for (const story of stories) {
    await saveStoryToFirestore(userId, story);
    count++;
  }
  return count;
}

/**
 * Save UserProfile to Firestore under /users/{userId}
 */
export async function saveUserProfileToFirestore(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const sanitized = cleanUndefined({
      id: userId,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl || '',
      isCloudSynced: true,
      lastSyncTime: new Date().toISOString(),
    });
    await setDoc(userDocRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
