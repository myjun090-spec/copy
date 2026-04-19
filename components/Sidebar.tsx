'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Search, Hash, Plus, Settings, FolderOpen, Crown, Download, Command } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const { categories, activeCategory, setActiveCategory, isPro, toggleProStatus, exportCSV, openAddModal } = useAppContext();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Profile Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FF4B4B', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
        }}>
          박
        </div>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>박민준's Space</span>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>
            <button 
              onClick={() => setActiveCategory(null)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 12px', borderRadius: '8px',
                backgroundColor: activeCategory === null ? 'var(--bg-elevated)' : 'transparent',
                color: activeCategory === null ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <FolderOpen size={18} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>All Stashes</span>
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat}>
              <button 
                onClick={() => setActiveCategory(cat)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '8px 12px', borderRadius: '8px',
                  backgroundColor: activeCategory === cat ? 'var(--bg-elevated)' : 'transparent',
                  color: activeCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                <Hash size={18} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{cat}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div style={{ marginTop: '32px' }}>
          <button 
            onClick={() => openAddModal()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)',
              padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500
            }}
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </nav>

      {/* Footer Nav */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={exportCSV}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          <Download size={18} /> Export (CSV)
        </button>
        
        <button 
          onClick={toggleProStatus}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: isPro ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: '14px' }}
        >
          <Crown size={18} /> {isPro ? 'Pro Active' : 'Upgrade to Pro'}
        </button>
        
        <button 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* Add Shortcut Hint */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
         <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '6px', borderRadius: '6px' }}>
           <Command size={16} color="var(--text-secondary)" />
         </div>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
           <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shortcut</span>
           <span style={{ fontSize: '14px', fontWeight: 600 }}>Cmd/Ctrl + V</span>
         </div>
      </div>
    </aside>
  );
}
