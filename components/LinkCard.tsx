'use client';

import { StashedLink, useAppContext } from '@/contexts/AppContext';
import { Code, Check, Trash2 } from 'lucide-react';

export default function LinkCard({ link }: { link: StashedLink }) {
  const { isSelectionMode, selectedIds, toggleSelection, setActiveTag, removeLink } = useAppContext();
  const selected = selectedIds.has(link.id);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      toggleSelection(link.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-secondary)',
        border: `1px solid ${selected ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
        borderRadius: '18px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        cursor: isSelectionMode ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: selected ? '0 0 0 3px var(--accent-cyan-faded)' : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = selected ? '0 0 0 3px var(--accent-cyan-faded)' : 'none';
      }}
    >
      {isSelectionMode && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          width: 24, height: 24, borderRadius: 8,
          background: selected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.9)',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {selected && <Check size={14} color="#000" />}
        </div>
      )}

      {link.image && !link.image.includes('mock-image') && (
        <div style={{ width: '100%', paddingTop: '56%', position: 'relative', backgroundColor: 'var(--bg-elevated)' }}>
          <img
            src={link.image}
            alt={link.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{link.domain}</span>
          {!isSelectionMode && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (confirm('삭제할까요?')) removeLink(link.id); }}
              style={{ color: 'var(--text-tertiary)', padding: 4, borderRadius: 6 }}
              title="삭제"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
          {link.title}
        </h3>

        <p style={{
          fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {link.description}
        </p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
          {link.tags.slice(0, 5).map(tag => (
            <button
              key={tag}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveTag(tag); }}
              style={{
                fontSize: '11px', color: 'var(--accent-cyan)',
                backgroundColor: 'var(--accent-cyan-faded)',
                padding: '3px 8px', borderRadius: '999px', fontWeight: 500
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
        {link.relatedRepo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan)', fontWeight: 600 }}>
            <Code size={12} />
            <span>{link.relatedRepo}</span>
          </div>
        ) : (
          <span>{link.category}</span>
        )}
        <span>{new Date(link.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
