'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { X, Search, FileText, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { classifyLink } from '@/lib/classifier';

export default function AddLinkModal() {
  const { isAddModalOpen, closeAddModal, clipboardData, addLink, categories } = useAppContext();
  
  const [memo, setMemo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('개발');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState({
    title: '',
    description: '',
    domain: '',
    image: '',
  });
  const [targetRepo, setTargetRepo] = useState<string | null>(null);

  useEffect(() => {
    if (isAddModalOpen && clipboardData) {
      // Simulate AI Parsing
      const fetchMetadata = async () => {
        try {
          const res = await fetch(`/api/title?url=${encodeURIComponent(clipboardData)}`);
          return await res.json();
        } catch (e) {
          return { 
            title: new URL(clipboardData.startsWith('http') ? clipboardData : 'https://example.com').hostname,
            description: '',
            image: ''
          };
        }
      };

      const timer = setTimeout(async () => {
        const meta = await fetchMetadata();
        setIsAnalyzing(false);
        
        const { category, tags: autoTags } = classifyLink(clipboardData);
        
        setPreviewData({
          title: meta.title || '새로운 링크',
          description: meta.description || clipboardData.substring(0, 50) + '...',
          image: meta.image || '',
          domain: new URL(clipboardData.startsWith('http') ? clipboardData : 'https://example.com').hostname,
        });

        setTags(autoTags);
        setSelectedCategory(category);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAddModalOpen, clipboardData]);

  if (!isAddModalOpen) return null;

  const handleSave = () => {
    if (!clipboardData) return;
    
    addLink({
      url: clipboardData.startsWith('http') ? clipboardData : `https://${clipboardData}`,
      title: previewData.title || clipboardData,
      description: previewData.description,
      image: previewData.image || '/mock-image-1.jpg',
      memo,
      tags,
      category: selectedCategory,
      domain: previewData.domain || '웹사이트',
      relatedRepo: targetRepo
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '400px', backgroundColor: '#FFFFFF', color: '#111', 
        borderRadius: '24px', padding: '24px', position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Close btn */}
        <button onClick={closeAddModal} style={{ position: 'absolute', top: '24px', left: '24px', color: '#111' }}>
          <X size={24} />
        </button>

        <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: '#111' }}>
          링크 저장
        </h2>

        {isAnalyzing ? (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '16px' }}>
              <div 
                style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-tertiary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                 <Sparkles color="var(--accent-cyan)" size={24} />
              </div>
              <p style={{ color: '#555', fontSize: '14px', fontWeight: 500 }}>AI가 링크를 분석하고 있습니다...</p>
           </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Image Thumbnail Preview */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px', backgroundColor: '#111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                 <ImageIcon color="#FFF" size={24} />
              </div>
            </div>

            {/* URL Display */}
            <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {clipboardData}
            </div>

            {/* Memo Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>메모 (선택)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '12px 16px' }}>
                <FileText size={18} color="#999" />
                <input 
                  type="text" 
                  value={memo} 
                  onChange={e => setMemo(e.target.value)}
                  placeholder="내용을 입력해주세요"
                  style={{ width: '100%', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Tags Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>태그 (선택)</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tags.map(t => (
                  <div key={t} style={{ backgroundColor: '#F4F4F5', padding: '6px 12px', borderRadius: '24px', fontSize: '13px', color: '#333' }}>
                    #{t}
                  </div>
                ))}
                <button style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '54px', height: '32px', border: '1px dashed #CCC', borderRadius: '24px', color: '#666'
                }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>카테고리</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ backgroundColor: '#111', color: '#FFF', padding: '6px 16px', borderRadius: '24px', fontSize: '13px' }}>
                  {selectedCategory}
                </div>
                <button style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', border: '1px solid #EBEBEB', borderRadius: '50%', color: '#666'
                }}>
                  <Plus size={16} />
                </button>
                <button style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', border: '1px solid #EBEBEB', borderRadius: '50%', color: '#666'
                }}>
                  <Search size={14} />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave}
              style={{
                width: '100%', backgroundColor: '#111', color: '#FFF', padding: '16px', 
                borderRadius: '12px', fontSize: '15px', fontWeight: 600, marginTop: '8px'
              }}
            >
              저장
            </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
