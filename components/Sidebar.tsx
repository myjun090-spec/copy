'use client';

import React, { useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Search, Hash, Plus, Settings, FolderOpen, Download, Command, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { classifyLink } from '@/lib/classifier';

export default function Sidebar() {
  const { 
    categories, activeCategory, setActiveCategory, exportCSV, openAddModal, addMultipleLinks,
    githubRepos, githubToken, addLink, openRepoExplorer, openRoadmap
  } = useAppContext();
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

    const newLinks = await Promise.all(uniqueUrls.map(async (url, index) => {
        const { category, tags } = classifyLink(url);
        
        // Match specific keywords for tech tags (Simulating AI understanding)
        let domain = '웹사이트';
        try { domain = new URL(url).hostname; } catch(e){}

        // Fetch actual metadata for better context
        let displayTitle = domain;
        let displayDesc = "카카오톡 내게쓰기에서 자동 임포트된 링크입니다.";
        let displayImg = '/mock-image-1.jpg';

        if (index < 10) {
          try {
            const res = await fetch(`/api/title?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.title) displayTitle = data.title;
            if (data.description) displayDesc = data.description;
            if (data.image) displayImg = data.image;
          } catch(e) {}
        }

        return {
          url: url,
          title: displayTitle,
          description: displayDesc,
          image: displayImg,
          memo: '카카오톡 자동 백업',
          tags: [...tags, '카톡추출'],
          category: category,
          domain: domain,
          relatedRepo: null // Initial upload is not linked yet
        };
    }));

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

        {/* GitHub Repositories Section */}
        {githubToken && githubRepos.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', padding: '0 12px' }}>
              My Repositories
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {githubRepos.map(repo => (
                <li key={repo.id}>
                  <div style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: '8px', cursor: 'pointer'
                  }} className="repo-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FolderOpen size={16} color="var(--text-secondary)" />
                      <span style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {repo.name}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addLink({
                          url: repo.html_url,
                          title: repo.name,
                          description: repo.description || "나의 GitHub 저장소입니다.",
                          category: '개발',
                          tags: [repo.language || 'Code', 'Repository'],
                          domain: 'github.com',
                          memo: '자동 연동 저장',
                          image: '/mock-image-1.jpg',
                          relatedRepo: repo.name
                        });
                      }}
                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      Stash
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openRepoExplorer(repo);
                      }}
                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', backgroundColor: 'var(--bg-elevated)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)' }}
                    >
                      Explore
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
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
          onClick={openRoadmap}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: 600 }}
        >
          <Sparkles size={18} /> Future Roadmap 🚀
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
