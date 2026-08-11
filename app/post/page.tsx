'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'folder' | 'code'>('code'); // コード入力をデフォルトに
  
  const [gameCode, setGameCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFolderClick = () => {
    fileInputRef.current?.click();
  };

  // リアルタイムプレビュー生成
  useEffect(() => {
    if (gameCode) {
      const blob = new Blob([gameCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [gameCode]);

  // --- EDITORページへデータを飛ばす ---
  const handleProceedToEditor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameCode) {
      alert("コードを入力するか、ファイルをアップロードしてください。");
      return;
    }

    // localStorageに一時保存
    localStorage.setItem('narou_build_code', gameCode);
    // プロンプト名は手動投稿であることを示す目印にする
    localStorage.setItem('narou_build_prompt', `Manual Entry ${new Date().toLocaleString()}`);
    
    // 公開設定ページ（EDITOR）へ遷移
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans tracking-tight transition-colors">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
          ← Exit
        </Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-500 uppercase italic">NAROU GAME : POST CONSOLE</div>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingest Mode</div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-60px)]">
        {/* 左側：入力エリア */}
        <section className="p-8 overflow-y-auto border-r border-slate-200 dark:border-white/5 space-y-10 bg-slate-50/30 dark:bg-slate-900/10">
          <div className="flex gap-8 border-b border-slate-100 dark:border-white/5 pb-4">
            <button 
              type="button"
              onClick={() => setActiveTab('code')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'code' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              01. Code Snippet
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('folder')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'folder' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              02. Folder Drop
            </button>
          </div>

          <form onSubmit={handleProceedToEditor} className="space-y-8">
            {activeTab === 'code' ? (
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1 h-1 bg-blue-600 rounded-full"></span> Source Code Ingestion
                 </label>
                 <textarea 
                  required 
                  className="w-full h-[60vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50 transition-all shadow-inner text-slate-900 dark:text-white" 
                  placeholder="Paste your game code (HTML) here..." 
                  value={gameCode} 
                  onChange={(e) => setGameCode(e.target.value)} 
                />
              </div>
            ) : (
              <div 
                onClick={handleFolderClick}
                className="h-[60vh] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-600/30 transition-all cursor-pointer bg-white dark:bg-slate-900/20 group/upload"
              >
                <span className="text-4xl mb-3 group-hover/upload:scale-110 transition-transform">📁</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  Select Build Folder<br/>
                  <span className="text-[8px] opacity-60">※現在はHTMLコード貼り付けを推奨</span>
                </span>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
            )}

            <button 
              type="submit" 
              disabled={!gameCode && activeTab === 'code'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black py-4 rounded text-xs uppercase tracking-[0.3em] transition-all shadow-lg active:scale-[0.98]"
            >
              次へ進む (公開設定へ) →
            </button>
          </form>
        </section>

        {/* 右側：プレビューエリア */}
        <section className="bg-slate-50 dark:bg-black relative overflow-hidden flex items-center justify-center border-l border-slate-200 dark:border-transparent">
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none bg-white shadow-2xl" 
              sandbox="allow-scripts" 
              title="NAROU Preview" 
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-10 italic font-black text-slate-900 dark:text-white select-none">NAROU</div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Waiting for Code Input...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}