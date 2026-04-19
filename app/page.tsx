'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AddLinkModal from '@/components/AddLinkModal';
import RoadmapModal from '@/components/RoadmapModal';
import RepoExplorerModal from '@/components/RepoExplorerModal';
import RepoDevelopModal from '@/components/RepoDevelopModal';
import RepoInsights from '@/components/RepoInsights';
import LinkCard from '@/components/LinkCard';
import Toast from '@/components/Toast';
import { useAppContext, StashedLink } from '@/contexts/AppContext';
import { Plus, X, Trash2, Tag as TagIcon, Clock, AlertTriangle } from 'lucide-react';

const MS_DAY = 24 * 60 * 60 * 1000;

interface TimeGroup {
  key: 'today' | 'week' | 'earlier';
  label: string;
  items: StashedLink[];
}

function groupByTime(links: StashedLink[]): TimeGroup[] {
  const now = Date.now();
  const today: StashedLink[] = [];
  const week: StashedLink[] = [];
  const earlier: StashedLink[] = [];
  for (const l of links) {
    const age = now - l.createdAt;
    if (age < MS_DAY) today.push(l);
    else if (age < 7 * MS_DAY) week.push(l);
    else earlier.push(l);
  }
  const groups: TimeGroup[] = [];
  if (today.length) groups.push({ key: 'today', label: '오늘 수집', items: today });
  if (week.length) groups.push({ key: 'week', label: '지난 7일', items: week });
  if (earlier.length) groups.push({ key: 'earlier', label: '지난 기록', items: earlier });
  return groups;
}

function topTags(links: StashedLink[], limit = 14): { tag: string; count: number }[] {
  const counter = new Map<string, number>();
  for (const l of links) {
    for (const t of l.tags || []) counter.set(t, (counter.get(t) ?? 0) + 1);
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export default function Home() {
  const {
    links, categories, activeCategory, setActiveCategory, searchQuery, openAddModal,
    activeTag, setActiveTag,
    isSelectionMode, setSelectionMode, selectedIds, clearSelection, removeManyLinks,
    user, logoutApp, storageMode, switchToCloudMode,
  } = useAppContext();

  const [drawerOpen, setDrawerOpen] = useState(false);

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
        if (text && text !== lastCheckedClipboard && (text.startsWith('http') || text.startsWith('www'))) {
          lastCheckedClipboard = text;
          sessionStorage.setItem('lastPasted', text);
          openAddModal(text);
        }
      } catch {}
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('focus', handleFocus);
    handleFocus();
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('focus', handleFocus);
    };
  }, [openAddModal]);

  const filteredLinks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return links.filter(link => {
      const matchCategory = activeCategory === null || link.category === activeCategory;
      const matchTag = activeTag === null || link.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase());
      const matchSearch = !q
        || link.title.toLowerCase().includes(q)
        || link.description?.toLowerCase().includes(q)
        || link.domain?.toLowerCase().includes(q)
        || link.tags?.some(t => t.toLowerCase().includes(q));
      return matchCategory && matchTag && matchSearch;
    });
  }, [links, activeCategory, activeTag, searchQuery]);

  const groups = useMemo(() => groupByTime(filteredLinks), [filteredLinks]);
  const tagCloud = useMemo(() => topTags(links), [links]);

  const toggleSelection = () => {
    if (isSelectionMode) {
      clearSelection();
      setSelectionMode(false);
    } else {
      setSelectionMode(true);
    }
  };

  const onBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}개의 링크를 삭제할까요?`)) return;
    await removeManyLinks(Array.from(selectedIds));
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar onToggleDrawer={() => setDrawerOpen(v => !v)} onToggleSelection={toggleSelection} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 96px' }}>
        {/* Storage-mode notices */}
        {storageMode === 'local' && (
          <div style={{
            marginBottom: 20, padding: '14px 18px', borderRadius: 14,
            background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.35)',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <AlertTriangle size={18} color="#0369a1" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, fontSize: 13, color: '#0c4a6e', lineHeight: 1.6 }}>
              <b>이 기기에만 저장 중입니다.</b> 브라우저의 <b>방문 기록·쿠키·저장소</b>를 지우거나, <b>시크릿 모드</b>를 쓰거나, <b>다른 기기/브라우저</b>에서 접속하면 지금까지 저장한 링크가 사라져요.
              지금 저장해둔 링크를 영구 보관하려면 계정 로그인으로 전환한 뒤 CSV로 내보내 백업하세요.
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button
                  onClick={switchToCloudMode}
                  style={{ padding: '7px 12px', borderRadius: 8, background: '#0369a1', color: '#fff', fontSize: 12, fontWeight: 600 }}
                >
                  계정으로 로그인하기
                </button>
              </div>
            </div>
          </div>
        )}

        {storageMode === 'cloud' && user?.isAnonymous && (
          <div style={{
            marginBottom: 20, padding: '14px 18px', borderRadius: 14,
            background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.5)',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, fontSize: 13, color: '#7c2d12', lineHeight: 1.55 }}>
              지금 <b>익명 Firebase 세션</b>으로 접속 중이에요. 브라우저/기기가 바뀌면 이 계정은 사라져서 저장한 링크에 다시 접근할 수 없어요.
              Google / GitHub 계정으로 로그인하면 데이터가 영구 보관됩니다.
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={logoutApp}
                  style={{ padding: '7px 12px', borderRadius: 8, background: '#b45309', color: '#fff', fontSize: 12, fontWeight: 600 }}
                >
                  로그아웃 후 계정으로 로그인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero quick-add */}
        <section style={{
          marginBottom: 28,
          borderRadius: 24,
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(0,177,177,0.12), rgba(2,132,199,0.08))',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Your scrap inbox</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>
            {links.length > 0
              ? `지금까지 ${links.length.toLocaleString()}개 링크를 쌓았어요`
              : '붙여넣거나 카톡 대화를 올리면 자동 정리합니다'}
          </h1>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => openAddModal()}
              className="cyan-btn"
              style={{ paddingInline: 18 }}
            >
              <Plus size={16} /> 링크 추가
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: 13, fontWeight: 500 }}
            >
              카톡 파일 / GitHub 연결 열기
            </button>
          </div>
        </section>

        {/* Per-repo recommendation cards */}
        <RepoInsights />

        {/* Category pills */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={pillStyle(activeCategory === null)}
            >
              전체 ({links.length})
            </button>
            {categories.map(cat => {
              const count = links.filter(l => l.category === cat).length;
              if (count === 0 && cat !== activeCategory) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={pillStyle(activeCategory === cat)}
                >
                  {cat} · {count}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tag chips */}
        {tagCloud.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
              <TagIcon size={13} /> HOT 태그
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan)', fontSize: 11 }}
                >
                  <X size={12} /> 필터 해제 (#{activeTag})
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tagCloud.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  style={{
                    fontSize: 12, padding: '5px 10px', borderRadius: 999,
                    background: activeTag === tag ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                    color: activeTag === tag ? '#000' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)', fontWeight: 500
                  }}
                >
                  #{tag} <span style={{ color: activeTag === tag ? '#000' : 'var(--text-tertiary)' }}>{count}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Feed */}
        {filteredLinks.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border-color)' }}>
            조건에 맞는 링크가 없어요. Cmd/Ctrl + V 로 붙여넣어보세요.
          </div>
        ) : (
          groups.map(group => (
            <section key={group.key} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Clock size={13} /> {group.label} · {group.items.length}
              </div>
              <div style={{
                columnCount: 3,
                columnGap: 18,
              }} className="masonry-feed">
                {group.items.map(link => (
                  <a
                    key={link.id}
                    href={isSelectionMode ? undefined : link.url}
                    onClick={(e) => { if (isSelectionMode) e.preventDefault(); }}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', width: '100%', marginBottom: 18, breakInside: 'avoid' }}
                  >
                    <LinkCard link={link} />
                  </a>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Bulk selection toolbar */}
      {isSelectionMode && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, padding: '12px 20px', borderRadius: 999,
          background: 'var(--text-primary)', color: 'var(--bg-primary)',
          display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.size}개 선택됨</span>
          <button
            onClick={onBulkDelete}
            disabled={selectedIds.size === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, opacity: selectedIds.size === 0 ? 0.5 : 1 }}
          >
            <Trash2 size={14} /> 삭제
          </button>
          <button
            onClick={() => { clearSelection(); setSelectionMode(false); }}
            style={{ fontSize: 13, color: 'var(--bg-primary)', opacity: 0.8 }}
          >
            취소
          </button>
        </div>
      )}

      {/* Drawer hosting the old Sidebar */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, backdropFilter: 'blur(4px)' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, height: '100%', boxShadow: '8px 0 30px rgba(0,0,0,0.12)' }}>
            <Sidebar />
          </div>
        </div>
      )}

      <AddLinkModal />
      <RoadmapModal />
      <RepoExplorerModal />
      <RepoDevelopModal />
      <Toast />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1000px) { .masonry-feed { column-count: 2 !important; } }
        @media (max-width: 640px)  { .masonry-feed { column-count: 1 !important; } }
      `}} />
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 999,
    border: '1px solid var(--border-color)',
    background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
    color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  };
}
