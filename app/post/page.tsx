'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'folder' | 'code'>('folder');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    play_time_avg: 0,
    thumbnail_url: '',
    game_code: '', 
    genre: 'Action',
  });

  // 自動で開く挙動を削除し、クリック時のみに限定
  const handleFolderClick = () => {
    fileInputRef.current?.click();
  };

  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (formData.game_code) {
      const blob = new Blob([formData.game_code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [formData.game_code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('games').insert([{
        ...formData,
        is_ai_generated: activeTab === 'code',
        revenue_weight: 1.0     
      }]);
      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ライトモードをデフォルト(bg-white)に設定
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans tracking-tight transition-colors">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
          ← Exit
        </Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-500 uppercase italic">Rapid Deployment Console</div>
        <button className="border border-blue-600/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded text-[10px] font-black uppercase transition-all">
          ゲームを作成・編集する
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-60px)]">
        <section className="p-8 overflow-y-auto border-r border-slate-200 dark:border-white/5 space-y-10">
          <div className="flex gap-8 border-b border-slate-100 dark:border-white/5 pb-4">
            <button 
              onClick={() => setActiveTab('folder')} // 自動で開かない
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'folder' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              01. Folder Drop
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'code' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              02. Code Snippet
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <input 
                required
                placeholder="タイトル" // 薄く表示されるプレースホルダー
                onFocus={() => {}} // 自動で開く挙動を完全に削除
                className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-2xl font-black focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <div className="flex gap-4">
                <input required placeholder="AUTHOR" className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-600" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                <select className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded px-3 py-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 focus:outline-none" value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})}>
                  {['Action', 'Strategy', 'Puzzle', 'Shooting', 'RPG', 'Novel'].map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {activeTab === 'folder' ? (
              <div 
                onClick={handleFolderClick} // このエリアをクリックした時だけ開く
                className="h-80 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-600/30 transition-all cursor-pointer bg-slate-50 dark:bg-slate-900/20"
              >
                <span className="text-3xl mb-3">📁</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  Drag & Drop Build Folder<br/>
                  <span className="text-[8px] opacity-60">Unity / Godot / RPG Maker Web Build</span>
                </span>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
            ) : (
              <textarea required className="w-full h-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50 transition-all" placeholder="Paste your AI-generated code here..." value={formData.game_code} onChange={(e) => setFormData({...formData, game_code: e.target.value})} />
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-4 rounded text-xs uppercase tracking-[0.3em] transition-all shadow-lg">
              {loading ? 'Processing...' : 'Deploy & Start Earning'}
            </button>
          </form>
        </section>

        <section className="bg-slate-50 dark:bg-black relative overflow-hidden flex items-center justify-center border-l border-slate-200 dark:border-transparent">
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Preview Output
            </span>
          </div>
          {previewUrl ? <iframe src={previewUrl} className="w-full h-full border-none" sandbox="allow-scripts" /> : (
            <div className="text-center space-y-4">
              <div className="text-4xl opacity-10 italic font-black text-slate-900 dark:text-white">AIGP</div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Standby for Asset Verification</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}