'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 引数の型を定義
interface GameCardProps {
  title: string;
  desc: string;
  author: string;
  avgTime: number | string;
  isSmall?: boolean;
  thumbnail?: string;
}

const GameCard = ({ title, desc, author, avgTime, isSmall = false, thumbnail }: GameCardProps) => (
  <div className="group cursor-pointer">
    <div className={`relative aspect-video bg-slate-900 rounded-lg mb-2 overflow-hidden border border-white/5 group-hover:border-blue-500/50 transition-all ${isSmall ? 'scale-95' : ''}`}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-tighter font-bold">No Preview</div>
      )}
      <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[10px] text-blue-400 font-mono">
        {avgTime || '0'}:00
      </div>
    </div>
    <h3 className="font-bold text-[11px] truncate group-hover:text-blue-400 tracking-tight">{title}</h3>
    <p className="text-[9px] text-slate-500 truncate uppercase tracking-tighter">{author} <span className="text-slate-700">|</span> {desc}</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans tracking-tight">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-lg font-black tracking-tighter uppercase italic">NAROU GAME <span className="text-blue-500 text-[10px] not-italic ml-1 border border-blue-500/30 px-1 rounded">BETA</span></div>
        <div className="flex gap-4 items-center">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-[11px] font-black uppercase transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95">新規投稿</button>
          <div className="w-8 h-8 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-500">ID</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-blue-500/50"></span> Recent Activities
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {games.slice(0, 6).map((game) => (
              <GameCard key={game.id} title={game.title} desc="前回 12分プレイ" avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} isSmall />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-yellow-500/80 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-yellow-500/50"></span> Top Ranking
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {games.slice(0, 5).map((game, i) => (
              <div key={game.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-5 h-5 bg-yellow-600 text-white flex items-center justify-center font-black rounded italic text-[10px] shadow-xl border border-yellow-400/30">
                  {i + 1}
                </div>
                <GameCard title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
              </div>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              {['All', 'Action', 'Strategy'].map((cat) => (
                <button key={cat} onClick={() => setGenre(cat)} className={`text-[10px] font-black tracking-widest uppercase transition-all ${genre === cat ? 'text-white border-b-2 border-white' : 'text-slate-600 hover:text-slate-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-[10px] font-black text-blue-500 uppercase tracking-widest focus:outline-none cursor-pointer">
              <option value="Newest">Sort: Newest</option>
              <option value="Popular">Sort: Popular</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
            {games.map((game) => (
              <GameCard key={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}