'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // デフォルトを 'folder' に変更 
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
      const { error } = await supabase
        .from('games')
        .insert([{
          ...formData,
          is_ai_generated: activeTab === 'code',
          revenue_weight: 1.0     
        }]);

      if (error) throw error;
      alert('デプロイ完了！収益分配対象として登録されました。');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      alert('エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans tracking-tight">
      <header className="px-6 py-4 border-b border-white/10 bg-slate-900/50 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-slate-500 hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
          ← Exit
        </Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Rapid Deployment Console</div>
        
        {/* 作成・編集ボタンを追加 */}
        <button className="border border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white px-4 py-1.5 rounded text-[10px] font-black uppercase transition-all">
          ゲームを作成・編集する
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-60px)]">
        
        <section className="p-8 overflow-y-auto border-r border-white/5 space-y-10">
          {/* 位置を逆転：Folder Drop を左（デフォルト）に  */}
          <div className="flex gap-8 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveTab('folder')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'folder' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-600'}`}
            >
              01. Folder Drop
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`text-[10px] font-black tracking-widest uppercase pb-2 transition-all ${activeTab === 'code' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-600'}`}
            >
              02. Code Snippet
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <input 
                required
                placeholder="GAME TITLE"
                className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-black focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-900"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <div className="flex gap-4">
                <input 
                  required
                  placeholder="AUTHOR"
                  className="flex-1 bg-slate-900/50 border border-white/5 rounded px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                />
                <select 
                  className="bg-slate-900/50 border border-white/5 rounded px-3 py-2 text-[10px] font-bold text-blue-400 focus:outline-none"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                >
                  {['Action', 'Strategy', 'Puzzle', 'Shooting', 'RPG', 'Novel'].map(g => (
                    <option key={g} value={g}>{g.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'folder' ? (
              <div className="h-80 border-2 border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-slate-600 hover:border-blue-500/30 transition-all cursor-pointer bg-slate-900/20">
                <span className="text-3xl mb-3">📁</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  Drag & Drop Build Folder<br/>
                  <span className="text-[8px] opacity-40">Unity / Godot / RPG Maker Web Build</span>
                </span>
                {/* 実際のファイル選択入力（透明） */}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">AI Generated Code (HTML)</label>
                <textarea 
                  required
                  className="w-full h-80 bg-slate-900 border border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Paste your AI-generated code here for instant deployment..."
                  value={formData.game_code}
                  onChange={(e) => setFormData({...formData, game_code: e.target.value})}
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || (activeTab === 'code' && !formData.game_code)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded text-xs uppercase tracking-[0.3em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.2)]"
            >
              {loading ? 'Processing...' : 'Deploy & Start Earning'}
            </button>
          </form>
        </section>

        <section className="bg-black relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Preview Output
            </span>
          </div>
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none"
              sandbox="allow-scripts"
              title="Deployment Preview"
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl opacity-20 italic font-black">AIGP</div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Standby for Asset Verification</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}