'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'folder' | 'code'>('folder');
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    game_code: '', 
    genre: 'Action',
  });

  const handleFolderClick = () => {
    fileInputRef.current?.click();
  };

  const [previewUrl, setPreviewUrl] = useState<string>('');

  // リアルタイムプレビュー
  useEffect(() => {
    if (formData.game_code) {
      const blob = new Blob([formData.game_code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [formData.game_code]);

  // --- 【重要】直接デプロイせず、Editorへデータを飛ばす ---
  const handleProceedToEditor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.game_code && activeTab === 'code') {
      alert("コードを入力してください");
      return;
    }

    // localStorageに一時保存（Editorページがこれを読み取る）
    localStorage.setItem('narou_build_code', formData.game_code);
    localStorage.setItem('narou_build_prompt', `Manual Upload: ${formData.title}`); // 便宜上のプロンプト名
    
    // 公開設定ページへ遷移
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans tracking-tight transition-colors">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
          ← Exit
        </Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-500 uppercase italic">Rapid Deployment Console</div>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manual Entry Mode</div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-60px)]">
        <section className="p-8 overflow-y-auto border-r border-slate-200 dark:border-white/5 space-y-10">
          <div className="flex gap-8 border-b border-slate-100 dark:border-white/5 pb-4">
            <button 
              type="button"
              onClick={() => setActiveTab('folder')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'folder' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              01. Folder Drop
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('code')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'code' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              02. Code Snippet
            </button>
          </div>

          <form onSubmit={handleProceedToEditor} className="space-y-8">
            <div className="space-y-4">
              <input 
                required
                placeholder="タイトル" 
                className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-2xl font-black focus:outline-none focus:border-blue-600 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {activeTab === 'folder' ? (
              <div 
                onClick={handleFolderClick}
                className="h-80 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-600/30 transition-all cursor-pointer bg-slate-50 dark:bg-slate-900/20 group/upload"
              >
                <span className="text-3xl mb-3 group-hover/upload:scale-110 transition-transform">📁</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  Select Build Folder<br/>
                  <span className="text-[8px] opacity-60">※現在はHTMLコード貼り付けのみ対応</span>
                </span>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
            ) : (
              <div className="space-y-2">
                 <textarea 
                  required 
                  className="w-full h-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50 transition-all shadow-inner" 
                  placeholder="Paste your game code here..." 
                  value={formData.game_code} 
                  onChange={(e) => setFormData({...formData, game_code: e.target.value})} 
                />
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98]">
              次へ進む (公開設定へ) →
            </button>
          </form>
        </section>

        <section className="bg-slate-50 dark:bg-black relative overflow-hidden flex items-center justify-center border-l border-slate-200 dark:border-transparent">
          {previewUrl ? <iframe src={previewUrl} className="w-full h-full border-none bg-white" sandbox="allow-scripts" /> : (
            <div className="text-center space-y-4">
              <div className="text-4xl opacity-10 italic font-black text-slate-900 dark:text-white select-none">AIGP</div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Preview Standby</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}