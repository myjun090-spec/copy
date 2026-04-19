'use client';

import { StashedLink } from '@/contexts/AppContext';
import { MoreHorizontal, Link as LinkIcon, Code } from 'lucide-react';

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
      {/* Link Thumbnail Image */}
      {link.image && !link.image.includes('mock-image') && (
        <div style={{ width: '100%', height: '140px', overflow: 'hidden', backgroundColor: 'var(--bg-elevated)' }}>
          <img src={link.image} alt={link.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
        </div>
      )}

      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{link.domain}</span>
          <button style={{ color: 'var(--text-tertiary)' }}><MoreHorizontal size={16} /></button>
        </div>
        
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
          {link.title}
        </h3>
        
        <p style={{ 
          fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
        }}>
          {link.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
          {link.tags.map(tag => (
            <span key={tag} style={{ fontSize: '11px', color: 'var(--accent-cyan)', backgroundColor: 'rgba(0, 243, 255, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Bottom Relationship Bar */}
      <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           {link.relatedRepo ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontWeight: 600, backgroundColor: 'rgba(0, 243, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
               <Code size={12} />
               <span>{link.relatedRepo}</span>
             </div>
           ) : (
             <span>{link.category} 카테고리</span>
           )}
         </div>
         <span>{new Date(link.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
