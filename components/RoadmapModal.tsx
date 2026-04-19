'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { X, Sparkles, Copy, Check } from 'lucide-react';

const ROADMAP_ITEMS = [
  {
    title: "소스 코드 조각(Snippet) 스태시",
    description: "내 레포지토리의 특정 함수나 로직만 골라 카드 형태로 저장하고 검색합니다.",
    prompt: `I am building Dawith Copy, a Next.js 14 link management app.
Implement the "Code Snippet Stash" feature. 
1. Allow users to select code blocks from the RepoExplorerModal (already has fetchFileRaw).
2. Save the code as a "Snippet" type in Firestore with language detection.
3. Update the dashboard card UI to show syntax-highlighted code blocks for these snippets.
Tech stack: Next.js 14, Tailwind/Vanilla CSS, Firebase Firestore.`
  },
  {
    title: "프로젝트별 지식 번들(Knowledge Bundle)",
    description: "레포지토리별로 참고한 문서 링크들을 타임라인으로 묶어 프로젝트 허브를 만듭니다.",
    prompt: `I am building Dawith Copy.
Implement "Knowledge Bundles".
1. Create a "Project Details" view for each GitHub repo.
2. Filter stashed links that have tags matching the repo name or manual linking.
3. Display these links in a chronological timeline next to the repo's recent commits.
Tech stack: Next.js 14, Firebase, GitHub API.`
  },
  {
    title: "AI 기반 README 리소스 자동 생성",
    description: "보관된 링크를 분석해 깃허브 README에 넣을 참고자료 마크다운을 제안합니다.",
    prompt: `I am building Dawith Copy.
Implement "AI README Generator".
1. Add a button "Generate README Resources" for a selected repo.
2. Fetch all links related to this repo.
3. Use a mock/real LLM to summarize these links into a beautiful Markdown "References" section.
4. Allow the user to copy or create a GitHub PR with this addition.`
  },
  {
    title: "터미널 전용 CLI 도구 (Dawith CLI)",
    description: "브라우저 없이 터미널에서 명령어로 링크를 즉시 저장하고 분류합니다.",
    prompt: `I want to build a CLI for my Dawith Copy app.
1. Create a simple Node.js CLI (using commander or yargs).
2. It should authenticate with Firebase Admin SDK or a custom API key.
3. Command: "copy add [url] --tags [tag1,tag2]" should send the link to my Firestore collection.
Ensure it detects the current git repo name if run inside a project folder.`
  }
];

export default function RoadmapModal() {
  const { isRoadmapModalOpen, closeRoadmap } = useAppContext();
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isRoadmapModalOpen) return null;

  const handleCopy = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
        backgroundColor: 'var(--bg-primary)', padding: '32px', borderRadius: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Future Roadmap</h2>
          </div>
          <button onClick={closeRoadmap} style={{ color: 'var(--text-tertiary)' }}><X /></button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
          아이디어를 복사하여 안티그래비티나 클로드에게 전달하면 바로 구현을 시작할 수 있습니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {ROADMAP_ITEMS.map((item, index) => (
            <div key={index} style={{
              padding: '20px', borderRadius: '16px', backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.description}</p>
                </div>
                <button 
                  onClick={() => handleCopy(item.prompt, index)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500,
                    color: copiedIndex === index ? '#10b981' : 'var(--text-primary)', border: '1px solid var(--border-color)'
                  }}
                >
                  {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === index ? 'Copied!' : '구현 프롬프트 복사'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
