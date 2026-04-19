'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, dismissToast } = useAppContext();
  if (!toast) return null;

  const variant = toast.kind;
  const icon = variant === 'success'
    ? <CheckCircle2 size={18} color="#10b981" />
    : variant === 'error'
      ? <AlertCircle size={18} color="#ef4444" />
      : <Info size={18} color="#0284c7" />;

  return (
    <div style={{
      position: 'fixed', top: 76, right: 24, zIndex: 9998,
      minWidth: 260, maxWidth: 360,
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--bg-secondary)',
      border: `1px solid ${variant === 'error' ? '#ef4444' : variant === 'success' ? '#10b981' : 'var(--border-color)'}`,
      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      {icon}
      <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {toast.message}
      </div>
      <button onClick={dismissToast} style={{ color: 'var(--text-tertiary)' }}>
        <X size={14} />
      </button>
    </div>
  );
}
