'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  fetchRepoContents,
  fetchRepoReadme,
  fetchRepoLanguages,
  GithubRepo,
} from '@/lib/github';
import { generateIdeas, DevelopIdea } from '@/lib/repoIdeas';
import { mapWithConcurrency } from '@/lib/batch';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';

interface RepoInsight {
  repo: GithubRepo;
  topIdea: DevelopIdea | null;
}

function pickIcon(title: string): string {
  if (title.includes('테스트')) return '🧪';
  if (title.includes('CI')) return '⚙️';
  if (title.includes('README') || title.includes('문서')) return '📘';
  if (title.includes('보안') || title.includes('규칙')) return '🔒';
  if (title.includes('환경')) return '🔑';
  if (title.includes('관찰') || title.includes('Observ')) return '📊';
  if (title.includes('패키징') || title.includes('Typing')) return '📦';
  return '✨';
}

export default function RepoInsights() {
  const { githubRepos, githubToken, openRepoDevelop } = useAppContext();
  const [insights, setInsights] = useState<RepoInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (!githubToken || githubRepos.length === 0) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    (async () => {
      const top = githubRepos.slice(0, 6);
      const results = await mapWithConcurrency(top, 3, async (repo) => {
        try {
          const [tree, readme, langs] = await Promise.all([
            fetchRepoContents(githubToken, repo.owner!.login, repo.name, ''),
            fetchRepoReadme(githubToken, repo.owner!.login, repo.name),
            fetchRepoLanguages(githubToken, repo.owner!.login, repo.name),
          ]);
          const ideas = generateIdeas(repo, tree, readme, langs);
          return { repo, topIdea: ideas[0] ?? null } as RepoInsight;
        } catch {
          return { repo, topIdea: null } as RepoInsight;
        }
      });
      if (!cancelled) {
        setInsights(results);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [githubRepos, githubToken]);

  if (!githubToken || githubRepos.length === 0) return null;

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>내 레포에 지금 필요한 것</h2>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {loading ? '분석 중…' : `${insights.length}개 레포 분석 완료`}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {(loading && insights.length === 0
          ? githubRepos.slice(0, 3).map(r => ({ repo: r, topIdea: null as DevelopIdea | null, skeleton: true }))
          : insights.map(i => ({ ...i, skeleton: false }))
        ).map((item, i) => (
          <div key={item.repo.id ?? i} style={{
            padding: 18, borderRadius: 18,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: 10,
            minHeight: 170,
            opacity: item.skeleton ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {pickIcon(item.topIdea?.title ?? '')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.repo.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {item.repo.language || '—'}
                </div>
              </div>
            </div>

            {item.skeleton ? (
              <div style={{ height: 56, background: 'var(--bg-elevated)', borderRadius: 10 }} />
            ) : item.topIdea ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.topIdea.title}
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  flex: 1,
                }}>
                  {item.topIdea.rationale}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => openRepoDevelop(item.repo)}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 10,
                      background: 'var(--accent-cyan)', color: '#000',
                      fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    자세히 보기 <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (!item.topIdea) return;
                      navigator.clipboard.writeText(item.topIdea.prompt);
                      setCopiedId(item.repo.id);
                      setTimeout(() => setCopiedId(null), 1800);
                    }}
                    title="프롬프트만 복사"
                    style={{
                      padding: '9px 12px', borderRadius: 10,
                      background: copiedId === item.repo.id ? '#10b981' : 'var(--bg-elevated)',
                      color: copiedId === item.repo.id ? '#fff' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 500,
                      border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {copiedId === item.repo.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                특별한 개선 포인트가 보이지 않아요. 이미 깔끔한 레포!
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
