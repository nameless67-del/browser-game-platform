'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GameCardProps {
  title: string;
  desc: string;
  author: string;
  avgTime: number | string;
  isSmall?: boolean;
  thumbnail?: string;
}

const GameCard = ({ title, desc, author, avgTime, isSmall = false, thumbnail }: GameCardProps) => (
  <div className={`flex-shrink-0 ${isSmall ? 'w-40' : 'w-56'} group cursor-pointer`}>
    <div className={`relative aspect-video bg-slate-900 rounded-lg mb-2 overflow-hidden border border-white/5 group-hover:border-blue-500/50 transition-all`}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 uppercase font-bold">No Preview</div>
      )}
      <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[10px] text-blue-400 font-mono">
        {avgTime || '0'}:00
      </div>
    </div>
    <h3 className="font-bold text-[11px] truncate group-hover:text-blue-400 tracking-tight">{title}</h3>
    <p className="text-[9px] text-slate-500 truncate uppercase tracking-tighter">{author} | {desc}</p>
  </div>
);

export default function NarouTopPage() {
  const [allGames, setAllGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('Newest');

  // 初回全データ取得
  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (data) setAllGames(data);
    };
    fetchAll();
  }, []);

  // ランキングセクション（Filtered）の制御
  useEffect(() => {
    let result = [...allGames];
    // 実際にはDBのカラムにgenre等がある想定ですが、今はAll以外はモックとして動作
    if (genre !== 'All') {
      // フィルタリングロジック（拡張用）
    }
    
    // ソートロジック
    result.sort((a, b) => {
      if (sort === 'Popular') return b.play_time_avg - a.play_time_avg;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredGames(result);
  }, [genre, sort, allGames]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans tracking-tight">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-lg font-black tracking-tighter uppercase italic">NAROU GAME <span className="text-blue-500 text-[10px] not-italic ml-1 border border-blue-500/30 px-1 rounded">BETA</span></div>
        <div className="flex gap-4 items-center">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-[11px] font-black uppercase transition-all shadow-lg">新規投稿</button>
          <div className="w-8 h-8 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-500">ID</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-16">
        
        {/* 1. 履歴 (横スクロール) */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-blue-500/50"></span> Recent Activities
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {allGames.slice(0, 8).map((game) => (
              <GameCard key={game.id} title={game.title} desc="前回 12分プレイ" avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} isSmall />
            ))}
          </div>
        </section>

        {/* 2. おすすめ (横スクロール) */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-500/80 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-purple-500/50"></span> Recommended
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {allGames.map((game) => (
              <GameCard key={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
            ))}
          </div>
        </section>

        {/* 3. ランキング (フィルタリング対象) */}
        <section className="pt-8 border-t border-white/5">
          <div className="flex flex-col gap-6 mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-yellow-500/80 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-yellow-500/50"></span> Ranking & Explorer
            </h2>
            
            <div className="flex items-center gap-6">
              {/* ソートを左に配置 */}
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-slate-900 border border-white/10 text-[10px] font-black text-blue-500 uppercase tracking-widest px-3 py-1 rounded focus:outline-none">
                <option value="Newest">SORT: NEWEST</option>
                <option value="Popular">SORT: POPULAR</option>
              </select>

              {/* ジャンル一覧を拡張 */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {['All', 'Action', 'Strategy', 'Puzzle', 'Shooting', 'RPG', 'Novel'].map((cat) => (
                  <button key={cat} onClick={() => setGenre(cat)} className={`text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${genre === cat ? 'text-white border-b-2 border-white' : 'text-slate-600 hover:text-slate-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10">
            {filteredGames.slice(0, 15).map((game, i) => (
              <div key={game.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-5 h-5 bg-yellow-600 text-white flex items-center justify-center font-black rounded italic text-[10px] shadow-xl border border-yellow-400/30">
                  {i + 1}
                </div>
                <GameCard title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}