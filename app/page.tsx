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
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        openAddModal(text);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
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
          {/* Update Banner */}
          <div style={{ 
            backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', padding: '16px 24px', 
            marginBottom: '32px', borderLeft: '4px solid var(--accent-cyan)'
          }}>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              4월 18일 [사용성 개선 업데이트]
            </h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyleType: 'disc', paddingLeft: '20px' }}>
              <li>상단 카테고리 칩을 드래그해서 순서 변경을 할 수 있어요.</li>
              <li>이제 모든 링크를 한번에 선택할 수 있어요.</li>
            </ul>
          </div>

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
