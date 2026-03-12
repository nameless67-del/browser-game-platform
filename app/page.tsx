'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface GameCardProps {
  title: string;
  desc: string;
  author: string;
  avgTime: number | string;
  isSmall?: boolean;
  thumbnail?: string;
}

// カードの形状を 4:5 (正方形に近い) に設定
const GameCard = ({ title, desc, author, avgTime, isSmall = false, thumbnail }: GameCardProps) => (
  <div className={`flex-shrink-0 ${isSmall ? 'w-44' : 'w-52'} group cursor-pointer`}>
    <div className={`relative aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-lg mb-2 overflow-hidden border border-slate-200 dark:border-white/5 group-hover:border-blue-500/50 transition-all shadow-sm group-hover:shadow-md`}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-700 uppercase font-black tracking-tighter italic">No Preview</div>
      )}
      <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-blue-600 dark:text-blue-400 font-mono border border-slate-200 dark:border-white/5 shadow-sm">
        {avgTime || '0'}:00
      </div>
    </div>
    <h3 className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 tracking-tight">{title}</h3>
    <p className="text-[9px] text-slate-500 truncate uppercase tracking-tighter font-medium">{author} | {desc}</p>
  </div>
);

export default function NarouTopPage() {
  const [allGames, setAllGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    const fetchAll = async () => {
      // 滞在時間を重視した評価軸に基づき取得（定義書 1章）
      const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (data) setAllGames(data);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let result = [...allGames];
    // ジャンル別しきい値やフィルタリング（定義書 3章・4章）
    if (genre !== 'All') {
      // result = result.filter(g => g.genre === genre);
    }
    result.sort((a, b) => {
      if (sort === 'Popular') return (Number(b.play_time_avg) || 0) - (Number(a.play_time_avg) || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setFilteredGames(result);
  }, [genre, sort, allGames]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 font-sans tracking-tight transition-colors duration-300">
      {/* ヘッダー：ライトモード対応 */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="text-lg font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
          NAROU GAME <span className="text-blue-600 dark:text-blue-500 text-[10px] not-italic ml-1 border border-blue-600/30 dark:border-blue-500/30 px-1 rounded">BETA</span>
        </div>
        
        <div className="flex gap-4 items-center">
          <Link href="/search">
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded text-[11px] font-bold transition-all border border-slate-200 dark:border-white/5">
              <span className="text-blue-600 dark:text-blue-400">🔍</span> ゲームを探す
            </button>
          </Link>
          
          <Link href="/post">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded text-[11px] font-black uppercase transition-all shadow-md">
              新規投稿
            </button>
          </Link>

          <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded text-[11px] font-bold transition-all">
            ログイン
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-20">
        
        {/* 1. 履歴 */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-blue-600 dark:bg-blue-500/50"></span> Continue Playing
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {allGames.slice(0, 8).map((game) => (
              <GameCard key={game.id} title={game.title} desc="前回プレイした作品" avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} isSmall />
            ))}
          </div>
        </section>

        {/* 2. おすすめ */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-600 dark:text-purple-500/80 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-purple-600 dark:bg-purple-500/50"></span> Recommended For You
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {allGames.map((game) => (
              <GameCard key={game.id} title={game.title} desc={game.description} avgTime={game.play_time_avg} author={game.author} thumbnail={game.thumbnail_url} />
            ))}
          </div>
        </section>

        {/* 3. ランキング & エクスプローラー */}
        <section className="pt-10 border-t border-slate-200 dark:border-white/5">
          <div className="flex flex-col gap-8 mb-10">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-yellow-600 dark:text-yellow-500/80 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-yellow-600 dark:bg-yellow-500/50"></span> Trend Ranking
            </h2>
            
            <div className="flex items-center gap-8">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest px-3 py-1.5 rounded focus:outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <option value="Newest">SORT: NEWEST</option>
                <option value="Popular">SORT: POPULAR</option>
              </select>

              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {['All', 'Action', 'Strategy', 'Puzzle', 'Shooting', 'RPG', 'Novel'].map((cat) => (
                  <button key={cat} onClick={() => setGenre(cat)} className={`text-[10px] font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap pb-1 ${genre === cat ? 'text-slate-900 border-b-2 border-blue-600 dark:text-white dark:border-blue-500' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">
            {filteredGames.slice(0, 15).map((game, i) => (
              <div key={game.id} className="relative group">
                <div className="absolute -top-3 -left-3 z-10 w-6 h-6 bg-yellow-600 text-white flex items-center justify-center font-black rounded italic text-[11px] shadow-lg border border-yellow-400/30">
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