'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { X, GitBranch, Copy, Check, Sparkles, Layers } from 'lucide-react';
import {
  fetchRepoContents,
  fetchRepoReadme,
  fetchRepoLanguages,
  GithubContent,
  RepoLanguages,
} from '@/lib/github';
import { generateIdeas, DevelopIdea } from '@/lib/repoIdeas';

export default function RepoDevelopModal() {
  const { isRepoDevelopOpen, closeRepoDevelop, developRepo, githubToken } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<DevelopIdea[]>([]);
  const [languages, setLanguages] = useState<RepoLanguages>({});
  const [tree, setTree] = useState<GithubContent[]>([]);
  const [readmeLength, setReadmeLength] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isRepoDevelopOpen || !developRepo || !githubToken) return;
    let cancelled = false;
    setIsLoading(true);
    setIdeas([]);
    (async () => {
      const [rootTree, readme, langs] = await Promise.all([
        fetchRepoContents(githubToken, developRepo.owner!.login, developRepo.name, ''),
        fetchRepoReadme(githubToken, developRepo.owner!.login, developRepo.name),
        fetchRepoLanguages(githubToken, developRepo.owner!.login, developRepo.name),
      ]);
      if (cancelled) return;
      setTree(rootTree);
      setLanguages(langs);
      setReadmeLength(readme.length);
      setIdeas(generateIdeas(developRepo, rootTree, readme, langs));
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isRepoDevelopOpen, developRepo, githubToken]);

  if (!isRepoDevelopOpen || !developRepo) return null;

  const handleCopy = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const langChips = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '760px', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)', borderRadius: '24px', overflow: 'hidden'
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-cyan-faded)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch color="var(--accent-cyan)" size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>이 레포 기반으로 발전시키기</h2>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {developRepo.full_name} · README {readmeLength.toLocaleString()}자 · 루트 {tree.length} 항목
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {langChips.map(([lang]) => (
                  <span key={lang} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={closeRepoDevelop} style={{ color: 'var(--text-tertiary)' }}><X /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            레포의 파일 구조와 README를 분석해 지금 이 프로젝트에 가장 필요한 작업을 생성했습니다. 프롬프트를 복사해 Claude/다른 AI 에이전트에게 넘기면 바로 작업을 시작할 수 있습니다.
          </div>

          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Layers size={28} style={{ marginBottom: 12 }} />
              <div>레포 분석 중...</div>
            </div>
          ) : ideas.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>아이디어를 생성할 수 없습니다.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ideas.map((idea, index) => (
                <div key={idea.title} style={{ padding: 18, borderRadius: 14, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{idea.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{idea.rationale}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(idea.prompt, index)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, backgroundColor: copiedIndex === index ? '#10b981' : 'var(--accent-cyan)',
                        color: copiedIndex === index ? '#FFF' : '#000', fontSize: 12, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                      }}
                    >
                      {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                      {copiedIndex === index ? 'Copied' : '프롬프트 복사'}
                    </button>
                  </div>
                  <pre style={{
                    margin: 0, padding: 12, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 10, fontSize: 11.5, lineHeight: 1.6, color: 'var(--text-secondary)',
                    maxHeight: 160, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    fontFamily: '"SFMono-Regular", Consolas, Menlo, monospace'
                  }}>{idea.prompt}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
