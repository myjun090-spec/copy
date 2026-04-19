'use client';

import React, { useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Search, Hash, Plus, Settings, FolderOpen, Download, Command, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const { categories, activeCategory, setActiveCategory, exportCSV, openAddModal, addMultipleLinks } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    const uniqueUrls = Array.from(new Set(matches));

    if (uniqueUrls.length === 0) {
       alert("텍스트 파일 내에서 링크를 찾을 수 없습니다.");
       if (e.target) e.target.value = '';
       return;
    }

    const confirmMsg = `카카오톡 대화록에서 ${uniqueUrls.length}개의 고유 링크를 찾았습니다. Firebase에 모두 분류하여 저장하시겠습니까?`;
    if (!confirm(confirmMsg)) {
      if (e.target) e.target.value = '';
      return;
    }

    const newLinks = uniqueUrls.map(url => {
        let matchedCategory = '아이디어'; // fallback
        const lowerData = url.toLowerCase();
        
        for (const cat of categories) {
          if (lowerData.includes(cat.toLowerCase())) {
            matchedCategory = cat;
            break;
          }
        }
        
        let generatedTags = ['카톡추출'];
        if (lowerData.includes('github') || lowerData.includes('code') || matchedCategory === '개발') {
          generatedTags = ['개발', '코드', '카톡추출'];
          if (!matchedCategory) matchedCategory = '개발';
        } else if (lowerData.includes('youtube') || lowerData.includes('video')) {
          generatedTags = ['영상', '참고', '카톡추출'];
          matchedCategory = '나중에 볼 영상';
        }
        
        let domain = '웹사이트';
        try { domain = new URL(url).hostname; } catch(e){}

        return {
          url: url,
          title: "카톡 추출 링크",
          description: "카카오톡 내게쓰기에서 자동 임포트된 복구 링크입니다.",
          image: '/mock-image-1.jpg',
          memo: '카카오톡 자동 백업',
          tags: generatedTags,
          category: matchedCategory,
          domain: domain
        };
    });

    await addMultipleLinks(newLinks);
    if (e.target) e.target.value = '';
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Profile Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FF4B4B', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
        }}>
          박
        </div>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>박민준's Space</span>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>
            <button 
              onClick={() => setActiveCategory(null)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 12px', borderRadius: '8px',
                backgroundColor: activeCategory === null ? 'var(--bg-elevated)' : 'transparent',
                color: activeCategory === null ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <FolderOpen size={18} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>All Stashes</span>
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat}>
              <button 
                onClick={() => setActiveCategory(cat)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '8px 12px', borderRadius: '8px',
                  backgroundColor: activeCategory === cat ? 'var(--bg-elevated)' : 'transparent',
                  color: activeCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                <Hash size={18} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{cat}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div style={{ marginTop: '32px' }}>
          <button 
            onClick={() => openAddModal()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)',
              padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500
            }}
          >
            <Plus size={18} /> Add Link
          </button>
        </div>
      </nav>

      {/* Footer Nav */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input type="file" accept=".txt,.csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          <MessageSquare size={18} /> 카톡 파일 스캔
        </button>

        <button 
          onClick={exportCSV}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          <Download size={18} /> Export (CSV)
        </button>
        
        <button 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* Add Shortcut Hint */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
         <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '6px', borderRadius: '6px' }}>
           <Command size={16} color="var(--text-secondary)" />
         </div>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
           <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shortcut</span>
           <span style={{ fontSize: '14px', fontWeight: 600 }}>Cmd/Ctrl + V</span>
         </div>
      </div>
    </aside>
  );
}
