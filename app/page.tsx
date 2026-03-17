'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface GameCardProps {
  id: string;
  title: string;
  desc: string;
  author: string;
  avgTime: number | string;
  isSmall?: boolean;
  thumbnail?: string;
}

// カード全体のリンク判定を確実にし、画像がない場合の表示を改善
const GameCard = ({ id, title, desc, author, avgTime, isSmall = false, thumbnail }: GameCardProps) => (
  <Link href={`/play/${id}`} className="block">
    <div className={`flex-shrink-0 ${isSmall ? 'w-40' : 'w-48'} group cursor-pointer`}>
      <div className={`relative aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-lg mb-1.5 overflow-hidden border border-slate-200 dark:border-white/5 group-hover:border-blue-500/50 transition-all shadow-sm`}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-700 uppercase font-black tracking-tighter italic text-center px-2">
            {title}<br/>(No Preview)
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-white/90 dark:bg-black/70 px-1 py-0.5 rounded text-[9px] text-blue-600 dark:text-blue-400 font-mono border border-slate-100 dark:border-white/5 shadow-sm">
          {avgTime || '0'}:00
        </div>
      </div>
      
      <div className="px-0.5 space-y-0.5">
        <h3 className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 tracking-tight leading-tight">{title}</h3>
        <p className="text-[9px] text-slate-500 truncate uppercase tracking-tighter font-medium">{author}</p>
        
        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold border-t border-slate-100 dark:border-white/5 pt-1 mt-1">
          <span className="flex items-center gap-0.5">▶ {Math.floor(Math.random() * 100)}</span>
          <span className="flex items-center gap-0.5 text-pink-500/70">❤ {Math.floor(Math.random() * 10)}</span>
          <span className="flex items-center gap-0.5 text-yellow-500 font-black italic">★ 4.5</span>
        </div>
      </div>
    </div>
  </Link>
);

export default function NarouTopPage() {
  const [allGames, setAllGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const fetchAll = async () => {
      const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (data) setAllGames(data);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let result = [...allGames];
    if (genre !== 'All') {
      result = result.filter(g => g.genre === genre);
    }
    result.sort((a, b) => {
      if (sort === 'Popular') return (Number(b.play_time_avg) || 0) - (Number(a.play_time_avg) || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setFilteredGames(result);
  }, [genre, sort, allGames]);

  const handleEditorClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      alert('ゲームを作成・編集するにはログインしてください');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 font-sans tracking-tight transition-colors duration-300">
      <header className="flex items-center justify-between px-6 py-2 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="text-lg font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
          NAROU GAME <span className="text-blue-600 dark:text-blue-500 text-[10px] not-italic ml-1 border border-blue-600/30 px-1 rounded">BETA</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <Link href="/editor" onClick={handleEditorClick}>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded text-[11px] font-black uppercase transition-all border border-blue-600/20 shadow-sm">
              <span>🛠️</span> ゲームを作る
            </button>
          </Link>
          <Link href="/search">
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded text-[11px] font-bold border border-slate-200 dark:border-white/5 shadow-sm">
              <span>🔍</span> 探す
            </button>
          </Link>
          <Link href="/post">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded text-[11px] font-black uppercase transition-all shadow-md">
              投稿
            </button>
          </Link>
          <button className="text-slate-400 hover:text-slate-900 px-3 py-1.5 text-[11px] font-bold">
            Login
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-10">
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4 flex items-center gap-3 italic">
            <span className="w-6 h-[1px] bg-blue-600"></span> Continue Playing
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {allGames.slice(0, 10).map((game) => (
              <GameCard key={game.id} id={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} isSmall />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-600 mb-4 flex items-center gap-3 italic">
            <span className="w-6 h-[1px] bg-purple-600"></span> Recommended
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {allGames.map((game) => (
              <GameCard key={game.id} id={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
            ))}
          </div>
        </section>

        <section className="pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-yellow-600 flex items-center gap-3 italic">
              <span className="w-6 h-[1px] bg-yellow-600"></span> Ranking
            </h2>
            <div className="flex items-center gap-6">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-1 rounded focus:outline-none cursor-pointer">
                <option value="Newest">NEWEST</option>
                <option value="Popular">POPULAR</option>
              </select>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {['All', 'Action', 'Strategy', 'Puzzle', 'Shooting', 'RPG', 'Novel'].map((cat) => (
                  <button key={cat} onClick={() => setGenre(cat)} className={`text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap pb-1 ${genre === cat ? 'text-slate-900 border-b-2 border-blue-600 dark:text-white dark:border-blue-500' : 'text-slate-400 hover:text-slate-600'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-8">
            {filteredGames.map((game, i) => (
              <div key={game.id} className="relative group">
                <div className="absolute -top-2 -left-2 z-10 w-5 h-5 bg-slate-900 text-white flex items-center justify-center font-black rounded italic text-[10px] shadow-md border border-white/10">
                  {i + 1}
                </div>
                <GameCard id={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}