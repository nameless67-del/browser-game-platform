'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // プレイ中かどうかのフラグ
  const isFocused = useRef(true);

  // 1. ゲームデータの取得
  useEffect(() => {
    const fetchGame = async () => {
      const { data } = await supabase.from('games').select('*').eq('id', id).single();
      if (data) setGame(data);
    };
    fetchGame();
  }, [id]);

  // 2. セッション作成（無限増殖防止ガード付き）
  useEffect(() => {
    if (!game || sessionId || !isPlaying) return; 

    const startSession = async () => {
      let guestId = localStorage.getItem('narou_guest_id');
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem('narou_guest_id', guestId);
      }

      const { data } = await supabase
        .from('play_sessions')
        .insert([{ 
          game_id: id, 
          guest_id: guestId,
          active_seconds: 0 
        }])
        .select()
        .single();
      
      if (data) setSessionId(data.id);
    };

    startSession();

    const handleFocus = () => { isFocused.current = true; };
    const handleBlur = () => { isFocused.current = false; };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const interval = setInterval(async () => {
      if (sessionId && isFocused.current) {
        await supabase.from('play_heartbeats').insert([{
          session_id: sessionId,
          is_focused: true,
          has_input: true 
        }]);
        await supabase.rpc('increment_active_seconds', { session_id_param: sessionId, seconds_to_add: 10 });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [game, sessionId, id, isPlaying]);

  if (!game) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.3em]">Loading Asset...</div>;

  // プレイ前の詳細表示
  if (!isPlaying) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans tracking-tight">
        <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">← Back</Link>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
            {game.thumbnail_url ? <img src={game.thumbnail_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-800 font-black text-4xl italic -rotate-12">NO IMAGE</div>}
          </div>
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">{game.genre}</span>
              <h1 className="text-5xl font-black tracking-tighter leading-none">{game.title}</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">by {game.author}</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{game.description || "No description provided."}</p>
            <button onClick={() => setIsPlaying(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl text-xs uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95">
              Play Engine Start
            </button>
          </div>
        </main>
      </div>
    );
  }

  // プレイ画面（iframe）
  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden z-[100]">
      <header className="h-10 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-blue-500 italic uppercase">Live</span>
          <h1 className="text-[11px] font-bold text-white truncate max-w-[200px]">{game.title}</h1>
        </div>
        <button onClick={() => setIsPlaying(false)} className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
          Close [×]
        </button>
      </header>
      <div className="flex-1 relative bg-white">
        <iframe srcDoc={game.game_code} className="w-full h-full border-none" sandbox="allow-scripts" title="Game Window" />
      </div>
    </div>
  );
}