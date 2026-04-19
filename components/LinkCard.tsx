'use client';

import React from 'react';
import { StashedLink } from '@/contexts/AppContext';
import { MoreHorizontal } from 'lucide-react';

export default function LinkCard({ link }: { link: StashedLink }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.borderColor = 'var(--border-color-hover)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'var(--border-color)';
    }}
    >
      <div style={{ padding: '20px', flex: 1 }}>
        {/* Mocking the header based on domain, similar to github layout in screenshot */}
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{link.domain}</span>
          <button style={{ color: 'var(--text-tertiary)' }}><MoreHorizontal size={16} /></button>
        </div>
        
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
          {link.title}
        </h3>
        
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {link.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          {link.tags.map(tag => (
            <span key={tag} style={{ fontSize: '12px', color: 'var(--accent-cyan)', backgroundColor: 'var(--accent-cyan-faded)', padding: '4px 8px', borderRadius: '4px' }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Decorative Bottom Bar mirroring the github repo info in user screenshot */}
      <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
         <span>{link.category} 카테고리</span>
         <span>•</span>
         <span>{new Date(link.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
