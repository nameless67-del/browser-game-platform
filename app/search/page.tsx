'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SearchPage() {
  const [games, setGames] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const tags = ['AI生成', 'ドット絵', '短時間', '高難易度', '箱庭', 'マルチエンド', '放置', '無双'];

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from('games').select('*');
      if (data) setGames(data);
    };
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans tracking-tight">
      {/* 探索専用ヘッダー */}
      <header className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center gap-6">
        <Link href="/" className="text-slate-500 hover:text-white transition">
          <span className="text-lg">←</span>
        </Link>
        <div className="relative flex-1 max-w-2xl">
          <input 
            type="text" 
            placeholder="タイトル、作者、タグで探索..."
            className="w-full bg-slate-900 border border-white/10 rounded-full px-12 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* タグクラウド：直感的な入り口 */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-500 mb-6 italic">Keywords Explorer</h2>
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <button key={tag} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold hover:bg-blue-600 hover:border-blue-500 transition-all">
                # {tag}
              </button>
            ))}
          </div>
        </section>

        {/* 運命の1本：ピックアップ */}
        <section className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-slate-800 animate-pulse"></div> {/* 本来はランダムなゲームの背景 */}
          <div className="absolute inset-0 z-20 p-10 flex flex-col justify-center">
            <span className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-[0.3em]">Random Pick</span>
            <h2 className="text-3xl font-black mb-4 group-hover:text-blue-400 transition">まだ見ぬ傑作に、<br />会いに行く。</h2>
            <button className="w-fit bg-white text-black px-6 py-2 rounded font-black text-xs uppercase hover:bg-blue-500 hover:text-white transition-all">
              シャッフル開始
            </button>
          </div>
        </section>

        {/* 検索結果（またはトレンド） */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 italic">Discovered Games</h2>
            <span className="text-[10px] text-slate-600 font-mono">{games.length} RESULTS FOUND</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {games.map(game => (
              <div key={game.id} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-slate-900 rounded-xl mb-3 border border-white/5 overflow-hidden transition-all group-hover:border-blue-500/40 shadow-xl">
                  {/* 探索画面では縦長の「ポスター形式」にして特別感を演出 */}
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-800 font-black uppercase italic -rotate-12 select-none">Poster Preview</div>
                </div>
                <h3 className="font-bold text-xs truncate mb-1">{game.title}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded uppercase font-bold tracking-tighter">RPG</span>
                   <span className="text-[10px] text-slate-600">by {game.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}