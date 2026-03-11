'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // フォームの状態管理
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    play_time_avg: 0,
    thumbnail_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('games')
        .insert([formData]);

      if (error) throw error;
      
      alert('投稿が完了しました！');
      router.push('/'); // トップページへ戻る
      router.refresh();
    } catch (error: any) {
      alert('エラーが発生しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans tracking-tight">
      {/* 簡易ヘッダー */}
      <header className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
        <Link href="/" className="text-slate-500 hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <span>←</span> Back to Hub
        </Link>
        <div className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase italic">Create New Entry</div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* セクション1：基本情報 */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-4 h-[1px] bg-blue-500"></span> Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2 ml-1">Game Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="タイトルを入力..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2 ml-1">Author Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="あなたの名前..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* セクション2：詳細 */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-4 h-[1px] bg-blue-500"></span> Content Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2 ml-1">Description</label>
                <textarea 
                  rows={4}
                  placeholder="ゲームの概要、遊び方、AIの使用有無など..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2 ml-1">Avg Play Time (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    value={formData.play_time_avg}
                    onChange={(e) => setFormData({...formData, play_time_avg: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2 ml-1">Thumbnail URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)]"
            >
              {loading ? 'Processing...' : 'Deploy Game Entry'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}