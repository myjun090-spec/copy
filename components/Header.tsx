'use client';

import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export default function Header() {
  const { searchQuery, setSearchQuery } = useAppContext();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ flex: 1, maxWidth: '600px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', 
          backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', padding: '10px 16px',
          border: '1px solid var(--border-color)'
        }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="제목, 태그 검색" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', fontSize: '15px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={18} color="var(--text-secondary)" />
        </button>
      </div>
    </header>
  );
}
