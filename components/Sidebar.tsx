'use client';

import React, { useRef, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Hash, Plus, Settings, FolderOpen, Download, Command, MessageSquare, GitBranch } from 'lucide-react';
import { classifyLink, buildAutoDescription, buildAutoTitle } from '@/lib/classifier';
import { mapWithConcurrency } from '@/lib/batch';

interface ImportProgress {
  done: number;
  total: number;
}

export default function Sidebar() {
  const {
    categories, activeCategory, setActiveCategory, exportCSV, openAddModal, addMultipleLinks,
    githubRepos, githubToken, addLink, openRepoExplorer, openRepoDevelop
  } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    // Match http(s) URLs, stopping at whitespace or common chat delimiters
    const urlRegex = /https?:\/\/[^\s<>"')\]]+/g;
    const matches = text.match(urlRegex) || [];
    const cleaned = matches.map(u => u.replace(/[),.!?]+$/g, ''));
    const uniqueUrls = Array.from(new Set(cleaned));

    if (uniqueUrls.length === 0) {
       alert("텍스트 파일 내에서 링크를 찾을 수 없습니다.");
       if (e.target) e.target.value = '';
       return;
    }

    const confirmMsg = `카카오톡 대화록에서 ${uniqueUrls.length}개의 고유 링크를 찾았습니다. 각 링크의 메타데이터와 해시태그를 AI 분석하여 저장합니다. 진행할까요?`;
    if (!confirm(confirmMsg)) {
      if (e.target) e.target.value = '';
      return;
    }

    setImportProgress({ done: 0, total: uniqueUrls.length });

    const newLinks = await mapWithConcurrency(
      uniqueUrls,
      6,
      async (url) => {
        let domain = '웹사이트';
        try { domain = new URL(url).hostname; } catch {}

        let meta: { title?: string; description?: string; image?: string } = {};
        try {
          const res = await fetch(`/api/title?url=${encodeURIComponent(url)}`);
          if (res.ok) meta = await res.json();
        } catch {}

        const { category, tags } = classifyLink(url, { title: meta.title, description: meta.description });
        const title = buildAutoTitle(url, { title: meta.title });
        const description = buildAutoDescription(url, { description: meta.description, title: meta.title });

        return {
          url,
          title,
          description,
          image: meta.image && !meta.image.includes('mock-image') ? meta.image : '/mock-image-1.jpg',
          memo: '카톡 자동 임포트',
          tags: Array.from(new Set([...tags, '카톡추출'])),
          category,
          domain,
          relatedRepo: null,
        };
      },
      (done, total) => setImportProgress({ done, total }),
    );

    await addMultipleLinks(newLinks);
    setImportProgress(null);
    if (e.target) e.target.value = '';
  };

  return (
    <aside style={{
      width: '280px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRepoDevelop(repo);
                      }}
                      title="이 레포 기반으로 발전시키기"
                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', backgroundColor: 'var(--accent-cyan)', color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <GitBranch size={11} /> Develop
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
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* Import progress */}
      {importProgress && (
        <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
            링크 분석 중 · {importProgress.done}/{importProgress.total}
          </div>
          <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${(importProgress.done / Math.max(importProgress.total, 1)) * 100}%`,
              height: '100%', background: 'var(--accent-cyan)', transition: 'width 200ms ease'
            }} />
          </div>
        </div>
      )}

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
