'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans tracking-tight">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <Link href="/" className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">← Exit Editor</Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 uppercase italic">Creative Studio</div>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase">保存</button>
      </header>

      <main className="flex h-[calc(100vh-60px)]">
        {/* 左：AIインストラクション / エディタ */}
        <section className="w-1/3 border-r border-slate-200 dark:border-white/10 p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Prompt / Code</label>
            <textarea 
              className="w-full h-[70vh] mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50"
              placeholder="ここにAIへの指示や直接コードを入力して、ゲームを構築・編集します..."
            />
          </div>
        </section>

        {/* 右：リアルタイムワークスペース */}
        <section className="flex-1 bg-slate-50 dark:bg-black flex items-center justify-center relative">
          <div className="absolute top-4 left-4">
            <span className="bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Live Workspace</span>
          </div>
          <div className="text-center text-slate-300 dark:text-slate-800 italic">
            <div className="text-5xl mb-4 font-black">EDITING</div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Real-time preview will appear here</p>
          </div>
        </section>
      </main>
    </div>
  );
}