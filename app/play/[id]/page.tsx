'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function PlayPage() {
  const { id } = useParams();
  const [game, setGame] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const isFocused = useRef(true);

  // 1. ゲームデータの取得
  useEffect(() => {
    const fetchGame = async () => {
      const { data } = await supabase.from('games').select('*').eq('id', id).single();
      if (data) setGame(data);
    };
    fetchGame();
  }, [id]);

  // 2. プレイセッションの開始とハートビート（生存確認）の実装 
  useEffect(() => {
    if (!game) return;

    const startSession = async () => {
      // セッションの作成 
      const { data, error } = await supabase
        .from('play_sessions')
        .insert([{ game_id: id, active_seconds: 0 }])
        .select()
        .single();
      
      if (data) setSessionId(data.id);
    };

    startSession();

    // フォーカス状態の監視（放置検知の準備） 
    const handleFocus = () => { isFocused.current = true; };
    const handleBlur = () => { isFocused.current = false; };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // 10秒おきの生存確認（ハートビート） 
    const interval = setInterval(async () => {
      if (sessionId && isFocused.current) {
        await supabase.from('play_heartbeats').insert([{
          session_id: sessionId,
          is_focused: isFocused.current,
          has_input: true // 将来的に入力を検知して精密化 
        }]);
        
        // 有効プレイ時間の加算
        await supabase.rpc('increment_active_seconds', { session_id: sessionId, seconds: 10 });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [game, sessionId, id]);

  if (!game) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.3em]">Loading Engine...</div>;

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* プレイヤー体験：最小限のUIで即プレイ開始 */}
      <header className="h-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 italic uppercase">Playing</span>
          <h1 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{game.title}</h1>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="text-[9px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Close [×]
        </button>
      </header>

      <div className="flex-1 relative bg-white">
        {/* サンドボックス属性によりセキュリティを確保 */}
        <iframe 
          srcDoc={game.game_code} 
          className="w-full h-full border-none" 
          sandbox="allow-scripts"
          title="Game Window"
        />
      </div>
    </div>
  );
}