'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Search, Sparkles, Menu, CheckSquare, LogOut, Download } from 'lucide-react';

interface TopBarProps {
  onToggleDrawer: () => void;
  onToggleSelection: () => void;
}

export default function TopBar({ onToggleDrawer, onToggleSelection }: TopBarProps) {
  const { searchQuery, setSearchQuery, openRoadmap, exportCSV, logoutApp, isSelectionMode, user } = useAppContext();

  const initial = user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '박';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 16,
      padding: '14px 24px', backgroundColor: 'rgba(247,247,248,0.8)',
      backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleDrawer}
          style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="작업 공간"
        >
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: 14 }}>C</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Dawith Copy</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', maxWidth: 520,
          padding: '10px 16px', borderRadius: 999,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 태그, 도메인 검색"
            style={{ flex: 1, fontSize: 14 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Clear</button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onToggleSelection}
          title={isSelectionMode ? '선택 모드 종료' : '여러개 선택'}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', backgroundColor: isSelectionMode ? 'var(--accent-cyan)' : 'var(--bg-secondary)', color: isSelectionMode ? '#000' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}
        >
          <CheckSquare size={15} /> 선택
        </button>
        <button
          onClick={exportCSV}
          title="CSV로 내보내기"
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
        >
          <Download size={15} />
        </button>
        <button
          onClick={openRoadmap}
          style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--accent-cyan)', color: '#000', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
        >
          <Sparkles size={15} /> 로드맵
        </button>
        <button
          onClick={logoutApp}
          title="로그아웃"
          style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {initial}
        </button>
      </div>
    </header>
  );
}
