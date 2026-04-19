'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Search, Menu, CheckSquare, LogOut, Download, ChevronDown } from 'lucide-react';

interface TopBarProps {
  onToggleDrawer: () => void;
  onToggleSelection: () => void;
}

export default function TopBar({ onToggleDrawer, onToggleSelection }: TopBarProps) {
  const { searchQuery, setSearchQuery, exportCSV, logoutApp, isSelectionMode, user } = useAppContext();

  const rawName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const shortName = rawName.length > 12 ? rawName.slice(0, 11) + '…' : rawName;
  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? 'G').toUpperCase();
  const email = user?.email ?? '';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

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

        {/* Account pill with dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px 6px 6px', borderRadius: 999,
              border: '1px solid var(--border-color)',
              backgroundColor: menuOpen ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
            }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 999,
              background: 'linear-gradient(135deg, #111, #4b5563)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{initial}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{shortName}</span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: 220, padding: 8,
                backgroundColor: 'var(--bg-secondary)', borderRadius: 14,
                border: '1px solid var(--border-color)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
              }}
            >
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{rawName}</div>
                {email && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{email}</div>
                )}
              </div>
              <button
                role="menuitem"
                onClick={() => { setMenuOpen(false); logoutApp(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10, fontSize: 13, color: '#dc2626',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <LogOut size={14} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
