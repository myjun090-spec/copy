'use client';

import React from 'react';
import { useAppContext, setGithubTokenGlobal } from '@/contexts/AppContext';
import { GithubAuthProvider } from 'firebase/auth';

export default function AuthOverlay() {
  const { user, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-primary)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (user) return null; // Already logged in

  const handleGoogle = async () => {
    const { loginWithGoogle } = await import('@/lib/firebase');
    loginWithGoogle().catch(e => alert(e.message));
  };

  const handleGithub = async () => {
    const { loginWithGithub } = await import('@/lib/firebase');
    try {
      const result = await loginWithGithub();
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGithubTokenGlobal(token);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };
  
  const handleAnon = async () => {
    const { loginAnonymously } = await import('@/lib/firebase');
    loginAnonymously().catch(e => alert(e.message));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, 
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: '400px', padding: '40px 32px', textAlign: 'center', borderRadius: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Dawith Copy</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
          클라우드 동기화와 협업을 위해 로그인이 필요합니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleGoogle}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', 
              backgroundColor: '#FFF', color: '#000', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: '1px solid var(--border-color)'
            }}
          >
            Google 계정으로 계속하기
          </button>

          <button 
            onClick={handleGithub}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', 
              backgroundColor: '#24292F', color: '#FFF', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            GitHub 계정으로 계속하기
          </button>
        </div>

        <div style={{ margin: '16px 0', fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        <button 
          onClick={handleAnon}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', 
            backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          로그인 없이 기능만 체험하기
        </button>
      </div>
    </div>
  );
}
