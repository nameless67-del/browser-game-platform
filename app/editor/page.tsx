'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // コードが生成・更新されたら実行用のURLを生成する
  useEffect(() => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [generatedCode]);

  // AIに生成を依頼する関数
  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);

    try {
      // 実際にはここでAPI（Gemini等）を叩きます
      // 一旦、動作確認用のモック（ダミー）を返します
      setTimeout(() => {
        const mockCode = `
          <!DOCTYPE html>
          <html>
          <body style="background: #000; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif;">
            <h1 style="color: #3b82f6;">AI GENERATED GAME</h1>
            <p>指示: ${prompt}</p>
            <button onclick="this.innerText='CLICKED!'" style="padding: 10px 20px; background: #3b82f6; border: none; color: #fff; border-radius: 5px; cursor: pointer;">PLAY</button>
          </body>
          </html>
        `;
        setGeneratedCode(mockCode);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans tracking-tight">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <Link href="/" className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">← Exit Editor</Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 uppercase italic">AI Creative Studio</div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'AI生成'}
          </button>
          <button className="border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded text-[10px] font-black uppercase">保存</button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-60px)]">
        {/* 左：AIインストラクション */}
        <section className="w-1/3 border-r border-slate-200 dark:border-white/10 p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Instructions</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50"
              placeholder="例: 赤いボールが跳ね回るクリックゲームを作って..."
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Raw Code Preview</label>
            <textarea 
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-[40vh] mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-[10px] focus:outline-none focus:border-blue-600/50"
              placeholder="生成されたコードがここに表示されます..."
            />
          </div>
        </section>

        {/* 右：プレビュー */}
        <section className="flex-1 bg-slate-100 dark:bg-black relative">
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-full border-none" sandbox="allow-scripts" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-800 italic">
              <div className="text-center">
                <div className="text-5xl mb-4 font-black">EDITING</div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI will build your game here</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}