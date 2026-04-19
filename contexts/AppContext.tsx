'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';

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
  createdAt: number;
};

interface AppContextState {
  links: StashedLink[];
  categories: string[];
  activeCategory: string | null;
  searchQuery: string;
  isAddModalOpen: boolean;
  clipboardData: string | null;
  isPro: boolean;
  user: User | null;
  isAuthLoading: boolean;
  
  // Actions
  addLink: (link: Omit<StashedLink, 'id' | 'createdAt'>) => void;
  removeLink: (id: string) => void;
  setActiveCategory: (cat: string | null) => void;
  setSearchQuery: (query: string) => void;
  openAddModal: (clipboardText?: string) => void;
  closeAddModal: () => void;
  toggleProStatus: () => void;
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
  const [isPro, setIsPro] = useState(true);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 1. Auth Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // 2. Firestore Sync for Links
  useEffect(() => {
    if (!user) {
      setLinks([]); // Clear if logged out
      return;
    }
    const q = query(collection(db, `users/${user.uid}/links`), orderBy('createdAt', 'desc'));
    const unsubDB = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StashedLink[];
      setLinks(data);
      
      // Update categories dynamically from links
      const cats = Array.from(new Set(data.map(l => l.category)));
      // Merge with default ones
      setCategories(Array.from(new Set(['개발', '디자인', '나중에 볼 영상', '아이디어', ...cats])));
    });

    return () => unsubDB();
  }, [user]);

  const addLink = async (linkData: Omit<StashedLink, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/links`), {
        ...linkData,
        createdAt: Date.now()
      });
      setIsAddModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('저장 실패: ' + (e as Error).message);
    }
  };

  const removeLink = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/links/${id}`));
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

  const exportCSV = () => {
    if (!isPro) {
      alert('CSV 익스포트 기능은 Pro 플랜에서 사용 가능합니다.');
      return;
    }
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

  const logoutApp = () => auth.signOut();

  return (
    <AppContext.Provider value={{
      links, categories, activeCategory, searchQuery, isAddModalOpen, clipboardData, isPro,
      user, isAuthLoading,
      addLink, removeLink, setActiveCategory, setSearchQuery, openAddModal, closeAddModal,
      toggleProStatus: () => setIsPro(!isPro), exportCSV, logoutApp
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
