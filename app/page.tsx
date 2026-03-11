'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const GameCard = ({ title, desc, author, avgTime, isSmall = false, thumbnail }) => (
  <div className="group cursor-pointer">
    <div className={`relative aspect-video bg-slate-900 rounded-lg mb-2 overflow-hidden border border-white/5 group-hover:border-blue-500/50 transition-all ${isSmall ? 'scale-95' : ''}`}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-tighter">No Preview</div>
      )}
      <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[10px] text-blue-400 font-mono">
        {avgTime || '0'}:00
      </div>
    </div>
    <h3 className="font-bold text-xs truncate group-hover:text-blue-400">{title}</h3>
    <p className="text-[10px] text-slate-500 truncate">{author} | {desc}</p>
  </div>
);

export default function NarouTopPage() {
  const [games, setGames] = useState<any[]>([]);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from('games')
        .select('*')
        .order(sort === 'Newest' ? 'created_at' : 'play_time_avg', { ascending: false });
      if (data) setGames(data);
    };
    fetchGames();
  }, [sort]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-lg font-black tracking-tighter uppercase">NAROU GAME <span className="text-blue-500 text-xs">BETA</span></div>
        <div className="flex gap-4 items-center">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow-lg active:scale-95">新規投稿</button>
          <div className="w-8 h-8 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center text-[10px]">ID</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        {/* 1. 履歴（デモ用。本来はAuthやLocalDBから取得） */}
        <section>
          <h2 className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
            <span className="w-1 h-3 bg-blue-500"></span> Recent Activities
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {games.slice(0, 6).map((game) => (
              <GameCard key={game.id} title={game.title} desc="前回 12分プレイ" avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} isSmall />
            ))}
          </div>
        </section>

        {/* 2. ランキング */}
        <section>
          <h2 className="text-[11px] uppercase tracking-widest font-bold text-yellow-500 mb-4 flex items-center gap-2">
            <span className="w-1 h-3 bg-yellow-500"></span> Top Ranking
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {games.slice(0, 5).map((game, i) => (
              <div key={game.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-6 h-6 bg-yellow-600 text-white flex items-center justify-center font-black rounded italic text-[10px] shadow-lg">
                  {i + 1}
                </div>
                <GameCard title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
              </div>
            ))}
          </div>
        </section>

        {/* 3. ジャンル・ソート */}
        <section>
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div className="flex gap-2">
              {['All', 'Action', 'Strategy'].map((cat) => (
                <button key={cat} onClick={() => setGenre(cat)} className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${genre === cat ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-[10px] font-bold text-slate-400 focus:outline-none">
              <option value="Newest">NEWEST</option>
              <option value="Popular">POPULAR</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}