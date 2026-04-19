'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddLinkModal from '@/components/AddLinkModal';
import LinkCard from '@/components/LinkCard';
import { useAppContext } from '@/contexts/AppContext';
import { Share, CheckSquare } from 'lucide-react';

export default function Home() {
  const { links, activeCategory, searchQuery, openAddModal, clipboardData } = useAppContext();

  // Create a listener for paste event or globally capturing cmd+v
  useEffect(() => {
    let lastCheckedClipboard = sessionStorage.getItem('lastPasted') || '';

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        lastCheckedClipboard = text;
        sessionStorage.setItem('lastPasted', text);
        openAddModal(text);
      }
    };

    const handleFocus = async () => {
      try {
        const text = await navigator.clipboard.readText();
        // Automatically popup if it's a URL and we haven't already prompted for it
        if (text && text !== lastCheckedClipboard && (text.startsWith('http') || text.startsWith('www'))) {
          lastCheckedClipboard = text;
          sessionStorage.setItem('lastPasted', text);
          openAddModal(text);
        }
      } catch (err) {
        // Permission denied or Safari blocking auto-read
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('focus', handleFocus);
    
    // Check when component mounts initially
    handleFocus();

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('focus', handleFocus);
    };
  }, [openAddModal]);

  const filteredLinks = links.filter(link => {
    const matchCategory = activeCategory === null || link.category === activeCategory;
    const matchSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        link.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>


          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>
              {activeCategory === null ? 'Stashed Links' : activeCategory} 
              <span style={{ color: 'var(--text-tertiary)', fontSize: '18px', marginLeft: '8px' }}>({filteredLinks.length})</span>
            </h1>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                 <Share size={16} /> 공유
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                 <CheckSquare size={16} /> 선택
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                 <LinkCard link={link} />
              </a>
            ))}
            {filteredLinks.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', color: 'var(--text-tertiary)' }}>
                저장된 링크가 없습니다. 화면에서 Cmd+V 또는 Ctrl+V를 눌러 링크를 바로 추가해보세요.
              </div>
            )}
          </div>
        </main>
      </div>

      <AddLinkModal />
    </div>
  );
}
