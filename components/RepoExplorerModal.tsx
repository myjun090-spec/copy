'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { X, Folder, File, ChevronLeft, Search, Plus, Code } from 'lucide-react';
import { fetchRepoContents, fetchFileRaw, GithubContent } from '@/lib/github';

export default function RepoExplorerModal() {
  const { isRepoExplorerOpen, closeRepoExplorer, selectedRepo, githubToken, addLink } = useAppContext();
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState<GithubContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GithubContent | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    if (isRepoExplorerOpen && selectedRepo && githubToken) {
      loadPath('');
    } else {
      setContents([]);
      setCurrentPath('');
      setSelectedFile(null);
      setFileContent('');
    }
  }, [isRepoExplorerOpen, selectedRepo, githubToken]);

  const loadPath = async (path: string) => {
    if (!selectedRepo || !githubToken) return;
    setIsLoading(true);
    const data = await fetchRepoContents(githubToken, selectedRepo.owner!.login, selectedRepo.name, path);
    setContents(data);
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent('');
    setIsLoading(false);
  };

  const handleFileClick = async (item: GithubContent) => {
    if (item.type === 'dir') {
      loadPath(item.path);
    } else {
      setIsLoading(true);
      setSelectedFile(item);
      if (item.download_url) {
        const raw = await fetchFileRaw(item.download_url);
        setFileContent(raw);
      }
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    loadPath(parts.join('/'));
  };

  const stashSnippet = () => {
    if (!selectedFile || !selectedRepo) return;
    
    addLink({
      url: `${selectedRepo.html_url}/blob/main/${selectedFile.path}`,
      title: `${selectedRepo.name} / ${selectedFile.name}`,
      description: `${selectedFile.path} 파일의 소스 코드입니다.`,
      category: '개발',
      tags: ['Code', 'Snippet', selectedRepo.language || 'Software'],
      domain: 'github.com',
      memo: fileContent.substring(0, 500),
      image: '/mock-image-1.jpg',
      relatedRepo: selectedRepo.name // Link to current repo
    });
    alert('소스 코드가 스니펫으로 저장되었습니다!');
  };

  if (!isRepoExplorerOpen || !selectedRepo) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)', borderRadius: '24px', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Folder color="var(--accent-cyan)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedRepo.name} Explorer</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{currentPath || 'root'}</span>
            </div>
          </div>
          <button onClick={closeRepoExplorer} style={{ color: 'var(--text-tertiary)' }}><X /></button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* File List */}
          <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '16px' }}>
            {currentPath && (
              <button onClick={handleBack} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
                borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px'
              }}>
                <ChevronLeft size={16} /> .. Back
              </button>
            )}
            
            {isLoading && contents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {contents.map(item => (
                  <li key={item.path}>
                    <button 
                      onClick={() => handleFileClick(item)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                        borderRadius: '8px', fontSize: '14px',
                        backgroundColor: selectedFile?.path === item.path ? 'var(--bg-elevated)' : 'transparent',
                        color: selectedFile?.path === item.path ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {item.type === 'dir' ? <Folder size={16} color="#3b82f6" fill="#3b82f633" /> : <File size={16} color="var(--text-tertiary)" />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Content Viewer */}
          <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedFile ? (
              <>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Code size={16} color="var(--text-tertiary)" />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedFile.name}</span>
                  </div>
                  <button 
                    onClick={stashSnippet}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                      backgroundColor: 'var(--accent-cyan)', color: '#000', fontSize: '13px', fontWeight: 600
                    }}
                  >
                    <Plus size={16} /> Stash Snippet
                  </button>
                </div>
                <pre style={{
                  flex: 1, margin: 0, padding: '24px', overflow: 'auto',
                  fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)',
                  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace'
                }}>
                  <code>{fileContent || 'Loading content...'}</code>
                </pre>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', gap: '16px' }}>
                <Folder size={48} opacity={0.2} />
                <span>파일을 선택하여 내용을 확인하세요.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
