'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状態管理
  const [code, setCode] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    author: 'Anonymous Creator',
    description: '',
    genre: 'Action'
  });

  // --- 0. localStorageからデータの復元 ---
  useEffect(() => {
    // クライアントサイドでのみ実行
    const savedCode = localStorage.getItem('narou_build_code');
    const savedPrompt = localStorage.getItem('narou_build_prompt');

    if (!savedCode) {
      // データがない場合はビルド画面へ戻す
      alert("ビルドデータが見つかりません。Build画面からやり直してください。");
      router.push('/build');
      return;
    }

    setCode(savedCode);
    setFormData({
      title: savedPrompt?.substring(0, 20) || 'Untitled AI Game',
      author: 'Anonymous Creator',
      description: `AI Prompt: ${savedPrompt}`,
      genre: 'Action'
    });
  }, [router]);

  // --- 1. AIサムネイル生成ロジック (30秒広告シミュレーション) ---
  const handleStartAiThumbnail = () => {
    setIsAdPlaying(true);
    setCountdown(30);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 実際にはここでGemini API経由でImagen等を叩く想定
          // 今回はプロトタイプとしてランダムな画像URLをセット
          setThumbnailUrl(`https://picsum.photos/seed/${Math.random()}/400/500`);
          setIsAdPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- 2. 手動アップロードロジック ---
  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  // --- 3. 最終デプロイ処理 ---
  const handleFinalDeploy = async () => {
    if (!code) return;
    setIsDeploying(true);
    try {
      const { error } = await supabase.from('games').insert([{
        title: formData.title,
        author: formData.author,
        description: formData.description,
        game_code: code,
        thumbnail_url: thumbnailUrl,
        genre: formData.genre,
        is_ai_generated: true,
        engine_type: 'html'
      }]);

      if (error) throw error;
      
      alert('🚀 NAROU GAME プロトコルへのデプロイに成功しました！');
      
      // 成功したら一時データを削除
      localStorage.removeItem('narou_build_code');
      localStorage.removeItem('narou_build_prompt');

      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error("Deploy Error:", err);
      alert(`デプロイエラー: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => router.push('/build')} 
            className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em]"
          >
            ← Back to Build Phase
          </button>
          <div className="text-[10px] font-black text-blue-500 italic uppercase tracking-[0.4em]">
            Step 02: Editor Phase (Metadata & Visuals)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Input Fields */}
          <div className="space-y-10">
            <section className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Game Title</label>
              <input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-transparent border-b-2 border-white/10 py-2 text-4xl font-black focus:border-blue-600 outline-none transition-all placeholder:text-slate-800"
                placeholder="UNLEASH THE TITLE"
              />
            </section>

            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Author Name</label>
                <input 
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded px-4 py-2 text-xs font-bold focus:border-blue-600 outline-none"
                />
              </section>
              <section className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Genre</label>
                <select 
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded px-4 py-2 text-xs font-bold text-blue-400 outline-none appearance-none cursor-pointer"
                >
                  {['Action', 'Strategy', 'Puzzle', 'Shooting', 'RPG', 'Novel'].map(g => (
                    <option key={g} value={g}>{g.toUpperCase()}</option>
                  ))}
                </select>
              </section>
            </div>

            <section className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Game Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full h-40 bg-slate-900 border border-white/5 rounded-xl p-4 text-xs leading-relaxed font-medium outline-none focus:border-blue-600/50 transition-all"
                placeholder="Describe your vision..."
              />
            </section>
          </div>

          {/* Right: Thumbnail Selection */}
          <div className="space-y-6">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Visual Manifestation <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded italic">Select one</span>
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* AI Option */}
              <button 
                onClick={handleStartAiThumbnail}
                disabled={isAdPlaying}
                className={`relative h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${isAdPlaying ? 'border-blue-600 bg-blue-600/10' : 'border-white/10 hover:border-blue-600/50 hover:bg-white/5'}`}
              >
                {isAdPlaying ? (
                  <span className="text-xl font-black italic animate-pulse">{countdown}s</span>
                ) : (
                  <>
                    <span className="text-xl mb-1">✨</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-blue-400">AI Materialize</span>
                    <span className="text-[7px] opacity-40 uppercase">Watch 30s Ad</span>
                  </>
                )}
              </button>

              {/* Manual Option */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-slate-400 hover:bg-white/5 transition-all"
              >
                <span className="text-xl mb-1">🖼️</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Manual Upload</span>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleManualUpload} accept="image/*" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="aspect-[4/5] bg-slate-900 rounded-2xl border border-white/5 overflow-hidden relative group shadow-2xl">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-800 font-black italic">
                  <div className="text-6xl -rotate-12 opacity-20 uppercase tracking-tighter text-center">No<br/>Image</div>
                  <div className="mt-4 text-[8px] font-black uppercase tracking-widest opacity-40 text-center">Asset Awaiting Initialization</div>
                </div>
              )}
              {isAdPlaying && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                   <div className="text-center">
                     <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-[9px] font-black uppercase tracking-widest">Extracting Aesthetics...</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Deploy Button */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <button 
            onClick={handleFinalDeploy}
            disabled={isDeploying || !thumbnailUrl}
            className="w-full group bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.6em] transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-[0.98] flex items-center justify-center gap-4"
          >
            {isDeploying ? 'Deploying Protocol...' : (
              <>
                Deploy to NAROU GAME Protocol
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </>
            )}
          </button>
          {!thumbnailUrl && (
            <p className="text-center mt-4 text-[9px] font-bold text-pink-500/50 uppercase tracking-widest">
              * サムネイルを生成またはアップロードしてください
            </p>
          )}
        </div>
      </div>
    </div>
  );
}