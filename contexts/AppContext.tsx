'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, getRedirectResult, GithubAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { fetchUserRepos, GithubRepo } from '@/lib/github';
import {
  getStorageMode, setStorageMode as persistStorageMode,
  loadLocalLinks, addLocalLink, addLocalLinks, removeLocalLink, removeLocalLinks,
  StorageMode,
} from '@/lib/localStore';

export type StashedLink = {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  memo: string;
  tags: string[];
  category: string;
  domain: string;
  relatedRepo: string | null;
  createdAt: number;
};

interface AppContextState {
  links: StashedLink[];
  categories: string[];
  activeCategory: string | null;
  searchQuery: string;
  isAddModalOpen: boolean;
  clipboardData: string | null;
  user: User | null;
  isAuthLoading: boolean;
  githubRepos: GithubRepo[];
  githubToken: string | null;
  isRoadmapModalOpen: boolean;
  isRepoExplorerOpen: boolean;
  selectedRepo: GithubRepo | null;
  isRepoDevelopOpen: boolean;
  developRepo: GithubRepo | null;
  activeTag: string | null;
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  toast: { kind: 'success' | 'error' | 'info'; message: string } | null;
  dismissToast: () => void;
  storageMode: StorageMode;
  enableLocalMode: () => void;
  switchToCloudMode: () => void;

  // Actions
  addLink: (link: Omit<StashedLink, 'id' | 'createdAt'>) => void;
  addMultipleLinks: (links: Omit<StashedLink, 'id' | 'createdAt'>[]) => Promise<void>;
  removeLink: (id: string) => void;
  removeManyLinks: (ids: string[]) => Promise<void>;
  setActiveCategory: (cat: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTag: (tag: string | null) => void;
  openAddModal: (clipboardText?: string) => void;
  closeAddModal: () => void;
  openRoadmap: () => void;
  closeRoadmap: () => void;
  openRepoExplorer: (repo: GithubRepo) => void;
  closeRepoExplorer: () => void;
  openRepoDevelop: (repo: GithubRepo) => void;
  closeRepoDevelop: () => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setSelectionMode: (on: boolean) => void;
  exportCSV: () => void;
  logoutApp: () => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = useState<StashedLink[]>([]);
  const [categories, setCategories] = useState<string[]>(['개발', '디자인', '나중에 볼 영상', '아이디어']);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clipboardData, setClipboardData] = useState<string | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [githubToken, setGithubToken] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('gh_token') : null);
  
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [isRepoExplorerOpen, setIsRepoExplorerOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [isRepoDevelopOpen, setIsRepoDevelopOpen] = useState(false);
  const [developRepo, setDevelopRepo] = useState<GithubRepo | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setSelectionMode] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>(() => (typeof window !== 'undefined' ? getStorageMode() : 'cloud'));

  const enableLocalMode = () => {
    persistStorageMode('local');
    setStorageMode('local');
    setLinks(loadLocalLinks());
    setIsAuthLoading(false);
  };

  const switchToCloudMode = () => {
    persistStorageMode('cloud');
    setStorageMode('cloud');
    // Data stays in localStorage; cloud sign-in will load the cloud collection
    if (typeof window !== 'undefined') window.location.reload();
  };

  const showToast = (kind: 'success' | 'error' | 'info', message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ kind, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };
  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  // 1. Auth Listener — skip entirely in local mode
  useEffect(() => {
    if (storageMode === 'local') {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        console.info('[auth] uid=%s anonymous=%s provider=%s',
          currentUser.uid,
          currentUser.isAnonymous,
          currentUser.providerData[0]?.providerId ?? 'anonymous',
        );
      }

      if (currentUser && githubToken) {
        const repos = await fetchUserRepos(githubToken);
        setGithubRepos(repos);
      }
    });
    return () => unsubAuth();
  }, [storageMode]);

  // 2. Links Source — cloud (Firestore) OR local (localStorage)
  useEffect(() => {
    if (storageMode === 'local') {
      const data = loadLocalLinks();
      setLinks(data);
      const cats = Array.from(new Set(data.map(l => l.category)));
      setCategories(Array.from(new Set(['개발', '디자인', '나중에 볼 영상', '아이디어', ...cats])));
      return;
    }
    if (!user) {
      setLinks([]);
      return;
    }
    const q = query(collection(db, `users/${user.uid}/links`), orderBy('createdAt', 'desc'));
    const unsubDB = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StashedLink[];
      setLinks(data);
      const cats = Array.from(new Set(data.map(l => l.category)));
      setCategories(Array.from(new Set(['개발', '디자인', '나중에 볼 영상', '아이디어', ...cats])));
    });

    return () => unsubDB();
  }, [user, storageMode]);

  const addLink = async (linkData: Omit<StashedLink, 'id' | 'createdAt'>) => {
    if (storageMode === 'local') {
      try {
        const created = addLocalLink(linkData);
        setLinks(prev => [created, ...prev]);
        setIsAddModalOpen(false);
        showToast('success', `저장됨 — "${linkData.title.slice(0, 40)}"`);
      } catch (e) {
        console.error('[addLink/local] failed', e);
        showToast('error', `저장 실패: ${(e as Error).message}`);
      }
      return;
    }
    if (!user) {
      showToast('error', '로그인이 필요합니다.');
      return;
    }
    try {
      await addDoc(collection(db, `users/${user.uid}/links`), {
        ...linkData,
        createdAt: Date.now()
      });
      setIsAddModalOpen(false);
      showToast('success', `저장됨 — "${linkData.title.slice(0, 40)}"`);
    } catch (e) {
      console.error('[addLink] failed', e);
      showToast('error', `저장 실패: ${(e as Error).message}`);
    }
  };

  const addMultipleLinks = async (linksData: Omit<StashedLink, 'id' | 'createdAt'>[]) => {
    if (storageMode === 'local') {
      try {
        const created = addLocalLinks(linksData);
        setLinks(prev => [...created, ...prev]);
        showToast('success', `${linksData.length}개 링크 저장 완료 (이 기기)`);
      } catch (e) {
        console.error('[addMultipleLinks/local] failed', e);
        showToast('error', `일괄 저장 실패: ${(e as Error).message}`);
      }
      return;
    }
    if (!user) {
      showToast('error', '로그인이 필요합니다.');
      return;
    }
    try {
      await Promise.all(linksData.map(link =>
        addDoc(collection(db, `users/${user.uid}/links`), {
          ...link,
          createdAt: Date.now()
        })
      ));
      showToast('success', `${linksData.length}개 링크 저장 완료`);
    } catch (e) {
      console.error('[addMultipleLinks] failed', e);
      showToast('error', `일괄 저장 실패: ${(e as Error).message}`);
    }
  };

  const removeLink = async (id: string) => {
    if (storageMode === 'local') {
      try {
        removeLocalLink(id);
        setLinks(prev => prev.filter(l => l.id !== id));
        showToast('info', '삭제됨');
      } catch (e) {
        console.error('[removeLink/local] failed', e);
        showToast('error', `삭제 실패: ${(e as Error).message}`);
      }
      return;
    }
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/links/${id}`));
      showToast('info', '삭제됨');
    } catch (e) {
      console.error('[removeLink] failed', e);
      showToast('error', `삭제 실패: ${(e as Error).message}`);
    }
  };

  const removeManyLinks = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (storageMode === 'local') {
      try {
        removeLocalLinks(ids);
        const set = new Set(ids);
        setLinks(prev => prev.filter(l => !set.has(l.id)));
        setSelectedIds(new Set());
        setSelectionMode(false);
        showToast('info', `${ids.length}개 삭제됨`);
      } catch (e) {
        console.error('[removeManyLinks/local] failed', e);
        showToast('error', `일괄 삭제 실패: ${(e as Error).message}`);
      }
      return;
    }
    if (!user) return;
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, `users/${user.uid}/links/${id}`))));
      setSelectedIds(new Set());
      setSelectionMode(false);
      showToast('info', `${ids.length}개 삭제됨`);
    } catch (e) {
      console.error('[removeManyLinks] failed', e);
      showToast('error', `일괄 삭제 실패: ${(e as Error).message}`);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const openAddModal = async (text?: string) => {
    if (text) {
      setClipboardData(text);
    } else {
      try {
        const clipText = await navigator.clipboard.readText();
        setClipboardData(clipText);
      } catch (err) {
        setClipboardData('');
      }
    }
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setClipboardData(null);
  };

  const openRoadmap = () => setIsRoadmapModalOpen(true);
  const closeRoadmap = () => setIsRoadmapModalOpen(false);
  
  const openRepoExplorer = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setIsRepoExplorerOpen(true);
  };
  const closeRepoExplorer = () => {
    setIsRepoExplorerOpen(false);
    setSelectedRepo(null);
  };

  const openRepoDevelop = (repo: GithubRepo) => {
    setDevelopRepo(repo);
    setIsRepoDevelopOpen(true);
  };
  const closeRepoDevelop = () => {
    setIsRepoDevelopOpen(false);
    setDevelopRepo(null);
  };

  const exportCSV = () => {
    const header = ['URL', '제목', '설명', '메모', '카테고리', '태그', '저장일'];
    const csvContent = [
      header.join(','),
      ...links.map(l => [
        `"${l.url}"`,
        `"${l.title.replace(/"/g, '""')}"`,
        `"${l.description.replace(/"/g, '""')}"`,
        `"${l.memo.replace(/"/g, '""')}"`,
        `"${l.category}"`,
        `"${l.tags?.join(' ') || ''}"`,
        `"${new Date(l.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'stashby_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const logoutApp = () => {
    if (storageMode === 'local') {
      // Exit local mode so AuthOverlay shows again. Keeps stored links intact.
      persistStorageMode('cloud');
      if (typeof window !== 'undefined') window.location.reload();
      return;
    }
    auth.signOut();
  };

  return (
    <AppContext.Provider value={{
      links, categories, activeCategory, searchQuery, isAddModalOpen, clipboardData,
      user, isAuthLoading, githubRepos, githubToken,
      isRoadmapModalOpen, isRepoExplorerOpen, selectedRepo,
      isRepoDevelopOpen, developRepo, activeTag, selectedIds, isSelectionMode,
      toast, dismissToast,
      storageMode, enableLocalMode, switchToCloudMode,
      addLink, addMultipleLinks, removeLink, removeManyLinks,
      setActiveCategory, setSearchQuery, setActiveTag,
      openAddModal, closeAddModal,
      openRoadmap, closeRoadmap, openRepoExplorer, closeRepoExplorer,
      openRepoDevelop, closeRepoDevelop,
      toggleSelection, clearSelection, setSelectionMode,
      exportCSV, logoutApp
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const setGithubTokenGlobal = (token: string) => {
  localStorage.setItem('gh_token', token);
  window.location.reload(); // Quick way to refresh state
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
